import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';
import { PieChart as PieIcon } from 'lucide-react';

const money = (n) => `$${Math.round(n).toLocaleString()}`;

export default function SpendingDonut({ categoryList, total }) {
  const top = categoryList.slice(0, 5);
  return (
    <div className="rounded-3xl border border-white/10 bg-white/[0.03] backdrop-blur-sm p-5 h-full">
      <h3 className="flex items-center gap-2 text-white font-heading font-bold mb-3">
        <PieIcon className="w-5 h-5 text-[#2EFD7A]" /> Where it goes
      </h3>
      {categoryList.length === 0 ? (
        <p className="text-white/50 text-sm py-12 text-center">No spending yet</p>
      ) : (
        <div className="flex flex-col sm:flex-row items-center gap-4">
          <div className="relative w-48 h-48 shrink-0">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={categoryList} dataKey="total" nameKey="label" innerRadius={62} outerRadius={88} paddingAngle={3} stroke="none" animationDuration={900}>
                  {categoryList.map(c => <Cell key={c.cat} fill={c.color} />)}
                </Pie>
                <Tooltip formatter={(v) => money(v)} contentStyle={{ background: 'rgba(0,0,0,0.9)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: 12, fontSize: 12 }} itemStyle={{ color: '#fff' }} />
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-[10px] uppercase tracking-widest text-white/50">Spent</span>
              <span className="text-xl font-display font-extrabold text-white">{money(total)}</span>
            </div>
          </div>
          <ul className="flex-1 w-full space-y-2.5">
            {top.map(c => (
              <li key={c.cat} className="flex items-center gap-2 text-sm">
                <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: c.color }} />
                <span className="flex-1 text-white/80 truncate">{c.label}</span>
                <span className="text-white font-semibold">{money(c.total)}</span>
                <span className="text-white/40 text-xs w-10 text-right">{total > 0 ? Math.round((c.total / total) * 100) : 0}%</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}