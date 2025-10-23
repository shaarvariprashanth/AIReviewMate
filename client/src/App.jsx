import MonacoEditor from "./components/MonacoEditor";
import Navbar from "./components/Navbar";
import { useState,useEffect } from "react";

function App() {
  const [theme, setTheme] = useState("light");

  useEffect(() => {
    const saved = localStorage.getItem("theme") || "light";
    setTheme(saved);
    document.documentElement.setAttribute("data-theme", saved);
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === "light" ? "dark" : "light";
    setTheme(newTheme);
    localStorage.setItem("theme", newTheme);
    document.documentElement.setAttribute("data-theme", newTheme);
  };

  return (
    <div>
     <Navbar theme={theme} toggleTheme={toggleTheme} /> 
      <MonacoEditor theme={theme} />
    </div>
  );
}

export default App;