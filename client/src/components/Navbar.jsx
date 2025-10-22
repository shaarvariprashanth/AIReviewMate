import React, { useState, useEffect } from "react";
import { FiSun } from "react-icons/fi";
import { FaMoon } from "react-icons/fa";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [theme, setTheme] = useState("light");

  // Load theme from localStorage on mount
  useEffect(() => {
    const savedTheme = localStorage.getItem("theme") || "light";
    setTheme(savedTheme);
    document.documentElement.setAttribute("data-theme", savedTheme);
  }, []);

  // Toggle between light and dark themes
  const toggleTheme = () => {
    const newTheme = theme === "light" ? "dark" : "light";
    setTheme(newTheme);
    localStorage.setItem("theme", newTheme);
    document.documentElement.setAttribute("data-theme", newTheme);
  };

  return (
    <nav className="bg-gray-900 text-white px-6 py-4 flex items-center justify-between shadow-md transition-colors duration-300">
      {/* Logo */}
      <div className="text-2xl font-bold">AIReviewMate</div>

      {/* Desktop Links + Theme Toggle */}
      <div className="hidden md:flex items-center space-x-6">
        <button
          onClick={toggleTheme}
          className="px-4 py-2 rounded bg-gray-700 hover:bg-gray-600 transition"
        >
          {theme === "light" ? <FiSun/> : <FaMoon/>}
        </button>
        <a href="https://microsoft.github.io/monaco-editor/docs.html" target="_blank" className="hover:text-gray-400 transition">
          About
        </a>
      </div>

      {/* Mobile Menu Button */}
      <button
        className="md:hidden text-2xl focus:outline-none"
        onClick={() => setIsOpen(!isOpen)}
      >
        ☰
      </button>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="absolute top-16 left-0 w-full bg-gray-800 flex flex-col items-center space-y-4 py-4 md:hidden z-50 transition-colors duration-300">
          <a href="https://microsoft.github.io/monaco-editor/docs.html" target="_blank" className="hover:text-gray-400 transition">
            About
          </a>

          {/* Theme Toggle for Mobile */}
          <button
            onClick={toggleTheme}
            className="px-4 py-2 rounded bg-gray-700 hover:bg-gray-600 transition"
          >
            {theme === "light" ? <FiSun/> : <FaMoon/>}
          </button>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
