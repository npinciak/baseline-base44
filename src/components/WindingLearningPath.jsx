import { BookOpen, Wallet, TrendingUp, CreditCard, FileText, Unlock, Umbrella, Shield, PiggyBank } from 'lucide-react';
import ChapterSection from '@/components/path/ChapterSection';

const TOPIC_META = {
  budgeting:  { Icon: Wallet,     from: '#2EFD7A', to: '#17C964' },
  investing:  { Icon: TrendingUp, from: '#2EA0FD', to: '#2BF9E9' },
  credit:     { Icon: CreditCard, from: '#2EA0FD', to: '#1B7FD1' },
  taxes:      { Icon: FileText,   from: '#2BF9E9', to: '#2EA0FD' },
  saving:     { Icon: PiggyBank,  from: '#2EFD7A', to: '#2BF9E9' },
  debt:       { Icon: Unlock,     from: '#2EA0FD', to: '#2EFD7A' },
  insurance:  { Icon: Umbrella,   from: '#2BF9E9', to: '#17C964' },
  retirement: { Icon: Shield,     from: '#2EA0FD', to: '#2BF9E9' },
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
      {chapters.map((chapter) => (
        <ChapterSection
          key={chapter.id}
          chapter={chapter}
          meta={TOPIC_META[chapter.topic] || TOPIC_META.saving}
          defaultOpen={chapter.id === current?.id}
          onCompleteMove={onCompleteMove}
        />
      ))}
    </div>
  );
}