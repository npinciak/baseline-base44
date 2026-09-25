import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import confetti from 'canvas-confetti';
import { CheckCircle, Target } from 'lucide-react';
import TiltCard from './TiltCard';

export default function GoalCard({ goal, onClick }) {
  const saved = goal.current_amount || 0;
  const pct = Math.min(100, Math.round((saved / goal.target_amount) * 100));
  const isComplete = saved >= goal.target_amount;
  const cardRef = useRef(null);
  const [celebrate, setCelebrate] = useState(false);

  useEffect(() => {
    if (!isComplete) return;
    const key = `goal_celebrated_${goal.id}`;
    if (sessionStorage.getItem(key)) return;
    sessionStorage.setItem(key, '1');
    setCelebrate(true);
    const rect = cardRef.current?.getBoundingClientRect();
    confetti({
      particleCount: 80,
      spread: 70,
      startVelocity: 30,
      origin: rect
        ? { x: (rect.left + rect.width / 2) / window.innerWidth, y: (rect.top + rect.height / 2) / window.innerHeight }
        : { y: 0.6 },
      colors: ['#2EFD7A', '#17C964', '#2EA0FD', '#ffffff'],
    });
    const t = setTimeout(() => setCelebrate(false), 900);
    return () => clearTimeout(t);
  }, [isComplete, goal.id]);

  return (
    <TiltCard className="rounded-2xl">
      <motion.div
        ref={cardRef}
        onClick={onClick}
        animate={celebrate ? { scale: [1, 1.04, 0.99, 1.02, 1] } : { scale: 1 }}
        transition={{ duration: 0.7, ease: 'easeOut' }}
        className={`bg-white/[0.03] border backdrop-blur-sm rounded-2xl overflow-hidden cursor-pointer transition-colors ${
          isComplete ? 'border-[#2EFD7A]/50 shadow-[0_0_24px_rgba(46,253,122,0.15)]' : 'border-white/10 hover:border-[#2EA0FD]/40 hover:shadow-[0_10px_30px_-8px_rgba(46,160,253,0.25)]'
        }`}
      >
        {goal.image ? (
          <div className="h-36 overflow-hidden">
            <img src={goal.image} alt={goal.name} className="w-full h-full object-cover" />
          </div>
        ) : (
          <div className="h-36 bg-white/[0.03] flex items-center justify-center">
            <Target className="w-10 h-10 text-white/20" />
          </div>
        )}
        <div className="p-5">
          <div className="flex items-center justify-between mb-1">
            <h3 className="text-base text-white tracking-wide">{goal.name}</h3>
            {isComplete && <CheckCircle className="w-5 h-5 text-[#2EFD7A]" />}
          </div>
          <div className="flex items-end justify-between mb-3">
            <div>
              <p className="text-2xl font-light text-[#2EFD7A]">${saved.toLocaleString()}</p>
              <p className="text-xs text-white/60">of ${goal.target_amount.toLocaleString()}</p>
            </div>
            <span className="text-sm font-semibold text-white/80">{pct}%</span>
          </div>
          <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
            <motion.div
              className={`h-full rounded-full ${goal.is_completed ? 'xp-shimmer' : 'bg-gradient-to-r from-[#2EFD7A] to-[#2EA0FD]'}`}
              initial={{ width: 0 }}
              animate={{ width: `${pct}%` }}
              transition={{ duration: 0.8, ease: 'easeOut' }}
            />
          </div>
        </div>
      </motion.div>
    </TiltCard>
  );
}