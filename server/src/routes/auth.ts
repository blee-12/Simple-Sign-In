// POST /signup
// POST /signin
// GET /signout

import bcrypt from 'bcryptjs';
import { Request, Response, Router } from 'express';
import { validateFirstName, validateLastName, validateEmail, validatePassword } from '../../../common/validation';
import { User } from '../config/mongoCollections';
import { userData } from '../data';

const router = Router();

router.post("/signup", async (req: Request, res: Response) => {
    let first_name, last_name, email, password;
    try {
        if (!req.body) throw new Error("No body provided");
        first_name = validateFirstName(req.body.first_name);
        last_name = validateLastName(req.body.last_name);
        email = validateEmail(req.body.email);
        password = validatePassword(req.body.password);
    } catch (err: any) {
        return res.status(400).send({error: `${err.message}`});
    }
    password = await bcrypt.hash(password, 10);
    const user = await userData.getUserByEmail(email);
    if (user) return res.status(400).send({error: "Email already exists"});
    const id = await userData.addUser(email, first_name, last_name, password);
    // save to session
    req.session._id = id;
    req.session.first_name = first_name;
    req.session.last_name = last_name;
    req.session.email = email;
    res.send({message: "registered & signed in"});
});

router.post("/signin", async (req: Request, res: Response) => {
    let email, password;
    try {
        if (!req.body) throw new Error("No body provided");
        email = validateEmail(req.body.email);
        password = req.body.password;
    } catch (err: any) {
        return res.status(400).send({error: `${err.message}`});
    }
    const user = await userData.getUserByEmail(email);
    if (!user) return res.status(400).send({error: "Email or password invalid"});
    const result = await bcrypt.compare(password, user.password);
    if (!result) return res.status(400).send({error: "Email or password invalid"});
    // save to session
    req.session._id = user._id;
    req.session.first_name = user.first_name;
    req.session.last_name = user.last_name;
    req.session.email = email;
    res.send({status: "signed in"});
});

router.get("/signout", async (req: Request, res: Response) => {
    req.session.destroy((err) => {
        if (err) {
            console.error(`Error destroying session: ${err}`);
            return res.status(500).send({error: "Error signing out"});
        }
        return res.send({status: "signed out"});
    });
});

export default router;
