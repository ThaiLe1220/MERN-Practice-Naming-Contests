import { React, useEffect, useState } from "react";
import ContestPreview from "./contest-preview";
// contest-list.tsx and contest-preview.tsx
import { ContestType } from "../models/ContestType"; // Update the path to the actual location
import { fetchContests } from "../api-client";

type ContestListProps = {
  contests: ContestType[];
};

const ContestList: React.FC<ContestListProps> = ({ initialContests }) => {
  const [contests, setContests] = useState(initialContests);

  useEffect(() => {
    // debugger;
    // fetchContests().then((contests) => {
    //   console.log(contests);
    //   setContests(contests);
    // });
  }, []);

  return (
    <div className="contest-list">
      {contests.map((contest) => (
        // You pass the key here, but you do not include it in the ContestPreviewProps type definition
        <ContestPreview key={contest.id} contest={contest} />
      ))}
    </div>
  );
};

export default ContestList;
