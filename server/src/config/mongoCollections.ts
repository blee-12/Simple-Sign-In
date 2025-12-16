import { ObjectId } from "mongodb";
import type { Collection } from "mongodb";
import { dbConnection } from "./mongoConnection.ts";

// Defining ts types for the documents:

// SignIn object
export interface SignIn {
  userID: User["email"];
  timestamp: Date;
}

// User document
export interface User {
  _id: ObjectId; 
  email: string;
  password: string;
  first_name: string;
  last_name: string;
}

// Event document
export interface Event {
  _id: ObjectId; 
  created_by: User["_id"]; 
  name: string;
  time_start: Date;
  time_end: Date;
  attending_users: User["email"][];
  checked_in_users: SignIn[]; 
  code: string | null;
}

// Token used in join links
export interface Token {
  _id: ObjectId;
  email: string;
  event: Event["_id"];
}

const getCollectionFn = <T extends object>(collection: string) => {
  let _col: Collection<T> | undefined = undefined;

  return async (): Promise<Collection<T>> => {
    if (!_col) {
      const db = await dbConnection();
      _col = db.collection<T>(collection);
    }

    return _col;
  };
};

export const users = getCollectionFn<User>("users");
export const events = getCollectionFn<Event>("events");
export const tokens = getCollectionFn<Token>("tokens");
