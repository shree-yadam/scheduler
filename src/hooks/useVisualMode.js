import { useState } from "react";

export default function useVisualMode(defaultMode) {
  const [mode, setMode] = useState(defaultMode);
  const [history, setHistory] = useState([defaultMode]);

  const transition = (newMode, replace = false) => {
    setMode(newMode);
    setHistory((prev) => {
      const updatedHistory = [...prev];
      if (replace) {
        updatedHistory.pop();
      }
      updatedHistory.push(newMode);
      return updatedHistory;
    });
  };

  const back = () => {
    if (history.length > 1) {
      setHistory((prev) => {
        const updatedHistory = [...prev];
        updatedHistory.pop();
        setMode(updatedHistory[updatedHistory.length - 1]);
        return updatedHistory;
      });
    }
  };

  return { mode, transition, back };
}
