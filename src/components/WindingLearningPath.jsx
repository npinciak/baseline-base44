import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  BookOpen, Lock, CheckCircle, Trophy,
  ChevronUp, ChevronDown,
  Wallet, TrendingUp, CreditCard, FileText, Unlock, Umbrella, Shield, PiggyBank, Star
} from 'lucide-react';
import { base44 } from '@/api/base44Client';

const TOPIC_META = {
  budgeting:   { Icon: Wallet,      from: '#14b8a6', to: '#10b981' },
  investing:   { Icon: TrendingUp,  from: '#3b82f6', to: '#6366f1' },
  credit:      { Icon: CreditCard,  from: '#a855f7', to: '#8b5cf6' },
  taxes:       { Icon: FileText,    from: '#f97316', to: '#f59e0b' },
  saving:      { Icon: PiggyBank,   from: '#22c55e', to: '#14b8a6' },
  debt:        { Icon: Unlock,      from: '#ef4444', to: '#f43f5e' },
  insurance:   { Icon: Umbrella,    from: '#0ea5e9', to: '#3b82f6' },
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

  const meta = TOPIC_META[module.topic_tag] || { Icon: BookOpen, from: '#14b8a6', to: '#14b8a6' };

  useEffect(() => {
    if (open && lessons === null) {
      base44.entities.Lesson
        .filter({ module_id: module.id, is_published: true }, 'order_index', 50)
        .then(setLessons)
        .catch(() => setLessons([]));
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
    <div className="rounded-2xl overflow-hidden border border-border mb-4">
      {/* Header */}
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between px-5 py-4 bg-card hover:bg-secondary/40 transition-colors"
      >
        <div className="flex items-center gap-3 text-left">
          {/* Coloured topic badge */}
          <div
            className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
            style={{ background: `linear-gradient(135deg, ${meta.from}, ${meta.to})` }}
          >
            <meta.Icon className="w-4.5 h-4.5 text-white" size={18} />
          </div>
          <div>
            <p className="text-sm font-heading font-bold leading-tight">{module.title}</p>
            <p className="text-xs text-muted-foreground mt-0.5 capitalize">{module.topic_tag?.replace(/_/g, ' ')}</p>
          </div>
        </div>
        <div className="flex items-center gap-3 shrink-0 ml-4">
          <span className="text-xs font-semibold text-muted-foreground">{completedCount}/{totalCount}</span>
          {open
            ? <ChevronUp className="w-4 h-4 text-muted-foreground" />
            : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
        </div>
      </button>

      {/* Progress bar */}
      <div className="h-1 bg-secondary">
        <div className="h-full bg-primary transition-all duration-500" style={{ width: `${pct}%` }} />
      </div>

      {/* Expanded content */}
      {open && (
        <div className="bg-background py-4">
          {!isUnlocked ? (
            <div className="flex flex-col items-center justify-center py-8 gap-2 text-muted-foreground">
              <Lock className="w-6 h-6" />
              <p className="text-xs">Complete the previous module to unlock</p>
            </div>
          ) : lessons === null ? (
            <div className="flex justify-center py-8">
              <div className="w-6 h-6 border-2 border-border border-t-primary rounded-full animate-spin" />
            </div>
          ) : nodes.length === 0 ? (
            <p className="text-center text-xs text-muted-foreground py-6">No lessons yet.</p>
          ) : (
            <div className="relative mx-auto" style={{ width: W, height: svgH }}>

              {/* Curved dashed path */}
              <svg
                className="absolute inset-0 pointer-events-none"
                width={W} height={svgH}
                viewBox={`0 0 ${W} ${svgH}`}
              >
                {/* Shadow / base track */}
                <path d={pathD} fill="none" stroke="hsl(var(--border))"
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

                // Gradient for unlocked; muted for locked
                const bgStyle = nodeUnlocked
                  ? { background: `linear-gradient(135deg, ${meta.from}, ${meta.to})` }
                  : { background: '#1e2640' };

                return (
                  <div
                    key={node.id}
                    className="absolute flex flex-col items-center"
                    style={{ left: cx - NODE_R, top: cy - NODE_R, width: D }}
                  >
                    <button
                      onClick={() => node.isLesson && nodeUnlocked && onNavigate(module.id)}
                      disabled={!node.isLesson || !nodeUnlocked}
                      className={`relative rounded-full flex items-center justify-center shadow-lg transition-all duration-200
                        ${nodeUnlocked && node.isLesson ? 'hover:scale-110 active:scale-95 cursor-pointer' : 'cursor-default'}
                        ${isNextUp ? 'ring-4 ring-offset-2 ring-offset-background ring-primary/40' : ''}
                      `}
                      style={{ width: D, height: D, ...bgStyle }}
                    >
                      <LessonIcon
                        className={`${node.isTrophy ? 'w-6 h-6' : 'w-6 h-6'} ${nodeUnlocked ? 'text-white drop-shadow' : 'text-muted-foreground'}`}
                      />

                      {/* Completed check badge */}
                      {node.completed && !node.isTrophy && (
                        <span className="absolute -top-1 -right-1 w-5 h-5 bg-primary rounded-full flex items-center justify-center ring-2 ring-background">
                          <CheckCircle className="w-3 h-3 text-primary-foreground" />
                        </span>
                      )}

                      {/* Pulse for next unlocked */}
                      {isNextUp && (
                        <span className="absolute inset-0 rounded-full animate-ping opacity-25"
                          style={bgStyle} />
                      )}
                    </button>

                    {/* Label */}
                    <div className="mt-2 text-center" style={{ width: 88, marginLeft: -(44 - NODE_R) }}>
                      <p className={`font-medium leading-tight ${nodeUnlocked ? 'text-foreground' : 'text-muted-foreground'}`}
                        style={{ fontSize: 11 }}>
                        {node.label}
                      </p>
                      <p className="font-semibold text-primary" style={{ fontSize: 10 }}>
                        +{node.xp} XP
                      </p>
                    </div>
                  </div>
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
      <div className="bg-card border border-border rounded-2xl p-8 text-center">
        <BookOpen className="w-10 h-10 text-muted-foreground/40 mx-auto mb-3" />
        <p className="text-sm text-muted-foreground">No modules published yet — check back soon!</p>
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