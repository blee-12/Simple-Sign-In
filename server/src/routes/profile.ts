// GET /profile
// PUT /profile

import { Request, Response, Router } from 'express';

const router = Router()

// GET profile placeholder
router.get('/profile', (req: Request, res: Response) => {
    res.status(200).json({ message: 'Profile data fetched' });
});

// PUT profile placeholder
router.put('/profile', (req: Request, res: Response) => {
    res.status(201).json({ message: 'Profile updated' });
});

export default router;