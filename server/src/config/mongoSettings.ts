export interface MongoConfig {
  serverUrl: string;
  database: string;
}

export const mongoConfig: MongoConfig = {
  serverUrl: process.env.MONGODB_URI,
  database: "simple-signin-cs554",
};
