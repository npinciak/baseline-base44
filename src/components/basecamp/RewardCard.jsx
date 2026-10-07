import { motion } from 'framer-motion';
import { Coins, Lock, Sparkles } from 'lucide-react';

const BRAND_COLORS = {
  Amazon: ['#FF9900', '#7a3e00'],
  Starbucks: ['#00A862', '#00432b'],
  Netflix: ['#E50914', '#4a0408'],
  Spotify: ['#1DB954', '#0b4020'],
  Target: ['#E4002B', '#500012'],
  DoorDash: ['#FF3008', '#541000'],
};

export default function RewardCard({ card, balance, onSelect }) {
  const affordable = balance >= card.coinsCost;
  const [from, to] = BRAND_COLORS[card.brand] || ['#2EA0FD', '#0a2a50'];
  const pct = Math.min(100, Math.round((balance / card.coinsCost) * 100));

  return (
    <motion.button
      variants={{ hidden: { opacity: 0, y: 24, scale: 0.94 }, show: { opacity: 1, y: 0, scale: 1, transition: { type: 'spring', stiffness: 260, damping: 20 } } }}
      whileHover={affordable ? { y: -8, rotate: -1.5, scale: 1.03 } : { y: -2 }}
      whileTap={affordable ? { scale: 0.97 } : {}}
      onClick={() => affordable && onSelect(card)}
      className={`group relative text-left rounded-3xl overflow-hidden border ${affordable ? 'border-white/25 cursor-pointer' : 'border-white/10 cursor-not-allowed'}`}
      style={{ boxShadow: affordable ? `0 18px 40px -16px ${from}` : 'none' }}
    >
      <div className="relative p-5 pb-6" style={{ background: `linear-gradient(135deg, ${from}${affordable ? '' : '55'}, ${to})` }}>
        <div className="flex items-start justify-between">
          <div className="h-11 w-28 rounded-xl bg-white flex items-center justify-center px-3 shadow-lg">
            <img src={card.logo} alt={card.brand} className="h-5 object-contain" />
          </div>
          {affordable ? (
            <motion.span animate={{ scale: [1, 1.08, 1] }} transition={{ duration: 1.8, repeat: Infinity }} className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider bg-white text-black rounded-full px-2.5 py-1">
              <Sparkles className="w-3 h-3" /> Ready
            </motion.span>
          ) : (
            <span className="w-8 h-8 rounded-full bg-black/40 flex items-center justify-center"><Lock className="w-4 h-4 text-white/80" /></span>
          )}
        </div>
        <p className="mt-6 text-5xl font-display font-extrabold text-white drop-shadow">${card.amount}</p>
        <p className="text-sm text-white/80">{card.brand} Gift Card</p>
        {affordable && (
          <motion.div className="absolute inset-y-0 w-1/3 bg-gradient-to-r from-transparent via-white/30 to-transparent -skew-x-12" initial={{ left: '-40%' }} animate={{ left: '140%' }} transition={{ duration: 2.4, repeat: Infinity, repeatDelay: 2.5, ease: 'easeInOut' }} />
        )}
      </div>
      <div className="relative bg-[#070d18] px-5 py-3">
        <div className="absolute -top-2 left-0 right-0 flex justify-between px-1 pointer-events-none">
          <span className="w-4 h-4 rounded-full bg-black -ml-3" /><span className="w-4 h-4 rounded-full bg-black -mr-3" />
        </div>
        {affordable ? (
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-1.5 text-sm font-bold text-white"><Coins className="w-4 h-4 text-[#2BF9E9]" />{card.coinsCost.toLocaleString()} BC</span>
            <span className="text-xs font-semibold text-[#2EA0FD] group-hover:translate-x-1 transition-transform">Claim →</span>
          </div>
        ) : (
          <div>
            <div className="flex items-center justify-between text-xs mb-1.5">
              <span className="text-white/60">{(card.coinsCost - balance).toLocaleString()} BC to unlock</span>
              <span className="text-white/40">{pct}%</span>
            </div>
            <div className="h-1.5 rounded-full bg-white/10 overflow-hidden">
              <motion.div className="h-full rounded-full bg-gradient-to-r from-[#2EA0FD] to-[#2BF9E9]" initial={{ width: 0 }} animate={{ width: `${pct}%` }} transition={{ duration: 1, ease: 'easeOut' }} />
            </div>
          </div>
        )}
      </div>
    </motion.button>
  );
}