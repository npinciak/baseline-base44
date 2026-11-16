import { BookOpen, Wallet, TrendingUp, CreditCard, FileText, Unlock, Umbrella, Shield, PiggyBank } from 'lucide-react';
import ChapterSection from '@/components/path/ChapterSection';

const TOPIC_META = {
  budgeting:  { Icon: Wallet },
  investing:  { Icon: TrendingUp },
  credit:     { Icon: CreditCard },
  taxes:      { Icon: FileText },
  saving:     { Icon: PiggyBank },
  debt:       { Icon: Unlock },
  insurance:  { Icon: Umbrella },
  retirement: { Icon: Shield },
};

export default function WindingLearningPath({ chapters, onCompleteMove }) {
  if (!chapters.some((c) => !c.comingSoon)) {
    return (
      <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-8 text-center">
        <BookOpen className="w-10 h-10 text-white/30 mx-auto mb-3" />
        <p className="text-sm text-white/60">No lessons published yet. Check back soon!</p>
      </div>
    );
  }

  const current = chapters.find((c) => c.unlocked && !c.comingSoon && (!c.learned || (c.move && !c.moveDone)));

  return (
    <div>
      {chapters.map((chapter, i) => {
        // Calculate continuous green (#2EFD7A) to blue (#2EA0FD) gradient across all chapters
        const total = chapters.length > 1 ? chapters.length - 1 : 1;
        
        // We'll interpolate HSL to keep the vibrant neon transition
        // Green is approx H: 142, S: 98, L: 59 
        // Blue is approx H: 207, S: 98, L: 59
        const h1 = 142;
        const h2 = 207;
        const s = 98;
        const l = 59;
        
        const pctFrom = i / total;
        const pctTo = Math.min((i + 1) / total, 1);
        
        const hFrom = h1 + (h2 - h1) * pctFrom;
        const hTo = h1 + (h2 - h1) * pctTo;
        
        const fromColor = `hsl(${hFrom}, ${s}%, ${l}%)`;
        const toColor = `hsl(${hTo}, ${s}%, ${l}%)`;
        
        const meta = {
          ...(TOPIC_META[chapter.topic] || TOPIC_META.saving),
          from: fromColor,
          to: toColor
        };
        
        return (
          <ChapterSection
            key={chapter.id}
            chapter={chapter}
            meta={meta}
            defaultOpen={chapter.id === current?.id}
            onCompleteMove={onCompleteMove}
          />
        );
      })}
    </div>
  );
}