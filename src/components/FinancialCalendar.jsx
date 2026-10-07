import { useState, useEffect, useMemo } from 'react';
import { base44 } from '@/api/base44Client';
import {
  Wallet, TrendingUp, TrendingDown, Plus, X, Calendar,
  Repeat, Zap, ShoppingBag, Car, Film, Heart, Plane,
  BookOpen, PiggyBank, DollarSign, MoreHorizontal, Pencil, Trash2
} from 'lucide-react';
import {
  format, getDaysInMonth, startOfMonth, getDay,
  eachDayOfInterval, startOfWeek, endOfWeek, addWeeks,
  isSameDay, isSameMonth, parseISO
} from 'date-fns';

const CATEGORY_META = {
  bills_utilities: { label: 'Bills & Utilities', Icon: Zap,        color: '#F87171' },
  food_dining:     { label: 'Food & Dining',     Icon: ShoppingBag, color: '#00D4AA' },
  shopping:        { label: 'Shopping',           Icon: ShoppingBag, color: '#FFB347' },
  transportation:  { label: 'Transportation',     Icon: Car,         color: '#60A5FA' },
  entertainment:   { label: 'Entertainment',      Icon: Film,        color: '#C084FC' },
  health:          { label: 'Health',             Icon: Heart,       color: '#34D399' },
  travel:          { label: 'Travel',             Icon: Plane,       color: '#38BDF8' },
  education:       { label: 'Education',          Icon: BookOpen,    color: '#A78BFA' },
  savings:         { label: 'Savings',            Icon: PiggyBank,   color: '#FCD34D' },
  income:          { label: 'Income',             Icon: DollarSign,  color: '#4ADE80' },
  other:           { label: 'Other',              Icon: MoreHorizontal, color: '#6B7280' },
};

const DAYS = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
const EMPTY_FORM = { name: '', amount: '', type: 'expense', category: 'bills_utilities', day_of_month: 1, is_recurring: true, frequency: 'monthly' };

function ordinal(n) {
  const s = ['th', 'st', 'nd', 'rd'];
  const v = n % 100;
  return n + (s[(v - 20) % 10] || s[v] || s[0]);
}

/** Get all events that fire on a specific day-of-month */
function getEventsForDay(events, day) {
  return events.filter(e => e.day_of_month === day);
}

/** Build heatmap: for each day 1-31 in the month, net flow */
function buildMonthHeatmap(events, daysInMonth) {
  const map = {};
  for (let d = 1; d <= daysInMonth; d++) {
    const dayEvents = getEventsForDay(events, d);
    const income  = dayEvents.filter(e => e.type === 'income').reduce((s, e) => s + e.amount, 0);
    const expense = dayEvents.filter(e => e.type === 'expense').reduce((s, e) => s + e.amount, 0);
    map[d] = { income, expense, net: income - expense, count: dayEvents.length };
  }
  return map;
}

export default function FinancialCalendar() {
  const [userId, setUserId]         = useState(null);
  const [events, setEvents]         = useState([]);
  const [loading, setLoading]       = useState(true);
  const [tab, setTab]               = useState('expenses');        // 'expenses' | 'incomes'
  const [selectedDay, setSelectedDay] = useState(new Date().getDate());
  const [today]                     = useState(new Date());
  const [showForm, setShowForm]     = useState(false);
  const [form, setForm]             = useState(EMPTY_FORM);
  const [saving, setSaving]         = useState(false);
  const [editingId, setEditingId]   = useState(null);

  const daysInMonth   = getDaysInMonth(today);
  const monthStart    = startOfMonth(today);
  const firstDayOfWeek = getDay(monthStart); // 0=Sun

  // Build calendar grid rows (by week)
  const calendarWeeks = useMemo(() => {
    const start = startOfWeek(monthStart);
    const end   = endOfWeek(addWeeks(monthStart, 5));
    const allDays = eachDayOfInterval({ start, end });
    const weeks = [];
    for (let i = 0; i < allDays.length; i += 7) {
      weeks.push(allDays.slice(i, i + 7));
    }
    // Trim trailing weeks that are entirely outside this month
    return weeks.filter(week => week.some(d => isSameMonth(d, today)));
  }, [today]);

  const heatmap = useMemo(() => buildMonthHeatmap(events, daysInMonth), [events, daysInMonth]);

  useEffect(() => {
    base44.auth.me().then(u => {
      setUserId(u.id);
      return base44.entities.FinancialEvent.filter({ user_id: u.id });
    }).then(setEvents).catch(() => setEvents([])).finally(() => setLoading(false));
  }, []);

  const reload = () =>
    base44.entities.FinancialEvent.filter({ user_id: userId }).then(setEvents);

  // Summary stats for selected day
  const dayEvents   = getEventsForDay(events, selectedDay);
  const dayIncome   = dayEvents.filter(e => e.type === 'income').reduce((s, e) => s + e.amount, 0);
  const dayExpense  = dayEvents.filter(e => e.type === 'expense').reduce((s, e) => s + e.amount, 0);
  const dayNet      = dayIncome - dayExpense;

  // Monthly totals for "Disposable Income" estimate
  const monthlyIncome  = events.filter(e => e.type === 'income').reduce((s, e) => s + e.amount, 0);
  const monthlyExpense = events.filter(e => e.type === 'expense').reduce((s, e) => s + e.amount, 0);
  const disposable     = monthlyIncome - monthlyExpense;

  const visibleDayEvents = dayEvents.filter(e =>
    tab === 'expenses' ? e.type === 'expense' : e.type === 'income'
  );

  const handleSave = async () => {
    if (!form.name || !form.amount) return;
    setSaving(true);
    const payload = { ...form, amount: parseFloat(form.amount), day_of_month: parseInt(form.day_of_month), user_id: userId };
    if (editingId) {
      await base44.entities.FinancialEvent.update(editingId, payload);
    } else {
      await base44.entities.FinancialEvent.create(payload);
    }
    await reload();
    setShowForm(false);
    setEditingId(null);
    setForm(EMPTY_FORM);
    setSaving(false);
  };

  const handleDelete = async (id) => {
    await base44.entities.FinancialEvent.delete(id);
    await reload();
  };

  const openEdit = (ev) => {
    setForm({ name: ev.name, amount: ev.amount, type: ev.type, category: ev.category, day_of_month: ev.day_of_month, is_recurring: ev.is_recurring, frequency: ev.frequency || 'monthly' });
    setEditingId(ev.id);
    setShowForm(true);
  };

  if (loading) {
    return (
      <div className="bg-white/[0.03] border border-white/10 backdrop-blur-sm rounded-2xl p-6">
        <div className="w-6 h-6 border-2 border-white/10 border-t-[#2EFD7A] rounded-full animate-spin mx-auto" />
      </div>
    );
  }

  return (
    <div className="bg-white/[0.03] border border-white/10 backdrop-blur-sm rounded-2xl overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-5 pt-5 pb-3">
        <div>
          <h2 className="text-lg font-heading font-bold text-white">Financial Calendar</h2>
          <p className="text-xs text-white/60">{format(today, 'MMMM yyyy')}</p>
        </div>
        <button
          onClick={() => { setForm({ ...EMPTY_FORM, day_of_month: selectedDay }); setEditingId(null); setShowForm(true); }}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-[#2EFD7A] text-black rounded-xl text-xs font-semibold hover:bg-[#2EFD7A]/90 transition-all"
        >
          <Plus className="w-3.5 h-3.5" /> Add Event
        </button>
      </div>

      {/* Tab toggle */}
      <div className="flex gap-2 px-5 pb-4">
        {['expenses', 'incomes'].map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`flex-1 py-2 rounded-xl text-sm font-semibold capitalize transition-all ${tab === t ? 'bg-[#2EFD7A] text-black' : 'bg-white/[0.05] text-white/60 hover:text-white'}`}
          >
            {t}
          </button>
        ))}
      </div>

      {/* Calendar grid */}
      <div className="px-5 pb-4">
        {/* Day-of-week headers */}
        <div className="grid grid-cols-7 mb-1">
          {DAYS.map((d, i) => (
            <div key={i} className="text-center text-xs font-semibold text-white/60 py-1">{d}</div>
          ))}
        </div>
        {/* Weeks */}
        {calendarWeeks.map((week, wi) => (
          <div key={wi} className="grid grid-cols-7">
            {week.map((day, di) => {
              const inMonth   = isSameMonth(day, today);
              const isToday   = isSameDay(day, today);
              const d         = day.getDate();
              const isSelected = inMonth && d === selectedDay;
              const heat      = inMonth ? heatmap[d] : null;
              const hasEvents = heat && heat.count > 0;

              let dotColor = null;
              if (hasEvents) {
                dotColor = heat.net >= 0 ? '#00D4AA' : '#F87171';
              }

              return (
                <button
                  key={di}
                  onClick={() => inMonth && setSelectedDay(d)}
                  disabled={!inMonth}
                  className={`relative flex flex-col items-center justify-center py-2 rounded-xl transition-all
                    ${!inMonth ? 'opacity-20 cursor-default' : 'hover:bg-white/10 cursor-pointer'}
                    ${isSelected ? 'bg-[#2EFD7A] text-black hover:bg-[#2EFD7A]' : ''}
                    ${isToday && !isSelected ? 'ring-1 ring-[#2EFD7A]/60' : ''}
                  `}
                >
                  <span className={`text-sm font-semibold leading-none ${isSelected ? 'text-black' : isToday ? 'text-[#2EFD7A]' : ''}`}>
                    {d}
                  </span>
                  {dotColor && !isSelected && (
                    <span className="absolute bottom-1 w-1.5 h-1.5 rounded-full" style={{ background: dotColor }} />
                  )}
                </button>
              );
            })}
          </div>
        ))}
      </div>

      <div className="mx-5 border-t border-white/10" />

      {/* Day header */}
      <div className="px-5 pt-4 pb-3">
        <p className="text-sm font-heading font-bold text-white">{ordinal(selectedDay)} {format(today, 'MMM, yyyy')}</p>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 gap-3 px-5 pb-4">
        <div className="bg-white/[0.05] rounded-xl p-4">
          <p className="text-xs text-white/60 mb-1">Monthly Surplus</p>
          <p className={`text-xl font-display font-extrabold ${disposable >= 0 ? 'text-[#2EFD7A]' : 'text-red-400'}`}>
            {disposable >= 0 ? '+' : '-'}${Math.abs(disposable).toLocaleString()}
          </p>
        </div>
        <div className="bg-white/[0.05] rounded-xl p-4">
          <p className="text-xs text-white/60 mb-1">Day's Net Change</p>
          <p className={`text-xl font-display font-extrabold ${dayNet >= 0 ? 'text-[#2EFD7A]' : 'text-red-400'}`}>
            {dayNet === 0 ? '$0' : `${dayNet > 0 ? '+' : '-'}$${Math.abs(dayNet).toLocaleString()}`}
          </p>
        </div>
      </div>

      {/* Events list for selected day */}
      <div className="mx-5 mb-5 bg-white/[0.03] rounded-2xl overflow-hidden">
        <div className="px-4 py-3 border-b border-white/10">
          <p className="text-xs font-semibold text-white/60 uppercase tracking-wider">
            Financial Events · {ordinal(selectedDay)} {format(today, 'MMM yyyy')}
          </p>
        </div>
        {visibleDayEvents.length === 0 ? (
          <div className="flex flex-col items-center py-8 text-white/60 gap-2">
            <Calendar className="w-5 h-5" />
            <p className="text-xs">No {tab} on this day</p>
          </div>
        ) : (
          <div className="divide-y divide-white/10">
            {visibleDayEvents.map(ev => {
              const meta = CATEGORY_META[ev.category] || CATEGORY_META.other;
              const { Icon } = meta;
              return (
                <div key={ev.id} className="flex items-center gap-3 px-4 py-3">
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0" style={{ background: `${meta.color}22` }}>
                    <Icon className="w-4 h-4" style={{ color: meta.color }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold truncate">{ev.name}</p>
                    <p className="text-xs text-white/60">{meta.label}{ev.is_recurring ? ' · Recurring' : ''}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`text-sm font-bold ${ev.type === 'income' ? 'text-[#2EFD7A]' : 'text-white'}`}>
                      {ev.type === 'income' ? '+' : ''} ${ev.amount.toLocaleString()}
                    </span>
                    <button onClick={() => openEdit(ev)} className="text-white/60 hover:text-white transition-colors">
                      <Pencil className="w-3.5 h-3.5" />
                    </button>
                    <button onClick={() => handleDelete(ev.id)} className="text-white/60 hover:text-red-400 transition-colors">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Add/Edit Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-end md:items-center justify-center z-50 p-4">
          <div className="bg-neutral-950 border border-white/10 rounded-3xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-lg font-heading font-bold">{editingId ? 'Edit Event' : 'New Financial Event'}</h3>
              <button onClick={() => { setShowForm(false); setEditingId(null); }} className="text-white/60 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              {/* Type toggle */}
              <div className="flex gap-2">
                {['expense', 'income'].map(t => (
                  <button key={t} onClick={() => setForm(p => ({ ...p, type: t }))}
                    className={`flex-1 py-2 rounded-xl text-sm font-semibold capitalize transition-all ${form.type === t ? 'bg-[#2EFD7A] text-black' : 'bg-white/[0.05] text-white/60'}`}>
                    {t}
                  </button>
                ))}
              </div>

              <div>
                <label className="text-xs text-white/60 font-medium mb-1 block">Name</label>
                <input value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
                  placeholder="e.g. Rent, Netflix, Salary"
                  className="w-full bg-white/[0.05] border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#2EFD7A] transition-colors" />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-white/60 font-medium mb-1 block">Amount ($)</label>
                  <input type="number" value={form.amount} onChange={e => setForm(p => ({ ...p, amount: e.target.value }))}
                    placeholder="0.00"
                    className="w-full bg-white/[0.05] border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#2EFD7A] transition-colors" />
                </div>
                <div>
                  <label className="text-xs text-white/60 font-medium mb-1 block">Day of Month</label>
                  <input type="number" min="1" max="31" value={form.day_of_month} onChange={e => setForm(p => ({ ...p, day_of_month: e.target.value }))}
                    className="w-full bg-white/[0.05] border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#2EFD7A] transition-colors" />
                </div>
              </div>

              <div>
                <label className="text-xs text-white/60 font-medium mb-1 block">Category</label>
                <select value={form.category} onChange={e => setForm(p => ({ ...p, category: e.target.value }))}
                  className="w-full bg-white/[0.05] border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#2EFD7A] transition-colors">
                  {Object.entries(CATEGORY_META).map(([val, { label }]) => (
                    <option key={val} value={val}>{label}</option>
                  ))}
                </select>
              </div>

              <div className="flex items-center gap-3">
                <button onClick={() => setForm(p => ({ ...p, is_recurring: !p.is_recurring }))}
                  className={`relative w-10 h-5 rounded-full transition-all ${form.is_recurring ? 'bg-[#2EFD7A]' : 'bg-white/[0.05] border border-white/10'}`}>
                  <span className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-all ${form.is_recurring ? 'left-5' : 'left-0.5'}`} />
                </button>
                <span className="text-sm text-white/60">Recurring</span>
                {form.is_recurring && (
                  <select value={form.frequency} onChange={e => setForm(p => ({ ...p, frequency: e.target.value }))}
                    className="ml-auto bg-white/[0.05] border border-white/10 rounded-lg px-3 py-1 text-xs focus:outline-none focus:border-[#2EFD7A] transition-colors">
                    {['monthly', 'weekly', 'biweekly', 'yearly'].map(f => (
                      <option key={f} value={f}>{f}</option>
                    ))}
                  </select>
                )}
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button onClick={() => { setShowForm(false); setEditingId(null); }}
                className="flex-1 py-3 bg-white/[0.05] text-white rounded-xl font-semibold hover:bg-white/[0.05]/80 transition-all">
                Cancel
              </button>
              <button onClick={handleSave} disabled={saving || !form.name || !form.amount}
                className="flex-1 py-3 bg-[#2EFD7A] text-black rounded-xl font-semibold hover:bg-[#2EFD7A]/90 transition-all disabled:opacity-50">
                {saving ? 'Saving...' : editingId ? 'Save Changes' : 'Add Event'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}