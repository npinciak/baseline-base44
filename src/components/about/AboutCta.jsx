import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";

export default function AboutCta() {
  return (
    <section className="w-full max-w-[1600px] mx-auto px-5 sm:px-8 md:px-[clamp(32px,6vw,140px)] py-20 md:py-28 border-t border-white/10 text-center">
      <h2 className="font-heading text-4xl sm:text-6xl font-extrabold uppercase tracking-tight leading-[1] mb-8">
        Find your <span className="text-[#2EFD7A]">baseline.</span>
      </h2>
      <div className="flex flex-wrap items-center justify-center gap-4">
        <Link
          to="/basescore-quiz"
          className="inline-flex items-center gap-2 px-8 py-4 rounded-full bg-[#2EFD7A] text-black font-semibold text-sm hover:bg-[#2EFD7A]/90 hover:shadow-[0_0_24px_rgba(46,253,122,0.35)] transition-all"
        >
          Check Your BaseScore™ <ArrowRight className="w-4 h-4" />
        </Link>
        <Link
          to="/contact"
          className="inline-flex items-center gap-2 px-8 py-4 rounded-full border border-white/20 text-white font-semibold text-sm hover:border-white/50 transition-colors"
        >
          Get in Touch
        </Link>
      </div>
    </section>
  );
}