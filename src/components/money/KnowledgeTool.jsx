import { Link } from 'react-router-dom';
import { GraduationCap, ArrowRight } from 'lucide-react';
import ToolCard, { StatTile } from '@/components/money/ToolCard';
import { nextLesson } from '@/lib/curriculum';

export default function KnowledgeTool({ chapters, knowledgeScore }) {
  const real = chapters.filter((c) => !c.comingSoon);
  const lessons = real.reduce((s, c) => s + c.modules.length, 0);
  const done = real.reduce((s, c) => s + c.lessonsDone, 0);
  const next = nextLesson(chapters);
  return (
    <ToolCard icon={GraduationCap} title="Financial Knowledge" subtitle="Every lesson you finish raises this part of your BaseScore">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-5">
        <StatTile label="Lessons done" value={`${done}/${lessons}`} />
        <StatTile label="Chapters done" value={`${real.filter((c) => c.learned).length}/${real.length}`} />
        <StatTile label="BaseScore part" value={knowledgeScore != null ? `${knowledgeScore}/100` : '—'} hint={knowledgeScore == null ? 'Take the BaseScore quiz' : null} />
      </div>
      {next ? (
        <Link to={`/lesson/${next.id}`} className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-[#2EFD7A] text-black text-sm font-semibold hover:bg-[#2EFD7A]/90 transition-all">
          Next lesson: {next.title} <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      ) : <p className="text-white/60 text-sm">You're all caught up. New lessons will show up on your BasePath.</p>}
    </ToolCard>
  );
}