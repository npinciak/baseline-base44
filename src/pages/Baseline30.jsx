import React, { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Search } from "lucide-react";

const BASESCORE_QUESTIONS = [
  "How Healthy Is Your Money?",
  "Is Your Money Growing As Fast As You Want?",
  "How Can You Reach Your Goals Faster?",
  "Are You On Track For Retirement?",
  "Do You Know Your Debt-To-Income Ratio?",
  "Is Your Credit Score Holding You Back?",
  "Could You Survive 3 Months Without Income?",
  "Are You Paying Too Much In Interest?",
  "How Much Should You Be Saving Each Month?",
  "Is Your Emergency Fund Big Enough?",
  "Are You Investing As Much As You Could Be?",
  "What Would It Take To Be Financially Free?",
];

function useTypingAnimation() {
  const [displayed, setDisplayed] = useState("");
  const [questionIndex, setQuestionIndex] = useState(0);
  const [phase, setPhase] = useState("typing"); // typing | pausing | deleting
  const timeoutRef = useRef(null);

  useEffect(() => {
    const current = BASESCORE_QUESTIONS[questionIndex];

    if (phase === "typing") {
      if (displayed.length < current.length) {
        timeoutRef.current = setTimeout(() => {
          setDisplayed(current.slice(0, displayed.length + 1));
        }, 42);
      } else {
        timeoutRef.current = setTimeout(() => setPhase("pausing"), 1800);
      }
    } else if (phase === "pausing") {
      timeoutRef.current = setTimeout(() => setPhase("deleting"), 400);
    } else if (phase === "deleting") {
      if (displayed.length > 0) {
        timeoutRef.current = setTimeout(() => {
          setDisplayed(displayed.slice(0, -1));
        }, 22);
      } else {
        setQuestionIndex((i) => (i + 1) % BASESCORE_QUESTIONS.length);
        setPhase("typing");
      }
    }

    return () => clearTimeout(timeoutRef.current);
  }, [displayed, phase, questionIndex]);

  return displayed;
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

// Onboarding quiz phone mockup — shows the financial profile questions
const OnboardingPhoneMockup = () => (
  <div className="relative w-[240px] lg:w-[280px] rounded-[36px] border border-white/15 shadow-2xl overflow-hidden bg-[#0a0e1a] flex flex-col" style={{ aspectRatio: '9/19' }}>
    {/* status bar */}
    <div className="flex justify-between px-5 pt-4 pb-1 text-white/50 text-[9px]">
      <span>9:41</span><span>●●● WiFi ▮</span>
    </div>
    {/* progress bar */}
    <div className="px-5 pt-3 pb-4">
      <div className="flex gap-1 mb-4">
        {[1,2,3,4,5].map(i => (
          <div key={i} className={`flex-1 h-1 rounded-full ${i <= 2 ? 'bg-teal-400' : 'bg-white/15'}`} />
        ))}
      </div>
      {/* Step label */}
      <p className="text-white/50 text-[9px] uppercase tracking-widest mb-2">Step 2 of 5</p>
      <h3 className="text-white font-bold text-sm leading-snug mb-4">How would you describe your financial knowledge?</h3>
      {/* Options */}
      {[
        { label: "Complete Beginner", sub: "Just starting out", active: false },
        { label: "Some Knowledge", sub: "Know the basics", active: true },
        { label: "Intermediate", sub: "Comfortable with investing", active: false },
      ].map((opt) => (
        <div key={opt.label} className={`flex items-center gap-3 p-3 rounded-xl mb-2 border ${opt.active ? 'border-teal-400 bg-teal-400/10' : 'border-white/10 bg-white/5'}`}>
          <div className={`w-4 h-4 rounded-full border-2 shrink-0 ${opt.active ? 'border-teal-400 bg-teal-400' : 'border-white/30'}`} />
          <div>
            <p className={`text-xs font-semibold ${opt.active ? 'text-teal-400' : 'text-white/80'}`}>{opt.label}</p>
            <p className="text-[9px] text-white/40">{opt.sub}</p>
          </div>
        </div>
      ))}
    </div>
    {/* Divider */}
    <div className="mx-5 border-t border-white/10 mb-3" />
    {/* Risk appetite question peek */}
    <div className="px-5">
      <p className="text-white/30 text-[9px] uppercase tracking-widest mb-2">Up next</p>
      <p className="text-white/50 text-xs font-medium">What's your risk appetite?</p>
      <div className="flex gap-2 mt-2">
        {['Conservative', 'Moderate', 'Aggressive'].map(r => (
          <span key={r} className="text-[8px] text-white/30 border border-white/10 px-2 py-1 rounded-full">{r}</span>
        ))}
      </div>
    </div>
    {/* CTA */}
    <div className="absolute bottom-0 left-0 right-0 p-4">
      <div className="bg-teal-400 rounded-2xl py-3 text-center">
        <span className="text-black font-bold text-xs">Continue</span>
      </div>
    </div>
  </div>
);

// Goals phone mockup
const GoalsPhoneMockup = () => (
  <div className="relative w-[240px] lg:w-[280px] rounded-[36px] border border-white/15 shadow-2xl overflow-hidden bg-[#0a0e1a] flex flex-col" style={{ aspectRatio: '9/19' }}>
    <div className="flex justify-between px-5 pt-4 pb-1 text-white/50 text-[9px]">
      <span>9:41</span><span>●●● WiFi ▮</span>
    </div>
    <div className="px-5 pt-3 flex-1">
      <p className="text-white/50 text-[9px] uppercase tracking-widest mb-1">My Goals</p>
      <h3 className="text-white font-bold text-sm mb-4">Saving Together 🎯</h3>
      {[
        { name: "College Fund", emoji: "🎓", saved: 4200, target: 20000, pct: 21 },
        { name: "Family Vacation", emoji: "✈️", saved: 1800, target: 5000, pct: 36 },
        { name: "Emergency Fund", emoji: "🛡️", saved: 3000, target: 10000, pct: 30 },
      ].map(g => (
        <div key={g.name} className="bg-white/5 border border-white/10 rounded-xl p-3 mb-2">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-base">{g.emoji}</span>
            <div className="flex-1">
              <p className="text-white text-xs font-semibold">{g.name}</p>
              <p className="text-white/40 text-[9px]">${g.saved.toLocaleString()} of ${g.target.toLocaleString()}</p>
            </div>
            <span className="text-teal-400 font-bold text-xs">{g.pct}%</span>
          </div>
          <div className="h-1.5 bg-white/10 rounded-full">
            <div className="h-full bg-teal-400 rounded-full" style={{ width: `${g.pct}%` }} />
          </div>
        </div>
      ))}
    </div>
    <div className="px-5 pb-6">
      <div className="bg-teal-400 rounded-2xl py-2.5 text-center">
        <span className="text-black font-bold text-xs">+ Add Goal</span>
      </div>
    </div>
  </div>
);

// Learning path phone mockup
const LearningPhoneMockup = () => (
  <div className="relative w-[240px] lg:w-[280px] rounded-[36px] border border-white/15 shadow-2xl overflow-hidden bg-[#0a0e1a] flex flex-col" style={{ aspectRatio: '9/19' }}>
    <div className="flex justify-between px-5 pt-4 pb-1 text-white/50 text-[9px]">
      <span>9:41</span><span>●●● WiFi ▮</span>
    </div>
    <div className="px-5 pt-3 flex-1">
      <div className="flex justify-between items-center mb-3">
        <p className="text-white font-bold text-sm">Learning Path 📚</p>
        <div className="flex items-center gap-1 bg-yellow-400/20 rounded-full px-2 py-1">
          <span className="text-yellow-400 text-[9px] font-bold">🪙 245 XP</span>
        </div>
      </div>
      {[
        { title: "Budgeting Basics", tag: "budgeting", pct: 100, color: "bg-teal-400" },
        { title: "Smart Saving", tag: "saving", pct: 60, color: "bg-blue-400" },
        { title: "Investing 101", tag: "investing", pct: 0, color: "bg-purple-400" },
        { title: "Credit & Debt", tag: "credit", pct: 0, color: "bg-orange-400" },
      ].map((m, i) => (
        <div key={m.title} className={`flex items-center gap-3 p-3 rounded-xl mb-2 border ${m.pct === 100 ? 'border-teal-400/30 bg-teal-400/5' : 'border-white/10 bg-white/5'}`}>
          <div className={`w-8 h-8 rounded-full ${m.color} flex items-center justify-center text-black text-xs font-bold`}>
            {m.pct === 100 ? '✓' : i + 1}
          </div>
          <div className="flex-1">
            <p className="text-white text-xs font-semibold">{m.title}</p>
            <div className="h-1 bg-white/10 rounded-full mt-1">
              <div className={`h-full ${m.color} rounded-full`} style={{ width: `${m.pct}%` }} />
            </div>
          </div>
          {m.pct === 0 && i !== 2 && <span className="text-white/20 text-xs">🔒</span>}
          {i === 1 && <span className="text-[8px] bg-teal-400 text-black px-1.5 py-0.5 rounded-full font-bold">Active</span>}
        </div>
      ))}
    </div>
  </div>
);

function BaseScoreSection({ onNav }) {
  const typedText = useTypingAnimation();

  return (
    <section className="w-full flex flex-col items-center justify-center px-8 pt-[120px] pb-[86px] gap-8">
      <motion.div
        className="text-center w-full"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-100px" }}
        variants={{ hidden: { opacity: 0, y: 40 }, visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: "easeOut" } } }}
      >
        <h2 className="text-white text-5xl lg:text-7xl font-light mb-10">
          What's Your <span className="font-extrabold">BaseScore?</span>
        </h2>
        <div
          className="relative max-w-xl mx-auto mb-7 cursor-pointer"
          onClick={() => onNav("/register")}
        >
          <div className="w-full bg-transparent border-2 border-white text-white text-lg px-6 py-4 pr-14 rounded-full flex items-center min-h-[60px]">
            <span className="text-white/90">{typedText}</span>
            <span className="inline-block w-[2px] h-[1.1em] bg-white/80 ml-[2px] animate-pulse align-middle" />
          </div>
          <Search className="absolute right-5 top-1/2 -translate-y-1/2 text-white w-6 h-6" />
        </div>
        <button
          onClick={() => onNav("/register")}
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
    { src: "https://media.base44.com/images/public/6a3542676f9044e70b439a84/cb653cc88_65f2ea1f0_93_395.svg", width: 17, left: 40 },
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
      <header className="fixed top-0 left-0 w-full px-8 lg:px-[clamp(16px,5.7vw,109px)] h-[72px] flex items-center justify-between z-50">
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
      <section className="relative w-full min-h-screen flex flex-col lg:flex-row items-center overflow-hidden">
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
        <div className="w-full lg:w-1/2 flex items-center justify-center min-h-screen overflow-hidden z-10">
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
        <div className="absolute inset-0 flex items-center justify-center px-8 lg:static lg:w-1/2 lg:flex lg:items-center lg:justify-start lg:px-[clamp(32px,5vw,80px)] z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.2, delay: 0.4, type: "spring", stiffness: 40 }}
            className="flex flex-col gap-[clamp(10px,2.4vw,47px)] w-full max-w-[min(508px,85vw)]"
          >
            <ImageWord images={baselineImages} width={508} height={89} ariaLabel="Baseline" />
            <ImageWord images={mindOverMoneyImages} width={327} height={21} ariaLabel="Mind Over Money" />
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
      <section className="w-full flex flex-col lg:flex-row items-center px-8 lg:px-[clamp(48px,8vw,140px)] py-[86px] gap-12">
        <motion.div
          className="flex-1 max-w-lg"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={fadeUp}
        >
          <h2 className="text-white text-5xl lg:text-6xl font-light leading-tight mb-8">
            Introducing <span className="font-extrabold">BaseScore™</span>
          </h2>
          <p className="text-white/70 text-lg leading-relaxed">
            More than just a credit score or retirement preparedness,{" "}
            <span className="text-white font-bold">BaseScore™</span> is a proprietary way to calculate your financial
            health and truly understand your whole financial picture.
          </p>
        </motion.div>
        <motion.div
          className="flex justify-center"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={{ hidden: { opacity: 0, x: 60 }, visible: { opacity: 1, x: 0, transition: { duration: 0.9, ease: "easeOut" } } }}
        >
          <OnboardingPhoneMockup />
        </motion.div>
      </section>

      {/* ─── WHAT'S YOUR BASESCORE ─── */}
      <BaseScoreSection onNav={handleNav} />

      {/* ─── FOR PARENTS ─── */}
      <section className="w-full flex flex-col lg:flex-row items-center px-8 lg:px-[clamp(48px,8vw,140px)] py-[86px] gap-12">
        <motion.div
          className="flex justify-center lg:order-first"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={{ hidden: { opacity: 0, x: -60 }, visible: { opacity: 1, x: 0, transition: { duration: 0.9, ease: "easeOut" } } }}
        >
          <GoalsPhoneMockup />
        </motion.div>
        <motion.div
          className="flex-1 max-w-lg"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={fadeUp}
        >
          <h2 className="text-white text-5xl lg:text-7xl font-light leading-tight mb-6">
            For <span className="font-extrabold">Parents</span>
          </h2>
          <p className="text-white font-bold text-lg mb-4">Tracability &amp; Collaboration</p>
          <p className="text-white/70 text-lg leading-relaxed">
            Map out the benefits of coaching your children on their financial journey.{" "}
            <span className="text-white font-bold">Baseline</span> provides the guardrails for the education and planning process.
          </p>
        </motion.div>
      </section>

      {/* ─── FOR KIDS ─── */}
      <section className="w-full flex flex-col lg:flex-row items-center px-8 lg:px-[clamp(48px,8vw,140px)] py-[86px] gap-12">
        <motion.div
          className="flex-1 max-w-lg"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={fadeUp}
        >
          <h2 className="text-white text-5xl lg:text-7xl font-light leading-tight mb-6">
            For <span className="font-extrabold">Kids</span>
          </h2>
          <p className="text-white font-bold text-lg mb-4">Take Control Of Your Money</p>
          <p className="text-white/70 text-lg leading-relaxed text-left">
            Learn about your money so that you can reach your goals and plan your future better (like paying for college and beyond).
            Get the tips and tools to reach your goals better and faster.
          </p>
        </motion.div>
        <motion.div
          className="flex justify-center"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={{ hidden: { opacity: 0, x: 60 }, visible: { opacity: 1, x: 0, transition: { duration: 0.9, ease: "easeOut" } } }}
        >
          <LearningPhoneMockup />
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
          <h2 className="text-white text-5xl lg:text-7xl font-light leading-tight mb-8">
            Set a <span className="font-extrabold">Goal</span>
            <br />&amp;<br />
            Start <span className="font-extrabold">Saving</span>
          </h2>
          <button
            onClick={() => handleNav("/register")}
            className="px-12 py-4 bg-teal-400 text-black font-semibold text-lg rounded-full hover:bg-teal-300 transition-all"
          >
            Let's Go
          </button>
        </motion.div>
      </section>
    </motion.main>
  );
}