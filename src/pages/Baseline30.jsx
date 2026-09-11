import React, { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Search } from "lucide-react";

const BASESCORE_QUESTIONS = [
  "How Healthy Is My Money?",
  "Am I On Track For The Future I Want?",
  "Could I Be Building Wealth Faster?",
  "Is My Financial Foundation Strong Enough?",
  "What Would It Take To Be Financially Free?",
  "Am I Making The Most Of What I Earn?",
];

// phases: typing → pause → selected (flash highlight) → clearing → next
function useTypingAnimation() {
  const stateRef = useRef({ index: 0, phase: "typing", charCount: 0 });
  const [display, setDisplay] = useState({ text: "", selected: false });
  const timerRef = useRef(null);

  useEffect(() => {
    function tick() {
      const s = stateRef.current;
      const current = BASESCORE_QUESTIONS[s.index];

      if (s.phase === "typing") {
        if (s.charCount < current.length) {
          s.charCount += 1;
          setDisplay({ text: current.slice(0, s.charCount), selected: false });
          timerRef.current = setTimeout(tick, 44);
        } else {
          s.phase = "pause";
          timerRef.current = setTimeout(tick, 1600);
        }
      } else if (s.phase === "pause") {
        s.phase = "selected";
        setDisplay({ text: current, selected: true });
        timerRef.current = setTimeout(tick, 380);
      } else if (s.phase === "selected") {
        s.phase = "clearing";
        setDisplay({ text: "", selected: false });
        timerRef.current = setTimeout(tick, 120);
      } else if (s.phase === "clearing") {
        s.index = (s.index + 1) % BASESCORE_QUESTIONS.length;
        s.charCount = 0;
        s.phase = "typing";
        timerRef.current = setTimeout(tick, 200);
      }
    }

    timerRef.current = setTimeout(tick, 500);
    return () => clearTimeout(timerRef.current);
  }, []);

  return display;
}

const ImageWord = ({ images, width, height, ariaLabel, className = "" }) => (
  <div
    className={`relative shrink-0 ${className}`}
    style={{ maxWidth: `${width}px`, width: "100%", aspectRatio: `${width} / ${height}` }}
    aria-label={ariaLabel}
    role="img"
  >
    {images.map((img, i) => (
      <img
        key={i}
        src={img.src}
        className="absolute object-contain"
        style={{
          left: `${(img.left / width) * 100}%`,
          top: img.top !== undefined ? `${(img.top / height) * 100}%` : "0%",
          width: `${(img.width / width) * 100}%`,
          height: img.height !== undefined ? `${(img.height / height) * 100}%` : "100%",
        }}
        alt=""
      />
    ))}
  </div>
);

// Section-specific phone screenshot images from the Figma designs
const PhoneScreenshot = ({ src, alt }) => (
  <div className="relative w-[240px] lg:w-[280px] rounded-[36px] border border-white/15 shadow-2xl overflow-hidden bg-[#0a0e1a]" style={{ aspectRatio: '9/19' }}>
    <img src={src} alt={alt} className="w-full h-full object-cover object-top" onError={(e) => { e.target.style.display = 'none'; }} />
  </div>
);

// BaseScore result phone mockup — shows the score and its five tenets
const BaseScoreMockup = () => {
  const tenets = [
    { label: "Financial Knowledge", score: 74, color: "bg-purple-400", pct: 74 },
    { label: "Income to Debt Ratio", score: 61, color: "bg-blue-400", pct: 61 },
    { label: "Preparedness", score: 55, color: "bg-yellow-400", pct: 55 },
    { label: "Risk Appetite", score: 68, color: "bg-orange-400", pct: 68 },
    { label: "Credit Health", score: 66, color: "bg-pink-400", pct: 66 },
  ];
  return (
    <div className="relative w-[240px] lg:w-[280px] rounded-[36px] border border-white/15 shadow-2xl overflow-hidden bg-[#0a0e1a] flex flex-col" style={{ aspectRatio: '9/19' }}>
      <div className="flex justify-between px-5 pt-4 pb-1 text-white/50 text-[9px]">
        <span>9:41</span><span>●●● WiFi ▮</span>
      </div>
      <div className="px-5 pt-2 pb-5 flex-1 flex flex-col">
        <p className="text-white/50 text-[9px] uppercase tracking-widest mb-3">Your BaseScore™</p>
        {/* Score ring */}
        <div className="flex flex-col items-center mb-4">
          <div className="relative w-24 h-24 flex items-center justify-center">
            <svg className="absolute inset-0 w-full h-full -rotate-90" viewBox="0 0 96 96">
              <circle cx="48" cy="48" r="40" fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="7" />
              <circle cx="48" cy="48" r="40" fill="none" stroke="#2EFD7A" strokeWidth="7"
                strokeDasharray={`${2 * Math.PI * 40}`}
                strokeDashoffset={`${2 * Math.PI * 40 * (1 - 0.65)}`}
                strokeLinecap="round" />
            </svg>
            <div className="text-center z-10">
              <p className="text-white font-extrabold text-2xl leading-none">324</p>
              <p className="text-white/40 text-[8px]">of 500</p>
            </div>
          </div>
          <span className="mt-1 text-[9px] font-bold px-3 py-1 rounded-full bg-teal-400/20 text-teal-400">Good Standing</span>
        </div>
        {/* Tenets */}
        <div className="space-y-2 flex-1">
          {tenets.map(t => (
            <div key={t.label}>
              <div className="flex justify-between items-center mb-0.5">
                <span className="text-white/70 text-[9px]">{t.label}</span>
                <span className="text-white/50 text-[9px] font-bold">{t.score}/100</span>
              </div>
              <div className="h-1 bg-white/10 rounded-full">
                <div className={`h-full ${t.color} rounded-full`} style={{ width: `${t.pct}%` }} />
              </div>
            </div>
          ))}
        </div>
        {/* CTA */}
        <div className="mt-3 bg-teal-400 rounded-2xl py-2.5 text-center">
          <span className="text-black font-bold text-xs">Improve My Score</span>
        </div>
      </div>
    </div>
  );
};

// Parents collaboration mockup — parent + child shared view
const ParentsMockup = () => (
  <div className="relative w-[240px] lg:w-[280px] rounded-[36px] border border-white/15 shadow-2xl overflow-hidden bg-[#0a0e1a] flex flex-col" style={{ aspectRatio: '9/19' }}>
    <div className="flex justify-between px-5 pt-4 pb-1 text-white/50 text-[9px]">
      <span>9:41</span><span>●●● WiFi ▮</span>
    </div>
    <div className="px-5 pt-2 flex-1">
      <p className="text-white/50 text-[9px] uppercase tracking-widest mb-2">Family Dashboard</p>
      {/* Member avatars */}
      <div className="flex items-center gap-2 mb-4">
        <div className="flex -space-x-2">
          <div className="w-8 h-8 rounded-full bg-purple-400 border-2 border-[#0a0e1a] flex items-center justify-center text-[10px] font-bold text-black">P</div>
          <div className="w-8 h-8 rounded-full bg-teal-400 border-2 border-[#0a0e1a] flex items-center justify-center text-[10px] font-bold text-black">K</div>
        </div>
        <div>
          <p className="text-white text-xs font-bold">The Johnson Family</p>
          <p className="text-white/40 text-[9px]">Parent + 1 child</p>
        </div>
      </div>
      {/* Child progress card */}
      <div className="bg-teal-400/10 border border-teal-400/30 rounded-xl p-3 mb-3">
        <div className="flex items-center gap-2 mb-2">
          <div className="w-6 h-6 rounded-full bg-teal-400 flex items-center justify-center text-[9px] font-bold text-black">K</div>
          <div>
            <p className="text-white text-xs font-bold">Kyle's Progress</p>
            <p className="text-teal-400 text-[9px]">3 lessons this week 🔥</p>
          </div>
        </div>
        <div className="flex gap-1">
          {['Budget', 'Saving', 'Credit'].map((tag, i) => (
            <span key={tag} className={`text-[8px] px-1.5 py-0.5 rounded-full font-bold ${i === 0 ? 'bg-teal-400 text-black' : 'bg-white/10 text-white/50'}`}>{tag}</span>
          ))}
        </div>
      </div>
      {/* Nudge */}
      <div className="bg-white/5 border border-white/10 rounded-xl p-3 mb-3">
        <p className="text-white/60 text-[9px] uppercase tracking-widest mb-1">Parent Nudge</p>
        <p className="text-white text-xs font-semibold mb-2">"Great job finishing Budgeting Basics! 🎉"</p>
        <div className="flex gap-2">
          <div className="flex-1 text-center py-1.5 rounded-lg bg-teal-400/20 text-teal-400 text-[9px] font-bold">Send Message</div>
          <div className="flex-1 text-center py-1.5 rounded-lg bg-white/10 text-white/50 text-[9px] font-bold">Add Goal</div>
        </div>
      </div>
      {/* Shared goal */}
      <div className="bg-white/5 border border-white/10 rounded-xl p-3">
        <div className="flex justify-between items-center mb-1">
          <p className="text-white text-xs font-semibold">🎓 College Fund</p>
          <span className="text-teal-400 text-[9px] font-bold">21%</span>
        </div>
        <div className="h-1.5 bg-white/10 rounded-full">
          <div className="h-full bg-teal-400 rounded-full w-[21%]" />
        </div>
        <p className="text-white/40 text-[8px] mt-1">$4,200 of $20,000</p>
      </div>
    </div>
    <div className="px-5 pb-5 pt-3">
      <div className="bg-white/10 rounded-2xl py-2.5 text-center">
        <span className="text-white font-bold text-xs">Manage Family</span>
      </div>
    </div>
  </div>
);

// Kids goals + rewards mockup
const KidsMockup = () => (
  <div className="relative w-[240px] lg:w-[280px] rounded-[36px] border border-white/15 shadow-2xl overflow-hidden bg-[#0a0e1a] flex flex-col" style={{ aspectRatio: '9/19' }}>
    <div className="flex justify-between px-5 pt-4 pb-1 text-white/50 text-[9px]">
      <span>9:41</span><span>●●● WiFi ▮</span>
    </div>
    <div className="px-5 pt-2 flex-1 flex flex-col">
      {/* XP banner */}
      <div className="flex items-center justify-between mb-3">
        <p className="text-white font-bold text-sm">My Journey 🚀</p>
        <div className="flex items-center gap-1 bg-yellow-400/20 rounded-full px-2 py-1">
          <span className="text-yellow-400 text-[9px] font-bold">🪙 480 XP</span>
        </div>
      </div>
      {/* Level bar */}
      <div className="bg-white/5 border border-white/10 rounded-xl p-3 mb-3">
        <div className="flex justify-between text-[9px] mb-1">
          <span className="text-white/60">Level 4 — Finance Rookie</span>
          <span className="text-yellow-400 font-bold">80/100 XP</span>
        </div>
        <div className="h-1.5 bg-white/10 rounded-full">
          <div className="h-full bg-yellow-400 rounded-full w-4/5" />
        </div>
      </div>
      {/* Active goal */}
      <div className="bg-teal-400/10 border border-teal-400/30 rounded-xl p-3 mb-3">
        <p className="text-white/50 text-[9px] uppercase tracking-widest mb-1">Active Goal</p>
        <div className="flex items-center gap-2 mb-2">
          <span className="text-lg">🎓</span>
          <div className="flex-1">
            <p className="text-white text-xs font-bold">College Fund</p>
            <p className="text-white/40 text-[9px]">$4,200 of $20,000</p>
          </div>
          <span className="text-teal-400 font-bold text-xs">21%</span>
        </div>
        <div className="h-1.5 bg-white/10 rounded-full">
          <div className="h-full bg-teal-400 rounded-full w-[21%]" />
        </div>
      </div>
      {/* Badges earned */}
      <p className="text-white/50 text-[9px] uppercase tracking-widest mb-2">Badges Earned</p>
      <div className="flex gap-2 mb-3">
        {[
          { emoji: '🏅', label: 'First Lesson' },
          { emoji: '🔥', label: '7-Day Streak' },
          { emoji: '💡', label: 'Budget Pro' },
        ].map(b => (
          <div key={b.label} className="flex flex-col items-center bg-white/5 rounded-xl p-2 flex-1">
            <span className="text-lg mb-0.5">{b.emoji}</span>
            <span className="text-[7px] text-white/50 text-center leading-tight">{b.label}</span>
          </div>
        ))}
      </div>
      {/* Next reward */}
      <div className="bg-yellow-400/10 border border-yellow-400/30 rounded-xl p-2.5 flex items-center gap-2 mt-auto">
        <span className="text-base">🎁</span>
        <div>
          <p className="text-yellow-400 text-[9px] font-bold">Next Reward at 500 XP!</p>
          <p className="text-white/40 text-[8px]">20 XP to go — keep learning</p>
        </div>
      </div>
    </div>
    <div className="px-5 pb-5 pt-3">
      <div className="bg-teal-400 rounded-2xl py-2.5 text-center">
        <span className="text-black font-bold text-xs">Continue Learning</span>
      </div>
    </div>
  </div>
);

function BaseScoreSection({ onNav }) {
  const { text, selected } = useTypingAnimation();

  return (
    <section className="w-full flex flex-col items-center justify-center px-8 pt-[160px] pb-[86px] gap-8">
      <motion.div
        className="text-center w-full"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-100px" }}
        variants={{ hidden: { opacity: 0, y: 40 }, visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: "easeOut" } } }}
      >
        <h2 className="text-white text-4xl md:text-5xl lg:text-7xl font-light mb-10">
          What's Your <span className="font-extrabold">BaseScore?</span>
        </h2>
        <div
          className="relative max-w-xl mx-auto mb-7 cursor-pointer"
          onClick={() => onNav("/basescore-quiz")}
        >
          <div className="w-full bg-transparent border-2 border-white text-white text-lg px-6 py-4 pr-14 rounded-full h-[60px] flex items-center overflow-hidden">
            <span className="flex-1 overflow-hidden whitespace-nowrap relative text-left">
              <span className={`${selected ? "bg-white/25 rounded px-0.5" : ""}`}>{text}</span>
              {!selected && (
                <span className="inline-block w-[2px] h-[1.1em] bg-white/80 ml-[1px] animate-pulse align-middle" />
              )}
            </span>
          </div>
          <Search className="absolute right-5 top-1/2 -translate-y-1/2 text-white w-6 h-6" />
        </div>
        <button
          onClick={() => onNav("/basescore-quiz")}
          className="px-10 py-4 bg-[#2EFD7A] text-black font-semibold text-lg rounded-full hover:bg-[#2EFD7A]/90 transition-all"
        >
          Find Out
        </button>
      </motion.div>
    </section>
  );
}

const fadeUp = {
  hidden: { opacity: 0, y: 40 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: "easeOut" } },
};

export default function Baseline30() {
  const navigate = useNavigate();
  const [isExiting, setIsExiting] = useState(false);

  const handleNav = (path) => {
    setIsExiting(true);
    setTimeout(() => navigate(path), 500);
  };

  const baselineImages = [
    { src: "https://media.base44.com/images/public/6a3542676f9044e70b439a84/f5993dcb0_5579a0908_93_355.svg", width: 72, height: 85, left: 0, top: 2 },
    { src: "https://media.base44.com/images/public/6a3542676f9044e70b439a84/068919593_cf4dcbdb5_93_359.svg", width: 68, height: 66, left: 78, top: 23 },
    { src: "https://media.base44.com/images/public/6a3542676f9044e70b439a84/e00160cd9_d36d4f5e0_93_363.svg", width: 60, height: 66, left: 149, top: 23 },
    { src: "https://media.base44.com/images/public/6a3542676f9044e70b439a84/000a4f3b9_0e64c97bf_93_367.svg", width: 69, height: 66, left: 214, top: 23 },
    { src: "https://media.base44.com/images/public/6a3542676f9044e70b439a84/261042c37_165540f3c_93_371.svg", width: 38, height: 89, left: 290, top: 0 },
    { src: "https://media.base44.com/images/public/6a3542676f9044e70b439a84/3aa2025ae_7733732c3_93_375.svg", width: 23, height: 88, left: 334, top: 0 },
    { src: "https://media.base44.com/images/public/6a3542676f9044e70b439a84/0b22860f7_28b850e24_93_379.svg", width: 64, height: 64, left: 368, top: 23 },
    { src: "https://media.base44.com/images/public/6a3542676f9044e70b439a84/a315ba224_12790a648_93_383.svg", width: 69, height: 66, left: 439, top: 23 },
  ];

  const mindOverMoneyImages = [
    { src: "https://media.base44.com/images/public/6a3542676f9044e70b439a84/973274d82_44e662a51_93_387.svg", width: 21, left: 0 },
    { src: "https://media.base44.com/images/public/6a3542676f9044e70b439a84/b77acf1a6_48483fefe_93_391.svg", width: 2, left: 29 },
    { src: "https://media.base44.com/images/public/6a3542676f9044e70b439a84/cb653cc88_65f2ea1f0_93_395.svg", width: 17, height: 21, left: 40 },
    { src: "https://media.base44.com/images/public/6a3542676f9044e70b439a84/37a09e0ec_5a2f677ab_93_399.svg", width: 17, left: 67 },
    { src: "https://media.base44.com/images/public/6a3542676f9044e70b439a84/8968055fe_89a0b436c_93_403.svg", width: 20, left: 101 },
    { src: "https://media.base44.com/images/public/6a3542676f9044e70b439a84/98fed13aa_c147abb07_93_407.svg", width: 19, left: 126 },
    { src: "https://media.base44.com/images/public/6a3542676f9044e70b439a84/871b299e9_269c42072_93_411.svg", width: 14, left: 152 },
    { src: "https://media.base44.com/images/public/6a3542676f9044e70b439a84/3cd017e54_654bb2d15_93_415.svg", width: 15, left: 174 },
    { src: "https://media.base44.com/images/public/6a3542676f9044e70b439a84/67c99f412_9f5974ac1_93_419.svg", width: 21, left: 208 },
    { src: "https://media.base44.com/images/public/6a3542676f9044e70b439a84/b55b26c7d_3f85f6d06_93_423.svg", width: 20, left: 236 },
    { src: "https://media.base44.com/images/public/6a3542676f9044e70b439a84/b215d855b_e53caf776_93_427.svg", width: 17, left: 263 },
    { src: "https://media.base44.com/images/public/6a3542676f9044e70b439a84/28d3c2ad9_61de8f716_93_431.svg", width: 14, left: 290 },
    { src: "https://media.base44.com/images/public/6a3542676f9044e70b439a84/6ad01a08e_dc6f731f2_93_435.svg", width: 18, left: 309 },
  ];

  return (
    <motion.main
      className="relative w-full bg-black font-sans overflow-x-hidden"
      animate={{ opacity: isExiting ? 0 : 1, scale: isExiting ? 0.97 : 1 }}
      transition={{ duration: 0.45, ease: "easeInOut" }}
    >
      {/* Sticky Nav */}
      <header className="fixed top-0 left-0 w-full px-8 lg:px-[clamp(16px,5.7vw,109px)] h-[72px] flex items-center justify-between z-50 bg-black/60 backdrop-blur-md border-b border-white/8">
        <div className="text-white font-bold text-lg tracking-wide">Baseline</div>
        <div className="flex items-center gap-[clamp(16px,2.8vw,40px)]">
          <button
            onClick={() => handleNav("/login")}
            className="text-white font-semibold text-sm hover:opacity-70 transition-opacity"
          >
            Log In
          </button>
          <button
            onClick={() => handleNav("/register")}
            className="px-4 py-2 bg-white text-black font-semibold text-sm rounded-full hover:bg-white/90 transition-all"
          >
            Sign Up
          </button>
        </div>
      </header>

      {/* ─── HERO ─── */}
      <section className="relative w-full min-h-screen flex flex-col md:flex-row items-center overflow-hidden">
        {/* Background */}
        <img
          src="https://media.base44.com/images/public/6a3542676f9044e70b439a84/5cb8a5204_323ee374e_93_338.svg"
          className="absolute inset-0 w-full h-full object-cover z-0"
          alt=""
        />
        <img
          src="https://media.base44.com/images/public/6a3542676f9044e70b439a84/8e606f141_46cfdf17b_93_339.svg"
          className="absolute inset-0 w-full h-full object-cover z-0"
          alt=""
        />

        {/* Orb */}
        <div className="w-full md:w-1/2 flex items-center justify-center min-h-screen overflow-hidden z-10">
          <motion.div
            className="relative w-full max-w-[660px] aspect-square overflow-hidden"
            initial={{ opacity: 0, scale: 0.85 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1.8, ease: [0.16, 1, 0.3, 1] }}
          >
            <motion.img
              src="https://media.base44.com/images/public/6a3542676f9044e70b439a84/156742c3c_2c64e420d_b567a13c189ab17b1195db0aba380e0ba8854e8c.png"
              alt="Power Core"
              className="absolute max-w-none"
              style={{ width: "237.034%", height: "238.171%", left: "-72.624%", top: "-50.189%", objectFit: "cover", objectPosition: "center" }}
              animate={{ filter: ["brightness(1)", "brightness(1.25)", "brightness(1)"], scale: [1, 1.015, 1] }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            />
          </motion.div>
        </div>

        {/* Brand text */}
        <div className="absolute inset-0 flex items-center justify-center px-8 md:static md:w-1/2 md:flex md:items-center md:justify-start md:px-[clamp(32px,5vw,80px)] z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.2, delay: 0.4, type: "spring", stiffness: 40 }}
            className="flex flex-col gap-[clamp(10px,2.4vw,47px)] w-full max-w-[min(508px,85vw)]"
          >
            <ImageWord images={baselineImages} width={508} height={89} ariaLabel="Baseline" />
            <p className="text-white/70 text-sm font-light tracking-[0.35em] uppercase">Mind Over Money</p>
          </motion.div>
        </div>

        {/* Scroll hint */}
        <motion.div
          className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 flex flex-col items-center gap-2"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 2 }}
        >
          <motion.div
            className="w-[1px] h-10 bg-white/30"
            animate={{ scaleY: [0, 1, 0], originY: 0 }}
            transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
          />
        </motion.div>
      </section>

      {/* ─── INTRODUCING BASESCORE ─── */}
      <section className="w-full flex flex-col md:flex-row items-center px-8 md:px-[clamp(48px,6vw,140px)] py-[86px] gap-12 md:gap-20 lg:gap-48">
        <motion.div
          className="flex-1 max-w-lg"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={fadeUp}
        >
          <h2 className="text-white text-4xl md:text-5xl lg:text-6xl font-light leading-tight mb-8">
            Introducing <span className="font-extrabold">BaseScore™</span>
          </h2>
          <p className="text-white/70 text-lg leading-relaxed">
            <span className="text-white font-bold">BaseScore™</span> is a proprietary way to calculate your financial health. More than just a credit score or retirement preparedness, it allows you to truly understand your whole financial picture.
          </p>
        </motion.div>
        <motion.div
          className="flex justify-center"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={{ hidden: { opacity: 0, x: 60 }, visible: { opacity: 1, x: 0, transition: { duration: 0.9, ease: "easeOut" } } }}
        >
          <BaseScoreMockup />
        </motion.div>
      </section>

      {/* ─── WHAT'S YOUR BASESCORE ─── */}
      <BaseScoreSection onNav={handleNav} />

      {/* ─── FOR PARENTS ─── */}
      <section className="w-full flex flex-col md:flex-row items-center px-8 md:px-[clamp(48px,6vw,140px)] py-[86px] gap-12 md:gap-20 lg:gap-48">
        <motion.div
          className="flex justify-center md:order-first"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={{ hidden: { opacity: 0, x: -60 }, visible: { opacity: 1, x: 0, transition: { duration: 0.9, ease: "easeOut" } } }}
        >
          <ParentsMockup />
        </motion.div>
        <motion.div
          className="flex-1 max-w-lg"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={fadeUp}
        >
          <h2 className="text-white text-4xl md:text-5xl lg:text-7xl font-light leading-tight mb-6">
            For <span className="font-extrabold">Parents</span>
          </h2>
          <p className="text-white font-bold text-lg mb-4">Traceability &amp; Collaboration</p>
          <p className="text-white/70 text-lg leading-relaxed">
            <span className="text-white font-bold">Baseline</span> provides the guardrails for the education and planning process with your children. Map out the benefits of coaching them on their financial journey.
          </p>
        </motion.div>
      </section>

      {/* ─── FOR KIDS ─── */}
      <section className="w-full flex flex-col md:flex-row items-center px-8 md:px-[clamp(48px,6vw,140px)] py-[86px] gap-12 md:gap-20 lg:gap-48">
        <motion.div
          className="flex-1 max-w-lg"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={fadeUp}
        >
          <h2 className="text-white text-4xl md:text-5xl lg:text-7xl font-light leading-tight mb-6">
            For <span className="font-extrabold">Kids</span>
          </h2>
          <p className="text-white font-bold text-lg mb-4">Take Control &amp; Earn Rewards</p>
          <p className="text-white/70 text-lg leading-relaxed text-left">
            Learn about your money so that you can reach your goals and plan your future better (like paying for college and beyond). Earn rewards for reaching your goals and completing quizzes.
          </p>
        </motion.div>
        <motion.div
          className="flex justify-center"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={{ hidden: { opacity: 0, x: 60 }, visible: { opacity: 1, x: 0, transition: { duration: 0.9, ease: "easeOut" } } }}
        >
          <KidsMockup />
        </motion.div>
      </section>

      {/* ─── CTA: SET A GOAL & START SAVING ─── */}
      <section className="w-full flex flex-col items-center justify-center px-8 py-[86px] gap-8 min-h-[60vh]">
        <motion.div
          className="text-center"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={fadeUp}
        >
          <p className="text-white/50 text-sm uppercase tracking-[0.25em] font-semibold mb-6">For Everyone</p>
          <h2 className="text-white text-4xl md:text-5xl lg:text-7xl font-light leading-tight mb-8">
            Set a <span className="font-extrabold">Goal</span>
            <br />&amp;<br />
            Start <span className="font-extrabold">Saving</span>
          </h2>
          <button
            onClick={() => handleNav("/onboarding")}
            className="px-[41px] py-[13.6px] bg-teal-400 text-black font-semibold text-[15px] rounded-full hover:bg-teal-300 transition-all"
          >
            Let's Go
          </button>
        </motion.div>
      </section>
      {/* ─── FOOTER ─── */}
      <footer className="w-full border-t border-white/8 px-8 lg:px-[clamp(48px,8vw,140px)] py-12 flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="text-white/20 text-sm font-light tracking-wide">© 2026 Baseline. All rights reserved.</div>
        <div className="flex items-center gap-8">
          <button onClick={() => handleNav("/basescore-quiz")} className="text-white/30 text-sm font-light hover:text-white/60 transition-colors">Get Your BaseScore™</button>
          <button onClick={() => handleNav("/login")} className="text-white/30 text-sm font-light hover:text-white/60 transition-colors">Log In</button>
          <button onClick={() => handleNav("/register")} className="text-white/30 text-sm font-light hover:text-white/60 transition-colors">Sign Up</button>
        </div>
      </footer>

    </motion.main>
  );
}