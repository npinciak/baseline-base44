import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, ArrowLeft, Check } from "lucide-react";

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
    correct: 2,
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
    correct: 1,
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
    correct: 1,
  },
];

export default function BaseScoreQuiz() {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState({});
  const [direction, setDirection] = useState(1);

  const step = STEPS[currentStep];
  const selected = answers[step.key];
  const total = STEPS.length;

  const handleSelect = (option) => {
    setAnswers((prev) => ({ ...prev, [step.key]: option }));
  };

  const handleNext = () => {
    if (currentStep < total - 1) {
      setDirection(1);
      setCurrentStep((s) => s + 1);
    } else {
      // Store answers in sessionStorage so register page can access them
      sessionStorage.setItem("basescore_quiz", JSON.stringify(answers));
      navigate("/register");
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
    <div className="min-h-screen bg-black flex items-center justify-center px-6">
      {/* Baseline branding — left */}
      <div className="hidden lg:flex flex-col items-center justify-center w-56 shrink-0 mr-16">
        <div className="flex items-center gap-3">
          {/* Power icon orb */}
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-teal-400 to-blue-500 flex items-center justify-center shadow-lg">
            <svg viewBox="0 0 24 24" fill="none" className="w-7 h-7" stroke="white" strokeWidth="2.5" strokeLinecap="round">
              <path d="M12 2v6" />
              <path d="M6.3 5.7a8 8 0 1 0 11.4 0" />
            </svg>
          </div>
          <span className="text-white font-bold text-2xl tracking-wide">Baseline</span>
        </div>
      </div>

      {/* Quiz card */}
      <div className="w-full max-w-[480px]">
        <AnimatePresence mode="wait" custom={direction}>
          <motion.div
            key={currentStep}
            custom={direction}
            initial={{ opacity: 0, x: direction * 40 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: direction * -40 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            className="bg-[#1a1f2e] rounded-2xl p-8 shadow-2xl border border-white/5"
          >
            {/* Section title */}
            <h2 className="text-white text-xl font-semibold mb-4">{step.section}</h2>

            {/* Progress dots */}
            <div className="flex items-center gap-1.5 mb-8">
              {STEPS.map((_, i) => (
                <div key={i} className="flex items-center gap-1.5">
                  <div
                    className={`w-5 h-5 rounded-full flex items-center justify-center transition-all duration-300 ${
                      i < currentStep
                        ? "bg-[#2EFD7A]"
                        : i === currentStep
                        ? "bg-[#2EFD7A] ring-2 ring-[#2EFD7A]/30"
                        : "bg-white/15"
                    }`}
                  >
                    {i < currentStep && <Check className="w-3 h-3 text-black" strokeWidth={3} />}
                  </div>
                  {i < total - 1 && (
                    <div
                      className={`h-[2px] w-5 rounded-full transition-all duration-300 ${
                        i < currentStep ? "bg-[#2EFD7A]" : "bg-white/15"
                      }`}
                    />
                  )}
                </div>
              ))}
            </div>

            {/* Question */}
            <p className="text-white text-lg font-medium leading-snug mb-6">{step.question}</p>

            {/* Options */}
            <div className="space-y-2.5 mb-8">
              {step.options.map((opt, i) => (
                <button
                  key={i}
                  onClick={() => handleSelect(opt)}
                  className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-xl border text-left text-sm transition-all duration-150 ${
                    selected === opt
                      ? "border-[#2EFD7A]/60 bg-[#2EFD7A]/10 text-white"
                      : "border-white/10 bg-white/5 text-white/70 hover:border-white/25 hover:text-white"
                  }`}
                >
                  <div
                    className={`w-5 h-5 rounded-full border-2 shrink-0 flex items-center justify-center transition-all ${
                      selected === opt ? "border-[#2EFD7A] bg-[#2EFD7A]" : "border-white/30"
                    }`}
                  >
                    {selected === opt && <div className="w-2 h-2 rounded-full bg-black" />}
                  </div>
                  <span>{opt}</span>
                </button>
              ))}
            </div>

            {/* Navigation */}
            <div className="flex items-center justify-between gap-3">
              <button
                onClick={handlePrev}
                className="px-5 py-2.5 rounded-xl bg-white/10 text-white/70 text-sm font-semibold hover:bg-white/15 transition-all flex items-center gap-2"
              >
                {currentStep === 0 ? "Cancel" : (
                  <>
                    <ArrowLeft className="w-4 h-4" />
                    Previous
                  </>
                )}
              </button>
              <button
                onClick={handleNext}
                disabled={!selected}
                className="px-6 py-2.5 rounded-xl bg-[#2EFD7A] text-black text-sm font-bold hover:bg-[#2EFD7A]/90 transition-all flex items-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {currentStep === total - 1 ? "See My Score" : "Next"}
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}