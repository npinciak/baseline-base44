export default function GoalsSummaryWidget({ goals }) {
  return (
    <div className="bg-white/[0.03] border border-white/10 backdrop-blur-sm rounded-2xl p-5">
      <h3 className="text-white/30 text-xs font-light tracking-widest uppercase mb-4">Goals Summary</h3>
      <div className="space-y-3">
        {goals.slice(0, 4).map(goal => {
          const saved = goal.current_amount || 0;
          const pct = Math.min(100, Math.round((saved / goal.target_amount) * 100));
          return (
            <div key={goal.id}>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-white/70 truncate max-w-[140px]">{goal.name}</span>
                <span className="text-white/30">{pct}%</span>
              </div>
              <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${goal.is_completed ? 'bg-[#2EFD7A]' : 'bg-[#2EFD7A]/60'}`}
                  style={{ width: `${pct}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}