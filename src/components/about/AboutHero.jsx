import { motion } from "framer-motion";
import { ArrowDown } from "lucide-react";

export default function AboutHero() {
  return (
    <section className="relative w-full max-w-[1600px] mx-auto px-5 sm:px-8 md:px-[clamp(32px,6vw,140px)] pt-20 md:pt-32 pb-20 md:pb-28">
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
        className="text-[#2EFD7A] text-xs sm:text-sm font-semibold uppercase tracking-[0.28em] mb-6"
      >
        About Baseline
      </motion.p>
      <motion.h1
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1, ease: [0.22, 1, 0.36, 1], delay: 0.1 }}
        className="font-heading text-5xl sm:text-7xl lg:text-8xl font-extrabold uppercase tracking-tight leading-[0.95]"
      >
        Mind over
        <br />
        <span className="text-[#2EFD7A]">money.</span>
      </motion.h1>
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1, delay: 0.4 }}
        className="mt-8 max-w-xl text-white/70 text-lg sm:text-xl font-light leading-relaxed"
      >
        Financial confidence, built one habit at a time.
      </motion.p>
      <motion.div
        animate={{ y: [0, 8, 0] }}
        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        className="mt-16 inline-flex items-center gap-2 text-xs uppercase tracking-[0.28em] text-white/40"
      >
        <ArrowDown className="w-4 h-4" /> Our story
      </motion.div>
    </section>
  );
}