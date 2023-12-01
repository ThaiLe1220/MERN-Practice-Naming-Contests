// File: app.tsx
import ContestList from "./contest-list";
import Contest from "./contest";
import { useState, useEffect } from "react";
import { ContestType } from "../models/ContestType"; // Update the path to the actual location

const App = ({ initialData }) => {
  const [page, setPage] = useState<"contestList" | "contest">(
    initialData.currentContest ? "contest" : "contestList",
  );
  const [contests, setContests] = useState<object | undefined>(
    initialData.contests,
  );

  const [currentContest, setCurrentContest] = useState<ContestType[]>(
    initialData.currentContest,
  );

  useEffect(() => {
    window.onpopstate = (event) => {
      const contestId = event.state?.contestId;
      const newPage = contestId ? "contest" : "contestList";
      setPage(newPage);
      if (contestId) {
        const contest = initialData.contests.find(
          (contest) => contest.id === contestId,
        );
        setCurrentContest(contest);
      } else {
        setCurrentContest(undefined);
      }
    };
  }, []);

  const addNewContest = (newContest) => {
    setContests([...contests, newContest]);
  };

  const navigateToContest = (contestId) => {
    window.history.pushState({ contestId }, "", `/contest/${contestId}`);
    setPage("contest");
    const contest = contests.find((c) => c.id === contestId);
    setCurrentContest(contest);
  };

  const navigateToContestList = () => {
    window.history.pushState({}, "", `/`);
    setPage("contestList");

    setCurrentContest(undefined);
  };

  const pageContent = () => {
    switch (page) {
      case "contestList":
        return (
          <ContestList
            initialContests={contests}
            onContestClick={navigateToContest}
            onAddNewContest={addNewContest}
          />
        );
      case "contest":
        return (
          <Contest
            initialContest={currentContest}
            onContestListClick={navigateToContestList}
          />
        );
      default:
        return null;
    }
  };

  return (
    <>
      <div className="container" title="Hello React">
        {pageContent()}
      </div>
    </>
  );
};

export default App;
