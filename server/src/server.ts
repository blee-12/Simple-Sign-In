import express from "express";
import { Request, Response } from "express";
import configRoutes from "./routes/index";
import { createServer } from "node:http";
import { Server } from "socket.io";
import { HttpError } from '../../common/errors';
import session from "express-session";
import cors from "cors";
import { ObjectId } from 'mongodb';
import { CLIENT_URL } from "./config/staticAssets";
import { ClientToServerEvents, ServerToClientEvents } from "../../common/socketTypes.ts";
import eventData from "./data/events.ts";

const API_PORT = 4000;

// types
interface EventState {
  id: string;
  name: string;
  currentCode: string; // deal with code bs later tbh.
  intervalId: NodeJS.Timeout; 
}

declare module "express-session" {
  interface SessionData {
    _id: ObjectId;
    first_name: string;
    last_name: string;
    email: string;
    password: string;
  }
}

declare module "http" {                                       
   interface IncomingMessage {                             
        session: session.SessionData;                        
    }                                                        
  }

// express
const app = express();
const httpServer = createServer(app);
app.use(express.json());
app.use(
  cors({
    origin: CLIENT_URL,
    credentials: true,
  })
);

// Session
const sessionMiddleware = session({
  name: "AuthenticationState",
  secret: "some secret string!",
  resave: false,
  saveUninitialized: false,
});
app.use(sessionMiddleware);

configRoutes(app);


/* ~~ SOCKET.IO SECTION ~~ */

// to store active events
const activeEvents = new Map<string, EventState>();

// syncronizing active events
const BUFFER_MINUTES = 15; // 15 minute buffer to label events as "active"
const SYNC_INTERVAL_MS = 60 * 1000; // sync this every minute.

function generateCode() {
  return Math.floor(1000 + Math.random() * 9000).toString();
}

// get the window of time in which events are "active"
function getActiveWindow() {
  const now = new Date();
  const buffer = BUFFER_MINUTES * 60 * 1000;
  
  return {
    startLimit: new Date(now.getTime() - buffer), 
    endLimit: new Date(now.getTime() + buffer)
  }
}

export function checkAndActivateEvent(eventDoc: any) {
    const id = eventDoc._id.toString();

    // ff it's already running, ignore
    if (activeEvents.has(id)) return;

    // check if it falls within the window
    const { startLimit, endLimit } = getActiveWindow();
    const startTime = new Date(eventDoc.time_start);
    const endTime = new Date(eventDoc.time_end);

    // is this shit going down right now?
    const isActive = startTime <= endLimit && endTime >= startLimit;

    if (isActive) {
        console.log(`Starting event: ${eventDoc.name}`);
        const initialCode = generateCode();

        // update a new code every 30 seconds.
        const interval = setInterval(() => {
            const newCode = generateCode();
            if (activeEvents.has(id)) {
                activeEvents.get(id)!.currentCode = newCode;
            }
            io.to(`${id}_creator`).emit("code_update", newCode);
            console.log(`Rotated code for ${eventDoc.name}: ${newCode}`);
        }, 30 * 1000);

        activeEvents.set(id, {
            id,
            name: eventDoc.name,
            currentCode: initialCode,
            intervalId: interval
        });
        
        io.to(`${id}_creator`).emit("code_update", initialCode);
    }
}

async function syncActiveEvents() {
    const window = getActiveWindow();

    // fetch all the active events.
    const DBactiveEvents = await eventData.getEventsInWindow(window.startLimit, window.endLimit);

    const activeEventIds = new Set(DBactiveEvents.map( event => event._id.toString() ));
    
    // adding new active events
    for (const eventDoc of DBactiveEvents){
        checkAndActivateEvent(eventDoc);
    }

    // removing the finished events.
    for (const [mapId, mapState] of activeEvents) {
            // If it's in our Map in the list from mongo, its done
            if (!activeEventIds.has(mapId)) {
                console.log(`Ending event: ${mapState.name}`);

                // clear the interval
                clearInterval(mapState.intervalId);
                
                // tell the clients
                io.to(`${mapId}_chat`).emit("error", "This event has ended.");
                io.to(`${mapId}_creator`).emit("error", "Event ended.");
                
                // leave the rooms
                io.in(`${mapId}_chat`).socketsLeave(`${mapId}_chat`);
                io.in(`${mapId}_creator`).socketsLeave(`${mapId}_creator`);

                activeEvents.delete(mapId);
            }
        }

    console.log(activeEventIds);
}

const io = new Server <ClientToServerEvents, ServerToClientEvents> (httpServer, {
    cors: {
        origin: "http://localhost:5173", // need to replace with front end url eventually.
        credentials: true 
    }
});
io.engine.use(sessionMiddleware);


io.on("connection", (socket) => {
  console.log("socket connection received");
  const req = socket.request;
  
  // make sure that the user is signed in.
  if (!req.session || !req.session._id) {
    console.log("Unauthenticated, disconnecting.");
    socket.disconnect();
    return;
  }

  // handle check in
  socket.on("check_in", async (eventId, code, email) => {
    const event = activeEvents.get(eventId);

    if (!event) return socket.emit("error", "This event is not active right now.");
    if (code !== event.currentCode) return socket.emit("error", "Incorrect code!");

    try {
      await eventData.checkInUser(eventId, null, email);

      const roomName = `${eventId}_chat`;
      socket.join(roomName);
      socket.emit("success_join");
      
      io.to(`${eventId}_creator`).emit("student_checked_in", email);
      console.log(`${email} checked in and joined room: ${roomName}`);

    } catch (e: any) {
      console.error("Check-in failed:", e);
      socket.emit("error", "Database error during check-in.");
    }
  });

  // When the creator joins, then they get added to their own room for the codes.
  socket.on("join_creator", (eventId) => {     
     const event = activeEvents.get(eventId);
     if (!event) {
        return socket.emit("error", "Event is not active.");
     }

     socket.join(`${eventId}_creator`);

     // so they can also see the chat.
     const roomName = `${eventId}_chat`;
     socket.join(roomName);
     
     // Send them the current code immediately so they don't have to wait 30s
     socket.emit("code_update", event.currentCode);
  });

  // handle messages
  socket.on("send_message", (eventId, message) => {
    const roomName = `${eventId}_chat`

    if (socket.rooms.has(roomName)) {
        io.to(roomName).emit("chat_message", req.session.email, message); 
    } else {
        socket.emit("error", "You must join the event before sending a message!");
    }
  });
});

// fallback error handler
// app.use((err: any, req: Request, res: Response, next: any) => {
//     if (err.statusCode < 500 || err instanceof HttpError)
//         return res.status(err.statusCode).send({error: err.message});
//     console.error("Unhandled server error:");
//     console.error(err);
//     return res.status(500).send({error: "Internal server error"});
// });

httpServer.listen(API_PORT, async () => {
  console.log("Express server has started!");
  await syncActiveEvents();
  setInterval(() => syncActiveEvents(), SYNC_INTERVAL_MS);
});

export const simpleSignInServer = app;
