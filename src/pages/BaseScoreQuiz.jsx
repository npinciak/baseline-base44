import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, ArrowLeft, Check } from "lucide-react";
import BaseScoreResult from "@/components/BaseScoreResult";

const MAX_SCORE = 500;
const RESULT_CAP_PCT = 0.6; // preliminary score is capped at 60% of the max

function calculateScore(answers) {
  let totalFraction = 0;
  let count = 0;
  STEPS.forEach((step) => {
    const answer = answers[step.key];
    if (!answer) return;
    const idx = step.options.indexOf(answer);
    const frac = (step.options.length - 1 - idx) / (step.options.length - 1);
    totalFraction += frac;
    count += 1;
  });
  const avg = count > 0 ? totalFraction / count : 0;
  return Math.round(avg * MAX_SCORE * RESULT_CAP_PCT);
}

const STEPS = [
  {
    section: "Preparedness",
    question: "I could handle a major unexpected expense",
    options: ["Completely", "Very Well", "Somewhat", "Very Little", "Not at all"],
    key: "preparedness_1",
  },
  {
    section: "Preparedness",
    question: "I can enjoy life because of the way I'm managing my money",
    options: ["Completely", "Very Well", "Somewhat", "Very Little", "Not at all"],
    key: "preparedness_2",
  },
  {
    section: "Money Mindset",
    question: "My finances control my life",
    options: ["Always", "Often", "Sometimes", "Rarely", "Never"],
    key: "mindset_1",
  },
  {
    section: "Credit Health",
    question: "What is your credit score?",
    options: [
      "300 – 579 (Poor)",
      "580 – 669 (Fair)",
      "670 – 739 (Good)",
      "740 – 799 (Very Good)",
      "800 – 850 (Excellent)",
    ],
    key: "credit_1",
  },
  {
    section: "Risk Appetite",
    question: "What's your main priority when investing?",
    options: [
      "Preserving my money with minimal risk.",
      "Growing my wealth steadily, even if there are some ups and downs.",
      "Maximizing returns, even if it means taking on significant risk.",
    ],
    key: "risk_1",
  },
  {
    section: "Risk Appetite",
    question: "If you received an unexpected windfall of $50,000, how would you allocate it?",
    options: [
      "Put it in a savings account or low-risk bonds.",
      "Invest in a balanced mix of stocks and bonds.",
      "Invest in high-growth stocks, startups, or cryptocurrency.",
    ],
    key: "risk_2",
  },
  {
    section: "Risk Appetite",
    question: "How would you react if your investment portfolio dropped by 20% in a short period?",
    options: [
      "I would sell immediately to cut losses.",
      "I would stay invested but feel uneasy.",
      "I would see it as a buying opportunity and invest more.",
    ],
    key: "risk_3",
  },
  {
    section: "Financial Knowledge",
    question: "What does it mean to 'live within your means'?",
    options: [
      "Using credit cards to afford the lifestyle you want.",
      "Spending all of your income each month without saving.",
      "Spending less money than you earn.",
      "Earning more money by investing in high-risk stocks.",
    ],
    key: "knowledge_1",
  },
  {
    section: "Financial Knowledge",
    question: "If you take out a loan with a 5% annual interest rate, what does that mean, and how does it impact the total amount you repay?",
    options: [
      "You will only pay back the exact amount you borrowed, with no additional costs.",
      "You will pay an extra 5% of the loan amount each year until it is fully repaid.",
      "You will pay a one-time 5% fee when taking out the loan.",
    ],
    key: "knowledge_2",
  },
  {
    section: "Financial Knowledge",
    question: "What is diversification, and why is it important in investing?",
    options: [
      "Putting all your money into one investment to maximize potential returns.",
      "Spreading your investments across different assets to reduce risk.",
      "Avoiding investments altogether to prevent potential losses.",
      "Investing only in stocks because they have the highest returns.",
    ],
    key: "knowledge_3",
  },
];

// Reuse the same SVG wordmark images from the hero
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

const WORDMARK_W = 508;
const WORDMARK_H = 89;

function BaselineWordmark({ scale = 0.38 }) {
  const w = WORDMARK_W * scale;
  const h = WORDMARK_H * scale;

  const renderMark = (opacity) => (
    <div
      className="absolute inset-0"
      style={{ opacity }}
    >
      {baselineImages.map((img, i) => (
        <img
          key={i}
          src={img.src}
          className="absolute object-contain"
          style={{
            left: (img.left / WORDMARK_W) * w,
            top: (img.top / WORDMARK_H) * h,
            width: (img.width / WORDMARK_W) * w,
            height: (img.height / WORDMARK_H) * h,
          }}
          alt=""
        />
      ))}
    </div>
  );

  // Crop the source image to its top ~65% (the icon glyph), excluding the "Baseline" text baked into the bottom of the image
  const logoContainerH = h * 4.8;
  const cropFrac = 0.65;
  const logoImgSize = logoContainerH / cropFrac;

  return (
    <div className="relative shrink-0" style={{ width: w, height: h }} aria-label="Baseline">
      {/* Faint logo watermark behind the title, proportional to font size */}
      <div
        className="absolute pointer-events-none overflow-hidden"
        style={{
          width: logoImgSize,
          height: logoContainerH,
          left: "50%",
          top: "50%",
          transform: "translate(-50%, -70%)",
          opacity: 0.1375,
        }}
      >
        <img
          src="https://media.base44.com/images/public/6a3542676f9044e70b439a84/156742c3c_2c64e420d_b567a13c189ab17b1195db0aba380e0ba8854e8c.png"
          alt=""
          className="absolute object-contain"
          style={{
            width: logoImgSize,
            height: logoImgSize,
            top: 0,
            left: 0,
          }}
        />
      </div>
      {renderMark(1)}
    </div>
  );
}

export default function BaseScoreQuiz() {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState({});
  const [direction, setDirection] = useState(1);
  const [showResult, setShowResult] = useState(false);
  const [score, setScore] = useState(0);

  const step = STEPS[currentStep];
  const selected = answers[step.key];
  const total = STEPS.length;

  if (showResult) {
    return <BaseScoreResult score={score} onContinue={() => navigate("/register")} />;
  }

  const handleSelect = (option) => {
    setAnswers((prev) => ({ ...prev, [step.key]: option }));
  };

  const handleNext = () => {
    if (currentStep < total - 1) {
      setDirection(1);
      setCurrentStep((s) => s + 1);
    } else {
      sessionStorage.setItem("basescore_quiz", JSON.stringify(answers));
      setScore(calculateScore(answers));
      setShowResult(true);
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setDirection(-1);
      setCurrentStep((s) => s - 1);
    } else {
      navigate("/");
    }
  };

  return (
    <div
      className="h-screen overflow-hidden flex font-body"
      style={{ background: "hsl(222,47%,6%)" }}
    >
      {/* Left panel — branding */}
      <div className="hidden lg:flex flex-col justify-between w-[340px] xl:w-[400px] shrink-0 px-14 py-10 border-r border-white/5">
        <BaselineWordmark scale={0.38} />

        {/* Tenet labels — progress context */}
        <div className="space-y-4">
          {["Preparedness", "Money Mindset", "Credit Health", "Risk Appetite", "Financial Knowledge"].map((label, i) => {
            const stepIndices = {
              "Preparedness": [0, 1],
              "Money Mindset": [2],
              "Credit Health": [3],
              "Risk Appetite": [4, 5, 6],
              "Financial Knowledge": [7, 8, 9],
            };
            const steps = stepIndices[label];
            const isActive = steps.includes(currentStep);
            const isDone = steps.every(s => s < currentStep);
            return (
              <div key={label} className="flex items-center gap-3">
                <div
                  className={`w-1.5 h-1.5 rounded-full transition-all duration-300 ${
                    isDone ? "bg-[#2EFD7A]" : isActive ? "bg-[#2EFD7A]" : "bg-white/15"
                  }`}
                />
                <span
                  className={`text-sm font-light tracking-wide transition-all duration-300 ${
                    isDone ? "text-[#2EFD7A]/60" : isActive ? "text-white" : "text-white/25"
                  }`}
                >
                  {label}
                </span>
              </div>
            );
          })}
        </div>

        <p className="text-white/20 text-xs font-light tracking-widest uppercase">
          BaseScore™ Assessment
        </p>
      </div>

      {/* Right panel — question */}
      <div className="flex-1 h-full overflow-hidden flex flex-col justify-center items-center px-6 md:px-8 py-4 md:py-8">
        {/* Mobile wordmark */}
        <div className="lg:hidden mb-4 md:mb-6 shrink-0">
          <BaselineWordmark scale={0.24} />
        </div>

        <div className="w-full max-w-[520px]">
          {/* Step counter + progress bar */}
          <div className="mb-5 md:mb-8">
            <div className="flex items-center justify-between mb-3">
              <span className="text-white/30 text-xs font-light tracking-widest uppercase">{step.section}</span>
              <span className="text-white/20 text-xs font-light">{currentStep + 1} / {total}</span>
            </div>
            {/* Thin progress line */}
            <div className="h-[1px] bg-white/10 rounded-full">
              <motion.div
                className="h-full bg-[#2EFD7A] rounded-full"
                animate={{ width: `${((currentStep + 1) / total) * 100}%` }}
                transition={{ duration: 0.4, ease: "easeOut" }}
              />
            </div>
          </div>

          {/* Question card */}
          <AnimatePresence mode="wait" custom={direction}>
            <motion.div
              key={currentStep}
              custom={direction}
              initial={{ opacity: 0, y: direction > 0 ? 24 : -24 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: direction > 0 ? -24 : 24 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
            >
              {/* Question */}
              <h2 className="text-white text-lg md:text-xl lg:text-2xl font-normal leading-snug mb-5 md:mb-7 tracking-tight">
                {step.question}
              </h2>

              {/* Options */}
              <div className="space-y-2 md:space-y-2.5 mb-6 md:mb-8">
                {step.options.map((opt, i) => {
                  const isSelected = selected === opt;
                  return (
                    <button
                      key={i}
                      onClick={() => handleSelect(opt)}
                      className={`group w-full flex items-center gap-4 px-4 md:px-5 py-2.5 md:py-3 rounded-xl border text-left text-sm font-normal tracking-wide transition-all duration-200 ${
                        isSelected
                          ? "border-[#2EFD7A]/60 text-white shadow-[0_0_20px_rgba(46,253,122,0.15)]"
                          : "border-white/8 bg-white/[0.03] text-white/70 hover:border-white/20 hover:text-white/90 hover:bg-white/[0.06]"
                      }`}
                      style={isSelected ? { background: "rgba(46,253,122,0.14)" } : {}}
                    >
                      {/* Radio dot */}
                      <div
                        className={`w-4 h-4 rounded-full border shrink-0 flex items-center justify-center transition-all duration-200 ${
                          isSelected ? "border-[#2EFD7A]" : "border-white/20 group-hover:border-white/40"
                        }`}
                      >
                        {isSelected && (
                          <div className="w-1.5 h-1.5 rounded-full bg-[#2EFD7A]" />
                        )}
                      </div>
                      <span>{opt}</span>
                    </button>
                  );
                })}
              </div>

              {/* Navigation */}
              <div className="flex items-center justify-between">
                <button
                  onClick={handlePrev}
                  className="flex items-center gap-2 text-white/30 hover:text-white/60 text-sm font-light tracking-wide transition-all duration-200"
                >
                  {currentStep > 0 && <ArrowLeft className="w-4 h-4" />}
                  {currentStep === 0 ? "Cancel" : "Previous"}
                </button>

                <button
                  onClick={handleNext}
                  disabled={!selected}
                  className="flex items-center gap-2.5 px-8 py-3.5 rounded-full bg-[#2EFD7A] text-black text-sm font-semibold tracking-wide hover:bg-[#2EFD7A]/90 transition-all duration-200 disabled:opacity-25 disabled:cursor-not-allowed"
                >
                  {currentStep === total - 1 ? "See My Score" : "Next"}
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}