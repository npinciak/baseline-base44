import { motion } from 'framer-motion';
import { COIN_LEVELS } from '@/lib/coinLevels';

const BARS_PER_LEVEL = 10;

/** Barcode-style level track: each level is a block of thin bars that fill as Lifetime BC grows. */
export default function LevelBarcode({ lifetimeCoins = 0, currentLevel = 1 }) {
  return (
    <div className="flex gap-2 sm:gap-3">
      {COIN_LEVELS.map((tier, i) => {
        const next = COIN_LEVELS[i + 1];
        const span = next ? next.minLifetimeCoins - tier.minLifetimeCoins : 1;
        const fill = next
          ? Math.max(0, Math.min(1, (lifetimeCoins - tier.minLifetimeCoins) / span))
          : lifetimeCoins >= tier.minLifetimeCoins ? 1 : 0;
        const filledBars = Math.round(fill * BARS_PER_LEVEL);
        const isCurrent = tier.level === currentLevel;
        return (
          <div key={tier.level} className="flex-1 min-w-0">
            <div className="flex items-end gap-[2px] h-12">
              {Array.from({ length: BARS_PER_LEVEL }).map((_, b) => (
                <motion.span key={b}
                  initial={{ scaleY: 0 }} animate={{ scaleY: 1 }}
                  transition={{ delay: (i * BARS_PER_LEVEL + b) * 0.012, duration: 0.3 }}
                  className={`flex-1 origin-bottom rounded-[1px] ${b < filledBars ? 'bg-gradient-to-t from-[#2EFD7A] to-[#2EA0FD]' : 'bg-white/10'}`}
                  style={{ height: `${b % 3 === 0 ? 100 : b % 2 === 0 ? 72 : 86}%` }} />
              ))}
            </div>
            <p className={`mt-2 text-[10px] font-bold uppercase tracking-wider truncate ${isCurrent ? 'text-[#2EFD7A]' : 'text-white/40'}`}>
              L{tier.level} · {tier.title}
            </p>
          </div>
        );
      })}
    </div>
  );
}