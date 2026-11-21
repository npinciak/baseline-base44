import { useMemo, useState } from 'react';
import { Lightbulb } from 'lucide-react';
import { SUGGESTIONS, SUGGESTION_CATEGORIES, isGoodFit } from '@/lib/smartSuggestions';
import { ICON_BOX, BTN_T } from '@/lib/goalStyles';
import SuggestionCard from '@/components/goal/SuggestionCard';

export default function SmartSuggestions({ goalType, monthsLeft }) {
  const [cat, setCat] = useState('saving');
  const items = useMemo(() => SUGGESTIONS
    .filter(s => s.category === cat)
    .map(s => ({ s, fit: isGoodFit(s, goalType, monthsLeft) }))
    .sort((a, b) => Number(b.fit) - Number(a.fit)), [cat, goalType, monthsLeft]);

  return (
    <div className="rounded-[20px] border border-[#26303a] bg-gradient-to-br from-[#12161a] to-[#0b0e11] p-[22px] shadow-[0_18px_40px_rgba(0,0,0,.45),inset_0_1px_0_rgba(255,255,255,.04)] text-[#e9efec]">
      <div className="flex flex-wrap items-end justify-between gap-3 mb-4">
        <div className="flex items-center gap-3">
          <div className={ICON_BOX}><Lightbulb className="w-4 h-4 text-[#2efd7a]" /></div>
          <div>
            <h3 className="text-base font-bold tracking-[-0.01em]">Smart saving strategies</h3>
            <p className="text-xs text-[#7d8d86] mt-0.5">Ways people speed up a goal like this one. For learning, not a recommendation.</p>
          </div>
        </div>
        <div className="flex gap-2 flex-wrap">
          {SUGGESTION_CATEGORIES.map(c => (
            <button key={c.key} type="button" onClick={() => setCat(c.key)} className={`${BTN_T} px-4 py-2 rounded-full text-xs font-semibold border ${cat === c.key ? 'bg-[#2efd7a] text-[#04140b] border-[#2efd7a]' : 'border-[#2f383d] text-[#aab8b1] hover:text-white hover:border-[#4a565c]'}`}>{c.label}</button>
          ))}
        </div>
      </div>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-[14px]">
        {items.map(({ s, fit }) => <SuggestionCard key={s.id} s={s} fit={fit} />)}
      </div>
      <p className="text-[11px] text-[#6b7a73] mt-4 leading-relaxed">
        Baseline does not sell or receive payment for any of these. Rates, fees and rules vary by provider and change over time. Nothing here is a guarantee of returns or financial advice, so compare options and read the terms before opening anything.
      </p>
    </div>
  );
}