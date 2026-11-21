import { useEffect, useState } from 'react';
import { Trophy } from 'lucide-react';
import { Carousel, CarouselContent, CarouselItem, CarouselPrevious, CarouselNext } from '@/components/ui/carousel';
import GoalProgressTracker from '@/components/money/GoalProgressTracker';

const isComplete = (g) => Number(g.target_amount) > 0 && (Number(g.current_amount) || 0) >= Number(g.target_amount);

export default function GoalsCarousel({ goals, onArchive, archivingId }) {
  const [api, setApi] = useState(null);
  const [index, setIndex] = useState(0);
  useEffect(() => {
    if (!api) return;
    const select = () => setIndex(api.selectedScrollSnap());
    select();
    api.on('select', select);
    api.on('reInit', select);
    return () => { api.off('select', select); api.off('reInit', select); };
  }, [api]);
  return (
    <Carousel setApi={setApi} opts={{ align: 'start' }} aria-label="Savings goals" className="w-full min-w-0">
      <CarouselContent>{goals.map((goal, i) => (
        <CarouselItem key={goal.id} aria-label={`${i + 1} of ${goals.length}`}>
          <GoalProgressTracker goal={goal} />
          {onArchive && isComplete(goal) && (
            <div className="flex items-center justify-between gap-2 mt-2 rounded-xl border border-[#2EFD7A]/25 bg-[#2EFD7A]/5 px-3 py-2">
              <span className="text-xs text-white/75">Goal reached. Retire it to your Trophy Case.</span>
              <button type="button" disabled={archivingId === goal.id} onClick={() => onArchive(goal)} className="inline-flex items-center gap-1.5 rounded-full bg-[#2EFD7A] text-black px-3 py-1.5 text-xs font-bold hover:bg-[#2EFD7A]/90 disabled:opacity-50 transition-colors shrink-0">
                <Trophy className="w-3.5 h-3.5" />
                {archivingId === goal.id ? 'Archiving…' : 'Archive'}
              </button>
            </div>
          )}
        </CarouselItem>
      ))}</CarouselContent>
      {goals.length > 1 && <div className="flex items-center justify-end gap-2 mt-2">
        <span aria-live="polite" aria-atomic="true" className="text-xs text-muted-foreground mr-1">{index + 1} / {goals.length}</span>
        <CarouselPrevious className="static translate-y-0 h-7 w-7" />
        <CarouselNext className="static translate-y-0 h-7 w-7" />
      </div>}
    </Carousel>
  );
}