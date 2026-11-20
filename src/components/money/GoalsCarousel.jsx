import { useEffect, useState } from 'react';
import { Carousel, CarouselContent, CarouselItem, CarouselPrevious, CarouselNext } from '@/components/ui/carousel';
import GoalProgressTracker from '@/components/money/GoalProgressTracker';

export default function GoalsCarousel({ goals }) {
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
      <CarouselContent>{goals.map((goal, i) => <CarouselItem key={goal.id} aria-label={`${i + 1} of ${goals.length}`}><GoalProgressTracker goal={goal} /></CarouselItem>)}</CarouselContent>
      {goals.length > 1 && <div className="flex items-center justify-end gap-2 mt-2">
        <span aria-live="polite" aria-atomic="true" className="text-xs text-muted-foreground mr-1">{index + 1} / {goals.length}</span>
        <CarouselPrevious className="static translate-y-0 h-7 w-7" />
        <CarouselNext className="static translate-y-0 h-7 w-7" />
      </div>}
    </Carousel>
  );
}