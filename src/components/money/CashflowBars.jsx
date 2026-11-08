import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { BarChart3 } from 'lucide-react';

export default function CashflowBars({ weeks }) {
  return (
    <div className="rounded-3xl border border-white/10 bg-white/[0.03] backdrop-blur-sm p-5 h-full">
      <div className="flex items-center justify-between mb-3">
        <h3 className="flex items-center gap-2 text-white font-heading font-bold">
          <BarChart3 className="w-5 h-5 text-[#2EFD7A]" /> Weekly cash flow
        </h3>
        <div className="flex items-center gap-3 text-[11px] text-white/60">
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-[#2EFD7A]" />In</span>
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-[#F5A623]" />Out</span>
        </div>
      </div>
      <div className="h-52">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={weeks} margin={{ top: 8, right: 4, left: -12, bottom: 0 }} barGap={3}>
            <CartesianGrid stroke="rgba(255,255,255,0.06)" vertical={false} />
            <XAxis dataKey="label" stroke="rgba(255,255,255,0.35)" fontSize={10} tickLine={false} axisLine={false} />
            <YAxis stroke="rgba(255,255,255,0.35)" fontSize={10} tickLine={false} axisLine={false} tickFormatter={(v) => `$${v >= 1000 ? `${Math.round(v / 100) / 10}k` : v}`} />
            <Tooltip cursor={{ fill: 'rgba(255,255,255,0.05)' }} formatter={(v) => `$${v.toLocaleString()}`} contentStyle={{ background: 'rgba(0,0,0,0.9)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: 12, fontSize: 12 }} labelStyle={{ color: 'rgba(255,255,255,0.6)' }} itemStyle={{ color: '#fff' }} />
            <Bar dataKey="income" name="Money in" fill="#2EFD7A" radius={[6, 6, 0, 0]} animationDuration={800} />
            <Bar dataKey="spent" name="Money out" fill="#F5A623" radius={[6, 6, 0, 0]} animationDuration={800} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}