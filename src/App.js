import React from "react";
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from "react-router-dom";
import LMSHDLStudio from "./components/LmsHdlStudio";
import TerminalApp from "./components/terminal_app";

function Navigation() {
  const location = useLocation();
  return (
    <nav className="bg-gray-900 text-white flex gap-4 px-4 py-2 sticky top-0 z-30">
      <Link
        to="/"
        className={`cursor-pointer px-3 py-1 rounded ${
          location.pathname === "/" ? "bg-emerald-600" : "hover:bg-gray-700"
        }`}
      >
        HDL Studio
      </Link>
      <Link
        to="/terminal"
        className={`cursor-pointer px-3 py-1 rounded ${
          location.pathname === "/terminal" ? "bg-emerald-600" : "hover:bg-gray-700"
        }`}
      >
        Terminal
      </Link>
    </nav>
  );
}

function App() {
  const location = useLocation();

  return (
    <div className="flex flex-col h-screen">
      <Navigation />
      <div className="flex-1 overflow-hidden">
        {/* Force re-render on route change using key */}
        <Routes key={location.pathname}>
          <Route path="/" element={<LMSHDLStudio key="hdl" />} />
          <Route path="/terminal" element={<TerminalApp key="terminal" />} />
          {/* Fallback route */}
          <Route path="*" element={<LMSHDLStudio key="default" />} />
        </Routes>
      </div>
    </div>
  );
}

export default function RootApp() {
  return (
    <Router>
      <App />
    </Router>
  );
}
