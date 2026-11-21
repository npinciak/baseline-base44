import { motion } from 'framer-motion';

export default function GoalTimeline({ percent }) {
  return (
    <div className="h-3 w-full rounded-full bg-white/10 overflow-hidden">
      <motion.div
        initial={{ width: 0 }}
        animate={{ width: `${percent}%` }}
        transition={{ duration: 1.1, ease: [0.22, 1, 0.36, 1] }}
        className="h-full rounded-full bg-gradient-to-r from-[#065F46] via-[#10B981] to-[#2EFD7A] shadow-[0_0_14px_rgba(46,253,122,0.5)]"
      />
    </div>
  );
}