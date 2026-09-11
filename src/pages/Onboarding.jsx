import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { base44 } from '@/api/base44Client';
import { ArrowRight, ArrowLeft, PiggyBank, Unlock, TrendingUp, Award, BookOpen, Sprout, GraduationCap, BarChart2 } from 'lucide-react';
import BaselineWordmark from '@/components/BaselineWordmark';

const GOALS = [
  { value: 'save_money', label: 'Save More Money', icon: PiggyBank },
  { value: 'get_out_of_debt', label: 'Get Out of Debt', icon: Unlock },
  { value: 'invest', label: 'Start Investing', icon: TrendingUp },
  { value: 'build_credit', label: 'Build My Credit', icon: Award },
  { value: 'understand_basics', label: 'Understand the Basics', icon: BookOpen },
];

const LEVELS = [
  { value: 'complete_beginner', label: 'Complete Beginner', desc: 'Money is confusing to me', icon: Sprout },
  { value: 'some_knowledge', label: 'Some Knowledge', desc: 'I know the basics but want more', icon: GraduationCap },
  { value: 'intermediate', label: 'Intermediate', desc: 'I manage money but want to optimize', icon: BarChart2 },
];

const STEP_LABELS = ["Your Goal", "Experience Level"];

export default function Onboarding() {
  const [step, setStep] = useState(0);
  const [direction, setDirection] = useState(1);
  const [goal, setGoal] = useState('');
  const [level, setLevel] = useState('');
  const [saving, setSaving] = useState(false);
  const navigate = useNavigate();

  const handleFinish = async () => {
    setSaving(true);
    const user = await base44.auth.me();
    const existing = await base44.entities.UserStats.filter({ user_id: user.id });
    if (existing.length > 0) {
      await base44.entities.UserStats.update(existing[0].id, {
        financial_goal: goal,
        experience_level: level,
        onboarding_completed: true,
      });
    } else {
      await base44.entities.UserStats.create({
        user_id: user.id,
        financial_goal: goal,
        experience_level: level,
        total_xp: 0,
        current_level: 1,
        current_streak: 0,
        longest_streak: 0,
        onboarding_completed: true,
      });
    }
    navigate('/dashboard');
  };

  const goNext = () => {
    setDirection(1);
    setStep(1);
  };

  const goPrev = () => {
    if (step > 0) {
      setDirection(-1);
      setStep(0);
    } else {
      navigate('/');
    }
  };

  return (
    <div className="h-screen overflow-hidden flex font-body" style={{ background: "hsl(222,47%,6%)" }}>
      {/* Left panel — branding */}
      <div className="hidden lg:flex flex-col justify-between w-[340px] xl:w-[400px] shrink-0 px-14 pt-16 pb-10 border-r border-white/5">
        <BaselineWordmark scale={0.38} />

        <div className="space-y-4">
          {STEP_LABELS.map((label, i) => {
            const isActive = i === step;
            const isDone = i < step;
            return (
              <div key={label} className="flex items-center gap-3">
                <div
                  className={`w-1.5 h-1.5 rounded-full transition-all duration-300 ${
                    isDone || isActive ? "bg-[#2EFD7A]" : "bg-white/15"
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
          Getting Started
        </p>
      </div>

      {/* Right panel — steps */}
      <div className="flex-1 h-full overflow-hidden flex flex-col justify-center items-center px-6 md:px-8 py-4 md:py-8">
        {/* Mobile wordmark */}
        <div className="lg:hidden mb-8 md:mb-10 shrink-0">
          <BaselineWordmark scale={0.24} />
        </div>

        <div className="w-full max-w-[520px]">
          {/* Step counter + progress bar */}
          <div className="mb-5 md:mb-8">
            <div className="flex items-center justify-between mb-3">
              <span className="text-white/30 text-xs font-light tracking-widest uppercase">{STEP_LABELS[step]}</span>
              <span className="text-white/20 text-xs font-light">{step + 1} / {STEP_LABELS.length}</span>
            </div>
            <div className="h-[1px] bg-white/10 rounded-full">
              <motion.div
                className="h-full bg-[#2EFD7A] rounded-full"
                animate={{ width: `${((step + 1) / STEP_LABELS.length) * 100}%` }}
                transition={{ duration: 0.4, ease: "easeOut" }}
              />
            </div>
          </div>

          <AnimatePresence mode="wait" custom={direction}>
            {step === 0 && (
              <motion.div
                key="goal"
                custom={direction}
                initial={{ opacity: 0, y: direction > 0 ? 24 : -24 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: direction > 0 ? -24 : 24 }}
                transition={{ duration: 0.3, ease: "easeOut" }}
              >
                <h2 className="text-white text-lg md:text-xl lg:text-2xl font-normal leading-snug mb-5 md:mb-7 tracking-tight">
                  What's your main financial goal?
                </h2>

                <div className="space-y-2 md:space-y-2.5 mb-6 md:mb-8">
                  {GOALS.map((g) => {
                    const isSelected = goal === g.value;
                    return (
                      <button
                        key={g.value}
                        onClick={() => setGoal(g.value)}
                        className={`group w-full flex items-center gap-4 px-4 md:px-5 py-2.5 md:py-3 rounded-xl border text-left text-sm font-normal tracking-wide transition-all duration-200 ${
                          isSelected
                            ? "border-[#2EFD7A]/60 text-white shadow-[0_0_20px_rgba(46,253,122,0.15)]"
                            : "border-white/8 bg-white/[0.03] text-white/70 hover:border-white/20 hover:text-white/90 hover:bg-white/[0.06]"
                        }`}
                        style={isSelected ? { background: "rgba(46,253,122,0.14)" } : {}}
                      >
                        <g.icon className={`w-4.5 h-4.5 shrink-0 ${isSelected ? "text-[#2EFD7A]" : "text-white/40"}`} />
                        <span>{g.label}</span>
                      </button>
                    );
                  })}
                </div>

                <div className="flex items-center justify-between">
                  <button
                    onClick={goPrev}
                    className="flex items-center gap-2 text-white/30 hover:text-white/60 text-sm font-light tracking-wide transition-all duration-200"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={goNext}
                    disabled={!goal}
                    className="flex items-center gap-2.5 px-8 py-3.5 rounded-full bg-[#2EFD7A] text-black text-sm font-semibold tracking-wide hover:bg-[#2EFD7A]/90 transition-all duration-200 disabled:opacity-25 disabled:cursor-not-allowed"
                  >
                    Next <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </motion.div>
            )}

            {step === 1 && (
              <motion.div
                key="level"
                custom={direction}
                initial={{ opacity: 0, y: direction > 0 ? 24 : -24 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: direction > 0 ? -24 : 24 }}
                transition={{ duration: 0.3, ease: "easeOut" }}
              >
                <h2 className="text-white text-lg md:text-xl lg:text-2xl font-normal leading-snug mb-5 md:mb-7 tracking-tight">
                  What's your experience level?
                </h2>

                <div className="space-y-2 md:space-y-2.5 mb-6 md:mb-8">
                  {LEVELS.map((l) => {
                    const isSelected = level === l.value;
                    return (
                      <button
                        key={l.value}
                        onClick={() => setLevel(l.value)}
                        className={`group w-full flex items-center gap-4 px-4 md:px-5 py-2.5 md:py-3 rounded-xl border text-left text-sm font-normal tracking-wide transition-all duration-200 ${
                          isSelected
                            ? "border-[#2EFD7A]/60 text-white shadow-[0_0_20px_rgba(46,253,122,0.15)]"
                            : "border-white/8 bg-white/[0.03] text-white/70 hover:border-white/20 hover:text-white/90 hover:bg-white/[0.06]"
                        }`}
                        style={isSelected ? { background: "rgba(46,253,122,0.14)" } : {}}
                      >
                        <l.icon className={`w-4.5 h-4.5 shrink-0 ${isSelected ? "text-[#2EFD7A]" : "text-white/40"}`} />
                        <div>
                          <p>{l.label}</p>
                          <p className={`text-xs font-light ${isSelected ? "text-white/60" : "text-white/30"}`}>{l.desc}</p>
                        </div>
                      </button>
                    );
                  })}
                </div>

                <div className="flex items-center justify-between">
                  <button
                    onClick={goPrev}
                    className="flex items-center gap-2 text-white/30 hover:text-white/60 text-sm font-light tracking-wide transition-all duration-200"
                  >
                    <ArrowLeft className="w-4 h-4" /> Previous
                  </button>
                  <button
                    onClick={handleFinish}
                    disabled={!level || saving}
                    className="flex items-center gap-2.5 px-8 py-3.5 rounded-full bg-[#2EFD7A] text-black text-sm font-semibold tracking-wide hover:bg-[#2EFD7A]/90 transition-all duration-200 disabled:opacity-25 disabled:cursor-not-allowed"
                  >
                    {saving ? "Setting up..." : "Start Learning"}
                    {!saving && <ArrowRight className="w-4 h-4" />}
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}