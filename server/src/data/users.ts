import { ObjectId, Collection } from "mongodb";
import { users, User } from "../config/mongoCollections.ts";
import { validateEmail, validateFirstName, validateLastName, validatePassword, validateStrAsObjectId } from "../../../common/validation.ts"; 

// helper function, checks if the email is in use:
async function emailInUse(email: string): Promise<Boolean> { 
  // asuming that its already a valid email

  const userCollection = await users();
  const inUse = await userCollection.findOne({email: email});

  if (inUse) throw new Error("Email is already in use!");
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
      throw new Error(`Could not find user with id: ${id}`);
    }

    return user;
  },

  async getUserByEmail(email: string) {
    email = validateEmail(email);

    const userCollection = await users();
    const user = await userCollection.findOne({ email: email});

    if (!user) {
      throw new Error(`Could not find user with email: ${email}`);
    }

    return user;
  },

  async deleteUser(id: string) {
    id = validateStrAsObjectId(id)

    const userCollection = await users();
    const user = await userCollection.findOneAndDelete({_id: new ObjectId(id)});

    if (!user) {
      throw new Error(`Could not delete user with id: ${id}`);
    }

    return user;
  },

  async editUser(email: string, first_name: string | null, last_name: string | null, created_events: string[] | null, attended_events: string[] | null) {
    // first get the user
    let originalEmail = email;
    let user = await this.getUserByEmail(email);
    let modified = false;

    // then we're just gonna update the user object:
    if (email) {
      email = validateEmail(email);
      emailInUse(email)
      user.email = email;
      modified = true;
    }

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

    if (!modified){
      throw new Error("Must change provide more than just an email argument!");
    }

    const userCollection = await users();
    const ret = await userCollection.findOneAndReplace({email: originalEmail}, user);

    if (!ret) {
      throw new Error(`could not edit user with email ${email}!`);
    }

    return user;
  },

  async addUser(email: string, first_name: string, last_name: string, password: string) {
    email = validateEmail(email);
    emailInUse(email);

    first_name = validateFirstName(first_name);
    last_name = validateLastName(last_name);
    password = validatePassword(password);

    // and now create a user object
    const user: User = { 
      email,
      first_name,
      last_name,
      password
    }

    const userCollection = await users();
    const added = await userCollection.insertOne(user);

    if (!added) throw new Error(`Could not add user ${email}!`);

    return user;
  }
};

export default exportedMethods;
