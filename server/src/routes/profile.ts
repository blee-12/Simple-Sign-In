import { NextFunction, Request, Response, Router } from "express";
import { asyncRoute, requireAuth } from "./utils";
import * as val from "../../../common/validation";
import users from "../data/users";
import { BadInputError } from "../../../common/errors";
import bcrypt from "bcryptjs";
const router = Router();

router.get(
  "/",
  requireAuth,
  asyncRoute(async (req: Request, res: Response, next: NextFunction) => {
    let id = req.session._id || "";
    const user = await users.getUserByID(id);
    const response = {
      _id: user._id,
      email: user.email,
      first_name: user.first_name,
      last_name: user.last_name,
    };
    res.status(200).json({ data: response });
  })
);
router.put(
  "/",
  requireAuth,
  asyncRoute(async (req: Request, res: Response, next: NextFunction) => {
    let email = req.session.email || "";
    let { first_name, last_name, password } = req.body; // user inputs. Must provide at least 1

    if (!first_name.trim() && !last_name.trim() && !password)
      throw new BadInputError("No updated fields provided");

    if (first_name)
      first_name = val.validateFirstName(first_name);

    if (last_name)
      last_name = val.validateLastName(last_name);

    if (password) {
      val.validatePassword(password);
      password = await bcrypt.hash(password, 10);
    }

    const user = await users.editUser(email, first_name, last_name, password);
    const response = {
      email: user.email,
      first_name: user.first_name,
      last_name: user.last_name,
    };
    res.status(200).json({ data: response });
  })
);
router.delete(
  "/",
  requireAuth,
  asyncRoute(async (req: Request, res: Response, next: NextFunction) => {
    let id = req.session._id;
    id = val.validateStrAsObjectId(id);

    //destroy user session first
    req.session.destroy((err) => {
      if (err) {
        console.error(`Error destroying session: ${err}`);
        return res.status(500).send({ error: "Error signing out" });
      }
    });

    const user = await users.deleteUser(id);
    const response = {
      email: user.email,
      first_name: user.first_name,
      last_name: user.last_name,
    };
    res.status(200).json({ data: response });
  })
);

export default router;
