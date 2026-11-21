import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { Coins } from 'lucide-react';
import useCountUp from '@/hooks/useCountUp';

const TRAIL = 'M40 238 C 150 238, 170 205, 260 198 S 390 168, 430 140 S 520 92, 560 56';

export default function MountainHero({ balance, camps }) {
  const pathRef = useRef(null);
  const [pts, setPts] = useState(null);
  const top = camps[camps.length - 1] || 1;
  const progress = Math.min(balance / top, 1);
  const animated = useCountUp(balance, 1200);
  const nextIdx = camps.findIndex(c => c > balance);

  useEffect(() => {
    const p = pathRef.current;
    if (!p) return;
    const len = p.getTotalLength();
    const at = (f) => p.getPointAtLength(len * f);
    setPts({ me: at(progress), camps: camps.map(c => { const pt = at(c / top); return { cost: c, x: pt.x, y: pt.y }; }) });
  }, [progress, camps, top]);

  return (
    <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-b from-[#071a33] via-[#050d1c] to-black shadow-[0_0_60px_-15px_rgba(46,160,253,0.35)]">
      <div className="relative z-10 p-6 sm:p-8 flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-[11px] uppercase tracking-[0.25em] text-[#2EA0FD] font-semibold mb-2">Your climb</p>
          <h1 className="text-3xl sm:text-4xl font-display font-extrabold text-white mb-1">Basecamp</h1>
          <p className="text-white/60 text-sm max-w-sm">
            {nextIdx === -1
              ? "You've reached the summit. Every reward is unlocked."
              : `${(camps[nextIdx] - balance).toLocaleString()} Base Coins to your next checkpoint.`}
          </p>
        </div>
        <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-black/40 backdrop-blur px-4 py-3">
          <motion.div animate={{ rotateY: [0, 360] }} transition={{ duration: 4, repeat: Infinity, ease: 'linear' }} className="w-10 h-10 rounded-full bg-gradient-to-br from-[#2BF9E9] to-[#2EA0FD] flex items-center justify-center shadow-[0_0_20px_rgba(46,160,253,0.6)]">
            <Coins className="w-5 h-5 text-black" />
          </motion.div>
          <div>
            <p className="text-[10px] uppercase tracking-widest text-white/50">Base Coins</p>
            <p className="text-2xl font-display font-extrabold text-white">{animated.toLocaleString()}</p>
          </div>
        </div>
      </div>

      <svg viewBox="0 0 800 270" className="relative z-0 w-full" role="img" aria-label="Mountain climbing progress">
        <defs>
          <linearGradient id="mtBack" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#12335f" /><stop offset="100%" stopColor="#050d1c" /></linearGradient>
          <linearGradient id="mtFront" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#1b4f8f" /><stop offset="100%" stopColor="#060f20" /></linearGradient>
          <linearGradient id="trail" x1="0" y1="0" x2="1" y2="0"><stop offset="0%" stopColor="#2EA0FD" /><stop offset="100%" stopColor="#2BF9E9" /></linearGradient>
        </defs>
        {[...Array(14)].map((_, i) => (
          <motion.circle key={i} cx={30 + ((i * 59) % 740)} cy={14 + ((i * 31) % 90)} r={i % 3 === 0 ? 1.6 : 1} fill="#fff" animate={{ opacity: [0.2, 0.9, 0.2] }} transition={{ duration: 2 + (i % 4), repeat: Infinity, delay: i * 0.3 }} />
        ))}
        <polygon points="0,270 90,150 200,200 330,130 460,190 600,90 720,170 800,130 800,270" fill="url(#mtBack)" opacity="0.8" />
        <polygon points="0,270 120,175 230,218 380,115 545,38 680,150 800,105 800,270" fill="url(#mtFront)" />
        <polygon points="545,38 520,62 536,58 548,70 560,58 575,64" fill="#e8f4ff" opacity="0.9" />
        <path ref={pathRef} d={TRAIL} fill="none" stroke="rgba(255,255,255,0.25)" strokeWidth="3" strokeDasharray="2 8" strokeLinecap="round" />
        <motion.path d={TRAIL} fill="none" stroke="url(#trail)" strokeWidth="4" strokeLinecap="round" initial={{ pathLength: 0 }} animate={{ pathLength: progress }} transition={{ duration: 1.4, ease: 'easeOut' }} style={{ filter: 'drop-shadow(0 0 6px rgba(43,249,233,0.8))' }} />
        {pts?.camps.map((c) => (
          <g key={c.cost} transform={`translate(${c.x},${c.y})`}>
            <circle r="7" fill={balance >= c.cost ? '#2BF9E9' : '#0b1b33'} stroke="#fff" strokeWidth="2" />
            <line x1="0" y1="-7" x2="0" y2="-33" stroke="#fff" strokeWidth="2" />
            <polygon points="0,-33 18,-27 0,-21" fill="#2EFD7A" />
            <text y="24" textAnchor="middle" fill="rgba(255,255,255,0.55)" fontSize="10">{c.cost.toLocaleString()} BC</text>
          </g>
        ))}
        {pts && (
          <motion.g initial={{ x: 40, y: 238 }} animate={{ x: pts.me.x, y: pts.me.y }} transition={{ type: 'spring', stiffness: 40, damping: 14, delay: 0.3 }}>
            <motion.circle r="16" fill="#2EA0FD" opacity="0.3" animate={{ r: [10, 20, 10], opacity: [0.5, 0, 0.5] }} transition={{ duration: 2, repeat: Infinity }} />
            <circle r="8" fill="#fff" stroke="#2EA0FD" strokeWidth="3" />
          </motion.g>
        )}
      </svg>
    </div>
  );
}