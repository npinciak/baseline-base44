import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ChevronRight } from 'lucide-react';

/** One clickable BaseScore sub-score that leads to where it can be improved. */
export default function ScoreCategoryRow({ cat, score, href }) {
  return (
    <Link to={href} className="block -mx-3 px-3 py-2 rounded-xl hover:bg-white/[0.05] transition-colors group">
      <div className="flex justify-between items-center mb-1 gap-3">
        <span className="text-white/80 text-xs">{cat.label}</span>
        <span className="flex items-center gap-1 text-white/50 text-xs font-bold">
          {score != null ? `${score}/100` : '—'}
          <ChevronRight className="w-3.5 h-3.5 text-white/30 group-hover:text-[#2EFD7A] group-hover:translate-x-0.5 transition-all" />
        </span>
      </div>
      <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
        <motion.div className="h-full rounded-full" style={{ background: cat.color }}
          initial={{ width: 0 }} animate={{ width: `${score || 0}%` }} transition={{ duration: 0.8, ease: 'easeOut' }} />
      </div>
      <p className="text-white/40 text-[11px] mt-1 group-hover:text-[#2EFD7A] transition-colors">{cat.action}</p>
    </Link>
  );
}