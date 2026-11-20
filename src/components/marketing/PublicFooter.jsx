import React from "react";
import { Link } from "react-router-dom";

export default function PublicFooter() {
  return (
    <footer className="w-full border-t border-white/10 px-5 sm:px-8 lg:px-[clamp(48px,8vw,140px)] py-12 flex flex-col md:flex-row items-center justify-between gap-6 max-w-[1600px] mx-auto">
      <div className="text-white/40 text-sm font-light tracking-wide text-center">
        © 2026 Baseline. All rights reserved.
      </div>
      <nav aria-label="Footer navigation" className="flex flex-wrap items-center justify-center gap-x-8 gap-y-3">
        <Link to="/about" className="text-white/50 text-sm font-light hover:text-white transition-colors">
          About
        </Link>
        <Link to="/contact" className="text-white/50 text-sm font-light hover:text-white transition-colors">
          Contact
        </Link>
        <Link to="/basescore-quiz" className="text-white/50 text-sm font-light hover:text-white transition-colors">
          Get Your BaseScore™
        </Link>
        <Link to="/login" className="text-white/50 text-sm font-light hover:text-white transition-colors">
          Log In
        </Link>
        <Link to="/register" className="text-white/50 text-sm font-light hover:text-white transition-colors">
          Sign Up
        </Link>
      </nav>
    </footer>
  );
}