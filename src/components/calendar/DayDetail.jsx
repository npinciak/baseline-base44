import { Calendar, Pencil, Trash2 } from 'lucide-react';
import { CATEGORY_META, money } from '@/components/calendar/categoryMeta';

const SOURCE = {
  actual: { label: 'Actual', cls: 'bg-white/10 text-white/70' },
  scheduled: { label: 'Scheduled', cls: 'bg-[#2EFD7A]/15 text-[#2EFD7A]' },
  predicted: { label: 'Predicted', cls: 'border border-dashed border-[#D4D4D8]/60 text-[#D4D4D8]' },
};

function Stat({ label, value, tone }) {
  return (
    <div className="bg-white/[0.05] rounded-xl p-3 sm:p-4 min-w-0">
      <p className="text-xs text-white/60 mb-1 truncate">{label}</p>
      <p className={`text-base sm:text-xl font-display font-extrabold truncate ${tone}`}>{value}</p>
    </div>
  );
}

export default function DayDetail({ day, onEdit, onDelete }) {
  const known = day?.end != null;
  const net = day?.net || 0;
  const future = day?.phase === 'future';
  return (
    <>
      <div className="grid grid-cols-3 gap-2 sm:gap-3 px-5 pb-4">
        <Stat label="Starting balance" value={known ? money(day.start) : 'Unavailable'} tone="text-white" />
        <Stat label="Day's net change" value={`${net > 0 ? '+' : ''}${money(net)}`} tone={net >= 0 ? 'text-[#2EFD7A]' : 'text-red-400'} />
        <Stat label={future ? 'Projected end' : 'Ending balance'} value={known ? money(day.end) : 'Unavailable'} tone={future ? 'text-[#D4D4D8]' : 'text-white'} />
      </div>

      <div className="mx-5 mb-5 bg-white/[0.03] rounded-2xl overflow-hidden">
        {!day || day.items.length === 0 ? (
          <div className="flex flex-col items-center py-8 text-white/60 gap-2">
            <Calendar className="w-5 h-5" />
            <p className="text-xs">No income or expenses on this day</p>
          </div>
        ) : (
          <div className="divide-y divide-white/10">
            {day.items.map((it) => {
              const meta = CATEGORY_META[it.category] || CATEGORY_META.other;
              const src = SOURCE[it.source];
              const income = it.type === 'income';
              return (
                <div key={it.id} className={`flex items-center gap-3 px-4 py-3 ${it.counted ? '' : 'opacity-50'}`}>
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0" style={{ background: `${meta.color}22` }}>
                    <meta.Icon className="w-4 h-4" style={{ color: meta.color }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold truncate">{it.name}</p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-semibold ${src.cls}`}>{src.label}</span>
                      {!it.counted && <span className="text-[10px] text-white/50">already in actuals</span>}
                    </div>
                  </div>
                  <span className={`text-sm font-bold ${income ? 'text-[#2EFD7A]' : 'text-white'}`}>
                    {income ? '+' : '-'}${Math.round(it.amount).toLocaleString()}
                  </span>
                  {it.source === 'scheduled' && (
                    <div className="flex items-center gap-2">
                      <button onClick={() => onEdit(it.event)} className="text-white/60 hover:text-white transition-colors"><Pencil className="w-3.5 h-3.5" /></button>
                      <button onClick={() => onDelete(it.event.id)} className="text-white/60 hover:text-red-400 transition-colors"><Trash2 className="w-3.5 h-3.5" /></button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </>
  );
}