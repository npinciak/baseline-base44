import { Link } from 'react-router-dom';
import { ArrowLeft, Compass } from 'lucide-react';
import AmbientBackdrop from '@/components/dashboard/AmbientBackdrop';
import CurriculumRoadmapView from '@/components/roadmap/CurriculumRoadmapView';

export default function CurriculumRoadmap() {
  return (
    <div className="relative min-h-screen bg-black px-4 md:px-10 py-10 overflow-hidden">
      <AmbientBackdrop dotsOnly />
      <div className="relative z-10 max-w-5xl mx-auto">
        <Link
          to="/dashboard"
          className="inline-flex items-center gap-1.5 text-xs font-medium text-white/60 hover:text-white mb-5 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Back to BasePath
        </Link>

        <div className="mb-8">
          <p className="text-[#2EFD7A] text-[11px] uppercase tracking-[0.25em] font-semibold mb-2 flex items-center gap-1.5">
            <Compass className="w-3.5 h-3.5" /> 3x Curriculum Expansion Plan
          </p>
          <h1 className="text-3xl sm:text-4xl font-display font-extrabold text-white">
            BasePath Expansion Roadmap
          </h1>
          <p className="text-white/65 text-sm sm:text-base mt-2 max-w-2xl">
            How Baseline grows from 19 chapters (71 lessons) to 57 chapters (213 lessons) across taxes, workplace benefits, contracts, investing depth, and life milestones — with strict boundaries so no concept is taught twice.
          </p>
        </div>

        <CurriculumRoadmapView />
      </div>
    </div>
  );
}