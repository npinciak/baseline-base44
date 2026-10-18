import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { Flame } from 'lucide-react';

/** Flame icon that grows slightly with a longer streak and wiggles when it increments. */
export default function StreakFlame({ streak = 0, size = 'w-5 h-5' }) {
  const prevRef = useRef(streak);
  const [bump, setBump] = useState(false);

  useEffect(() => {
    if (streak > prevRef.current) {
      setBump(true);
      const t = setTimeout(() => setBump(false), 700);
      prevRef.current = streak;
      return () => clearTimeout(t);
    }
    prevRef.current = streak;
  }, [streak]);

  const restScale = 1 + Math.min(streak, 30) / 100;

  return (
    <motion.div
      animate={bump ? { rotate: [0, -12, 10, -6, 0], scale: [restScale, restScale * 1.3, restScale * 1.1, restScale * 1.2, restScale] } : { scale: restScale }}
      transition={bump ? { duration: 0.6 } : { type: 'spring', stiffness: 300, damping: 15 }}
    >
      <Flame
        className={`${size} text-[#2BF9E9]`}
        style={{ filter: bump ? 'drop-shadow(0 0 6px rgba(245,158,11,0.8))' : 'none' }}
      />
    </motion.div>
  );
}