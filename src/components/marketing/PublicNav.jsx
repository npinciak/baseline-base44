import React from "react";
import { Link, useLocation } from "react-router-dom";

export default function PublicNav({ onNav }) {
  const { pathname } = useLocation();

  const linkClass = (path) =>
    `text-sm font-medium transition-colors ${
      pathname === path ? "text-[#2EFD7A]" : "text-white/80 hover:text-white"
    }`;

  return (
    <header className="fixed top-0 left-0 w-full px-5 sm:px-8 lg:px-[clamp(16px,5.7vw,109px)] h-[72px] flex items-center justify-between z-50 bg-black/70 backdrop-blur-md border-b border-white/10">
      <Link to="/" className="text-white font-bold text-lg tracking-wide hover:opacity-90 transition-opacity">
        Baseline
      </Link>

      <nav aria-label="Primary navigation" className="flex items-center gap-4 sm:gap-7">
        <Link to="/about" className={linkClass("/about")}>
          About
        </Link>
        <Link to="/contact" className={linkClass("/contact")}>
          Contact
        </Link>
        {onNav ? (
          <button
            onClick={() => onNav("/login")}
            className="text-white/80 hover:text-white font-semibold text-sm transition-colors"
          >
            Log In
          </button>
        ) : (
          <Link to="/login" className="text-white/80 hover:text-white font-semibold text-sm transition-colors">
            Log In
          </Link>
        )}
        {onNav ? (
          <button
            onClick={() => onNav("/register")}
            className="px-4 py-2 bg-white text-black font-semibold text-sm rounded-full hover:bg-white/90 transition-all"
          >
            Sign Up
          </button>
        ) : (
          <Link
            to="/register"
            className="px-4 py-2 bg-white text-black font-semibold text-sm rounded-full hover:bg-white/90 transition-all"
          >
            Sign Up
          </Link>
        )}
      </nav>
    </header>
  );
}