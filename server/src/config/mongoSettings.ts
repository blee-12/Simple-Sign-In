export interface MongoConfig {
  serverUrl: string;
  database: string;
}

export const mongoConfig: MongoConfig = {
  serverUrl: "mongodb://localhost:27017/",
  database: "simple-signin-cs554",
};
