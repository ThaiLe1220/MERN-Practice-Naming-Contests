// File: public-config.ts
// This configuration file exports settings that are used by the client-side of the application. It defines the port and host for the API server, and constructs the base URL for making API calls.

export const PORT = process.env.PORT ?? "8080"; // Sets the default port for the API server to 8080 if not specified in the environment.
export const HOST = process.env.HOST ?? "localhost"; // Sets the default host for the API server to localhost if not specified in the environment.

// Constructs the full URL for the API server, appending '/api' to make it ready for API calls.
export const API_SERVER_URL = `http://${HOST}:${PORT}/api`;

export default {
  API_SERVER_URL, // Exports the API_SERVER_URL for use in API calls from the client side.
};
