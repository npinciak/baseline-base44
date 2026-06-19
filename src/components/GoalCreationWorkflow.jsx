import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { X, ChevronRight, Star, Plane, Home, Car, Sparkles, CalendarDays, Check } from 'lucide-react';
import { base44 } from '@/api/base44Client';

const GOAL_TYPES = [
  { value: 'vacation', label: 'Go on Vacation', icon: Plane, image: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&auto=format&fit=crop' },
  { value: 'buyHome', label: 'Buy a Home', icon: Home, image: 'https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=800&auto=format&fit=crop' },
  { value: 'newCar', label: 'Buy a new car', icon: Car, image: 'https://images.unsplash.com/photo-1494976388531-d1058494cdd8?w=800&auto=format&fit=crop' },
  { value: 'other', label: 'Something else', icon: Sparkles, image: 'https://images.unsplash.com/photo-1579621970563-ebec7560ff3e?w=800&auto=format&fit=crop' },
];

const STEPS = ['GoalType', 'BasePoints100', 'BasePoints150', 'Target', 'GoalName', 'GoalDate', 'Summary', 'LinkAccounts', 'Baseplan'];

function computeMonthlySavings(targetAmount, targetDate) {
  const now = new Date();
  const end = new Date(targetDate);
  const months = Math.max(1, (end.getFullYear() - now.getFullYear()) * 12 + (end.getMonth() - now.getMonth()));
  return (targetAmount / months).toFixed(2);
}

export default function GoalCreationWorkflow({ user, onClose, onCreated }) {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [goalType, setGoalType] = useState('vacation');
  const [targetAmount, setTargetAmount] = useState('');
  const [goalName, setGoalName] = useState('');
  const [targetDate, setTargetDate] = useState('');
  const [pendingPoints, setPendingPoints] = useState(0);
  const [saving, setSaving] = useState(false);

  const currentStep = STEPS[step];
  const today = new Date().toISOString().slice(0, 10);

  const monthlySavings = targetAmount && targetDate ? computeMonthlySavings(parseFloat(targetAmount), targetDate) : '0.00';

  const advance = () => setStep(s => s + 1);

  const handleSubmit = async () => {
    setSaving(true);
    const selectedType = GOAL_TYPES.find(t => t.value === goalType);
    await base44.entities.SavingsGoal.create({
      user_id: user.id,
      name: goalName.trim(),
      goal_type: goalType,
      target_amount: parseFloat(targetAmount),
      saved_amount: 0,
      currency: 'USD',
      target_date: targetDate,
      source: 'workflow',
      pending_points: pendingPoints,
      image_url: selectedType?.image || null,
      is_completed: false,
    });
    setSaving(false);
    onCreated();
    navigate('/goals');
  };

  const ProgressBar = () => (
    <div className="flex gap-1 mb-6">
      {STEPS.map((_, i) => (
        <div key={i} className={`h-1 flex-1 rounded-full transition-all duration-300 ${i <= step ? 'bg-primary' : 'bg-secondary'}`} />
      ))}
    </div>
  );

  return (
    <div className="fixed inset-0 bg-background/90 backdrop-blur-sm flex items-end md:items-center justify-center z-50 p-4">
      <div className="bg-card border border-border rounded-3xl w-full max-w-md max-h-[92vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs text-muted-foreground font-medium uppercase tracking-wider">
              {step + 1} / {STEPS.length}
            </span>
            <button onClick={onClose} className="text-muted-foreground hover:text-foreground transition-colors">
              <X className="w-5 h-5" />
            </button>
          </div>

          <ProgressBar />

          {/* GoalType */}
          {currentStep === 'GoalType' && (
            <div>
              <h2 className="text-2xl font-display font-extrabold mb-1">Let's Start with your Goal</h2>
              <p className="text-muted-foreground text-sm mb-6">What are you saving for?</p>
              <div className="space-y-3 mb-6">
                {GOAL_TYPES.map(({ value, label, icon: Icon }) => (
                  <button
                    key={value}
                    onClick={() => setGoalType(value)}
                    className={`w-full flex items-center gap-4 p-4 rounded-2xl border text-left transition-all duration-200 ${
                      goalType === value
                        ? 'border-primary bg-primary/10 text-foreground'
                        : 'border-border bg-secondary/40 text-foreground hover:border-primary/40'
                    }`}
                  >
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${goalType === value ? 'bg-primary/20' : 'bg-secondary'}`}>
                      <Icon className={`w-5 h-5 ${goalType === value ? 'text-primary' : 'text-muted-foreground'}`} />
                    </div>
                    <span className="font-medium">{label}</span>
                    {goalType === value && <Check className="w-4 h-4 text-primary ml-auto" />}
                  </button>
                ))}
              </div>
              <button
                onClick={() => { advance(); }}
                className="w-full py-4 bg-primary text-primary-foreground rounded-2xl font-bold text-base hover:bg-primary/90 transition-all flex items-center justify-center gap-2"
              >
                Next <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          )}

          {/* BasePoints100 */}
          {currentStep === 'BasePoints100' && (
            <div className="text-center">
              <div className="w-20 h-20 rounded-full bg-primary/15 flex items-center justify-center mx-auto mb-6">
                <Star className="w-10 h-10 text-primary" />
              </div>
              <h2 className="text-2xl font-display font-extrabold mb-2">You earned 100 BasePoints!</h2>
              <p className="text-muted-foreground text-sm mb-2">Just for starting your savings journey.</p>
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/15 rounded-full mb-8">
                <Star className="w-4 h-4 text-primary" />
                <span className="text-primary font-bold">+100 BasePoints</span>
              </div>
              <button
                onClick={() => { setPendingPoints(p => p + 100); advance(); }}
                className="w-full py-4 bg-primary text-primary-foreground rounded-2xl font-bold text-base hover:bg-primary/90 transition-all flex items-center justify-center gap-2"
              >
                Next <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          )}

          {/* BasePoints150 */}
          {currentStep === 'BasePoints150' && (
            <div className="text-center">
              <div className="w-20 h-20 rounded-full bg-accent/15 flex items-center justify-center mx-auto mb-6">
                <Star className="w-10 h-10 text-accent" />
              </div>
              <h2 className="text-2xl font-display font-extrabold mb-2">Bonus! 150 More BasePoints!</h2>
              <p className="text-muted-foreground text-sm mb-2">You're on a roll — keep going!</p>
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-accent/15 rounded-full mb-8">
                <Star className="w-4 h-4 text-accent" />
                <span className="text-accent font-bold">+150 BasePoints</span>
              </div>
              <button
                onClick={() => { setPendingPoints(p => p + 150); advance(); }}
                className="w-full py-4 bg-primary text-primary-foreground rounded-2xl font-bold text-base hover:bg-primary/90 transition-all flex items-center justify-center gap-2"
              >
                Next <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          )}

          {/* Target */}
          {currentStep === 'Target' && (
            <div>
              <h2 className="text-2xl font-display font-extrabold mb-1">Let's Set A Target</h2>
              <p className="text-muted-foreground text-sm mb-6">How much money do you need to reach your goal? A guess is OK too</p>
              <div className="flex gap-2 mb-6">
                <div className="relative">
                  <select disabled className="appearance-none bg-secondary border border-border rounded-xl px-4 py-4 text-sm font-semibold text-muted-foreground opacity-60 cursor-not-allowed pr-8">
                    <option>USD</option>
                  </select>
                </div>
                <input
                  type="number"
                  min="1"
                  value={targetAmount}
                  onChange={e => setTargetAmount(e.target.value)}
                  placeholder="0"
                  className="flex-1 bg-secondary border border-border rounded-xl px-4 py-4 text-2xl font-bold focus:outline-none focus:border-primary transition-colors"
                />
              </div>
              {targetAmount > 0 && (
                <div className="bg-primary/10 border border-primary/20 rounded-2xl px-4 py-3 mb-6 flex items-center gap-2">
                  <span className="text-sm text-primary font-medium">Goal amount: ${parseFloat(targetAmount).toLocaleString()}</span>
                </div>
              )}
              <button
                onClick={advance}
                disabled={!targetAmount || parseFloat(targetAmount) <= 0}
                className="w-full py-4 bg-primary text-primary-foreground rounded-2xl font-bold text-base hover:bg-primary/90 transition-all disabled:opacity-40 flex items-center justify-center gap-2"
              >
                Next <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          )}

          {/* GoalName */}
          {currentStep === 'GoalName' && (
            <div>
              <h2 className="text-2xl font-display font-extrabold mb-1">Let's Name Your Goal</h2>
              <p className="text-muted-foreground text-sm mb-6">Make it your own</p>
              <input
                value={goalName}
                onChange={e => setGoalName(e.target.value)}
                placeholder="e.g. New Laptop"
                autoFocus
                className="w-full bg-secondary border border-border rounded-2xl px-5 py-4 text-lg font-semibold focus:outline-none focus:border-primary transition-colors mb-6"
              />
              <button
                onClick={advance}
                disabled={!goalName.trim()}
                className="w-full py-4 bg-primary text-primary-foreground rounded-2xl font-bold text-base hover:bg-primary/90 transition-all disabled:opacity-40 flex items-center justify-center gap-2"
              >
                Next <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          )}

          {/* GoalDate */}
          {currentStep === 'GoalDate' && (
            <div>
              <h2 className="text-2xl font-display font-extrabold mb-1">Let's Pick A Goal Date</h2>
              <p className="text-muted-foreground text-sm mb-6">When would you like to reach your goal? Approximate is OK</p>
              <div className="relative mb-6">
                <CalendarDays className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground pointer-events-none" />
                <input
                  type="date"
                  min={today}
                  value={targetDate}
                  onChange={e => setTargetDate(e.target.value)}
                  className="w-full bg-secondary border border-border rounded-2xl pl-12 pr-5 py-4 text-base font-semibold focus:outline-none focus:border-primary transition-colors"
                />
              </div>
              <button
                onClick={advance}
                disabled={!targetDate || targetDate <= today}
                className="w-full py-4 bg-primary text-primary-foreground rounded-2xl font-bold text-base hover:bg-primary/90 transition-all disabled:opacity-40 flex items-center justify-center gap-2"
              >
                Next <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          )}

          {/* Summary */}
          {currentStep === 'Summary' && (
            <div>
              <h2 className="text-2xl font-display font-extrabold mb-1">To Reach Your Goal</h2>
              <p className="text-muted-foreground text-sm mb-8">You want to save</p>
              <div className="bg-primary/10 border border-primary/25 rounded-3xl p-6 text-center mb-8">
                <p className="text-5xl font-display font-extrabold text-primary mb-1">${monthlySavings}</p>
                <p className="text-muted-foreground font-medium">/ month</p>
                <p className="text-xs text-muted-foreground mt-3">towards <span className="text-foreground font-semibold">{goalName}</span></p>
              </div>
              <button
                onClick={advance}
                className="w-full py-4 bg-primary text-primary-foreground rounded-2xl font-bold text-base hover:bg-primary/90 transition-all flex items-center justify-center gap-2"
              >
                Next <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          )}

          {/* LinkAccounts */}
          {currentStep === 'LinkAccounts' && (
            <div>
              <h2 className="text-2xl font-display font-extrabold mb-1">Create or link an account</h2>
              <p className="text-muted-foreground text-sm mb-8">We recommend a dedicated account for your specific goal</p>
              <button
                onClick={advance}
                disabled
                className="w-full py-4 bg-secondary text-muted-foreground rounded-2xl font-semibold text-base mb-3 opacity-50 cursor-not-allowed"
              >
                Link existing account
              </button>
              <button
                onClick={advance}
                className="w-full py-4 bg-primary text-primary-foreground rounded-2xl font-bold text-base hover:bg-primary/90 transition-all flex items-center justify-center gap-2"
              >
                Next <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          )}

          {/* Baseplan */}
          {currentStep === 'Baseplan' && (
            <div>
              <h2 className="text-2xl font-display font-extrabold mb-1">Your BasePlan</h2>
              <p className="text-muted-foreground text-sm mb-6">Here's how you'll get there</p>

              <div className="bg-secondary rounded-2xl p-5 mb-6">
                <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold mb-1">Savings Target</p>
                <p className="text-2xl font-display font-extrabold text-primary">${monthlySavings} <span className="text-base font-normal text-muted-foreground">/ month</span></p>
              </div>

              <div className="bg-card border border-border rounded-2xl p-5 mb-6">
                <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold mb-4">Weekly Objectives</p>
                <div className="space-y-3">
                  {['Make Goal Contribution', 'Get Your Weekly Insight', 'Collect Rewards'].map(obj => (
                    <div key={obj} className="flex items-center gap-3">
                      <div className="w-6 h-6 rounded-full border-2 border-primary/40 flex items-center justify-center">
                        <div className="w-2 h-2 rounded-full bg-primary/40" />
                      </div>
                      <span className="text-sm font-medium">{obj}</span>
                    </div>
                  ))}
                </div>
              </div>

              {pendingPoints > 0 && (
                <div className="flex items-center gap-2 bg-primary/10 border border-primary/20 rounded-2xl px-4 py-3 mb-6">
                  <Star className="w-4 h-4 text-primary" />
                  <span className="text-sm text-primary font-semibold">{pendingPoints} BasePoints ready to claim!</span>
                </div>
              )}

              <button
                onClick={handleSubmit}
                disabled={saving}
                className="w-full py-4 bg-primary text-primary-foreground rounded-2xl font-bold text-lg hover:bg-primary/90 transition-all disabled:opacity-50"
              >
                {saving ? 'Creating...' : "Let's Go"}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}