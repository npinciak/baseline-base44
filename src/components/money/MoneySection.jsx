/** A Money page section grouped around one financial job. */
export default function MoneySection({ id, kicker, title, children }) {
  return (
    <section id={id} className="min-w-0 scroll-mt-6 space-y-6">
      <div className="pt-4">
        <p className="text-white/50 text-xs tracking-widest uppercase mb-1">{kicker}</p>
        <h2 className="text-white text-2xl font-light">{title}</h2>
      </div>
      {children}
    </section>
  );
}