// File: render.tsx

import { fetchContest, fetchContests } from "../api-client";
import ReactDOMServer from "react-dom/server";
import App from "../components/app";

const serverRender = async (req) => {
  const { contestId } = req.params;

  const initialData = contestId
    ? {
        currentContest: await fetchContest(contestId),
      }
    : { contests: await fetchContests() };

  const initialMarkup = ReactDOMServer.renderToString(
    <App initialData={initialData} />,
  );

  return { initialMarkup, initialData };
};

export default serverRender;
