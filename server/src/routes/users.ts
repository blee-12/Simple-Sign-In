import { Request, Response, Router } from 'express';
const router = Router()

router.get('/me', async (req: Request, res: Response) => { 
    if (req.session && req.session._id) {
        return res.status(200).json({
            _id: req.session._id,
            first_name: req.session.first_name,
            last_name: req.session.last_name,
            email: req.session.email
        });
    } else {
        return res.status(401).json({ error: "Not authenticated" });
    }
});


export default router