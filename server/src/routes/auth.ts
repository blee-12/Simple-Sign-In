// POST /signup
// POST /signin
// GET /signout

import bcrypt from "bcryptjs";
import { NextFunction, Request, Response, Router } from "express";
import {
  validateFirstName,
  validateLastName,
  validateEmail,
  validatePassword,
  validateAndTrimString,
} from "../../../common/validation";
import { userData } from '../data';
import { asyncRoute, requireAuth, sendEmail } from "./utils";
import { BadInputError, NotFoundError } from "../../../common/errors";

const router = Router();

router.post("/signup", asyncRoute (
  async (req: Request, res: Response, next: NextFunction) => {
    if (!req.body) throw new BadInputError("No body provided");
    let first_name = validateFirstName(req.body.first_name);
    let last_name = validateLastName(req.body.last_name);
    let email = validateEmail(req.body.email);
    let password = validatePassword(req.body.password);
    let code = validateAndTrimString(req.body.code, "Code", 6, 6);

    await userData.verifyUserCode(email, code);

    password = await bcrypt.hash(password, 10);

    let user;
    try { user = await userData.getUserByEmail(email); } 
    catch (e) {
      // 404 is good
      if (!(e instanceof NotFoundError)) {
        throw e;
      }
    }
    const newUser = await userData.addUser(email, first_name, last_name, password);

    await userData.deleteUnverifiedUser(email);
    
    // save to session
    req.session._id = newUser._id.toHexString();
    req.session.first_name = first_name;
    req.session.last_name = last_name;
    req.session.email = email;
    res.send({message: "registered & signed in"});
  }
));

router.post("/signin", asyncRoute (
  async (req: Request, res: Response, next: NextFunction) => {
    if (!req.body) throw new BadInputError("No body provided");
    let email = validateEmail(req.body.email);
    let password = req.body.password;

    const user = await userData.getUserByEmail(email);
    if (!user) throw new BadInputError("Email or password invalid");
    const result = await bcrypt.compare(password, user.password);
    if (!result) throw new BadInputError("Email or password invalid");

    // save to session
    req.session._id = user._id.toHexString();
    req.session.first_name = user.first_name;
    req.session.last_name = user.last_name;
    req.session.email = email;
    res.send({status: "signed in"});
  }
));

router.get("/signout", requireAuth, asyncRoute (
  async (req: Request, res: Response, next: NextFunction) => {
    req.session.destroy((err) => {
      if (err) {
        console.error(`Error destroying session: ${err}`);
        return res.status(500).send({ error: "Error signing out" });
      }
      return res.send({ status: "signed out" });
    });
  }
));

router.post("/verify", asyncRoute (
  async (req: Request, res: Response, next: NextFunction) => {
    const email = validateEmail(req.body.email);
    const unverifiedUser = await userData.createUnverifiedUser(email);
    await sendEmail(email, "Verify your email", `Your verification code is: ${unverifiedUser.code}`);
    res.status(200).json({ message: "Code sent to email" });
  }
));

export default router;
