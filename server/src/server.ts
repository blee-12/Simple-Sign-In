import express from "express";
import { Request, Response } from "express";
import configRoutes from "./routes/index";
import { createServer } from "node:http";
import { Server } from "socket.io";
import session from "express-session";
import cors from "cors";
import { ObjectId } from 'mongodb';
import { CLIENT_URL } from "./config/staticAssets";
import { ClientToServerEvents, ServerToClientEvents } from "../../common/socketTypes.ts";

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

const io = new Server <ClientToServerEvents, ServerToClientEvents> (httpServer, {
    cors: {
        origin: "http://localhost:5173", // need to replace with front end url eventually.
        credentials: true 
    }
});
io.engine.use(sessionMiddleware);
io.engine.use(cors());

// to store active events
// this will need syncronization
const activeEvents = new Map<string, EventState>();

io.on("connection", (socket) => {
  console.log("socket connection received");
  const req = socket.request;
  
  // make sure that the user is signed in.
  if (!req.session || !req.session._id) {
    console.log("Unauthenticated, disconnecting.")
  }

  // handle check in
  socket.on("check_in", (eventId, code, email) => {
    // TODO: check if the map has that event active.
    // verify the code matches.

    const roomName = `${eventId}_chat`;
    socket.join(roomName);

    socket.emit("success_join");

    io.to('${eventId}_creator').emit("student_checked_in", req.session.email);

    // TODO: if the student isn't registered for the event, then handle that.

    console.log(`${req.session.email} joined room: ${roomName}`);
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

  // TODO: remove when we actually do something with the socket
  socket.disconnect();
});

// fallback error handler
app.use(async (err: any, req: Request, res: Response, next: any) => {
  if (err.statusCode < 500)
    return res.status(err.statusCode).send({ error: err.message });
  console.error("Unhandled server error:");
  console.error(err);
  return res.status(500).send({ error: "Internal server error" });
});

httpServer.listen(4000, () => {
  console.log("Express server has started!");
});

export const simpleSignInServer = app;
