import { NextFunction, Request, Response, Router } from 'express';
import { asyncRoute, requireAuth } from './utils';
import * as val from '../../../common/validation';
import users from '../data/users'
const router = Router()

router.get('/', requireAuth, asyncRoute ( 
    async (req: Request, res: Response, next: NextFunction) => {
        let id = req.session._id || ""
        id = val.validateStrAsObjectId(id)
        const user = await users.getUserByID(id)
        res.status(200).json({ data: user });
    }
));
router.put('/', requireAuth, asyncRoute (
    async (req: Request, res: Response, next: NextFunction) => {
        let id = req.session._id || ""
        id = val.validateStrAsObjectId(id)
        const user = await users.getUserByID(id)
        res.status(200).json({ data: user });
    }
));
router.delete('/', requireAuth, asyncRoute (
    async (req: Request, res: Response, next: NextFunction) => {
        let { id } = req.params
        id = val.validateStrAsObjectId(id)

        //destroy user session first
        req.session.destroy((err) => {
            if (err) {
                console.error(`Error destroying session: ${err}`);
                return res.status(500).send({ error: "Error signing out" });
            }
        })
        
        const user = await users.deleteUser(id)
        res.status(200).json({ data: user })
    }
));


//NOTE add /:id routes if need to access users != self

// Get all route also questionable. When should one logged in user have access to all others..?
// router.get('/users', requireAuth, (req: Request, res: Response, next: NextFunction) => {
//     res.status(200).json({ message: `Users fetched` });
// });

export default router