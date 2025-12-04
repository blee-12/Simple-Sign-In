import { MongoClient, Db } from "mongodb";
import { mongoConfig } from "./mongoSettings.ts";
import {InternalServerError} from "../../../common/errors.ts"

// Type variables as either the object or undefined
let _connection: MongoClient | undefined = undefined;
let _db: Db | undefined = undefined;

const dbConnection = async (): Promise<Db> => {
  if (!_connection) {
    _connection = await MongoClient.connect(mongoConfig.serverUrl);
    _db = _connection.db(mongoConfig.database);
  }

  if (!_db) {
    throw new InternalServerError("Database not initialized");
  }

  return _db;
};

const closeConnection = async (): Promise<void> => {
  if (_connection) {
    await _connection.close();
  }
};

export { dbConnection, closeConnection };
