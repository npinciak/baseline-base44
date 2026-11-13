import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ShieldCheck, ArrowRight } from 'lucide-react';
import RingGauge from './RingGauge';

const MAX_SCORE = 500;

function standingFor(score) {
  const pct = score / MAX_SCORE;
  if (pct >= 0.7) return 'Excellent';
  if (pct >= 0.45) return 'Good Standing';
  if (pct >= 0.25) return 'Fair';
  return 'Needs Work';
}

export default function BaseScoreGlance({ score }) {
  if (score === undefined || score === null) {
    return (
      <Link
        to="/basescore-quiz"
        className="flex items-center gap-2.5 group"
      >
        <div className="w-10 h-10 rounded-full bg-white/[0.05] border border-white/10 flex items-center justify-center group-hover:border-[#2EFD7A]/40 transition-colors">
          <ShieldCheck className="w-4.5 h-4.5 text-white/40 group-hover:text-[#2EFD7A] transition-colors" />
        </div>
        <div>
          <p className="text-white/60 text-[10px] tracking-widest uppercase mb-0.5">BaseScore</p>
          <p className="text-white/80 text-xs font-medium flex items-center gap-1 group-hover:text-[#2EFD7A] transition-colors">
            Take the assessment <ArrowRight className="w-3 h-3" />
          </p>
        </div>
      </Link>
    );
  }

  const pct = (score / MAX_SCORE) * 100;

  return (
    <Link to="/basescore" className="flex items-center gap-2.5 group">
      <RingGauge pct={pct} size={40} strokeWidth={4} color="#2EFD7A" accentColor="#2BF9E9">
        <span className="text-[10px] font-bold text-white">{score}</span>
      </RingGauge>
      <div>
        <p className="text-white/60 text-[10px] tracking-widest uppercase mb-0.5">BaseScore</p>
        <p className="text-white text-xs font-semibold group-hover:text-[#2EFD7A] transition-colors">{standingFor(score)}</p>
      </div>
    </Link>
  );
}