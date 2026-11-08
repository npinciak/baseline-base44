import { motion } from 'framer-motion';
import { Landmark, ArrowDownLeft, ArrowUpRight, PiggyBank } from 'lucide-react';

const money = (n) => `${n < 0 ? '-' : ''}$${Math.abs(Math.round(n)).toLocaleString()}`;

export default function MoneyKpis({ balance, income, spent, days }) {
  const rate = income > 0 ? Math.round(((income - spent) / income) * 100) : 0;
  const tiles = [
    { label: 'Total balance', value: money(balance), icon: Landmark, color: '#D4D4D8' },
    { label: `Money in · ${days}d`, value: money(income), icon: ArrowDownLeft, color: '#2EFD7A' },
    { label: `Money out · ${days}d`, value: money(spent), icon: ArrowUpRight, color: '#F5A623' },
    { label: 'Savings rate', value: `${rate}%`, icon: PiggyBank, color: '#2EFD7A' },
  ];
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
      {tiles.map(({ label, value, icon: Icon, color }, i) => (
        <motion.div
          key={label}
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.07, type: 'spring', stiffness: 260, damping: 22 }}
          whileHover={{ y: -3 }}
          className="relative overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03] backdrop-blur-sm p-4"
        >
          <div className="absolute -top-6 -right-6 w-20 h-20 rounded-full blur-2xl opacity-30" style={{ background: color }} />
          <div className="w-8 h-8 rounded-lg flex items-center justify-center mb-3" style={{ background: `${color}22` }}>
            <Icon className="w-4 h-4" style={{ color }} />
          </div>
          <p className="text-[11px] uppercase tracking-widest text-white/50">{label}</p>
          <p className="text-2xl font-display font-extrabold text-white">{value}</p>
        </motion.div>
      ))}
    </div>
  );
}