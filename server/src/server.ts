import express from "express";
import { Request, Response } from "express";
import configRoutes from "./routes/index";
import { createServer } from "node:http";
import { Server } from "socket.io";
import session from "express-session";
import cors from "cors";
import { ObjectId } from 'mongodb';
import { CLIENT_URL } from "./config/staticAssets";

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

declare module "express-session" {
  interface SessionData {
    _id: ObjectId;
    first_name: string;
    last_name: string;
    email: string;
    password: string;
  }
}

configRoutes(app);

// socket.io
const io = new Server(httpServer);
io.engine.use(sessionMiddleware);
io.engine.use(cors());

io.on("connection", (socket) => {
  console.log("socket connection received");
  // @ts-ignore
  const session = socket.request.session;
  if (session.email) {
    console.log(`session ${session.email}`);
  } else {
    console.log("no session");
  }
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

httpServer.listen(3001, () => {
  console.log("Express server has started!");
});

export const simpleSignInServer = app;
