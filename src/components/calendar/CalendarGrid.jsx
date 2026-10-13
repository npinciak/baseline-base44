import { format, parseISO } from 'date-fns';
import { compact } from '@/components/calendar/categoryMeta';

const DAYS = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

export default function CalendarGrid({ weeks, month, timeline, selected, todayIso, onSelect }) {
  return (
    <div className="px-3 sm:px-5 pb-4">
      <div className="grid grid-cols-7 mb-1">
        {DAYS.map((d, i) => (
          <div key={i} className="text-center text-xs font-semibold text-white/60 py-1">{d}</div>
        ))}
      </div>
      {weeks.map((week, wi) => (
        <div key={wi} className="grid grid-cols-7 gap-0.5">
          {week.map((day) => {
            const key = format(day, 'yyyy-MM-dd');
            const inMonth = day.getMonth() === month.getMonth();
            const data = timeline[key];
            const isSel = key === selected;
            const isToday = key === todayIso;
            const future = data?.phase === 'future';
            const hasIn = data?.items.some((i) => i.counted && i.type === 'income' || (!i.counted && i.type === 'income'));
            const hasOut = data?.items.some((i) => i.type === 'expense');
            return (
              <button
                key={key}
                onClick={() => onSelect(key)}
                className={`relative flex flex-col items-center justify-start gap-0.5 pt-1.5 pb-1.5 min-h-[58px] rounded-xl transition-all ${
                  inMonth ? 'cursor-pointer hover:bg-white/10' : 'opacity-30'
                } ${future && !isSel ? 'bg-[#2EA0FD]/[0.06]' : ''} ${
                  isSel ? 'bg-[#2EFD7A] text-black hover:bg-[#2EFD7A]' : ''
                } ${isToday && !isSel ? 'ring-1 ring-[#2EFD7A]/70' : ''}`}
              >
                <span className={`text-sm font-semibold leading-none ${isSel ? 'text-black' : isToday ? 'text-[#2EFD7A]' : ''}`}>
                  {day.getDate()}
                </span>
                {data?.end != null && (
                  <span className={`text-[9px] sm:text-[10px] leading-none font-medium ${
                    isSel ? 'text-black/70' : future ? 'text-[#2EA0FD]' : 'text-white/60'
                  }`}>
                    {compact(data.end)}
                  </span>
                )}
                <span className="flex gap-1 h-1.5 mt-auto">
                  {hasIn && <span className="w-1.5 h-1.5 rounded-full bg-[#2EFD7A] ring-1 ring-black/30" />}
                  {hasOut && <span className="w-1.5 h-1.5 rounded-full bg-red-400 ring-1 ring-black/30" />}
                </span>
              </button>
            );
          })}
        </div>
      ))}
    </div>
  );
}

export const labelFor = (key) => format(parseISO(key), 'EEEE, MMM d, yyyy');