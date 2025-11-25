// POST /event/create
// GET /event/:id
// PUT /event/:id
// GET /event/:id/details
// POST /event/join/:randomToken

import { Request, Response, Router } from 'express';
const router = Router()


// POST and GET : Fetch all and create
router.get('/', (req: Request, res: Response) => {
    res.status(200).json({ message: `Events fetched` });
});
router.post('/', (req: Request, res: Response) => {
    res.status(201).json({ message: 'Event created successfully' });
});


// GET join/:randomToken
router.post('/join/:randomToken', (req: Request, res: Response) => {
    const { randomToken } = req.params
    res.status(200).json({ message: `Used ${randomToken} to join event` });
});


// /:id
router.get('/:id', (req: Request, res: Response) => {
    const { id } = req.params
    res.status(200).json({ message: `Fetched event with ID: ${id}` });
});
router.put('/:id', (req: Request, res: Response) => {
    const { id } = req.params
    res.status(200).json({ message: `Updated event with ID: ${id}` });
});
router.get('/:id/details', (req: Request, res: Response) => {
    const { id } = req.params
    res.status(200).json({ message: `Details of event with ID: ${id}` });
});

export default router;
