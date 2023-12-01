/* eslint-disable no-unused-vars */
import React from "react";
import { ContestType } from "../models/ContestType";

type ContestPreviewProps = {
  contest: ContestType;
  onClick: (contestId: string) => void;
  onDelete: (contestId: string) => void;
};

const ContestPreview: React.FC<ContestPreviewProps> = ({
  contest,
  onClick,
  onDelete, // Add this line
}) => {
  return (
    <div className="contest-preview">
      <div className="category">{contest.categoryName}</div>
      <div className="contest">{contest.contestName}</div>
      <button onClick={() => onClick(contest.id)}>View Contest</button>
      <button onClick={() => onDelete(contest.id)}>Delete</button>{" "}
      {/* Add this button */}
    </div>
  );
};

export default ContestPreview;
