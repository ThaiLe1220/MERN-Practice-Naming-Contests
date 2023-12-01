// File: api-client.ts

import { API_SERVER_URL } from "./public-config"; // Imports the base URL for the API server.
import axios from "axios"; // Imports Axios for making HTTP requests.

// Asynchronously fetches the list of contests from the API server and returns the data.
export const fetchContests = async () => {
  const res = await axios.get(`${API_SERVER_URL}/contests`); // Makes a GET request to the contests endpoint.
  return res.data.contests; // Returns the contests part of the response data.
};

export const fetchContest = async (contestId) => {
  const res = await axios.get(`${API_SERVER_URL}/contests/${contestId}`);

  return res.data.contest;
};

export const addNewNameToContest = async ({ contestId, newNameValue }) => {
  const res = await axios.post(`${API_SERVER_URL}/contests/${contestId}`, {
    newNameValue,
  });

  return res.data.updatedContest;
};

export const addNewContest = async ({
  contestName,
  categoryName,
  description,
}) => {
  const res = await axios.post(`${API_SERVER_URL}/contests/`, {
    contestName,
    categoryName,
    description,
  });

  return res.data.contest;
};

export const deleteContest = async (contestId) => {
  const res = await axios.delete(`${API_SERVER_URL}/contests/${contestId}`);
  return res.data;
};

export const suggestContestNames = async (theme) => {
  const res = await axios.post(`${API_SERVER_URL}/suggest-contest-name`, {
    subject: theme,
  });
  return res.data.suggestions; // Assuming the backend returns an array of suggestions
};

export const uploadContestDocument = async (file) => {
  const formData = new FormData();
  formData.append("file", file);

  const response = await axios.post(
    `${API_SERVER_URL}/upload-contest-document`,
    formData,
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    },
  );

  return response.data;
};

export const listContestDocuments = async () => {
  const response = await axios.get(`${API_SERVER_URL}/list-documents`);
  return response.data;
};

export const downloadContestDocument = async (fileId) => {
  const response = await axios.get(
    `${API_SERVER_URL}/download-contest-document/${fileId}`,
    { responseType: "blob" },
  );
  return response.data;
};

export default {
  fetchContests,
  fetchContest,
  addNewNameToContest,
  addNewContest,
  deleteContest,
  suggestContestNames,
  uploadContestDocument,
};
