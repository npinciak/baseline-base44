import { Trophy } from 'lucide-react';

export default function TrophyCase({ trophies }) {
  const fmtDate = (d) => (d ? new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : null);
  return (
    <div className="bg-white/[0.03] border border-white/10 backdrop-blur-sm rounded-3xl p-6 mb-6">
      <h3 className="text-lg font-heading font-bold mb-4 flex items-center gap-2 text-white">
        <Trophy className="w-5 h-5 text-[#2EFD7A]" /> Trophy Case
      </h3>
      {trophies.length === 0 ? (
        <p className="text-white/50 text-sm">Fully fund a savings goal, then move it here to celebrate the win.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {trophies.map((t) => {
            const money = new Intl.NumberFormat('en-US', { style: 'currency', currency: t.currency_code || 'USD', maximumFractionDigits: 0 });
            return (
              <div key={t.id} className="flex items-center gap-3 p-3 rounded-2xl border border-[#2EFD7A]/25 bg-gradient-to-br from-[#2EFD7A]/10 to-[#2EA0FD]/5">
                <div className="w-11 h-11 rounded-xl bg-[#2EFD7A]/15 flex items-center justify-center shrink-0">
                  <Trophy className="w-5 h-5 text-[#2EFD7A]" />
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-white truncate">{t.name}</p>
                  <p className="text-xs text-white/60">
                    {money.format(t.target_amount)} saved{fmtDate(t.archived_at) ? ` · ${fmtDate(t.archived_at)}` : ''}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}