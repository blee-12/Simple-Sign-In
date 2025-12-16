import { ObjectId, Collection } from "mongodb";
import { unverifiedUsers, users } from "../config/mongoCollections.ts";
import type { UnverifiedUser, User } from "../config/mongoCollections.ts";
import { BadInputError, NotFoundError, InternalServerError} from "../../../common/errors.ts";
import { validateAndTrimString, validateEmail, validateFirstName, validateLastName, validatePassword, validateStrAsObjectId } from "../../../common/validation.ts"; 

// helper function, checks if the email is in use:
async function emailInUse(email: string): Promise<Boolean> { 
  // asuming that its already a valid email

  const userCollection = await users();
  const inUse = await userCollection.findOne({email: email});

  if (inUse) throw new BadInputError("Email is already in use!");
  return false;
}

// example data function
let exportedMethods = {
  async getAllUsers() {
    const userCollection: Collection<User> = await users();
    const userList = await userCollection.find({}).toArray();
    return userList;
  },

  async getUserByID(id: string) {
    id = validateStrAsObjectId(id);

    const userCollection = await users();
    const user = await userCollection.findOne({ _id: new ObjectId(id) });

    if (!user) {
      throw new NotFoundError(`Could not find user with id: ${id}`);
    }

    return user;
  },

  async getUserByEmail(email: string) {
    email = validateEmail(email);

    const userCollection = await users();
    const user = await userCollection.findOne({ email: email});

    if (!user) {
      throw new NotFoundError(`Could not find user with email: ${email}`);
    }

    return user;
  },

  async deleteUser(id: string) {
    id = validateStrAsObjectId(id)

    const userCollection = await users();
    const user = await userCollection.findOneAndDelete({_id: new ObjectId(id)});

    if (!user) {
      throw new NotFoundError(`Could not delete user with id: ${id}`);
    }

    return user;
  },

  async editUser(email: string, first_name: string | null, last_name: string | null, password: string | null) {
    // first get the user
    let user = await this.getUserByEmail(email);
    let modified = false;

    // then we're just gonna update the user object:
    if (first_name) {
      first_name = validateFirstName(first_name);
      user.first_name = first_name;
      modified = true;
    }

    if (last_name) {
      last_name = validateLastName(last_name);
      user.last_name = last_name;
      modified = true;
    }

    if (password) {
      password = validatePassword(password);
      user.password = password;
      modified = true;
    }

    if (!modified){
      throw new BadInputError("Must change provide more than just an email argument!");
    }

    const userCollection = await users();
    const ret = await userCollection.findOneAndUpdate({ email: email }, 
      { $set: 
        { 
          first_name: user.first_name, 
          last_name: user.last_name,
          password: user.password
        }
      }
    );

    if (!ret) {
      throw new NotFoundError(`could not edit user with email ${email}!`);
    }

    return user;
  },

  async addUser(email: string, first_name: string, last_name: string, password: string) {
    email = validateEmail(email);
    await emailInUse(email);

    first_name = validateFirstName(first_name);
    last_name = validateLastName(last_name);
    password = validatePassword(password);

    // and now create a user object
    const user: User = { 
      _id: new ObjectId(),
      email,
      first_name,
      last_name,
      password
    }

    const userCollection = await users();
    const added = await userCollection.insertOne(user);

    if (!added) throw new InternalServerError(`Could not add user ${email}!`);

    return user;
  },

  async createUnverifiedUser(email: string) {
    email = validateEmail(email);
    await emailInUse(email);

    const code = Math.floor(100000 + Math.random() * 900000).toString();

    const unverifiedUserCollection = await unverifiedUsers();
    
    const unverifiedUser: UnverifiedUser = {
      email,
      code
    }
    const result = await unverifiedUserCollection.updateOne({ email: email }, { $set: unverifiedUser }, { upsert: true });
    if (!result.acknowledged) throw new InternalServerError("Unable to create unverified user");
    return unverifiedUser;
  },

  async verifyUserCode(email: string, code: string) {
    email = validateEmail(email);
    code = validateAndTrimString(code, "Code", 6, 6);
    const unverifiedUserCollection = await unverifiedUsers();
    const result = await unverifiedUserCollection.findOne({ email: email, code: code });
    if (!result) throw new NotFoundError("Email or code not found");
  },

  async deleteUnverifiedUser(email: string) {
    email = validateEmail(email);
    const unverifiedUserCollection = await unverifiedUsers();
    const result = await unverifiedUserCollection.deleteOne({ email: email });
    // don't return an error as this isn't really a problem
    if (!result.acknowledged) console.error(`Unable to delete unverified user ${email}`);
  }
};

export default exportedMethods;
