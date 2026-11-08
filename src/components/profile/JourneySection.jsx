import { Link } from 'react-router-dom';
import { GraduationCap, Gift, ArrowRight } from 'lucide-react';

const LEVEL_TITLES = ['Rookie', 'Learner', 'Saver', 'Investor', 'Planner', 'Strategist', 'Expert', 'Master', 'Guru', 'Legend'];

export default function JourneySection({ stats, goal, earnedBadges }) {
  const level = stats?.current_level || 1;
  const xpForLevel = (l) => l * 200;
  const levelXp = xpForLevel(level);
  const xpProgress = levelXp > 0 ? ((stats?.total_xp || 0) % levelXp) / levelXp * 100 : 0;
  const levelTitle = LEVEL_TITLES[Math.min(level - 1, LEVEL_TITLES.length - 1)];

  const nextMilestone = Math.ceil(((stats?.total_xp || 0) + 1) / 500) * 500;
  const xpToGo = nextMilestone - (stats?.total_xp || 0);

  const saved = goal?.current_amount || 0;
  const target = goal?.target_amount || 1;
  const pct = Math.min(100, Math.round((saved / target) * 100));

  return (
    <div className="bg-white/[0.03] border border-white/10 backdrop-blur-sm rounded-3xl p-6 md:p-8">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-white/60 text-xs font-light tracking-widest uppercase">For Kids · My Journey 🚀</h3>
        <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-[#2EFD7A]/15 text-[#2EFD7A] border border-[#2EFD7A]/30">🪙 {stats?.total_xp || 0} BC</span>
      </div>

      {/* Level tracker */}
      <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-4 mb-4">
        <div className="flex justify-between text-xs mb-1.5">
          <span className="text-white/60">Level {level} — Finance {levelTitle}</span>
          <span className="text-[#2EFD7A] font-bold">{Math.round(xpProgress)}%</span>
        </div>
        <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
          <div className="h-full bg-[#2EFD7A] rounded-full transition-all duration-700" style={{ width: `${xpProgress}%` }} />
        </div>
      </div>

      {/* Active goal */}
      {goal && (
        <div className="bg-[#2EFD7A]/10 border border-[#2EFD7A]/30 rounded-2xl p-4 mb-4">
          <p className="text-white/40 text-[10px] uppercase tracking-widest mb-2">Active Goal</p>
          <div className="flex items-center gap-3 mb-2">
            <GraduationCap className="w-5 h-5 text-[#2EFD7A]" />
            <div className="flex-1">
              <p className="text-white text-sm font-bold">{goal.name}</p>
              <p className="text-white/40 text-xs">${saved.toLocaleString()} of ${target.toLocaleString()}</p>
            </div>
            <span className="text-[#2EFD7A] font-bold text-sm">{pct}%</span>
          </div>
          <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
            <div className="h-full bg-[#2EFD7A] rounded-full transition-all duration-700" style={{ width: `${pct}%` }} />
          </div>
        </div>
      )}

      {/* Badges earned */}
      <p className="text-white/40 text-[10px] uppercase tracking-widest mb-2">Badges Earned</p>
      <div className="flex gap-2 mb-4">
        {earnedBadges.length === 0 ? (
          <p className="text-white/40 text-xs py-2">Complete lessons to earn your first badge!</p>
        ) : (
          earnedBadges.slice(0, 3).map(b => (
            <div key={b.id} className="flex flex-col items-center bg-white/[0.03] border border-white/10 rounded-xl p-2.5 flex-1">
              <span className="text-lg mb-1">{b.icon || '🏅'}</span>
              <span className="text-[9px] text-white/60 text-center leading-tight">{b.name}</span>
            </div>
          ))
        )}
      </div>

      {/* Next reward */}
      <div className="bg-[#2EFD7A]/10 border border-[#2EFD7A]/30 rounded-2xl p-3 flex items-center gap-3 mb-5">
        <Gift className="w-5 h-5 text-[#2EFD7A] shrink-0" />
        <div>
          <p className="text-[#2EFD7A] text-xs font-bold">Next Reward at {nextMilestone} BC!</p>
          <p className="text-white/40 text-xs">{xpToGo} BC to go — keep learning</p>
        </div>
      </div>

      <Link
        to="/dashboard"
        className="w-full flex items-center justify-center gap-2 py-3 rounded-full bg-[#2EFD7A] text-black text-sm font-semibold hover:bg-[#2EFD7A]/90 transition-all"
      >
        Continue Learning <ArrowRight className="w-4 h-4" />
      </Link>
    </div>
  );
}