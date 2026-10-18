import { motion } from 'framer-motion';
import RingGauge from './RingGauge';
import StreakFlame from './StreakFlame';
import BaseScoreGlance from './BaseScoreGlance';
import useCountUp from '@/hooks/useCountUp';

export default function StatsBar({ stats }) {
  const xpForLevel = (level) => level * 200;
  const levelXp = xpForLevel(stats.current_level);
  const xpProgress = levelXp > 0 ? ((stats.total_xp % levelXp) / levelXp) * 100 : 0;
  const animatedXp = useCountUp(stats.total_xp, 1200);

  return (
    <motion.div
      whileHover={{ y: -2 }}
      className="flex items-center flex-wrap gap-5 bg-white/[0.02] border border-white/10 rounded-2xl px-5 py-3 mb-8 opacity-90"
    >
      <RingGauge pct={xpProgress} size={44} strokeWidth={4} color="#2EFD7A" accentColor="#2EA0FD">
        <span className="text-sm font-bold text-white">{stats.current_level}</span>
      </RingGauge>
      <div>
        <p className="text-white/60 text-[10px] tracking-widest uppercase mb-0.5">Level Progress</p>
        <p className="text-white text-lg font-light">{animatedXp.toLocaleString()} <span className="text-white/60 text-xs">BC</span></p>
      </div>
      <div className="w-px h-8 bg-white/10" />
      <div className="flex items-center gap-2.5">
        <StreakFlame streak={stats.current_streak} size="w-6 h-6" />
        <div>
          <p className="text-white text-lg font-light">{stats.current_streak}</p>
          <p className="text-white/60 text-[10px] tracking-widest uppercase">Day Streak</p>
        </div>
      </div>
      <div className="w-px h-8 bg-white/10" />
      <BaseScoreGlance score={stats.base_score} />
    </motion.div>
  );
}