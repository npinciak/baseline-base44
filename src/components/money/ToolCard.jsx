import FeaturePanel from '@/components/money/FeaturePanel';

/** Shared shell for the score-focused Money tools. */
export default function ToolCard({ icon, title, subtitle, children }) {
  return (
    <FeaturePanel icon={icon} kicker={title}>
      {subtitle && <p className="text-white/60 text-sm -mt-2 mb-5">{subtitle}</p>}
      {children}
    </FeaturePanel>
  );
}

export function StatTile({ label, value, hint }) {
  return (
    <div className="min-w-0 break-words rounded-xl bg-white/[0.04] border border-white/5 p-4">
      <p className="text-white/50 text-[11px] uppercase tracking-widest">{label}</p>
      <p className="text-white text-2xl font-bold tabular-nums mt-1">{value}</p>
      {hint && <p className="text-white/50 text-xs mt-1">{hint}</p>}
    </div>
  );
}