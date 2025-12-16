// GET /events
// POST /events
// GET /events/:id
// PUT /events/:id
// DELETE /events/:id
// POST /events/join/:randomToken

import { NextFunction, Request, Response, Router } from 'express';
import events from '../data/events'
import * as val from '../../../common/validation';
import { BadInputError } from '../../../common/errors';
import { asyncRoute, requireAuth } from './utils';
import { checkAndActivateEvent } from '../server';
const router = Router()

// POST and GET : Fetch all and create
router.get('/', requireAuth, asyncRoute ( 
    async (req: Request, res: Response, next: NextFunction) => {
        const allEvents = await events.getAllEvents();
        return res.status(200).json({ data: allEvents });
    }
));
router.post('/', requireAuth, asyncRoute ( 
    async (req: Request, res: Response, next: NextFunction) => {
        let { name, time_start, time_end } = req.body 
        if (!name || !time_start || !time_end)
            throw new BadInputError("All fields must be provided")
        name = val.validateAndTrimString(name, "Event Name", 5, 100)
        const start = new Date(time_start);
        const end = new Date(time_end);
        val.validateStartEndDates(start, end);
        
        const created_by = req.session._id || ""
        const event = await events.createEvent(created_by.toString(), name, start, end);
        checkAndActivateEvent(event);
        res.status(201).json({ data: event });
    }
));

// GET join/:randomToken
router.post('/join/:randomToken', asyncRoute (
    //TODO
    async (req: Request, res: Response, next: NextFunction) => {
        const { randomToken } = req.params
        res.status(200).json({ message: `Used ${randomToken} to join event` });
    }
));

// /:id
router.get('/:id', requireAuth, asyncRoute ( 
    async (req: Request<{id: string}>, res: Response, next: NextFunction) => {
        let { id } = req.params
        id = val.validateStrAsObjectId(id, 'Event ID');
        const event = await events.getEventByID(id)
        return res.status(200).json({data: event});
    }
));
router.put('/:id', requireAuth, asyncRoute ( 
    async (req: Request<{id: string}>, res: Response, next: NextFunction) => {
        let { id } = req.params
        let { name, time_start, time_end } = req.body  // user inputs. Must provide at least 1
        id = val.validateStrAsObjectId(id, 'Event ID');
        if (!name.trim() && !time_start && !time_end)
            throw new BadInputError("No updated fields provided")

        const updated = events.editEvent(id, name, time_start, time_end)
        res.status(200).json({ data: updated });
    }
));
router.delete('/:id', requireAuth, asyncRoute ( 
    async (req: Request<{id: string}>, res: Response, next: NextFunction) => {
        let { id } = req.params
        id = val.validateStrAsObjectId(id, 'Event ID');

        const deleted = events.deleteEvent(id)
        res.status(200).json({ data: deleted });
    }
));

export default router;
