/** Shared card shell so every Profile block reads as one system. */
export default function ProfileSection({ id, icon: Icon, title, action, children, className = '' }) {
  return (
    <section id={id} className={`min-w-0 scroll-mt-6 bg-white/[0.03] border border-white/10 backdrop-blur-sm rounded-3xl p-6 ${className}`}>
      <div className="flex items-center justify-between gap-3 mb-5">
        <h3 className="flex items-center gap-2 text-[11px] uppercase tracking-[0.22em] font-semibold text-white/60">
          {Icon && <Icon className="w-4 h-4 text-[#2EFD7A]" />}
          {title}
        </h3>
        {action}
      </div>
      {children}
    </section>
  );
}