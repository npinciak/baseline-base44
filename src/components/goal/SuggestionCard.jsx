import { useState } from 'react';
import {
  ChevronDown, Info, PiggyBank, Lock, Landmark, Building2, Repeat, Coins, SplitSquareHorizontal,
  Car, CreditCard, TrendingUp, Sprout, Briefcase, Sparkles,
} from 'lucide-react';
import { BTN_T } from '@/lib/goalStyles';

const ICONS = { PiggyBank, Lock, Landmark, Building2, Repeat, Coins, SplitSquareHorizontal, Car, CreditCard, TrendingUp, Sprout, Briefcase };
const IMG = 'https://media.base44.com/images/public/6a3542676f9044e70b439a84/';
const IMAGES = {
  hysa: `${IMG}bd03cd47c_generated_image.png`,
  cd: `${IMG}56d28e057_generated_image.png`,
  mma: `${IMG}7b7536ee9_generated_image.png`,
  tbills: `${IMG}86bb4e940_generated_image.png`,
  'auto-transfer': `${IMG}777f5113b_generated_image.png`,
  roundups: `${IMG}a4751f787_generated_image.png`,
  'split-deposit': `${IMG}4584d8595_generated_image.png`,
  preapproval: `${IMG}252e843ed_generated_image.png`,
  'credit-builder': `${IMG}9ec15ad74_generated_image.png`,
  'index-funds': `${IMG}3c99b26d1_generated_image.png`,
  roth: `${IMG}64ac7a3c7_generated_image.png`,
  match: `${IMG}7f43fd618_generated_image.png`,
};

export default function SuggestionCard({ s, fit }) {
  const [open, setOpen] = useState(false);
  const Icon = ICONS[s.icon] || Sparkles;
  return (
    <div className="group border border-[#232a2e] hover:border-[#2efd7a] hover:-translate-y-0.5 transition-all duration-200 rounded-2xl overflow-hidden bg-[#0a0d0f] flex flex-col">
      <div className="relative h-[150px] overflow-hidden bg-[#0a0d0f]">
        {IMAGES[s.id] && <img src={IMAGES[s.id]} alt="" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />}
        <div className="absolute inset-0 bg-gradient-to-t from-[#0a0d0f] via-transparent to-transparent" />
        <div className="absolute bottom-2 left-3 w-[34px] h-[34px] rounded-[10px] bg-black/70 backdrop-blur text-[#2efd7a] flex items-center justify-center">
          <Icon className="w-4 h-4" />
        </div>
        {fit && <span className="absolute top-3 right-3 text-[10px] font-bold uppercase tracking-[0.12em] text-[#04140b] bg-[#2efd7a] rounded-full px-2 py-1">Good fit</span>}
      </div>
      <div className="p-[18px] pt-3 flex flex-col gap-2">
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
    </div>
  );
}