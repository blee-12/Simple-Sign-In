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
import bcrypt from "bcryptjs";

const db = await dbConnection();
await db.dropDatabase();

console.log("Database cleared!");

const userCollection = await users();
const eventCollection = await events();

// create the first user and event:
const PASSWORD = "EncryptThis123!";
const hashed_password = await bcrypt.hash(PASSWORD, 10);

let st1: User = {
  _id: new ObjectId(),
  email: "bwoods@stevens.edu",
  password: hashed_password, 
  first_name: "Bennett",
  last_name: "Woods",
};

let st2: User = {
  _id: new ObjectId(),
  email: "bennettwoods2004@gmail.com",
  password: hashed_password, 
  first_name: "Benit",
  last_name: "Voods",
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
  requires_code: true
};

// create the signIn object for st1
const signIn1: SignIn = {
  userID: st1._id.toString(),
  timestamp: new Date(),
};

// chuck this into the event.
ev1.attending_users.push(signIn1.userID.toString());
ev1.checked_in_users.push(signIn1);

// add the events to the db.
try {
  await userCollection.insertOne(st1);
  await userCollection.insertOne(st2);
  await eventCollection.insertOne(ev1);
} catch (e) {
  // on failure, exit.
  console.log("failed to insert into collection: " + e);
}

// exit
await closeConnection();
