import { ObjectId, Collection } from "mongodb";
import { users, User } from "../config/mongoCollections.js";

// example data function
let exportedMethods = {
  async getAllUsers() {
    const userCollection: Collection<User> = await users();
    const userList = await userCollection.find({}).toArray();
    return userList;
  },
};

export default exportedMethods;
