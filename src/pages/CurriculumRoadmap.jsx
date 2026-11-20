import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Compass, Lock } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import AmbientBackdrop from '@/components/dashboard/AmbientBackdrop';
import CurriculumRoadmapView from '@/components/roadmap/CurriculumRoadmapView';

export default function CurriculumRoadmap() {
  const [status, setStatus] = useState({ loading: true, allowed: false });

  useEffect(() => {
    let active = true;
    const verify = async () => {
      const user = await base44.auth.me().catch(() => null);
      if (!user) {
        if (active) setStatus({ loading: false, allowed: false });
        return;
      }
      if (user.role === 'admin') {
        if (active) setStatus({ loading: false, allowed: true });
        return;
      }
      const res = await base44.functions.invoke('curriculumReview', { mode: 'check' }).catch(() => null);
      if (active) setStatus({ loading: false, allowed: !!res?.data?.allowed });
    };
    verify();
    return () => { active = false; };
  }, []);

  if (status.loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-black">
        <div className="w-8 h-8 border-4 border-white/10 border-t-[#2EFD7A] rounded-full animate-spin" />
      </div>
    );
  }

  if (!status.allowed) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-black text-center px-6">
        <Lock className="w-8 h-8 text-white/30 mb-3" />
        <p className="text-white text-xl font-bold">Owner & admin access only</p>
        <p className="text-white/50 text-sm mt-1 max-w-md">
          The curriculum planning roadmap is reserved for the workspace owner and app admins. Your live lessons are right on BasePath.
        </p>
        <Link
          to="/dashboard"
          className="mt-5 inline-flex items-center gap-2 rounded-full bg-[#2EFD7A] px-5 py-2.5 text-sm font-bold text-black hover:bg-[#2EFD7A]/90 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Back to BasePath
        </Link>
      </div>
    );
  }

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
            <Compass className="w-3.5 h-3.5" /> Developer Planning View · Owner & Admins
          </p>
          <h1 className="text-3xl sm:text-4xl font-display font-extrabold text-white">
            BasePath Expansion Roadmap
          </h1>
          <p className="text-white/65 text-sm sm:text-base mt-2 max-w-2xl">
            Internal curriculum backlog beyond the live BasePath. Student & young-adult essentials (Ch 20–25) are now live on BasePath; future tracks below roll out only as their lessons are published.
          </p>
        </div>

        <CurriculumRoadmapView />
      </div>
    </div>
  );
}