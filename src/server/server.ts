// File: server.ts

import express from "express";
import path from "path";
import os from "os";

import config from "./config"; // Contains settings like PORT and HOST for server initialization.
import apiRouter from "./api-router"; // Defines API route handlers for endpoints starting with '/api'.
import serverRender from "./render"; // Handles server-side rendering to return initial HTML to the client.
import "dotenv/config";

const server = express(); // Initializes a new Express application.

server.use(express.static("dist")); // Serves up static assets from the 'dist' directory which includes compiled frontend files.

server.set("views", path.join(__dirname, "../../views")); // Configures the directory where the view templates are stored.
server.set("view engine", "ejs"); // Sets up EJS as the template engine for rendering views.

server.use("/api", apiRouter); // Mounts the API router to handle API requests under the '/api' namespace.

server.get(["/", "/contest/:contestId"], async (req, res) => {
  try {
    const { initialMarkup, initialData } = await serverRender(req);
    res.render("index", { initialMarkup, initialData });
  } catch (error) {
    res.status(500).send("Internal Server Error");
  }
});

server.listen(config.PORT, config.HOST, () => {
  console.info(
    `Express server is listening at ${config.SERVER_URL}`,
    `Free Mem: ${os.freemem() / 1024 / 1024}`,
  );
});
