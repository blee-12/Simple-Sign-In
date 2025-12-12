/* SEED WILL CLEAR THE DB, BE WARNED */
import { dbConnection, closeConnection } from "../config/mongoConnection.ts";
import {
  users,
  events
} from "../config/mongoCollections.ts";
import type {
  User,
  Event,
  SignIn
} from "../config/mongoCollections.ts";
import { ObjectId } from "mongodb";

const db = await dbConnection();
await db.dropDatabase();

console.log("Database cleared!");

const userCollection = await users();
const eventCollection = await events();

// create the first user and event:

let st1: User = {
  _id: new ObjectId(),
  email: "bwoods@stevens.edu",
  password: "EncryptThis",
  first_name: "Bennett",
  last_name: "Woods",
};

let ev1: Event = {
  _id: new ObjectId(),
  created_by: st1._id,
  name: "Code this website!",
  time_start: new Date(),
  time_end: new Date(), // I dont wanna mess with dates rn
  attending_users: [],
  checked_in_users: [],
  code: null,
};

// create the signIn object for st1
const signIn1: SignIn = {
  userID: st1._id,
  timestamp: new Date(),
};

// chuck this into the event.
ev1.attending_users.push(signIn1.userID.toString());
ev1.checked_in_users.push(signIn1);

// add the events to the db.
try {
  await userCollection.insertOne(st1);
  await eventCollection.insertOne(ev1);
} catch (e) {
  // on failure, exit.
  console.log("failed to insert into collection: " + e);
}

// exit
await closeConnection();
