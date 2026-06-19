import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { Zap, ArrowRight, ArrowLeft } from 'lucide-react';

const GOALS = [
  { value: 'save_money', label: 'Save More Money', emoji: '💰' },
  { value: 'get_out_of_debt', label: 'Get Out of Debt', emoji: '🔓' },
  { value: 'invest', label: 'Start Investing', emoji: '📈' },
  { value: 'build_credit', label: 'Build My Credit', emoji: '🏆' },
  { value: 'understand_basics', label: 'Understand the Basics', emoji: '📚' },
];

const LEVELS = [
  { value: 'complete_beginner', label: 'Complete Beginner', desc: 'Money is confusing to me', emoji: '🌱' },
  { value: 'some_knowledge', label: 'Some Knowledge', desc: 'I know the basics but want more', emoji: '🌿' },
  { value: 'intermediate', label: 'Intermediate', desc: 'I manage money but want to optimize', emoji: '🌳' },
];

export default function Onboarding() {
  const [step, setStep] = useState(0);
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
    navigate('/learn');
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6">
      <div className="w-full max-w-lg">
        {/* Header */}
        <div className="text-center mb-10">
          <div className="w-14 h-14 rounded-2xl bg-primary/15 flex items-center justify-center mx-auto mb-4">
            <Zap className="w-8 h-8 text-primary" />
          </div>
          <h1 className="text-3xl font-display font-extrabold mb-2">Welcome to FinPath</h1>
          <p className="text-muted-foreground">Let's personalize your learning journey</p>
        </div>

        {/* Progress */}
        <div className="flex gap-2 mb-8">
          {[0, 1].map((i) => (
            <div
              key={i}
              className={`h-1.5 flex-1 rounded-full transition-all duration-300 ${i <= step ? 'bg-primary' : 'bg-secondary'}`}
            />
          ))}
        </div>

        {step === 0 && (
          <div>
            <h2 className="text-xl font-heading font-bold mb-2">What's your main financial goal?</h2>
            <p className="text-muted-foreground text-sm mb-6">We'll customize your learning path based on this.</p>
            <div className="space-y-3">
              {GOALS.map((g) => (
                <button
                  key={g.value}
                  onClick={() => setGoal(g.value)}
                  className={`w-full flex items-center gap-4 p-4 rounded-2xl border text-left transition-all duration-200 ${
                    goal === g.value
                      ? 'border-primary bg-primary/10 text-foreground'
                      : 'border-border bg-card text-foreground hover:border-primary/40'
                  }`}
                >
                  <span className="text-2xl">{g.emoji}</span>
                  <span className="font-medium">{g.label}</span>
                </button>
              ))}
            </div>
            <button
              onClick={() => setStep(1)}
              disabled={!goal}
              className="w-full mt-6 py-4 bg-primary text-primary-foreground rounded-2xl font-bold text-lg disabled:opacity-40 hover:bg-primary/90 transition-all duration-200 flex items-center justify-center gap-2 group"
            >
              Continue <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        )}

        {step === 1 && (
          <div>
            <h2 className="text-xl font-heading font-bold mb-2">What's your experience level?</h2>
            <p className="text-muted-foreground text-sm mb-6">No wrong answer — this helps us start you in the right place.</p>
            <div className="space-y-3">
              {LEVELS.map((l) => (
                <button
                  key={l.value}
                  onClick={() => setLevel(l.value)}
                  className={`w-full flex items-center gap-4 p-4 rounded-2xl border text-left transition-all duration-200 ${
                    level === l.value
                      ? 'border-primary bg-primary/10 text-foreground'
                      : 'border-border bg-card text-foreground hover:border-primary/40'
                  }`}
                >
                  <span className="text-2xl">{l.emoji}</span>
                  <div>
                    <p className="font-medium">{l.label}</p>
                    <p className="text-xs text-muted-foreground">{l.desc}</p>
                  </div>
                </button>
              ))}
            </div>
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setStep(0)}
                className="px-6 py-4 bg-secondary text-foreground rounded-2xl font-semibold hover:bg-secondary/80 transition-all duration-200 flex items-center gap-2"
              >
                <ArrowLeft className="w-4 h-4" /> Back
              </button>
              <button
                onClick={handleFinish}
                disabled={!level || saving}
                className="flex-1 py-4 bg-primary text-primary-foreground rounded-2xl font-bold text-lg disabled:opacity-40 hover:bg-primary/90 transition-all duration-200 flex items-center justify-center gap-2 group"
              >
                {saving ? 'Setting up...' : 'Start Learning'}
                {!saving && <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}