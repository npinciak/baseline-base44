import * as SliderPrimitive from '@radix-ui/react-slider';

/** Labeled slider used by the Future View what-if controls. */
export default function GoalSlider({ label, valueLabel, value, onChange, min, max, step, minLabel, maxLabel }) {
  const pct = ((value - min) / (max - min)) * 100;
  return (
    <div>
      <div className="flex items-center justify-between text-sm mb-2">
        <span className="text-white font-semibold">{label}</span>
        <span className="text-[#2EFD7A] font-bold tabular-nums">{valueLabel}</span>
      </div>
      <SliderPrimitive.Root value={[value]} onValueChange={(v) => onChange(v[0])} min={min} max={max} step={step}
        className="relative flex w-full h-6 touch-none select-none items-center">
        <SliderPrimitive.Track className="relative h-2 w-full grow rounded-full bg-white/10">
          <div className="absolute h-full rounded-full bg-[#2EFD7A]" style={{ width: `${pct}%` }} />
        </SliderPrimitive.Track>
        <SliderPrimitive.Thumb className="block h-5 w-5 rounded-full bg-white border-4 border-[#2EFD7A] cursor-grab active:cursor-grabbing focus-visible:outline-none shadow-[0_0_14px_#2EFD7A99]" />
      </SliderPrimitive.Root>
      <div className="flex justify-between text-[11px] text-white/50 mt-1.5">
        <span>{minLabel}</span><span>{maxLabel}</span>
      </div>
    </div>
  );
}