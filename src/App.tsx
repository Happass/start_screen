import { useState } from "react";
import Start from "./components/Start";
import Main from "./components/Main";

function App() {
  const [currentPage, setCurrentPage] = useState<'start' | 'main'>('start');

  const handleStart = () => {
    setCurrentPage('main');
  };

  return (
    <>
      {currentPage === 'start' && <Start onStart={handleStart} />}
      {currentPage === 'main' && <Main />}
    </>
  );
}

export default App;