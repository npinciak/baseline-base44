import { CheckCircle, Target } from 'lucide-react';

export default function GoalCard({ goal, onClick }) {
  const saved = goal.current_amount || 0;
  const pct = Math.min(100, Math.round((saved / goal.target_amount) * 100));

  return (
    <div
      onClick={onClick}
      className="bg-white/[0.03] border border-white/10 backdrop-blur-sm rounded-2xl overflow-hidden cursor-pointer hover:border-[#2EFD7A]/40 transition-colors"
    >
      {goal.image ? (
        <div className="h-36 overflow-hidden">
          <img src={goal.image} alt={goal.name} className="w-full h-full object-cover" />
        </div>
      ) : (
        <div className="h-36 bg-white/[0.03] flex items-center justify-center">
          <Target className="w-10 h-10 text-white/15" />
        </div>
      )}
      <div className="p-5">
        <div className="flex items-center justify-between mb-1">
          <h3 className="text-base text-white tracking-wide">{goal.name}</h3>
          {saved >= goal.target_amount && <CheckCircle className="w-5 h-5 text-[#2EFD7A]" />}
        </div>
        <div className="flex items-end justify-between mb-3">
          <div>
            <p className="text-2xl font-light text-[#2EFD7A]">${saved.toLocaleString()}</p>
            <p className="text-xs text-white/30">of ${goal.target_amount.toLocaleString()}</p>
          </div>
          <span className="text-sm font-semibold text-white/70">{pct}%</span>
        </div>
        <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-500 ${goal.is_completed ? 'xp-shimmer' : 'bg-[#2EFD7A]'}`}
            style={{ width: `${pct}%` }}
          />
        </div>
      </div>
    </div>
  );
}