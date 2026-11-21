import { useNavigate } from 'react-router-dom';
import { BookOpen, CheckCircle, CreditCard, TrendingUp, Wallet, PiggyBank } from 'lucide-react';
import { BTN_T } from '@/lib/goalStyles';

const TOPIC_ICONS = { budgeting: CreditCard, investing: TrendingUp, credit: Wallet, saving: PiggyBank };
const TOPIC_COLORS = {
  budgeting: 'bg-orange-500/[0.18] text-orange-400',
  investing: 'bg-blue-500/20 text-blue-400',
  credit: 'bg-purple-500/20 text-purple-400',
  saving: 'bg-[#2efd7a]/15 text-[#2efd7a]',
  taxes: 'bg-amber-500/20 text-amber-400',
  debt: 'bg-red-500/20 text-red-400',
  insurance: 'bg-sky-500/20 text-sky-400',
  retirement: 'bg-yellow-500/20 text-yellow-400',
};

export default function BasePlanModules({ modules, isCompleted }) {
  const navigate = useNavigate();
  return (
    <div className="pt-[18px] border-t border-[#1f4a35]">
      <h4 className="text-[15px] font-bold mb-3">My Base Plan</h4>
      {modules.length === 0 ? (
        <div className="text-center py-4 rounded-[14px] border border-dashed border-[#2f3c35]">
          <BookOpen className="w-8 h-8 text-[#5d6b64] mx-auto" />
          <p className="mt-2 text-xs text-[#8a9a93]">No relevant lessons found.</p>
        </div>
      ) : (
        <div className="grid sm:grid-cols-3 gap-3">
          {modules.map(mod => {
            const Icon = TOPIC_ICONS[mod.topic_tag] || BookOpen;
            return (
              <button key={mod.id} onClick={() => navigate(`/lesson/${mod.id}`)} className={`${BTN_T} flex gap-3 items-center text-left p-[14px] rounded-[14px] bg-[#0a0d0f] border border-[#232a2e] hover:border-[#2efd7a] hover:bg-[#101614] text-[#e9efec]`}>
                <div className={`w-[38px] h-[38px] rounded-[11px] flex items-center justify-center shrink-0 ${TOPIC_COLORS[mod.topic_tag] || TOPIC_COLORS.saving}`}><Icon className="w-[18px] h-[18px]" /></div>
                <div className="min-w-0 flex-1">
                  <b className="block text-[13px] font-semibold leading-[1.3]">{mod.title}</b>
                  {mod.description && <span className="block text-[11px] text-[#7d8d86] mt-[3px] leading-[1.35] line-clamp-2">{mod.description}</span>}
                </div>
                {isCompleted(mod.id) && <div className="w-5 h-5 rounded-full bg-green-400/20 flex items-center justify-center shrink-0"><CheckCircle className="w-3.5 h-3.5 text-green-400" /></div>}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}