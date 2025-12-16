import { Request, Response, Router } from 'express';
const router = Router()


// POST and GET : Fetch all and fetch by id
router.get('/', (req: Request, res: Response) => {
    res.status(200).json({ message: `Users fetched` });
});

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

router.get('/:id', (req: Request, res: Response) => {
    const { id } = req.params
    res.status(200).json({ message: `Fetched User with ID: ${id}` });
});

export default router