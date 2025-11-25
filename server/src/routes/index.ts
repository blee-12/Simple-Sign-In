import { Application, Request, Response } from 'express';
import eventRoutes from './events'
import rootRoutes from './root'
import profileRoutes from './profile'
import userRoutes from './users'

const constructorMethod = (app: Application) => {
    app.use("/events", eventRoutes);
    app.use("/profile", profileRoutes);
    app.use("/users", userRoutes);
    app.use("/", rootRoutes);
    app.use(/(.*)/, (req: Request, res: Response) => {
        return res.status(404).json({ error: "Not found" });
    });
};

export default constructorMethod;