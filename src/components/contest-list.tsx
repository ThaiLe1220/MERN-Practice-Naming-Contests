// File: contest-list.tsx
import { React, useEffect, useState } from "react";
import ContestPreview from "./contest-preview";
import { ContestType } from "../models/ContestType";
import {
  fetchContests,
  addNewContest,
  deleteContest,
  uploadContestDocument,
} from "../api-client";

import Header from "./header";
import axios from "axios";

type ContestListProps = {
  contests: ContestType[];
};

const ContestList: React.FC<ContestListProps> = ({
  initialContests,
  onContestClick,
  onAddNewContest,
}) => {
  const [contests, setContests] = useState(initialContests ?? []);
  const [theme, setTheme] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [file, setFile] = useState(null);

  useEffect(() => {
    if (!initialContests) {
      fetchContests().then((contests) => {
        console.log(contests);
        setContests(contests);
      });
    }
  }, [initialContests]);

  // Function to handle suggestion request
  const handleSuggestNameClick = async () => {
    try {
      const response = await axios.post("/api/suggest-contest-name", {
        subject: theme,
      });
      setSuggestions(response.data.suggestions);
    } catch (error) {
      console.error("Failed to get suggestions", error);
    }
  };

  const handleDeleteContest = async (contestId: string) => {
    try {
      await deleteContest(contestId);
      setContests(contests.filter((contest) => contest.id !== contestId));
    } catch (error) {
      console.error("Failed to delete contest", error);
    }
  };

  const handleNewContestSubmit = async (event) => {
    event.preventDefault();
    const { contestName, categoryName, description } = event.target.elements;

    const newContest = await addNewContest({
      contestName: contestName.value,
      categoryName: categoryName.value,
      description: description.value,
    });

    if (newContest && newContest.id) {
      setContests([...contests, newContest]);
      onAddNewContest(newContest);
    } else {
      console.error("Invalid contest data returned from API");
    }
  };

  const handleFileChange = (event) => {
    setFile(event.target.files[0]);
  };

  const handleFileUpload = async (event) => {
    event.preventDefault();
    try {
      const response = await uploadContestDocument(file); // Use the function from api-client
      console.log(response); // Handle the response
      // You can now set the document text to the state and use it as needed
    } catch (error) {
      console.error("Error uploading document", error);
    }
  };

  return (
    <>
      <Header message="Naming Contests" />

      <div className="add-new-contest">
        <form onSubmit={handleFileUpload}>
          <input
            type="file"
            name="contestDocument"
            accept=".doc,.docx"
            onChange={handleFileChange}
          />
          <button type="submit">Upload Document</button>
        </form>

        <form onSubmit={handleNewContestSubmit}>
          <input type="text" name="contestName" placeholder="Contest Name" />
          <input type="text" name="categoryName" placeholder="Category Name" />
          <textarea name="description" placeholder="Description" />
          <button type="submit">Add Contest</button>
        </form>

        <div>
          <textarea
            value={theme}
            onChange={(e) => setTheme(e.target.value)}
            placeholder="Enter theme for contest"
          />
          <button onClick={handleSuggestNameClick}>Generate Names</button>
        </div>
        <div>
          {suggestions.length > 0 && (
            <ul>
              {suggestions.map((suggestion, index) => (
                <li key={index}>{suggestion}</li>
              ))}
            </ul>
          )}
        </div>
      </div>

      <div className="contest-list link">
        {contests.map((contest) => {
          if (!contest) {
            // Handle or skip rendering for invalid contest
            return null;
          }
          return (
            <ContestPreview
              key={contest.id}
              contest={contest}
              onClick={onContestClick}
              onDelete={handleDeleteContest} // Pass the deletion handler here
            />
          );
        })}
      </div>
    </>
  );
};

export default ContestList;
