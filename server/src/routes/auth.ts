// POST /signup
// POST /signin
// GET /signout

import bcrypt from "bcryptjs";
import { Request, Response, Router } from "express";
import {
  validateFirstName,
  validateLastName,
  validateEmail,
  validatePassword,
} from "../../../common/validation";
import { User } from "../config/mongoCollections";

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
    return res.status(400).send({ error: `${err.message}` });
  }
  // TODO: validation passed, check if in DB and store if not
  password = await bcrypt.hash(password, 10);
  // save to session
  req.session.first_name = first_name;
  req.session.last_name = last_name;
  req.session.email = email;
  res.send({ message: "registered & signed in" });
});

router.post("/signin", async (req: Request, res: Response) => {
  let email, password;
  try {
    if (!req.body) throw new Error("No body provided");
    email = validateEmail(req.body.email);
    password = req.body.password;
  } catch (err: any) {
    return res.status(400).send({ error: `${err.message}` });
  }
  // TODO: check against DB
  // ...
  let user: User; // retrieved from DB
  // save to session
  // req.session.first_name = user.first_name; // TODO: uncomment when user is actually fetched
  // req.session.last_name = user.last_name; // TODO: uncomment when user is actually fetched
  req.session.email = email;
  res.send({ status: "signed in" });
});

router.get("/signout", async (req: Request, res: Response) => {
  req.session.destroy((err) => {
    if (err) {
      console.error(`Error destroying session: ${err}`);
      return res.status(500).send({ error: "Error signing out" });
    }
    return res.send({ status: "signed out" });
  });
});

export default router;
