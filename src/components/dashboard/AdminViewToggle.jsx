import { motion } from 'framer-motion';
import { Shield, GraduationCap } from 'lucide-react';

const OPTIONS = [
  { id: 'admin', label: 'Admin', Icon: Shield },
  { id: 'learner', label: 'Learner', Icon: GraduationCap },
];

export default function AdminViewToggle({ viewMode, onChange, isRealAdmin }) {
  if (!isRealAdmin) return null;

  return (
    <div
      role="group"
      aria-label="View mode"
      title={viewMode === 'learner' ? 'Previewing normal learner view' : 'Admin view active'}
      className="fixed bottom-24 right-4 md:bottom-6 md:right-6 z-50 inline-flex items-center p-1 rounded-full border border-white/15 bg-[#090D16]/90 backdrop-blur-xl shadow-[0_12px_32px_rgba(0,0,0,0.75)] hover:border-white/25 transition-colors"
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
              active ? 'text-black' : 'text-white/70 hover:text-white'
            }`}
          >
            {active && (
              <motion.span
                layoutId="admin-view-mode-pill"
                transition={{ type: 'spring', stiffness: 420, damping: 30 }}
                className={`absolute inset-0 rounded-full ${
                  id === 'learner'
                    ? 'bg-[#2EA0FD] shadow-[0_0_16px_rgba(46,160,253,0.4)]'
                    : 'bg-[#2EFD7A] shadow-[0_0_16px_rgba(46,253,122,0.4)]'
                }`}
              />
            )}
            <Icon className="relative z-10 w-3.5 h-3.5" />
            <span className="relative z-10">{label}</span>
          </button>
        );
      })}
    </div>
  );
}