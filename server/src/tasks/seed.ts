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

const now = new Date();
const fifteen_mins_from_now = new Date(new Date().getTime() + 15*60000);
const fifteen_mins_ago = new Date(new Date().getTime() - 15*60000);
const one_hour_from_now = new Date(new Date().getTime() + 60*60000);
const one_day_from_now = new Date(new Date().getTime() + 24*60*60000);
const one_day_ago = new Date(new Date().getTime() - 24*60*60000);
const one_hour_ago = new Date(new Date().getTime() - 60*60000);

// create the first user and event:
const PASSWORD = "Testpass123!";
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
  email: "blee12@stevens.edu",
  password: hashed_password, 
  first_name: "Brendan",
  last_name: "Lee",
};

let st3: User = {
  _id: new ObjectId(),
  email: "pvanguru@stevens.edu",
  password: hashed_password, 
  first_name: "Praneeth",
  last_name: "Vanguru",
};


let active1: Event = {
  _id: new ObjectId(),
  created_by: st2._id,
  name: "The Main Event!",
  time_start: fifteen_mins_ago,
  time_end: one_hour_from_now,
  description: "This is a test event created during seeding.",
  attending_users: [],
  checked_in_users: [],
  code: null,
  requires_code: true
};

let upcoming1: Event = {
  _id: new ObjectId(),
  created_by: st1._id,
  name: "Attend Soon!",
  time_start: one_hour_from_now,
  time_end: one_day_from_now,
  description: "This is a test event created during seeding.",
  attending_users: [],
  checked_in_users: [],
  code: null,
  requires_code: true
};


let past1: Event = {
  _id: new ObjectId(),
  created_by: st3._id,
  name: "I Happened Already!",
  time_start: one_day_ago,
  time_end: fifteen_mins_ago,
  description: "This is a test event created during seeding.",
  attending_users: [],
  checked_in_users: [],
  code: null,
  requires_code: true
};


let active2: Event = {
  _id: new ObjectId(),
  created_by: st1._id,
  name: "Coding Challenge!",
  time_start: fifteen_mins_ago,
  time_end: one_hour_from_now,
  description: "This is a test event created during seeding.",
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

const signIn2: SignIn = {
  userID: st2._id.toString(),
  timestamp: new Date(),
};

const signIn3: SignIn = {
  userID: st3._id.toString(),
  timestamp: new Date(),
};

// chuck this into the event.
active1.attending_users.push(signIn1.userID.toString());
active1.checked_in_users.push(signIn1);

upcoming1.attending_users.push(signIn1.userID.toString());
upcoming1.attending_users.push(signIn2.userID.toString());

past1.attending_users.push(signIn1.userID.toString());
past1.attending_users.push(signIn2.userID.toString());
past1.attending_users.push(signIn3.userID.toString());
active2.checked_in_users.push(signIn1);
active2.checked_in_users.push(signIn2);


active2.attending_users.push(signIn1.userID.toString());
active2.attending_users.push(signIn2.userID.toString());
active2.attending_users.push(signIn3.userID.toString());
active2.checked_in_users.push(signIn1);
active2.checked_in_users.push(signIn2);

// add the events to the db.
try {
  await userCollection.insertOne(st1);
  await userCollection.insertOne(st2);
  await userCollection.insertOne(st3);
  await eventCollection.insertOne(active1);
  await eventCollection.insertOne(upcoming1);
  await eventCollection.insertOne(past1);
  await eventCollection.insertOne(active2);
} catch (e) {
  // on failure, exit.
  console.log("failed to insert into collection: " + e);
}

// exit
await closeConnection();
