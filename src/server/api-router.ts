/* eslint-disable no-useless-escape */
// File: api-router.ts

import express from "express";
import cors from "cors";
import {
  connectClient,
  saveUploadedDocument,
  retrieveFileFromMongoDB,
  retrieveAllFilesFromMongoDB,
} from "./db";
import axios from "axios";
import multer from "multer";

const router = express.Router();
router.use(cors());
router.use(express.json());

const storage = multer.memoryStorage(); // Store files in memory
const upload = multer({ storage: storage });

router.get("/contests", async (req, res) => {
  const client = await connectClient();
  const contests = await client
    .collection("contests")
    .find()
    .project({
      id: 1,
      categoryName: 1,
      contestName: 1,
      description: 1,
      _id: 0,
    })
    .toArray();

  res.send({ contests });
});

router.get("/contests/:contestId", async (req, res) => {
  const client = await connectClient();
  const contest = await client
    .collection("contests")
    .findOne({ id: req.params.contestId });

  if (contest) {
    res.send({ contest });
  } else {
    res.status(404).send({ message: "Contest not found" });
  }
});

router.post("/contests/:contestId", async (req, res) => {
  const client = await connectClient();
  const { newNameValue } = req.body;

  const doc = await client.collection("contests").findOneAndUpdate(
    { id: req.params.contestId },
    {
      $push: {
        names: {
          id: newNameValue.toLowerCase().replace(/\s/g, "-"),
          name: newNameValue,
          timestamp: new Date(),
        },
      },
    },
    {
      returnDocument: "after",
    },
  );

  res.send({ updatedContest: doc.value });
});

router.post("/contests/", async (req, res) => {
  const { contestName, categoryName, description } = req.body;

  const client = await connectClient();
  const doc = await client.collection("contests").insertOne({
    id: contestName.toLowerCase().replace(/\s/g, "-"),
    contestName,
    categoryName,
    description,
    names: [],
  });

  const contest = await client
    .collection("contests")
    .findOne({ _id: doc.insertedId });

  res.send({ contest });
});

router.delete("/contests/:contestId", async (req, res) => {
  const client = await connectClient();
  try {
    await client.collection("contests").deleteOne({ id: req.params.contestId });
    res.json({ message: "Contest deleted successfully." });
  } catch (error) {
    res.status(500).json({ message: "Error deleting contest", error });
  }
});

router.post("/suggest-contest-name", async (req, res) => {
  const userSubject = req.body.subject; // Assume 'subject' is passed in the request body
  const prompt = `Suggest 3 creative names for a contest about ${userSubject}:`;

  try {
    const openaiResponse = await axios.post(
      "https://api.openai.com/v1/engines/text-davinci-003/completions",
      {
        prompt: prompt,
        temperature: 0.7,
        max_tokens: 35,
        top_p: 1.0,
        frequency_penalty: 0.5,
        presence_penalty: 0.0,
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        },
      },
    );

    // Extract multiple suggestions if needed
    const suggestions = openaiResponse.data.choices.map((choice) =>
      choice.text.trim(),
    );
    res.json({ suggestions });
  } catch (error) {
    console.error("Error calling OpenAI API:", error);
    res.status(500).json({
      message: "Error generating contest name",
      error: error.response ? error.response.data : error.message,
    });
  }
});

router.post(
  "/upload-contest-document",
  upload.single("file"),
  async (req, res) => {
    if (!req.file) return res.status(400).send("No file uploaded.");

    try {
      const fileId = await saveUploadedDocument(
        req.file.buffer,
        req.file.originalname,
      );
      res
        .status(201)
        .send({ fileId: fileId.toString(), filename: req.file.originalname });
    } catch (error) {
      res.status(500).send("Error saving file: " + error.message);
    }
  },
);

// In your Express router, add a new route to list all files
router.get("/list-documents", async (req, res) => {
  try {
    const files = await retrieveAllFilesFromMongoDB();
    res.send(
      files.map((file) => ({ filename: file.filename, fileId: file._id })),
    );
  } catch (error) {
    res.status(500).send("Error listing files: " + error.message);
  }
});

router.get("/download-contest-document/:fileId", async (req, res) => {
  try {
    const fileId = req.params.fileId;
    const fileStream = await retrieveFileFromMongoDB(fileId);
    fileStream.on("file", (file) => {
      // Set the response header to indicate a file attachment with the correct filename
      res.setHeader(
        "Content-Disposition",
        "attachment; filename=" + file.filename,
      );
    });
    // Pipe the file stream directly to the response object
    fileStream.pipe(res);
  } catch (error) {
    res.status(500).send("Error downloading file: " + error.message);
  }
});

export default router;
