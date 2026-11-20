import { BookOpen, Wallet, TrendingUp, CreditCard, FileText, Unlock, Umbrella, Shield, PiggyBank } from 'lucide-react';
import ChapterSection from '@/components/path/ChapterSection';
import { useAuth } from '@/lib/AuthContext';

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

function hslToHex(h, s, l) {
  const sat = s / 100;
  const light = l / 100;
  const a = sat * Math.min(light, 1 - light);
  const f = (n) => {
    const k = (n + h / 30) % 12;
    const color = light - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
    return Math.round(255 * color).toString(16).padStart(2, '0');
  };
  return `#${f(0)}${f(8)}${f(4)}`;
}

export default function WindingLearningPath({ chapters, onCompleteMove, isAdmin }) {
  const { user } = useAuth();
  const adminUnlocked = Boolean(isAdmin ?? (user?.role === 'admin'));

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
        const total = chapters.length > 1 ? chapters.length - 1 : 1;
        const t = i / total;

        // Wide per-badge hue span so each chapter number has a rich gradient while progressing green -> blue
        const hStart = 140 + (182 - 140) * t;
        const hMid = 166 + (200 - 166) * t;
        const hEnd = 190 + (218 - 190) * t;

        const fromColor = hslToHex(hStart, 98, 56);
        const midColor = hslToHex(hMid, 100, 66);
        const toColor = hslToHex(hEnd, 98, 56);

        const meta = {
          ...(TOPIC_META[chapter.topic] || TOPIC_META.saving),
          from: fromColor,
          mid: midColor,
          to: toColor,
          index: i,
        };

        return (
          <div key={chapter.id}>
            {chapter.section && (
              <div className={`flex items-center gap-3 ${i === 0 ? 'mb-3' : 'mt-7 mb-3'}`}>
                <span className="text-[11px] font-semibold uppercase tracking-[0.2em] text-white/45">
                  {chapter.section}
                </span>
                <div className="h-px flex-1 bg-white/[0.08]" />
              </div>
            )}
            <ChapterSection
              chapter={chapter}
              meta={meta}
              defaultOpen={chapter.id === current?.id}
              isAdmin={adminUnlocked}
              onCompleteMove={onCompleteMove}
            />
          </div>
        );
      })}
    </div>
  );
}