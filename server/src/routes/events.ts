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
import { asyncRoute, requireAuth, sendEmail } from './utils';
import { tokenData } from '../data';
import { CLIENT_URL } from '../config/staticAssets';
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
        let { name, time_start, time_end } = req.body  // user inputs
        if (!name || !time_start || !time_end)
            throw new BadInputError("All fields must be provided")
        name = val.validateAndTrimString(name, "Event Name", 5, 100)
        time_start = new Date(time_start);
        time_end = new Date(time_end);
        val.validateStartEndDates(time_start, time_end);

        const created_by = req.session._id || ""
        const event = await events.createEvent(created_by, name, time_start, time_end)
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

// send out event emails
router.post('/:id/email', requireAuth, asyncRoute (
    async (req: Request<{id: string}>, res: Response, next: NextFunction) => {
        let { id } = req.params
        id = val.validateStrAsObjectId(id, 'Event ID');

        const event = await events.getEventByID(id);
        const attendees = event.attending_users
            .filter(user => !event.checked_in_users.map(s => s.userID).includes(user))
        const tokenChecks = attendees.map(async user => !(await tokenData.tokenExists(user, id)));
        let invitees = [];
        for (let i = 0; i < attendees.length; i++)
            if (await tokenChecks[i])
                invitees.push(attendees[i]);

        
        // generate tokens
        // if creating a token fails we're just gonna ignore it
        const newTokens = (await Promise.all(invitees.map(async (user) => {
            try {
                return await tokenData.createToken(user, id);
            } catch (e) {
                return 0;
            }
        }))).filter(t => t != 0);
        
        // send out emails concurrently
        // supressing errors for now
        try {
            const results = await Promise.all(newTokens.map(async (token) => await sendEmail(
                token.email,
                `Join your event "${event.name}" now!`,
                `Click here to join the event: ${CLIENT_URL}/event/join/${token._id.toHexString()}`
            )));
        } catch (err: any) {
            console.error(`Email error: ${err.message}`);
        }
        res.status(200).json({ message: `Sent out ${newTokens.length} emails` })
    }
));

// register users
router.post('/:id/register', requireAuth, asyncRoute (
    async (req: Request<{id: string}>, res: Response, next: NextFunction) => {
        let { id } = req.params
        id = val.validateStrAsObjectId(id, 'Event ID');
        let emails: string[] = req.body;
        if (!Array.isArray(emails)) throw new BadInputError('Expected array of emails as body');
        emails = emails.map(email => val.validateEmail(email));

        for (const email of emails) {
            await events.registerUser(id, null, email);
        }

        res.status(200).json({ message: 'Success' })
    }
));

export default router;
