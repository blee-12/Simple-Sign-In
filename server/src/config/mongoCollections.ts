import { Collection, Document, ObjectId } from "mongodb";
import { dbConnection } from "./mongoConnection.js";

// Defining ts types for the documents:

// SignIn object, doesn't need to extend document
export interface SignIn {
  userID: ObjectId;
  timestamp: Date;
}

// User document
export interface User extends Document {
  _id?: ObjectId;
  email: string;
  first_name: string;
  last_name: string;
  created_events: ObjectId[];
  attended_events: ObjectId[];
}

// Event document
export interface Event extends Document {
  _id?: string;
  created_by: ObjectId;
  name: string;
  time_start: Date;
  time_end: Date;
  attending_users: SignIn["userID"];
  code: string | null;
}

const getCollectionFn = <T extends Document = Document>(collection: string) => {
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
export const snippets = getCollectionFn<Event>("events");
