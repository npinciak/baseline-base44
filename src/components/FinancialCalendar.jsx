import { useState, useEffect, useMemo } from 'react';
import { base44 } from '@/api/base44Client';
import { Plus, ChevronLeft, ChevronRight, Info, CalendarDays } from 'lucide-react';
import { PANEL_SHELL } from '@/components/money/FeaturePanel';
import {
  format, startOfMonth, endOfMonth, startOfWeek, endOfWeek, eachDayOfInterval, addMonths, parseISO,
} from 'date-fns';
import { buildTimeline, iso } from '@/lib/calendarForecast';
import { money } from '@/components/calendar/categoryMeta';
import CalendarGrid from '@/components/calendar/CalendarGrid';
import DayDetail from '@/components/calendar/DayDetail';
import EventFormModal from '@/components/calendar/EventFormModal';

const EMPTY_FORM = { name: '', amount: '', type: 'expense', category: 'bills_utilities', day_of_month: 1, is_recurring: true, frequency: 'monthly' };

/**
 * balance: current net worth (null = unavailable). txs: normalized transactions.
 * Past days use actual transactions; future days use scheduled events + predicted patterns.
 */
export default function FinancialCalendar({ balance = null, txs = [], isSample = false, readOnlyPreview = false }) {
  const [today] = useState(new Date());
  const todayIso = iso(today);
  const [userId, setUserId] = useState(null);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [month, setMonth] = useState(startOfMonth(today));
  const [selected, setSelected] = useState(todayIso);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [editingId, setEditingId] = useState(null);

  useEffect(() => {
    if (readOnlyPreview) { setLoading(false); return; }
    base44.auth.me().then((u) => {
      setUserId(u.id);
      return base44.entities.FinancialEvent.filter({ user_id: u.id });
    }).then(setEvents).catch(() => setEvents([])).finally(() => setLoading(false));
  }, [readOnlyPreview]);

  const reload = () => base44.entities.FinancialEvent.filter({ user_id: userId }).then(setEvents);

  const rangeStart = startOfWeek(startOfMonth(month));
  const rangeEnd = endOfWeek(endOfMonth(month));
  const weeks = useMemo(() => {
    const all = eachDayOfInterval({ start: rangeStart, end: rangeEnd });
    return Array.from({ length: all.length / 7 }, (_, i) => all.slice(i * 7, i * 7 + 7));
  }, [month]); // eslint-disable-line react-hooks/exhaustive-deps

  const timeline = useMemo(
    () => buildTimeline({ events, txs, balance, rangeStart, rangeEnd, today }),
    [events, txs, balance, month] // eslint-disable-line react-hooks/exhaustive-deps
  );

  const monthEndKey = iso(endOfMonth(month));
  const monthEnd = timeline[monthEndKey];

  const changeMonth = (delta) => {
    const next = addMonths(month, delta);
    setMonth(next);
    setSelected(iso(next.getMonth() === today.getMonth() && next.getFullYear() === today.getFullYear() ? today : next));
  };

  const openNew = () => {
    setForm({ ...EMPTY_FORM, day_of_month: parseISO(selected).getDate() });
    setEditingId(null);
    setShowForm(true);
  };

  const openEdit = (ev) => {
    setForm({ name: ev.name, amount: ev.amount, type: ev.type, category: ev.category, day_of_month: ev.day_of_month, is_recurring: ev.is_recurring, frequency: ev.frequency || 'monthly' });
    setEditingId(ev.id);
    setShowForm(true);
  };

  const closeForm = () => { setShowForm(false); setEditingId(null); };

  const handleSave = async () => {
    if (!form.name || !form.amount) return;
    setSaving(true);
    const payload = { ...form, amount: parseFloat(form.amount), day_of_month: parseInt(form.day_of_month), user_id: userId };
    if (editingId) await base44.entities.FinancialEvent.update(editingId, payload);
    else await base44.entities.FinancialEvent.create(payload);
    await reload();
    closeForm();
    setForm(EMPTY_FORM);
    setSaving(false);
  };

  const handleDelete = async (id) => {
    await base44.entities.FinancialEvent.delete(id);
    await reload();
  };

  if (loading) {
    return (
      <div className={`${PANEL_SHELL} p-6`}>
        <div className="w-6 h-6 border-2 border-white/10 border-t-[#2EFD7A] rounded-full animate-spin mx-auto" />
      </div>
    );
  }

  const known = balance != null;

  return (
    <div className={PANEL_SHELL}>
      <div className="flex items-center justify-between gap-3 px-5 sm:px-7 pt-5 sm:pt-7 pb-3">
        <div className="min-w-0">
          <p className="flex items-center gap-2 text-[11px] uppercase tracking-[0.25em] text-[#2EFD7A] font-semibold mb-1"><CalendarDays className="w-4 h-4" /> Financial calendar</p>
          <div className="flex items-center gap-1 -ml-1.5">
            <button onClick={() => changeMonth(-1)} className="p-1 text-white/60 hover:text-white"><ChevronLeft className="w-4 h-4" /></button>
            <span className="text-xs text-white/70 w-28 text-center">{format(month, 'MMMM yyyy')}</span>
            <button onClick={() => changeMonth(1)} className="p-1 text-white/60 hover:text-white"><ChevronRight className="w-4 h-4" /></button>
          </div>
        </div>
        <button onClick={openNew} className="flex items-center gap-1.5 px-3 py-1.5 bg-[#2EFD7A] text-black rounded-xl text-xs font-semibold hover:bg-[#2EFD7A]/90 transition-all shrink-0">
          <Plus className="w-3.5 h-3.5" /> Add Event
        </button>
      </div>

      <div className="grid grid-cols-2 gap-3 px-5 pb-3">
        <div className="bg-white/[0.05] rounded-xl p-3">
          <p className="text-xs text-white/60 mb-1">Net worth today{isSample ? ' (sample)' : ''}</p>
          <p className="text-lg font-display font-extrabold text-white">{known ? money(balance) : 'Unavailable'}</p>
        </div>
        <div className="bg-white/[0.05] rounded-xl p-3">
          <p className="text-xs text-white/60 mb-1">Projected {format(endOfMonth(month), 'MMM d')}</p>
          <p className="text-lg font-display font-extrabold text-[#D4D4D8]">{known && monthEnd ? money(monthEnd.end) : 'Unavailable'}</p>
        </div>
      </div>

      {!known && (
        <div className="mx-5 mb-3 flex items-start gap-2 rounded-xl border border-amber-400/30 bg-amber-400/10 px-3 py-2 text-xs text-amber-200">
          <Info className="w-4 h-4 shrink-0 mt-px" />
          Link a bank account to see your daily net worth. Showing scheduled and predicted items only.
        </div>
      )}

      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 px-5 pb-3 text-[11px] text-white/60">
        <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-white/60" /> Actual balance</span>
        <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-[#D4D4D8]" /> Projected balance</span>
        <span className="flex items-center gap-1.5"><span className="w-1.5 h-1.5 rounded-full bg-[#2EFD7A]" /> Income</span>
        <span className="flex items-center gap-1.5"><span className="w-1.5 h-1.5 rounded-full bg-red-400" /> Expense</span>
      </div>

      <CalendarGrid weeks={weeks} month={month} timeline={timeline} selected={selected} todayIso={todayIso} onSelect={setSelected} />

      <div className="mx-5 border-t border-white/10" />
      <div className="px-5 pt-4 pb-3 flex items-center justify-between">
        <p className="text-sm font-heading font-bold text-white">{format(parseISO(selected), 'EEEE, MMM d, yyyy')}</p>
        {timeline[selected] && (
          <span className="text-[11px] text-white/60">
            {timeline[selected].phase === 'future' ? 'Forecast' : timeline[selected].phase === 'today' ? 'Today' : 'Actual'}
          </span>
        )}
      </div>

      <DayDetail day={timeline[selected]} onEdit={openEdit} onDelete={handleDelete} />

      {showForm && (
        <EventFormModal form={form} setForm={setForm} editing={!!editingId} saving={saving} onSave={handleSave} onClose={closeForm} />
      )}
    </div>
  );
}