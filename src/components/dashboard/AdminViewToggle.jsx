import { motion } from 'framer-motion';
import { Shield, GraduationCap } from 'lucide-react';

const OPTIONS = [
  { id: 'admin', label: 'Admin', Icon: Shield },
  { id: 'learner', label: 'Learner', Icon: GraduationCap },
];

export default function AdminViewToggle({ viewMode, onChange, isRealAdmin }) {
  if (!isRealAdmin) return null;
  const isLearner = viewMode === 'learner';

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
      <div className="flex items-center gap-2 text-xs text-white/60">
        <span
          className={`w-2 h-2 rounded-full transition-colors ${
            isLearner ? 'bg-[#2EA0FD] shadow-[0_0_8px_rgba(46,160,253,0.7)]' : 'bg-[#2EFD7A] shadow-[0_0_8px_rgba(46,253,122,0.7)]'
          }`}
        />
        <span>{isLearner ? 'Previewing normal learner experience' : 'Admin view · all chapters & tools unlocked'}</span>
      </div>

      <div
        role="group"
        aria-label="View mode"
        className="inline-flex items-center p-1 rounded-full border border-white/10 bg-white/[0.04] backdrop-blur-md"
      >
        {OPTIONS.map(({ id, label, Icon }) => {
          const active = viewMode === id;
          return (
            <button
              key={id}
              type="button"
              aria-pressed={active}
              onClick={() => onChange(id)}
              className={`relative inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold transition-colors ${
                active ? 'text-black' : 'text-white/65 hover:text-white'
              }`}
            >
              {active && (
                <motion.span
                  layoutId="admin-view-mode-pill"
                  transition={{ type: 'spring', stiffness: 420, damping: 30 }}
                  className={`absolute inset-0 rounded-full ${
                    id === 'learner'
                      ? 'bg-[#2EA0FD] shadow-[0_0_16px_rgba(46,160,253,0.35)]'
                      : 'bg-[#2EFD7A] shadow-[0_0_16px_rgba(46,253,122,0.35)]'
                  }`}
                />
              )}
              <Icon className="relative z-10 w-3.5 h-3.5" />
              <span className="relative z-10">{label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}