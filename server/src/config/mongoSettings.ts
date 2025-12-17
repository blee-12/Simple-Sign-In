import 'dotenv/config';

const env_vars = [
  "MONGODB_URI"
]
for (const ev of env_vars)
  if (process.env[ev] == null)
    throw new Error(`Missing environment variable ${ev}`)

export interface MongoConfig {
  serverUrl: string;
  database: string;
}

export const mongoConfig: MongoConfig = {
  serverUrl: process.env.MONGODB_URI,
  database: "simple-signin-cs554",
};
