import { Application, Request, Response, NextFunction } from 'express';
import eventRoutes from './events'
import rootRoutes from './root'
import profileRoutes from './profile'
import authRoutes from './auth'
import userRoutes from './users'
import { errorHandler } from './utils';
import { Server } from 'socket.io'; // Import types


const constructorMethod = (
    app: Application, 
    io: Server, 
    activeEvents: Map<string, any>
) => {
    app.use("/events", eventRoutes(io, activeEvents));
    app.use("/profile", profileRoutes);
    app.use("/users", userRoutes);
    app.use("/", authRoutes);
    app.use("/", rootRoutes);
    app.use(/(.*)/, (req: Request, res: Response) => {
        return res.status(404).json({ error: "Not found" });
    });

    app.use(errorHandler);
};

export default constructorMethod;