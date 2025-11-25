import { ObjectId, Collection } from "mongodb";
import { users, User } from "../config/mongoCollections.js";
import { validateEmail, validateFirstName } from "../../../common/validation.js"; 

// example data function
let exportedMethods = {
  async getAllUsers() {
    const userCollection: Collection<User> = await users();
    const userList = await userCollection.find({}).toArray();
    return userList;
  },

  async getUserByID(id: string) {
    if (!id || typeof id !== "string" || id.trim().length === 0) {
      throw new Error("Id must be a non-empty string");
    }

    if (!ObjectId.isValid(id)) {
      throw new Error("Invalid ObjectId format");
    }

    const userCollection = await users();
    const user = await userCollection.findOne({ _id: new ObjectId(id) });

    if (!user) {
      throw new Error(`Could not find user with id: ${id}`);
    }

    return user;
  },

  async getUserByEmail(email: string) {
    validateEmail(email);

    const userCollection = await users();
    const user = await userCollection.findOne({ email: email});

    if (!user) {
      throw new Error(`Could not find user with email: ${email}`);
    }

    return user;
  },

  async deleteUser(id: string) {

    // validate ID

    const userCollection = await users();
    const user = await userCollection.findOneAndDelete({_id: new ObjectId(id)});

    if (!user) {
      throw new Error(`Could not delete user with id: ${id}`);
    }

    return user;
  },

  async editUser(id: string, email: string | null, first_name: string | null, last_name: string | null, created_events: string | null, attended_events: string | null) {
    // first get the user
    let user = await this.getUserByID(id);
    let modified = false;

    // then we're just gonna update the user object:
    if (email) {
      validateEmail(email);
      user.email = email;
      modified = true;
    }

    if (first_name) {
      validateFirstName(first_name);
      user.first_name = first_name;
      modified = true;
    }

    if (last_name) {
      validateFirstName(last_name);
      user.last_name = last_name;
      modified = true;
    }

    if (created_events) {
      // validate create_events
    }

  }
};

export default exportedMethods;
