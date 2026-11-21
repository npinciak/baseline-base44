import { motion } from 'framer-motion';
import { CheckCircle, Lock } from 'lucide-react';

const W = 300, LEFT_X = 72, RIGHT_X = 228, NODE_R = 30, STEP = 130;
const nodeX = (i) => (i % 2 === 0 ? LEFT_X : RIGHT_X);
const nodeY = (i) => NODE_R + 16 + i * STEP;

function buildPath(count) {
  if (count < 2) return '';
  let d = `M ${nodeX(0)} ${nodeY(0)}`;
  for (let i = 1; i < count; i++) {
    const x0 = nodeX(i - 1), y0 = nodeY(i - 1), x1 = nodeX(i), y1 = nodeY(i);
    const swing = (x1 - x0) * 1.6;
    d += ` C ${x0 + swing * 0.5} ${y0 + STEP * 0.4}, ${x1 - swing * 0.5} ${y1 - STEP * 0.4}, ${x1} ${y1}`;
  }
  return d;
}

/** Winding S-curve of lesson nodes for one chapter. */
export default function ChapterPath({ units, meta, unlocked = true, isAdmin = false, onOpen }) {
  const svgH = nodeY(units.length - 1) + NODE_R + 72;
  return (
    <div className="relative mx-auto" style={{ width: W, height: svgH }}>
      <svg className="absolute inset-0 pointer-events-none" width={W} height={svgH} viewBox={`0 0 ${W} ${svgH}`}>
        <path d={buildPath(units.length)} fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="4" strokeLinecap="round" strokeDasharray="10 8" />
      </svg>
      {units.map((u, i) => {
        const progressionOpen = unlocked && (i === 0 || units[i - 1].completed);
        const open = isAdmin || progressionOpen;
        const nextUp = progressionOpen && !u.completed;
        const Icon = u.completed ? CheckCircle : open ? meta.Icon : Lock;
        const bg = open
          ? { background: `linear-gradient(135deg, ${meta.from}, ${meta.to})`, boxShadow: `0 8px 18px -4px ${meta.from}66, 0 3px 8px rgba(0,0,0,0.5)` }
          : { background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.1)' };
        return (
          <motion.div key={u.id} className="absolute flex flex-col items-center"
            style={{ left: nodeX(i) - NODE_R, top: nodeY(i) - NODE_R, width: NODE_R * 2 }}
            initial={{ opacity: 0, scale: 0.3, y: 18 }} animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ type: 'spring', stiffness: 300, damping: 16, delay: i * 0.07 }}>
            <motion.button onClick={() => open && onOpen(u.id)} disabled={!open}
              animate={nextUp ? { scale: [1, 1.06, 1] } : { scale: 1 }}
              transition={nextUp ? { duration: 3.2, repeat: Infinity, ease: 'easeInOut' } : { duration: 0.2 }}
              className={`relative rounded-full flex items-center justify-center ${open ? 'hover:scale-110 active:scale-95 cursor-pointer' : 'cursor-default'} ${nextUp ? 'ring-4 ring-offset-2 ring-offset-black ring-[#2EA0FD]/40' : ''}`}
              style={{ width: NODE_R * 2, height: NODE_R * 2, ...bg }}>
              <Icon className={`w-6 h-6 ${open ? 'text-black' : 'text-white/30'}`} />
            </motion.button>
            <div className="mt-2 text-center" style={{ width: 96, marginLeft: -(48 - NODE_R) }}>
              <p className={`font-medium leading-tight ${open ? 'text-white' : 'text-white/50'}`} style={{ fontSize: 11 }}>{u.title.replace(/^Checkpoint: /, '')}</p>
              <p className={`font-semibold ${open ? 'text-[#2EFD7A]' : 'text-[#2EFD7A]/55'}`} style={{ fontSize: 10 }}>+{u.xp_reward} BC</p>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}