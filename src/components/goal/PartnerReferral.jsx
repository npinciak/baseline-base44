import { useState } from 'react';
import { ExternalLink, ShieldAlert } from 'lucide-react';
import { BTN_T } from '@/lib/goalStyles';

/** Referral CTA: shows a disclosure step before sending the learner to a partner site. */
export default function PartnerReferral({ referral }) {
  const [confirming, setConfirming] = useState(false);

  if (!referral?.url) {
    return <p className="text-[11px] font-semibold text-[#6b7a73] mt-auto pt-2">Partner coming soon</p>;
  }

  if (!confirming) {
    return (
      <button type="button" onClick={() => setConfirming(true)} className={`${BTN_T} mt-auto self-start inline-flex items-center gap-1.5 rounded-full border border-[#2efd7a]/40 px-3 py-1.5 text-xs font-semibold text-[#2efd7a] hover:bg-[#2efd7a] hover:text-[#04140b]`}>
        Explore with {referral.partner} <ExternalLink className="w-3 h-3" />
      </button>
    );
  }

  return (
    <div className="mt-auto rounded-xl border border-amber-300/20 bg-amber-300/[0.06] p-3 space-y-2">
      <p className="flex items-start gap-1.5 text-[11px] text-amber-100/90 leading-relaxed">
        <ShieldAlert className="w-3.5 h-3.5 shrink-0 mt-px" />
        You are leaving Baseline for {referral.partner}. Baseline may be compensated if you open an account. This is for learning, not financial advice, so read their terms first.
      </p>
      <div className="flex gap-2">
        <a href={referral.url} target="_blank" rel="noopener noreferrer sponsored" className={`${BTN_T} rounded-full bg-[#2efd7a] px-3 py-1.5 text-xs font-bold text-[#04140b]`}>Continue</a>
        <button type="button" onClick={() => setConfirming(false)} className={`${BTN_T} rounded-full px-3 py-1.5 text-xs font-semibold text-[#aab8b1] hover:text-white`}>Cancel</button>
      </div>
    </div>
  );
}