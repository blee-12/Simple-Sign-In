// GET /events
// POST /events
// GET /events/:id
// PUT /events/:id
// DELETE /events/:id
// POST /events/join/:randomToken

import { NextFunction, Request, Response, Router } from 'express';
import events from '../data/events'
import * as val from '../../../common/validation';
import { BadInputError, UnauthenticatedError } from '../../../common/errors';
import { asyncRoute, requireAuth, sendEmail } from './utils';
import { tokenData, userData } from '../data';
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
        let { name, time_start, time_end, requires_code, attending_users } = req.body  // user inputs
        time_start = new Date(time_start);
        time_end = new Date(time_end);
        if (!name || !time_start || !time_end)
            throw new BadInputError("All fields must be provided")
        name = val.validateAndTrimString(name, "Event Name", 5, 100)
        const start = new Date(time_start);
        const end = new Date(time_end);
        val.validateStartEndDates(start, end);
        if(!Array.isArray(attending_users)) {        
            throw new BadInputError("An Array of using attending the event must be provided");
        }
        if (attending_users.length === 0) throw new BadInputError("At least one user must be attending the event!")
        attending_users.map((email: any) => val.validateEmail(email));

        if (typeof(requires_code) != "boolean") throw new BadInputError("requires_code must be a boolean");

        const created_by = req.session._id || "";
        const event = await events.createEvent(created_by.toString(), name, start, end, requires_code, attending_users);;
        checkAndActivateEvent(event);
        res.status(201).json({ data: event });
    }
));

// GET join/:randomToken
router.get('/join/:randomToken', asyncRoute (
    async (req: Request, res: Response, next: NextFunction) => {
        const { randomToken } = req.params;
        val.validateStrAsObjectId(randomToken);
        const token = await tokenData.getTokenByID(randomToken);
        const event = await events.getEventByID(token.event.toHexString());
        const creator = await userData.getUserByID(event.created_by.toHexString());

        const data = {
            _id: event._id,
            name: event.name,
            time_start: event.time_start,
            time_end: event.time_end,
            requires_code: event.requires_code,
            created_by: creator.email
        }

        res.status(200).json(data);
    }
));
// POST join/:randomToken
router.post('/join/:randomToken', asyncRoute (
    async (req: Request, res: Response, next: NextFunction) => {
        const { randomToken } = req.params;
        const code = req.body?.code;
        val.validateStrAsObjectId(randomToken);
        const token = await tokenData.getTokenByID(randomToken);
        const event = await events.getEventByID(token.event.toHexString());
        const creator = await userData.getUserByID(event.created_by.toHexString());

        if (event.requires_code) {
            if (!code) throw new UnauthenticatedError("This event requires a code");
            // TODO: check code against current event code
        }

        // check in
        await events.checkInUser(event._id.toHexString(), null, token.email);

        try {
            const user = await userData.getUserByEmail(token.email);
            req.session._id = user._id.toHexString();
            req.session.first_name = user.first_name;
            req.session.last_name = user.last_name;
            req.session.email = user.email;
        } catch (_) {
            // no account associated with email
            req.session._id = token._id.toHexString();
            req.session.email = token.email;
            req.session.temporary = true;
        }

        
        const updatedEvent = await events.getEventByID(token.event.toHexString());
        const data = {
            _id: event._id,
            name: event.name,
            time_start: event.time_start,
            time_end: event.time_end,
            requires_code: event.requires_code,
            created_by: creator.email,
            checked_in_users: updatedEvent.checked_in_users
        }

        res.status(200).json(data);
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
                `Click here to join the event: ${process.env.CLIENT_URL}/event/join/${token._id.toHexString()}`
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
