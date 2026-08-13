import React, { useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Search } from "lucide-react";

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

// Shared mock phone UI used across sections
const AppPhoneUI = () => (
  <div className="relative w-[260px] lg:w-[300px] bg-black rounded-[40px] border border-white/10 shadow-2xl overflow-hidden" style={{ aspectRatio: '9/19' }}>
    {/* Status bar */}
    <div className="flex justify-between items-center px-5 pt-4 pb-2 text-white text-[10px] font-medium">
      <span>9:41</span>
      <div className="flex gap-1 items-center">
        <span>●●●</span>
        <span>WiFi</span>
        <span>▮</span>
      </div>
    </div>
    {/* Header */}
    <div className="flex justify-between items-center px-5 py-2">
      <span className="text-white font-bold text-sm">Welcome 🔥</span>
      <div className="flex items-center gap-1 bg-white/10 rounded-full px-2 py-1">
        <span className="text-yellow-400 text-xs">●</span>
        <span className="text-white text-xs font-bold">125</span>
      </div>
    </div>
    {/* Goal card */}
    <div className="mx-4 bg-white rounded-2xl p-3 mb-3">
      <div className="flex gap-2 items-center">
        <div className="w-10 h-8 bg-gray-200 rounded-lg overflow-hidden">
          <img src="https://images.unsplash.com/photo-1555215695-3004980ad54e?w=80&h=60&fit=crop" alt="Porsche" className="w-full h-full object-cover" />
        </div>
        <div className="flex-1">
          <p className="text-black font-bold text-xs">Porsche</p>
          <p className="text-gray-500 text-[9px]">Buying a Car</p>
        </div>
        <div className="text-right">
          <p className="text-black font-bold text-xs">$12,000.00</p>
          <p className="text-gray-500 text-[9px]">Sep 01, 2030</p>
        </div>
      </div>
      <div className="flex justify-between mt-2 pt-2 border-t border-gray-100">
        <div><p className="text-gray-400 text-[8px]">Total Saved</p><p className="text-black font-bold text-[10px]">$0</p></div>
        <div><p className="text-gray-400 text-[8px]">Days Till Goal</p><p className="text-black font-bold text-[10px]">0</p></div>
      </div>
    </div>
    {/* Dots */}
    <div className="flex justify-center gap-1 mb-3">
      <span className="w-1.5 h-1.5 rounded-full bg-white/40"></span>
      <span className="w-1.5 h-1.5 rounded-full bg-white/40"></span>
      <span className="w-1.5 h-1.5 rounded-full bg-white/40"></span>
    </div>
    {/* Learning path nodes */}
    <div className="px-4 space-y-1">
      {[
        { label: "Get Started with level 1", num: "01", completed: false, isNum: true },
        { label: "Savings Plan", completed: true },
        { label: "Set up Automatic Contributions", active: true },
        { label: "Personal Finance 101", locked: true },
      ].map((node, i) => (
        <div key={i} className="flex items-center gap-3">
          <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 text-xs font-bold
            ${node.isNum ? 'bg-teal-400 text-black' : node.completed ? 'bg-teal-400 text-black' : node.active ? 'bg-white/20 border border-white/40 text-white' : 'bg-white/10 text-white/40'}`}>
            {node.isNum ? node.num : node.completed ? '✓' : node.active ? '✎' : '○'}
          </div>
          <span className={`text-[10px] ${node.locked ? 'text-white/30' : 'text-white/80'}`}>{node.label}</span>
          {node.active && <span className="ml-auto text-[8px] bg-teal-400 text-black px-1.5 py-0.5 rounded-full font-bold">Start</span>}
        </div>
      ))}
    </div>
    {/* Bottom nav */}
    <div className="absolute bottom-0 left-0 right-0 flex justify-around items-center px-4 py-3 border-t border-white/10 bg-black">
      {['🏠', '🔍', '📊', '🛍️', '⚙️'].map((icon, i) => (
        <span key={i} className={`text-sm ${i === 0 ? 'text-teal-400' : 'text-white/40'}`}>{icon}</span>
      ))}
    </div>
  </div>
);

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
      <section className="w-full min-h-screen flex flex-col lg:flex-row items-center px-8 lg:px-[clamp(48px,8vw,140px)] py-24 gap-16">
        <motion.div
          className="flex-1 max-w-lg"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={fadeUp}
        >
          <h2 className="text-white text-5xl lg:text-6xl font-light leading-tight mb-10">
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
          <AppPhoneUI />
        </motion.div>
      </section>

      {/* ─── WHAT'S YOUR BASESCORE ─── */}
      <section className="w-full min-h-screen flex flex-col items-center justify-center px-8 py-24 gap-10">
        <motion.div
          className="text-center"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={fadeUp}
        >
          <h2 className="text-white text-5xl lg:text-7xl font-light mb-12">
            What's Your <span className="font-extrabold">BaseScore?</span>
          </h2>
          <div className="relative max-w-xl mx-auto mb-8">
            <input
              type="text"
              placeholder="How Healthy is Your Money?"
              readOnly
              onClick={() => handleNav("/register")}
              className="w-full bg-transparent border-2 border-white text-white placeholder-white/60 text-lg px-6 py-4 pr-14 rounded-full cursor-pointer focus:outline-none focus:border-teal-400 transition-colors"
            />
            <Search className="absolute right-5 top-1/2 -translate-y-1/2 text-white w-6 h-6" />
          </div>
          <button
            onClick={() => handleNav("/register")}
            className="px-10 py-4 bg-[#2EFD7A] text-black font-semibold text-lg rounded-full hover:bg-[#2EFD7A]/90 transition-all"
          >
            Find Out
          </button>
        </motion.div>
      </section>

      {/* ─── FOR PARENTS ─── */}
      <section className="w-full min-h-screen flex flex-col lg:flex-row items-center px-8 lg:px-[clamp(48px,8vw,140px)] py-24 gap-16">
        <motion.div
          className="flex justify-center lg:order-first"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={{ hidden: { opacity: 0, x: -60 }, visible: { opacity: 1, x: 0, transition: { duration: 0.9, ease: "easeOut" } } }}
        >
          <AppPhoneUI />
        </motion.div>
        <motion.div
          className="flex-1 max-w-lg"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={fadeUp}
        >
          <h2 className="text-white text-5xl lg:text-7xl font-light leading-tight mb-8">
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
      <section className="w-full min-h-screen flex flex-col lg:flex-row items-center px-8 lg:px-[clamp(48px,8vw,140px)] py-24 gap-16">
        <motion.div
          className="flex-1 max-w-lg"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={fadeUp}
        >
          <h2 className="text-white text-5xl lg:text-7xl font-light leading-tight mb-8">
            For <span className="font-extrabold">Kids</span>
          </h2>
          <p className="text-white font-bold text-lg mb-4">Take Control Of Your Money</p>
          <p className="text-white/70 text-lg leading-relaxed text-center lg:text-left">
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
          <AppPhoneUI />
        </motion.div>
      </section>

      {/* ─── CTA: SET A GOAL & START SAVING ─── */}
      <section className="w-full min-h-screen flex flex-col items-center justify-center px-8 py-24 gap-8">
        <motion.div
          className="text-center"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={fadeUp}
        >
          <h2 className="text-white text-5xl lg:text-7xl font-light leading-tight mb-10">
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