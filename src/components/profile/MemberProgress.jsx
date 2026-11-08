import { useEffect, useState } from 'react';
import { base44 } from '@/api/base44Client';

const Stat = ({ label, value }) => (
  <div className="text-center">
    <p className="text-white font-bold text-lg tabular-nums">{value}</p>
    <p className="text-white/40 text-[10px] uppercase tracking-wider">{label}</p>
  </div>
);

export default function MemberProgress({ memberId }) {
  const [p, setP] = useState(null);
  useEffect(() => {
    base44.functions.invoke('familyAccount', { action: 'progress', member_id: memberId }).then(r => setP(r.data));
  }, [memberId]);

  if (!p) return <p className="text-white/40 text-xs py-3" role="status">Loading progress…</p>;
  if (!p.joined) return <p className="text-white/40 text-xs py-3">Progress appears once they accept the invite.</p>;
  const pct = p.lessons_total ? Math.round((p.lessons_done / p.lessons_total) * 100) : 0;
  return (
    <div className="pt-3 space-y-3">
      <div className="grid grid-cols-4 gap-2">
        <Stat label="Lessons" value={p.lessons_done} />
        <Stat label="This week" value={p.lessons_this_week} />
        <Stat label="Streak" value={p.streak} />
        <Stat label="BaseScore" value={p.base_score ?? '—'} />
      </div>
      <div>
        <div className="flex justify-between text-[11px] text-white/50 mb-1"><span>BasePath progress</span><span>{pct}%</span></div>
        <div className="h-1.5 bg-white/10 rounded-full overflow-hidden"><div className="h-full bg-[#2EA0FD] rounded-full" style={{ width: `${pct}%` }} /></div>
      </div>
      {p.recent.length > 0 && (
        <p className="text-xs text-white/50">Recently finished: <span className="text-white/80">{p.recent.map(r => r.title).join(', ')}</span></p>
      )}
    </div>
  );
}