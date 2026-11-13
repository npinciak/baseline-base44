/** Shared shell for the score-focused Money tools. */
export default function ToolCard({ icon: Icon, title, subtitle, children }) {
  return (
    <div className="bg-white/[0.03] border border-white/10 backdrop-blur-sm rounded-2xl p-5 sm:p-6">
      <div className="flex items-center gap-3 mb-5">
        <div className="w-9 h-9 rounded-xl bg-[#2EFD7A]/10 border border-[#2EFD7A]/20 flex items-center justify-center shrink-0">
          <Icon className="w-4 h-4 text-[#2EFD7A]" />
        </div>
        <div className="min-w-0">
          <h3 className="text-white font-semibold leading-tight">{title}</h3>
          {subtitle && <p className="text-white/50 text-xs mt-0.5">{subtitle}</p>}
        </div>
      </div>
      {children}
    </div>
  );
}

export function StatTile({ label, value, hint }) {
  return (
    <div className="rounded-xl bg-white/[0.04] border border-white/5 p-4">
      <p className="text-white/50 text-[11px] uppercase tracking-widest">{label}</p>
      <p className="text-white text-2xl font-bold tabular-nums mt-1">{value}</p>
      {hint && <p className="text-white/50 text-xs mt-1">{hint}</p>}
    </div>
  );
}