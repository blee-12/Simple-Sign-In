// GET /

import { NextFunction, Request, Response, Router } from 'express';

const router = Router()

// Placeholder
router.get('/', (req: Request, res: Response, next: NextFunction) => {
    res.status(200).json({ message: 'Hello World' });
});

export default router;