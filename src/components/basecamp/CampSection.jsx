import { motion } from 'framer-motion';
import { Flag, Check } from 'lucide-react';
import RewardCard from './RewardCard';

const ROMAN = ['I', 'II', 'III', 'IV', 'V'];
const NAMES = ['Trailhead rewards', 'High Ridge rewards', 'Summit rewards'];

export default function CampSection({ index, cost, cards, balance, lifetimeCoins = 0, onSelect }) {
  const reached = balance >= cost;
  return (
    <section>
      <div className="flex items-center gap-3 mb-4">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${reached ? 'bg-[#2BF9E9] text-black' : 'bg-white/10 text-white/70'}`}>
          {reached ? <Check className="w-5 h-5" /> : <Flag className="w-5 h-5" />}
        </div>
        <div className="flex-1">
          <h2 className="text-xl font-display font-extrabold text-white">Camp {ROMAN[index]} <span className="text-white/40 font-normal text-base">· {NAMES[index] || 'Rewards'}</span></h2>
          <p className="text-xs text-white/50">{reached ? 'Camp reached. Claim your rewards.' : `Reach ${cost.toLocaleString()} Base Coins to set up camp.`}</p>
        </div>
        <div className="hidden sm:block h-px flex-1 max-w-xs bg-gradient-to-r from-white/20 to-transparent" />
      </div>
      <motion.div initial="hidden" animate="show" variants={{ hidden: {}, show: { transition: { staggerChildren: 0.07 } } }} className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {cards.map(card => <RewardCard key={card.id} card={card} balance={balance} lifetimeCoins={lifetimeCoins} onSelect={onSelect} />)}
      </motion.div>
    </section>
  );
}