// File: db.ts

import { MongoClient, GridFSBucket, ObjectId } from "mongodb";
import { MONGODB_URL, DATABASE_NAME } from "./config";
let connectedClient;
import { Readable } from "stream";

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

// Function to retrieve all files from MongoDB
export const retrieveAllFilesFromMongoDB = async () => {
  try {
    const db = await connectClient();
    const bucket = new GridFSBucket(db, { bucketName: "documents" });

    const files = await bucket.find().toArray();
    return files;
  } catch (error) {
    console.error("Error retrieving all files from MongoDB:", error);
    throw error;
  }
};

// Function to retrieve a file from MongoDB
export const retrieveFileFromMongoDB = async (fileId) => {
  try {
    const db = await connectClient();
    const bucket = new GridFSBucket(db, { bucketName: "documents" });

    // Ensure fileId is an ObjectId
    const downloadStream = bucket.openDownloadStream(new ObjectId(fileId));
    return downloadStream;
  } catch (error) {
    console.error("Error retrieving file from MongoDB:", error);
    throw error;
  }
};

export const saveUploadedDocument = async (fileBuffer, filename) => {
  try {
    const db = await connectClient();
    const bucket = new GridFSBucket(db, { bucketName: "documents" });

    const readableFileBufferStream = new Readable();
    readableFileBufferStream.push(fileBuffer);
    readableFileBufferStream.push(null); // No more data to push

    const uploadStream = bucket.openUploadStream(filename);

    readableFileBufferStream.pipe(uploadStream);

    return new Promise((resolve, reject) => {
      uploadStream.on("error", reject);
      uploadStream.on("finish", () => resolve(uploadStream.id)); // Resolve with the file id
    });
  } catch (error) {
    console.error("Error saving file to MongoDB:", error);
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
