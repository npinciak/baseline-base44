import * as SliderPrimitive from '@radix-ui/react-slider';

const MIN = -40;
const MAX = 40;

export default function ScenarioSlider({ change, setChange }) {
  const pct = ((change - MIN) / (MAX - MIN)) * 100;
  const left = Math.min(pct, 50);
  const width = Math.abs(pct - 50);
  const color = change < 0 ? '#2EFD7A' : '#2EA0FD';

  return (
    <div>
      <SliderPrimitive.Root
        value={[change]}
        onValueChange={(v) => setChange(v[0])}
        min={MIN}
        max={MAX}
        step={5}
        className="relative flex w-full h-6 touch-none select-none items-center"
      >
        <SliderPrimitive.Track className="relative h-2 w-full grow rounded-full bg-white/10">
          <div
            className="absolute h-full rounded-full transition-colors"
            style={{ left: `${left}%`, width: `${width}%`, background: color }}
          />
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-0.5 h-4 rounded bg-white/40" />
        </SliderPrimitive.Track>
        <SliderPrimitive.Thumb
          className="block h-5 w-5 rounded-full bg-white border-4 cursor-grab active:cursor-grabbing focus-visible:outline-none transition-colors"
          style={{ borderColor: color, boxShadow: `0 0 14px ${color}99` }}
        />
      </SliderPrimitive.Root>
      <div className="relative flex justify-between text-[11px] text-white/60 mt-2">
        <span>Spend less</span>
        <span className="absolute left-1/2 -translate-x-1/2 text-white/80">Today</span>
        <span>Spend more</span>
      </div>
    </div>
  );
}