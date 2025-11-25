import express from 'express';
import configRoutes from './routes/index'
import { createServer } from 'node:http';
import { Server } from 'socket.io';
import session from "express-session";
import cors from 'cors';

const app = express();

app.use(express.json());
app.use(cors());

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
        first_name: string,
        last_name: string,
        email: string,
        password: string
    }
}

configRoutes(app)

app.listen(3000, () => {
    console.log("Express server has started!");
})

export const simpleSignInServer = app;