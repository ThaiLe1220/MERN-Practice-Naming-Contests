/* eslint-disable no-useless-escape */
// File: api-router.ts

import express from "express";
import cors from "cors";
import { connectClient, saveCorrectedDocumentToMongoDB } from "./db";
import axios from "axios";
import multer from "multer";
import mammoth from "mammoth";

const router = express.Router();
router.use(cors());
router.use(express.json());

const storage = multer.memoryStorage(); // Store files in memory
const upload = multer({ storage: storage });

// Route to get a list of all contests.
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

// Route to get a single contest by its ID.
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
    try {
      if (!req.file) throw new Error("No file uploaded");

      // Extract text from Word document
      const textResult = await mammoth.extractRawText({
        buffer: req.file.buffer,
      });
      const documentText = textResult.value; // The extracted text

      // Split text into sentences
      const sentences = documentText.match(/[^\.!\?]+[\.!\?]+/g);

      // Array to hold promises
      let grammarCheckPromises = [];

      // Check grammar for each sentence
      sentences.forEach((sentence) => {
        const prompt = `correct english of this sentence: ${sentence}`;
        // Push the promise from the API call into the array
        grammarCheckPromises.push(
          axios.get(`https://3c92-103-253-89-37.ngrok-free.app/generate_code`, {
            params: { prompts: prompt },
          }),
        );
      });

      // Resolve all promises
      const grammarResults = await Promise.all(grammarCheckPromises);

      // Extract corrected sentences
      const correctedSentences = grammarResults.map((result) => result.data);

      // Reassemble the corrected document from the corrected sentences
      const correctedDocument = correctedSentences.join(" ");

      // Save to MongoDB
      const savedDocumentId = await saveCorrectedDocumentToMongoDB(
        correctedDocument,
        documentText,
      );
      res.json({
        message: "Document processed and saved successfully",
        id: savedDocumentId,
      });
      // Send the response
      res.json({ correctedText: correctedDocument });
    } catch (error) {
      console.error("Error processing the document:", error);
      res.status(500).json({
        message: "Error processing the document",
        error: error.message,
      });
    }
  },
);

export default router;
