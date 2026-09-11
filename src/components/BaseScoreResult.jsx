import React from "react";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";

const MAX_POSSIBLE = 500;

export default function BaseScoreResult({ score, onContinue }) {
  const pct = Math.min(1, score / MAX_POSSIBLE);
  const circumference = 2 * Math.PI * 64;

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-8 py-16 font-body" style={{ background: "hsl(222,47%,6%)" }}>
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="w-full max-w-md text-center"
      >
        <p className="text-white/40 text-xs font-light tracking-[0.3em] uppercase mb-8">Your Preliminary BaseScore™</p>

        <div className="relative w-40 h-40 mx-auto mb-8 flex items-center justify-center">
          <svg className="absolute inset-0 w-full h-full -rotate-90" viewBox="0 0 144 144">
            <circle cx="72" cy="72" r="64" fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="10" />
            <motion.circle
              cx="72" cy="72" r="64" fill="none" stroke="#2EFD7A" strokeWidth="10"
              strokeLinecap="round"
              strokeDasharray={circumference}
              initial={{ strokeDashoffset: circumference }}
              animate={{ strokeDashoffset: circumference * (1 - pct) }}
              transition={{ duration: 1.2, ease: "easeOut", delay: 0.2 }}
            />
          </svg>
          <div className="text-center z-10">
            <p className="text-white font-extrabold text-4xl leading-none">{score}</p>
            <p className="text-white/30 text-xs mt-1">of {MAX_POSSIBLE}</p>
          </div>
        </div>

        <h2 className="text-white text-2xl font-normal mb-4 tracking-tight">Nice start!</h2>
        <p className="text-white/60 text-sm leading-relaxed mb-2">
          Based on your answers, this is a preliminary look at your financial health.
        </p>
        <p className="text-white/30 text-xs leading-relaxed mb-10">
          This score is capped since we've only asked a handful of questions — create an account to unlock your full BaseScore™.
        </p>

        <button
          onClick={onContinue}
          className="inline-flex items-center gap-2.5 px-8 py-3.5 rounded-full bg-[#2EFD7A] text-black text-sm font-semibold tracking-wide hover:bg-[#2EFD7A]/90 transition-all duration-200"
        >
          Boost my BaseScore
          <ArrowRight className="w-4 h-4" />
        </button>
      </motion.div>
    </div>
  );
}