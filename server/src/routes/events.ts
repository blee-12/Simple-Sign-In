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
import { asyncRoute, requireAccount, requireSession, sendEmail } from './utils';
import { tokenData, userData } from '../data';
import { checkAndActivateEvent } from '../server';
import { Server } from 'socket.io';

const eventRoutes = (io: Server, activeEvents: Map<string, any>) => {
    const router = Router();

    // POST and GET : Fetch all and create
    router.get('/', requireAccount, asyncRoute ( 
        async (req: Request, res: Response, next: NextFunction) => {
            const email = req.session.email || ""
            let allEvents = await events.getAllEvents();
            allEvents = allEvents.filter((event) => {
                return event.created_by.toHexString() === req.session._id
                || event.attending_users.includes(email)
            })
            return res.status(200).json({ data: allEvents });
        }
    ));
    router.post('/', requireAccount, asyncRoute ( 
        async (req: Request, res: Response, next: NextFunction) => {
            let { name, time_start, time_end, requires_code, attending_users, description } = req.body  // user inputs
            time_start = new Date(time_start);
            time_end = new Date(time_end);
            if (!name || !time_start || !time_end)
                throw new BadInputError("All fields must be provided")
            name = val.validateAndTrimString(name, "Event Name", 5, 100);
            description = val.validateAndTrimString(description, "Event Description", 5, 200);
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
            const event = await events.createEvent(created_by.toString(), name, start, end, requires_code, attending_users, description);
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
            // convert token -> event -> creator
            val.validateStrAsObjectId(randomToken);
            const token = await tokenData.getTokenByID(randomToken);
            const eventId = token.event.toHexString();
            const event = await events.getEventByID(eventId);
            const creator = await userData.getUserByID(event.created_by.toHexString());

            // check in the "user"
            await events.checkInUser(eventId, null, token.email);

            // if they have an account, the auth them.
            try {
                const user = await userData.getUserByEmail(token.email);
                req.session._id = user._id.toHexString();
                req.session.first_name = user.first_name;
                req.session.last_name = user.last_name;
                req.session.email = user.email;
            } catch (_) { // if not then just give them some minimal auth.
                req.session._id = token._id.toHexString();
                req.session.email = token.email;
                req.session.temporary = true;
            }

            // send a message tro the socket.
            io.to(`${eventId}_creator`).emit("user_checked_in", { 
                userID: token.email, 
                timestamp: new Date().toISOString() 
            });

            // return the updated event.
            const updatedEvent = await events.getEventByID(eventId);
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

    router.get('/:id', requireSession, asyncRoute ( 
        async (req: Request<{id: string}>, res: Response, next: NextFunction) => {
            let { id } = req.params
            id = val.validateStrAsObjectId(id, 'Event ID');
            const event = await events.getEventByID(id)

            // check if user is member
            let email = req.session.email || ""
            if (!event.attending_users.includes(email))
                throw new UnauthenticatedError("You are not authorized to view this resource");

            return res.status(200).json({data: event});
        }
    ));
    router.put('/:id', requireAccount, asyncRoute ( 
        async (req: Request<{id: string}>, res: Response, next: NextFunction) => {
            let { id } = req.params
            id = val.validateStrAsObjectId(id, 'Event ID');
            
            let { name, time_start, time_end, description } = req.body  // user inputs. Must provide at least 1
            if (!name.trim() && !time_start && !time_end && !description.trim())
            throw new BadInputError("No updated fields provided");

            time_start = new Date(time_start);
            time_end = new Date(time_end);
            // check ownership
            const userId = req.session._id
            const event = await events.getEventByID(id);
            if (event.created_by.toHexString() != userId) {
                throw new UnauthenticatedError("You are not authorized to edit this event");
            }

            const updated = await events.editEvent(
            id,
            name,
            time_start,
            time_end,
            description
            );
            res.status(200).json({ data: updated });
        }
    ));
    router.delete('/:id', requireAccount, asyncRoute ( 
        async (req: Request<{id: string}>, res: Response, next: NextFunction) => {
            let { id } = req.params
            id = val.validateStrAsObjectId(id, 'Event ID');

            // check ownership
            const userId = req.session._id
            const event = await events.getEventByID(id);
            if (event.created_by.toHexString() != userId) {
                throw new UnauthenticatedError("You are not authorized to delete this event");
            }

            const deleted = events.deleteEvent(id)
            res.status(200).json({ data: deleted });
        }
    ));

    // send out event emails
    router.post('/:id/email', requireAccount, asyncRoute (
        async (req: Request<{id: string}>, res: Response, next: NextFunction) => {
            let { id } = req.params
            id = val.validateStrAsObjectId(id, 'Event ID');

            const event = await events.getEventByID(id);

            // check ownership
            const userId = req.session._id
            if (event.created_by.toHexString() != userId) {
                throw new UnauthenticatedError("You are not authorized to use this feature");
            }

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

    // register users to an event from list of email addresses
    router.post('/:id/register', requireAccount, asyncRoute (
        async (req: Request<{id: string}>, res: Response, next: NextFunction) => {
            let { id } = req.params
            id = val.validateStrAsObjectId(id, 'Event ID');

            // check ownership
            const userId = req.session._id
            const event = await events.getEventByID(id);
            if (event.created_by.toHexString() != userId) {
                throw new UnauthenticatedError("You are not authorized to edit this event");
            }

            let emails: string[] = req.body;
            if (!Array.isArray(emails)) throw new BadInputError('Expected array of emails as body');
            emails = emails.map(email => val.validateEmail(email));

            for (const email of emails) {
                await events.registerUser(id, null, email);
            }

            res.status(200).json({ message: 'Success' })
        }
    ));

    return router;
};

export default eventRoutes;
