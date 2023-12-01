// File: config.ts

const env = process.env;

// Default to port 8080 if not specified in the environment
export const PORT = env.PORT ?? "8080";
// Default to localhost if not specified in the environment
export const HOST = env.HOST ?? "localhost";
// Construct the server URL using the HOST and PORT
export const SERVER_URL = `http://${HOST}:${PORT}/`;

// MongoDB connection URL, defaulting to the local MongoDB instance
export const MONGODB_URL = env.MONGODB_URL ?? "mongodb://localhost:27017";
// Default database name if not specified
export const DATABASE_NAME = env.DATABASE_NAME ?? "local";

// Exporting configuration as a default object
export default {
  PORT,
  HOST,
  SERVER_URL,
  MONGODB_URL,
  DATABASE_NAME,
};
