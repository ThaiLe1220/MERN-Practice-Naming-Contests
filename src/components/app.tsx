import Header from "./header";
import ContestList from "./contest-list";
import { useState } from "react";

const App = ({ initialData }) => {
  console.log({ initialData });
  const [counter, setCounter] = useState(0);
  return (
    <>
      <div className="container" title="Hello React">
        <Header message="Naming Contests" />
        <ContestList initialContests={initialData.contests} />
      </div>
    </>
  );
};

export default App;
