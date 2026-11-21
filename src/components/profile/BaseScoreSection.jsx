import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, ShieldCheck } from 'lucide-react';
import { MAX_SCORE, SCORE_CATEGORIES, standingFor } from '@/lib/baseScore';
import ScoreCategoryRow from '@/components/profile/ScoreCategoryRow';

export default function BaseScoreSection({ stats, knowledgeHref = '/dashboard', stacked = false, cta = { to: '/basescore', label: 'See how to improve' } }) {
  const score = stats?.base_score;
  const rows = (
    <div className="space-y-1">
      {SCORE_CATEGORIES.map((cat) => (
        <ScoreCategoryRow key={cat.key} cat={cat} score={stats?.[cat.key] ?? null} growth={stats?.score_growth?.[cat.key] || 0} href={cat.href || knowledgeHref} />
      ))}
    </div>
  );

  if (score === undefined || score === null) {
    return (
      <div className="bg-white/[0.03] border border-white/10 backdrop-blur-sm rounded-3xl p-6 md:p-8">
        <div className="text-center mb-6">
          <div className="w-14 h-14 rounded-2xl bg-[#2EFD7A]/10 border border-[#2EFD7A]/20 flex items-center justify-center mx-auto mb-4">
            <ShieldCheck className="w-6 h-6 text-[#2EFD7A]" />
          </div>
          <h3 className="text-white text-lg font-light mb-2">You haven't taken the <span className="font-bold">BaseScore™</span> assessment yet</h3>
          <p className="text-white/60 text-sm mb-6 max-w-sm mx-auto">Answer a few questions to see a full breakdown of your financial health across five key categories.</p>
          <Link to="/basescore-quiz" className="inline-flex items-center gap-2 px-6 py-3 bg-[#2EFD7A] text-black rounded-full text-sm font-semibold hover:bg-[#2EFD7A]/90 transition-all">
            Take the Assessment <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
        {rows}
      </div>
    );
  }

  const pct = Math.min(1, score / MAX_SCORE);
  const circumference = 2 * Math.PI * 64;

  return (
    <div className={stacked ? 'bg-navy-card border border-white/15 rounded-3xl p-6 md:p-8' : 'bg-white/[0.03] border border-white/10 backdrop-blur-sm rounded-3xl p-6 md:p-8'}>
      <h3 className="text-white/60 text-xs font-light tracking-widest uppercase mb-6">Your BaseScore™</h3>
      <div className={stacked ? 'flex flex-col items-center gap-6' : 'flex flex-col md:flex-row items-center gap-8'}>
        <div className="relative w-40 h-40 shrink-0 flex items-center justify-center">
          <svg className="absolute inset-0 w-full h-full -rotate-90" viewBox="0 0 144 144">
            <circle cx="72" cy="72" r="64" fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="10" />
            <motion.circle cx="72" cy="72" r="64" fill="none" stroke="#2EFD7A" strokeWidth="10" strokeLinecap="round"
              strokeDasharray={circumference} initial={{ strokeDashoffset: circumference }}
              animate={{ strokeDashoffset: circumference * (1 - pct) }} transition={{ duration: 1.2, ease: 'easeOut', delay: 0.2 }} />
          </svg>
          <div className="text-center z-10">
            <p className="text-white font-extrabold text-4xl leading-none">{score}</p>
            <p className="text-white/40 text-xs mt-1">of {MAX_SCORE}</p>
          </div>
        </div>
        <div className={stacked ? 'w-full' : 'flex-1 w-full'}>
          <div className={stacked ? 'text-center' : ''}>
          <span className="inline-block mb-3 text-xs font-bold px-3 py-1 rounded-full bg-[#2EFD7A]/15 text-[#2EFD7A] border border-[#2EFD7A]/30">
            {standingFor(score)}
          </span>
          <p className="text-white/50 text-xs mb-4">
            {stats.score_gained > 0
              ? <>Assessment {stats.assessment_score} <span className="text-[#2EFD7A] font-semibold">+{stats.score_gained} from your BasePath</span></>
              : 'Finish lessons and Money Moves to grow your score.'}
          </p>
          </div>
          {rows}
        </div>
      </div>
      <Link to={cta.to} className="mt-6 w-full flex items-center justify-center gap-2 px-6 py-3.5 bg-[#2EFD7A] text-black rounded-full text-sm font-semibold hover:bg-[#2EFD7A]/90 transition-all">
        {cta.label} <ArrowRight className="w-4 h-4" />
      </Link>
    </div>
  );
}