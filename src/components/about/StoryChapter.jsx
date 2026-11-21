import { motion } from "framer-motion";

/** One snackable story beat: big number, punchy headline, a short line of copy. */
export default function StoryChapter({ number, kicker, title, body, children }) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.3 }}
      transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
      className="w-full max-w-[1600px] mx-auto px-5 sm:px-8 md:px-[clamp(32px,6vw,140px)] py-16 md:py-24 border-t border-white/10"
    >
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-16">
        <div className="lg:col-span-4 flex lg:flex-col items-baseline lg:items-start gap-4">
          <span className="font-heading text-6xl md:text-8xl font-extrabold text-[#2EFD7A] leading-none">{number}</span>
          <span className="text-xs sm:text-sm font-semibold uppercase tracking-[0.28em] text-white/50">{kicker}</span>
        </div>
        <div className="lg:col-span-8 space-y-6">
          <h2 className="font-heading text-3xl sm:text-4xl md:text-5xl font-extrabold uppercase tracking-tight leading-[1.05] text-white">
            {title}
          </h2>
          {body && <p className="text-white/70 text-base sm:text-lg font-light leading-relaxed max-w-2xl">{body}</p>}
          {children}
        </div>
      </div>
    </motion.section>
  );
}