import { Request, Response, Router } from 'express';
const router = Router()


// POST and GET : Fetch all and fetch by id
router.get('/', (req: Request, res: Response) => {
    res.status(200).json({ message: `Users fetched` });
});
router.get('/:id', (req: Request, res: Response) => {
    const { id } = req.params
    res.status(200).json({ message: `Fetched User with ID: ${id}` });
});

export default router