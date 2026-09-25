import { motion } from 'framer-motion';
import RingGauge from './RingGauge';

const listVariants = { hidden: {}, show: { transition: { staggerChildren: 0.08 } } };
const rowVariants = {
  hidden: { opacity: 0, x: -12 },
  show: { opacity: 1, x: 0, transition: { type: 'spring', stiffness: 260, damping: 22 } },
};

export default function GoalsSummaryWidget({ goals }) {
  return (
    <div className="bg-white/[0.03] border border-white/10 backdrop-blur-sm rounded-2xl p-5">
      <h3 className="text-white/30 text-xs font-light tracking-widest uppercase mb-4">Goals Summary</h3>
      <motion.div variants={listVariants} initial="hidden" animate="show" className="space-y-4">
        {goals.slice(0, 4).map(goal => {
          const saved = goal.current_amount || 0;
          const pct = Math.min(100, Math.round((saved / goal.target_amount) * 100));
          return (
            <motion.div key={goal.id} variants={rowVariants} className="flex items-center gap-3">
              <RingGauge pct={pct} size={38} strokeWidth={4} color={goal.is_completed ? '#2EFD7A' : '#2EFD7Ab3'}>
                <span className="text-[9px] font-bold text-white">{pct}%</span>
              </RingGauge>
              <span className="text-xs text-white/70 truncate flex-1">{goal.name}</span>
            </motion.div>
          );
        })}
      </motion.div>
    </div>
  );
}