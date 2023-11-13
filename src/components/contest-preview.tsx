import React from "react";
// contest-list.tsx and contest-preview.tsx
import { ContestType } from "../models/ContestType"; // Update the path to the actual location

// ContestPreview.tsx
// The props for ContestPreview should only include the contest object
type ContestPreviewProps = {
  contest: ContestType;
};

const ContestPreview: React.FC<ContestPreviewProps> = ({ contest }) => {
  return (
    <div className="contest-preview">
      <div className="category">{contest.categoryName}</div>
      <div className="contest">{contest.contestName}</div>
    </div>
  );
};

export default ContestPreview;
