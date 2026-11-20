import React from "react";
import { Link } from "react-router-dom";
import { Compass, Sparkles, Users, ShieldCheck, ArrowRight } from "lucide-react";
import PublicNav from "@/components/marketing/PublicNav";
import PublicFooter from "@/components/marketing/PublicFooter";
import WhoWeAreSection from "@/components/marketing/WhoWeAreSection";

const PILLARS = [
  {
    Icon: Compass,
    title: "Guided BasePath & Money Moves",
    body: "Bite-sized chapters turn budgeting, paychecks, taxes, credit, and investing into clear lessons paired with real-world Money Moves that unlock tools as you progress.",
  },
  {
    Icon: Sparkles,
    title: "Holistic BaseScore™ (0–500)",
    body: "Unlike a traditional credit score that only looks backward at debt, BaseScore™ measures financial knowledge, income-to-debt balance, preparedness, and credit health together.",
  },
  {
    Icon: ShieldCheck,
    title: "Interactive Financial Forecasting",
    body: "Our calendar-driven cash-flow sandbox works like a flight search for your money, letting you test upcoming bills, savings goals, and paycheck shifts before they happen.",
  },
  {
    Icon: Users,
    title: "Built for Students, Young Adults & Families",
    body: "Students and young adults build independence and earn BaseCoins for consistent habits, while parents gain supportive visibility to coach milestones together.",
  },
];

export default function About() {
  return (
    <div className="min-h-screen bg-black text-white font-body flex flex-col">
      <PublicNav />

      <main className="flex-1 pt-[72px]">
        <section className="w-full max-w-[1600px] mx-auto px-5 sm:px-8 md:px-[clamp(32px,6vw,140px)] pt-16 md:pt-24 pb-12 md:pb-16">
          <p className="text-[#2EFD7A] text-xs sm:text-sm font-semibold uppercase tracking-[0.28em] mb-4">
            Mind Over Money
          </p>
          <h1 className="font-heading text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight leading-tight max-w-3xl mb-8">
            About Baseline: Financial Confidence Built One Habit at a Time
          </h1>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16 text-white/75 text-base sm:text-lg leading-relaxed">
            <div className="space-y-5">
              <p>
                <strong className="text-white font-semibold">What Baseline Does:</strong>{" "}
                Baseline is a gamified personal finance education and forecasting platform that helps people understand how money works before costly mistakes happen. Instead of overwhelming spreadsheets or dry textbooks, Baseline guides learners along an interactive BasePath filled with concise lessons, quick quizzes, and practical Money Moves. Every learner starts with a personalized BaseScore™ on a zero-to-five-hundred scale spanning financial knowledge, income-to-debt ratio, emergency preparedness, risk awareness, and credit health, alongside an interactive financial calendar that projects future cash flow like a flight map for everyday money decisions.
              </p>
              <p>
                <strong className="text-white font-semibold">Who Baseline Is For:</strong>{" "}
                We designed Baseline first and foremost for teens, college students, and young adults navigating first paychecks, campus budgets, rent, credit cards, and savings goals. Baseline also supports parents and families who want shared guardrails, goal tracking, and encouraging accountability without lectures or micromanagement.
              </p>
            </div>

            <div className="space-y-5">
              <p>
                <strong className="text-white font-semibold">Who Builds Baseline:</strong>{" "}
                Baseline is built by a dedicated team of financial educators, product designers, and engineers united around a simple belief: financial literacy should be accessible, visual, and immediately actionable. After watching too many students graduate without ever learning how taxes, compound growth, or credit utilization work in real life, our team created Baseline to bridge the gap between learning a concept and making your next smart money move.
              </p>
              <div className="pt-2 flex flex-wrap items-center gap-4">
                <Link
                  to="/basescore-quiz"
                  className="inline-flex items-center gap-2 px-7 py-3.5 rounded-full bg-[#2EFD7A] text-black font-semibold text-sm hover:bg-[#2EFD7A]/90 transition-all"
                >
                  Check Your BaseScore™
                  <ArrowRight className="w-4 h-4" />
                </Link>
                <Link
                  to="/contact"
                  className="inline-flex items-center gap-2 px-7 py-3.5 rounded-full border border-white/20 text-white font-semibold text-sm hover:border-white/50 transition-colors"
                >
                  Get in Touch
                </Link>
              </div>
            </div>
          </div>
        </section>

        <WhoWeAreSection ctaLabel="Take the BaseScore™ Quiz" ctaTo="/basescore-quiz" />

        <section className="w-full max-w-[1600px] mx-auto px-5 sm:px-8 md:px-[clamp(32px,6vw,140px)] py-14 md:py-20">
          <h2 className="font-heading text-2xl sm:text-3xl font-bold text-white mb-8">
            How Baseline Helps You Grow
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {PILLARS.map(({ Icon, title, body }) => (
              <div
                key={title}
                className="rounded-3xl border border-white/10 bg-white/[0.03] p-6 sm:p-8"
              >
                <div className="w-11 h-11 rounded-2xl bg-[#2EFD7A]/15 border border-[#2EFD7A]/30 flex items-center justify-center mb-5">
                  <Icon className="w-5 h-5 text-[#2EFD7A]" />
                </div>
                <h3 className="font-heading text-xl font-bold text-white mb-2.5">
                  {title}
                </h3>
                <p className="text-white/70 text-sm sm:text-base leading-relaxed">
                  {body}
                </p>
              </div>
            ))}
          </div>
        </section>
      </main>

      <PublicFooter />
    </div>
  );
}