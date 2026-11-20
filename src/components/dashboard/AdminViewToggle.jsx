import { useRef, useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Shield, GraduationCap, GripVertical } from 'lucide-react';

const OPTIONS = [
  { id: 'admin', label: 'Admin', Icon: Shield },
  { id: 'learner', label: 'Learner', Icon: GraduationCap },
];

export default function AdminViewToggle({ viewMode, onChange, isRealAdmin }) {
  const draggedRef = useRef(false);
  const viewportRef = useRef(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setReady(true);
  }, []);

  if (!isRealAdmin) return null;

  return (
    <>
      <div ref={viewportRef} className="fixed inset-3 bottom-20 md:inset-5 pointer-events-none z-40" />
      <motion.div
        drag={ready}
        dragConstraints={viewportRef}
        dragMomentum={false}
        onDragStart={() => { draggedRef.current = true; }}
        onDragEnd={() => { setTimeout(() => { draggedRef.current = false; }, 120); }}
        whileDrag={{ scale: 1.04 }}
        role="group"
        aria-label="View mode"
        title="Switch view mode (drag to reposition)"
        className="fixed bottom-20 right-4 md:bottom-6 md:right-6 z-50 inline-flex items-center gap-0.5 p-1 rounded-full border border-white/15 bg-[#090D16]/90 backdrop-blur-xl shadow-[0_12px_32px_rgba(0,0,0,0.75)] hover:border-white/25 cursor-grab active:cursor-grabbing select-none"
      >
        <span aria-hidden="true" className="pl-1.5 pr-0.5 text-white/30">
          <GripVertical className="w-3 h-3" />
        </span>
        {OPTIONS.map(({ id, label, Icon }) => {
          const active = viewMode === id;
          return (
            <button
              key={id}
              type="button"
              aria-pressed={active}
              onClick={() => { if (!draggedRef.current) onChange(id); }}
              className={`relative inline-flex items-center gap-1.5 px-2.5 py-1 md:px-3.5 md:py-1.5 rounded-full text-[11px] md:text-xs font-semibold transition-colors ${
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
      </motion.div>
    </>
  );
}