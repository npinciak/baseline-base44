import { CHAPTERS, MONEY_TOOLS } from '@/lib/curriculum';
export const AUDIT_STATUS = ['all', 'keep', 'review', 'planned', 'removed'];
export const auditTone = key => ({ '--dt1-fc': `hsl(var(--${key === 'keep' ? 'dt1-green' : key === 'review' ? 'accent' : key === 'removed' ? 'destructive' : 'ring'}))`, '--dt1-fc-fill': `linear-gradient(180deg,hsl(var(--${key === 'keep' ? 'dt1-green' : key === 'review' ? 'accent' : key === 'removed' ? 'destructive' : 'ring'})),hsl(var(--${key === 'keep' ? 'dt1-green' : key === 'review' ? 'accent' : key === 'removed' ? 'destructive' : 'ring'}) / .85))`, '--dt1-fc-ink': key === 'removed' ? 'hsl(var(--foreground))' : 'hsl(var(--background))' });
export function auditRows(chapters, reviews = []) {
  return Object.entries(MONEY_TOOLS).map(([key, tool]) => {
    const chapter = chapters.find(c => c.id === tool.chapter);
    const saved = reviews.find(r => r.tool_key === key);
    return { key, ...tool, decision: saved?.decision || tool.decision || 'keep', note: saved?.note || '', chapterLabel: chapter ? `${chapter.number}. ${chapter.title}` : 'Learning progress (not a financial tool)', move: chapter?.move?.title || '', lessonCount: chapter?.modules?.length || 0, milestone: CHAPTERS.findIndex(c => c.id === tool.chapter) + 1 };
  });
}