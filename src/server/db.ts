// File: db.ts

import { MongoClient } from "mongodb";
import { MONGODB_URL, DATABASE_NAME } from "./config";
let connectedClient;

// Asynchronously establishes a connection to the MongoDB server and returns the database instance.
export const connectClient = async () => {
  if (connectedClient) {
    return connectedClient.db(DATABASE_NAME);
  }

  const client = new MongoClient(MONGODB_URL);
  await client.connect();
  await client.db(DATABASE_NAME).command({ ping: 1 });
  console.info("Connected to MongoDB");

  connectedClient = client;

  return connectedClient.db(DATABASE_NAME);
};

// Function to save the corrected document text to MongoDB
export const saveCorrectedDocumentToMongoDB = async (
  correctedText,
  originalText,
) => {
  try {
    const db = connectedClient.db(DATABASE_NAME);
    const result = await db.collection("correctedDocuments").insertOne({
      originalText,
      correctedText,
      createdAt: new Date(),
    });
    return result.insertedId; // Return the inserted document's ID
  } catch (error) {
    console.error("Error saving to MongoDB:", error);
    throw error; // Rethrow the error to be handled by the caller
  }
};

// Asynchronously closes the MongoDB connection if it exists.
export const stopClient = async () => {
  if (connectedClient) {
    await connectedClient.close();
    console.info("Disconnected from MongoDB");
  }
};
