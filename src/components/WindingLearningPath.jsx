import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  BookOpen, Lock, CheckCircle, Trophy,
  ChevronUp, ChevronDown,
  Wallet, TrendingUp, CreditCard, FileText, Unlock, Umbrella, Shield, PiggyBank
} from 'lucide-react';
import RingGauge from '@/components/dashboard/RingGauge';

const TOPIC_META = {
  budgeting:   { Icon: Wallet,      from: '#2EFD7A', to: '#17C964' },
  investing:   { Icon: TrendingUp,  from: '#F5A623', to: '#F7C948' },
  credit:      { Icon: CreditCard,  from: '#2EC4B6', to: '#17A398' },
  taxes:       { Icon: FileText,    from: '#f97316', to: '#f59e0b' },
  saving:      { Icon: PiggyBank,   from: '#22c55e', to: '#14b8a6' },
  debt:        { Icon: Unlock,      from: '#ef4444', to: '#f43f5e' },
  insurance:   { Icon: Umbrella,    from: '#2DD4BF', to: '#14B8A6' },
  retirement:  { Icon: Shield,      from: '#f59e0b', to: '#eab308' },
};

// Canvas layout
const W = 300;
const LEFT_X  = 72;
const RIGHT_X = 228;
const NODE_R  = 30;       // circle radius
const STEP    = 130;      // vertical distance between node centres

function nodeX(i) { return i % 2 === 0 ? LEFT_X : RIGHT_X; }
function nodeY(i) { return NODE_R + 16 + i * STEP; }

/** Build a smooth Duolingo-style S-curve path through all node centres */
function buildPath(count) {
  if (count < 2) return '';
  let d = `M ${nodeX(0)} ${nodeY(0)}`;
  for (let i = 1; i < count; i++) {
    const x0 = nodeX(i - 1), y0 = nodeY(i - 1);
    const x1 = nodeX(i),     y1 = nodeY(i);
    // Control points swing wide toward the opposite side for a natural S
    const swing = (x1 - x0) * 1.6;
    const cp1x = x0 + swing * 0.5;
    const cp1y = y0 + STEP * 0.4;
    const cp2x = x1 - swing * 0.5;
    const cp2y = y1 - STEP * 0.4;
    d += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${x1} ${y1}`;
  }
  return d;
}

function ModuleSection({ module, moduleIndex, isUnlocked, completedLessonIds, onNavigate }) {
  const [open, setOpen]       = useState(moduleIndex === 0);
  const [lessons, setLessons] = useState(null);

  const meta = TOPIC_META[module.topic_tag] || { Icon: BookOpen, from: '#2EFD7A', to: '#2EFD7A' };

  useEffect(() => {
    if (open && lessons === null) {
      // Use pre-loaded lessons embedded in the module object from getPayloadLessons
      setLessons(module.lessons || []);
    }
  }, [open, module.id, lessons]);

  const nodes = lessons ? [
    ...lessons.map(lesson => ({
      id: lesson.id,
      label: lesson.title,
      xp: lesson.xp_reward || 20,
      completed: completedLessonIds.has(lesson.id),
      isLesson: true,
    })),
    {
      id: `complete-${module.id}`,
      label: `${module.title} Complete!`,
      xp: module.xp_reward || 100,
      completed: lessons.length > 0 && lessons.every(l => completedLessonIds.has(l.id)),
      isLesson: false,
      isTrophy: true,
    },
  ] : [];

  const completedCount = lessons ? lessons.filter(l => completedLessonIds.has(l.id)).length : 0;
  const totalCount     = lessons ? lessons.length : 0;
  const pct            = totalCount > 0 ? (completedCount / totalCount) * 100 : 0;

  const svgH   = nodes.length > 0 ? nodeY(nodes.length - 1) + NODE_R + 52 : 0;
  const pathD  = buildPath(nodes.length);

  return (
    <div className="rounded-2xl overflow-hidden border border-white/10 bg-white/[0.03] backdrop-blur-sm mb-4">
      {/* Header */}
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between px-5 py-4 hover:bg-white/[0.04] transition-colors"
      >
        <div className="flex items-center gap-3 text-left">
          {/* Coloured topic badge */}
          <div
            className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
            style={{ background: `linear-gradient(135deg, ${meta.from}, ${meta.to})` }}
          >
            <meta.Icon className="w-4.5 h-4.5 text-black" size={18} />
          </div>
          <div>
            <p className="text-sm text-white leading-tight">{module.title}</p>
            <p className="text-xs text-white/60 mt-0.5 capitalize">{module.topic_tag?.replace(/_/g, ' ')}</p>
          </div>
        </div>
        <div className="flex items-center gap-3 shrink-0 ml-4">
          <RingGauge pct={pct} size={30} strokeWidth={3} color={meta.from}>
            <span className="text-[9px] font-bold text-white">{Math.round(pct)}%</span>
          </RingGauge>
          {open
            ? <ChevronUp className="w-4 h-4 text-white/30" />
            : <ChevronDown className="w-4 h-4 text-white/30" />}
        </div>
      </button>

      {/* Expanded content */}
      {open && (
        <div className="py-4">
          {!isUnlocked ? (
            <div className="flex flex-col items-center justify-center py-8 gap-2 text-white/30">
              <Lock className="w-6 h-6" />
              <p className="text-xs text-white/60">Complete the previous module to unlock</p>
            </div>
          ) : lessons === null ? (
            <div className="flex justify-center py-8">
              <div className="w-6 h-6 border-2 border-white/10 border-t-[#2EFD7A] rounded-full animate-spin" />
            </div>
          ) : nodes.length === 0 ? (
            <p className="text-center text-xs text-white/60 py-6">No lessons yet.</p>
          ) : (
            <div className="relative mx-auto" style={{ width: W, height: svgH }}>

              {/* Curved dashed path */}
              <svg
                className="absolute inset-0 pointer-events-none"
                width={W} height={svgH}
                viewBox={`0 0 ${W} ${svgH}`}
              >
                {/* Shadow / base track */}
                <path d={pathD} fill="none" stroke="rgba(255,255,255,0.1)"
                  strokeWidth="4" strokeLinecap="round" strokeDasharray="10 8" />
              </svg>

              {/* Nodes */}
              {nodes.map((node, i) => {
                const cx           = nodeX(i);
                const cy           = nodeY(i);
                const nodeUnlocked = i === 0 || nodes[i - 1]?.completed;
                const isNextUp     = !node.completed && nodeUnlocked && !node.isTrophy;
                const D            = NODE_R * 2;

                // Pick icon for lesson nodes
                const LessonIcon = node.isTrophy ? Trophy
                  : node.completed              ? CheckCircle
                  : nodeUnlocked                ? (meta.Icon)
                  :                               Lock;

                // Gradient for unlocked; muted for locked — with a soft depth shadow for a 3D feel
                const bgStyle = nodeUnlocked
                  ? { background: `linear-gradient(135deg, ${meta.from}, ${meta.to})`, boxShadow: `0 8px 18px -4px ${meta.from}66, 0 3px 8px rgba(0,0,0,0.5)` }
                  : { background: 'rgba(255,255,255,0.08)' };

                return (
                  <motion.div
                    key={node.id}
                    className="absolute flex flex-col items-center"
                    style={{ left: cx - NODE_R, top: cy - NODE_R, width: D }}
                    initial={{ opacity: 0, scale: 0.3, y: 18 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    transition={{ type: 'spring', stiffness: 300, damping: 16, delay: i * 0.07 }}
                  >
                    <motion.button
                      onClick={() => node.isLesson && nodeUnlocked && onNavigate(module.id)}
                      disabled={!node.isLesson || !nodeUnlocked}
                      animate={isNextUp ? { scale: [1, 1.06, 1] } : { scale: 1 }}
                      transition={isNextUp ? { duration: 3.2, repeat: Infinity, ease: 'easeInOut' } : { duration: 0.2 }}
                      className={`relative rounded-full flex items-center justify-center shadow-lg
                        ${nodeUnlocked && node.isLesson ? 'hover:scale-110 active:scale-95 cursor-pointer' : 'cursor-default'}
                        ${isNextUp ? 'ring-4 ring-offset-2 ring-offset-black ring-[#2EFD7A]/40' : ''}
                      `}
                      style={{ width: D, height: D, ...bgStyle }}
                    >
                      <LessonIcon
                        className={`${node.isTrophy ? 'w-6 h-6' : 'w-6 h-6'} ${nodeUnlocked ? 'text-black drop-shadow' : 'text-white/30'}`}
                      />

                      {/* Completed check badge */}
                      {node.completed && !node.isTrophy && (
                        <span className="absolute -top-1 -right-1 w-5 h-5 bg-[#2EFD7A] rounded-full flex items-center justify-center ring-2 ring-black">
                          <CheckCircle className="w-3 h-3 text-black" />
                        </span>
                      )}

                      {/* Slow, calm breathing pulse for next unlocked */}
                      {isNextUp && (
                        <motion.span
                          className="absolute inset-0 rounded-full"
                          style={bgStyle}
                          initial={{ opacity: 0.35, scale: 1 }}
                          animate={{ opacity: [0.35, 0, 0.35], scale: [1, 1.35, 1] }}
                          transition={{ duration: 3.2, repeat: Infinity, ease: 'easeInOut' }}
                        />
                      )}
                    </motion.button>

                    {/* Label */}
                    <div className="mt-2 text-center" style={{ width: 88, marginLeft: -(44 - NODE_R) }}>
                      <p className={`font-medium leading-tight ${nodeUnlocked ? 'text-white' : 'text-white/50'}`}
                        style={{ fontSize: 11 }}>
                        {node.label}
                      </p>
                      <p className="font-semibold text-[#2EFD7A]" style={{ fontSize: 10 }}>
                        +{node.xp} BC
                      </p>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function WindingLearningPath({ modules, progress }) {
  const navigate = useNavigate();

  const completedLessonIds = new Set(
    progress.filter(p => p.completed).map(p => p.lesson_id)
  );

  const getModuleCompletedCount = (moduleId) =>
    progress.filter(p => p.module_id === moduleId && p.completed).length;

  const isModuleUnlocked = (index) => {
    if (index === 0) return true;
    return getModuleCompletedCount(modules[index - 1]?.id) > 0;
  };

  if (modules.length === 0) {
    return (
      <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-8 text-center">
        <BookOpen className="w-10 h-10 text-white/30 mx-auto mb-3" />
        <p className="text-sm text-white/60">No modules published yet — check back soon!</p>
      </div>
    );
  }

  return (
    <div>
      {modules.map((module, index) => (
        <ModuleSection
          key={module.id}
          module={module}
          moduleIndex={index}
          isUnlocked={isModuleUnlocked(index)}
          completedLessonIds={completedLessonIds}
          onNavigate={(moduleId) => navigate(`/lesson/${moduleId}`)}
        />
      ))}
    </div>
  );
}