/** Shared hero shell for Money Hub feature panels (Future View, Savings Goals). */
export default function FeaturePanel({ id, icon: Icon, kicker, action, className = '', children }) {
  return (
    <section id={id} className={`scroll-mt-6 min-w-0 relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-[#06142a] via-black to-black p-5 sm:p-7 shadow-[0_0_60px_-15px_rgba(46,253,122,0.35)] text-white ${className}`}>
      {(kicker || action) && (
        <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
          <p className="flex items-center gap-2 text-[11px] uppercase tracking-[0.25em] text-[#2EFD7A] font-semibold">
            {Icon && <Icon className="w-4 h-4" />} {kicker}
          </p>
          {action}
        </div>
      )}
      {children}
    </section>
  );
}