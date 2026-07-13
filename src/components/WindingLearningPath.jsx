import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  BookOpen, Lock, CheckCircle, Star, Trophy,
  ChevronUp, ChevronDown
} from 'lucide-react';
import { base44 } from '@/api/base44Client';

// Fixed layout constants
const NODE_X = { left: 75, right: 225 };
const NODE_Y_STEP = 120;
const NODE_R = 32;

function buildPath(count) {
  if (count < 2) return '';
  let d = '';
  for (let i = 0; i < count; i++) {
    const side = i % 2 === 0 ? 'left' : 'right';
    const x = NODE_X[side];
    const y = NODE_R + i * NODE_Y_STEP;
    if (i === 0) {
      d += `M ${x} ${y}`;
    } else {
      const prevSide = (i - 1) % 2 === 0 ? 'left' : 'right';
      const px = NODE_X[prevSide];
      const py = NODE_R + (i - 1) * NODE_Y_STEP;
      const cp1x = px + (x - px) * 0.5;
      const cp1y = py + NODE_Y_STEP * 0.45;
      const cp2x = x - (x - px) * 0.5;
      const cp2y = y - NODE_Y_STEP * 0.45;
      d += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${x} ${y}`;
    }
  }
  return d;
}

function ModuleSection({ module, moduleIndex, isUnlocked, completedLessonIds, onNavigate }) {
  const [open, setOpen] = useState(moduleIndex === 0);
  const [lessons, setLessons] = useState(null); // null = not loaded yet

  useEffect(() => {
    if (open && lessons === null) {
      base44.entities.Lesson.filter({ module_id: module.id, is_published: true }, 'order_index', 50)
        .then(setLessons)
        .catch(() => setLessons([]));
    }
  }, [open, module.id, lessons]);

  // Build nodes from lessons + trophy
  const nodes = lessons
    ? [
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
      ]
    : [];

  const completedCount = lessons ? lessons.filter(l => completedLessonIds.has(l.id)).length : 0;
  const totalCount = lessons ? lessons.length : 0;
  const pct = totalCount > 0 ? (completedCount / totalCount) * 100 : 0;

  const svgH = nodes.length > 0
    ? NODE_R + (nodes.length - 1) * NODE_Y_STEP + NODE_R + 48
    : 0;
  const pathD = buildPath(nodes.length);

  return (
    <div className="rounded-2xl overflow-hidden border border-border mb-4">
      {/* Header */}
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between px-5 py-4 bg-card hover:bg-secondary/40 transition-colors"
      >
        <div className="text-left">
          <p className="text-sm font-heading font-bold leading-tight">{module.title}</p>
          <p className="text-xs text-muted-foreground mt-0.5 capitalize">{module.topic_tag?.replace(/_/g, ' ')}</p>
        </div>
        <div className="flex items-center gap-3 shrink-0 ml-4">
          <span className="text-xs font-semibold text-muted-foreground">
            {completedCount}/{totalCount}
          </span>
          {open
            ? <ChevronUp className="w-4 h-4 text-muted-foreground" />
            : <ChevronDown className="w-4 h-4 text-muted-foreground" />
          }
        </div>
      </button>

      {/* Progress bar */}
      <div className="h-1 bg-secondary">
        <div
          className="h-full bg-primary transition-all duration-500"
          style={{ width: `${pct}%` }}
        />
      </div>

      {/* Expanded content */}
      {open && (
        <div className="bg-background py-6">
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
            <div className="relative mx-auto" style={{ width: 300, height: svgH }}>
              {/* Dashed path */}
              <svg
                className="absolute inset-0 pointer-events-none"
                width={300}
                height={svgH}
                viewBox={`0 0 300 ${svgH}`}
              >
                <path
                  d={pathD}
                  fill="none"
                  stroke="hsl(var(--border))"
                  strokeWidth="2.5"
                  strokeDasharray="7 5"
                  strokeLinecap="round"
                />
              </svg>

              {/* Nodes */}
              {nodes.map((node, i) => {
                const side = i % 2 === 0 ? 'left' : 'right';
                const cx = NODE_X[side];
                const cy = NODE_R + i * NODE_Y_STEP;
                const nodeUnlocked = i === 0 || nodes[i - 1]?.completed;
                const isNextUp = !node.completed && nodeUnlocked && !node.isTrophy;

                return (
                  <div
                    key={node.id}
                    className="absolute flex flex-col items-center"
                    style={{ left: cx - NODE_R, top: cy - NODE_R, width: NODE_R * 2 }}
                  >
                    <button
                      onClick={() => node.isLesson && nodeUnlocked && onNavigate(module.id)}
                      disabled={!node.isLesson || !nodeUnlocked}
                      className={`relative w-16 h-16 rounded-full flex items-center justify-center shadow-md transition-all duration-200
                        ${nodeUnlocked && node.isLesson ? 'hover:scale-110 active:scale-95 cursor-pointer' : 'cursor-default'}
                        ${isNextUp ? 'ring-4 ring-primary/25' : ''}
                      `}
                      style={{
                        background: nodeUnlocked
                          ? (node.completed ? '#0d9488' : '#14b8a6')
                          : '#1e2640',
                      }}
                    >
                      {node.isTrophy ? (
                        <Trophy className={`w-7 h-7 ${nodeUnlocked ? 'text-white' : 'text-muted-foreground'}`} />
                      ) : node.completed ? (
                        <CheckCircle className="w-7 h-7 text-white" />
                      ) : nodeUnlocked ? (
                        <Star className="w-7 h-7 text-white" />
                      ) : (
                        <Lock className="w-6 h-6 text-muted-foreground" />
                      )}
                      {isNextUp && (
                        <span className="absolute inset-0 rounded-full animate-ping opacity-20 bg-primary" />
                      )}
                    </button>

                    {/* Label */}
                    <div className="mt-2 text-center w-20 -ml-2 mr-auto" style={{ marginLeft: -(20 - NODE_R) }}>
                      <p className="text-foreground font-medium leading-tight" style={{ fontSize: 10 }}>
                        {node.label}
                      </p>
                      <p className="text-primary font-semibold" style={{ fontSize: 10 }}>
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