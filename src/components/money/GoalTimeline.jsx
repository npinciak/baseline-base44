import { motion } from 'framer-motion';
import { Check, Flag } from 'lucide-react';

const STOPS = [0, 25, 50, 75, 100];

export default function GoalTimeline({ percent, target, money }) {
  return (
    <div className="relative pt-7 pb-1 mt-2">
      <div className="absolute left-3 right-3 top-[38px] h-1.5 rounded-full bg-white/10" />
      <motion.div
        initial={{ width: 0 }}
        animate={{ width: `calc((100% - 24px) * ${percent / 100})` }}
        transition={{ duration: 1.1, ease: [0.22, 1, 0.36, 1] }}
        className="absolute left-3 top-[38px] h-1.5 rounded-full bg-gradient-to-r from-[#065F46] via-[#10B981] to-[#2EFD7A] shadow-[0_0_14px_rgba(46,253,122,0.5)]"
      />
      <motion.div
        initial={{ left: '12px' }}
        animate={{ left: `calc(12px + (100% - 24px) * ${percent / 100})` }}
        transition={{ duration: 1.1, ease: [0.22, 1, 0.36, 1] }}
        className="absolute top-[13px] z-10 -translate-x-1/2 flex flex-col items-center"
      >
        <span className="text-[10px] font-bold uppercase tracking-widest text-[#2EFD7A] whitespace-nowrap">You</span>
        <span className="mt-1 w-4 h-4 rounded-full bg-[#2EFD7A] ring-4 ring-[#2EFD7A]/20 shadow-[0_0_16px_rgba(46,253,122,0.8)]" />
      </motion.div>
      <div className="relative flex justify-between">
        {STOPS.map(stop => {
          const reached = percent >= stop;
          const last = stop === 100;
          return (
            <div key={stop} className="flex flex-col items-center w-6">
              <span className={`w-6 h-6 rounded-full flex items-center justify-center border transition-colors ${reached ? 'bg-[#065F46] border-[#2EFD7A]/60 text-[#2EFD7A]' : 'bg-black border-white/15 text-white/30'}`}>
                {last ? <Flag className="w-3 h-3" /> : reached ? <Check className="w-3 h-3" /> : <span className="w-1.5 h-1.5 rounded-full bg-current" />}
              </span>
              <span className={`mt-2 text-[10px] font-semibold tabular-nums whitespace-nowrap ${reached ? 'text-white/80' : 'text-white/35'}`}>{stop}%</span>
              <span className="text-[10px] text-white/35 tabular-nums whitespace-nowrap hidden sm:block">{money.format(target * stop / 100)}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}