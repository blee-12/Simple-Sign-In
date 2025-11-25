// GET /
// GET /dashboard

import { Request, Response, Router } from 'express';

const router = Router()

// GET users dashboard. Can separate to another file if more routes needed
router.get('/dashboard', (req: Request, res: Response) => {
    res.status(200).json({ message: 'Dashboard data fetched' });
});

// GET root placeholder. May remove if no data needed from this endpoint
router.get('/', (req: Request, res: Response) => {
    res.status(200).json({ message: 'Hello World' });
});

export default router;