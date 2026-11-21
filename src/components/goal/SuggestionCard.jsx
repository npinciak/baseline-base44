import { useState } from 'react';
import {
  ChevronDown, Info, PiggyBank, Lock, Landmark, Building2, Repeat, Coins, SplitSquareHorizontal,
  Car, CreditCard, TrendingUp, Sprout, Briefcase, Sparkles,
} from 'lucide-react';
import { BTN_T } from '@/lib/goalStyles';

const ICONS = { PiggyBank, Lock, Landmark, Building2, Repeat, Coins, SplitSquareHorizontal, Car, CreditCard, TrendingUp, Sprout, Briefcase };

export default function SuggestionCard({ s, fit }) {
  const [open, setOpen] = useState(false);
  const Icon = ICONS[s.icon] || Sparkles;
  return (
    <div className="border border-dashed border-[#2f3c35] hover:border-[#2efd7a] transition-colors duration-200 rounded-2xl p-[18px] bg-[#0a0d0f] flex flex-col gap-2">
      <div className="flex items-start justify-between gap-2">
        <div className="w-[38px] h-[38px] rounded-[11px] bg-[#2efd7a]/[0.12] text-[#2efd7a] flex items-center justify-center shrink-0">
          <Icon className="w-[18px] h-[18px]" />
        </div>
        {fit && <span className="text-[10px] font-bold uppercase tracking-[0.12em] text-[#7ee8ae] bg-[#2efd7a]/10 rounded-full px-2 py-1">Good fit</span>}
      </div>
      <b className="text-[14px] font-semibold leading-tight">{s.name}</b>
      <p className="text-xs text-[#7d8d86] leading-snug">{s.tagline}</p>
      <button type="button" onClick={() => setOpen(o => !o)} aria-expanded={open} className={`${BTN_T} self-start flex items-center gap-1 text-xs font-semibold text-[#2efd7a] hover:text-white mt-1`}>
        Why BasePlan suggests this <ChevronDown className={`w-3.5 h-3.5 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>
      {open && (
        <div className="space-y-2 pt-1">
          <p className="text-xs text-[#aab8b1] leading-relaxed">{s.why}</p>
          <p className="flex items-start gap-1.5 text-[11px] text-amber-200/80"><Info className="w-3.5 h-3.5 shrink-0 mt-px" />{s.note}</p>
        </div>
      )}
    </div>
  );
}