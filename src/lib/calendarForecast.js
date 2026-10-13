import {
  addDays, addMonths, differenceInCalendarDays, eachDayOfInterval, format, getDaysInMonth, parseISO,
} from 'date-fns';

export const iso = (d) => format(d, 'yyyy-MM-dd');

const clampDate = (y, m, dom) =>
  new Date(y, m, Math.min(Math.max(dom || 1, 1), getDaysInMonth(new Date(y, m, 1))));

/** Expand FinancialEvent records into dated occurrences within [from, to]. */
export function expandEvents(events, from, to, today) {
  const out = [];
  const f = iso(from);
  const t = iso(to);
  const add = (ev, d) => {
    const s = iso(d);
    if (s >= f && s <= t) {
      out.push({ id: `${ev.id}-${s}`, date: s, name: ev.name, amount: ev.amount, type: ev.type, category: ev.category, event: ev });
    }
  };
  events.forEach((ev) => {
    const freq = ev.is_recurring === false ? 'once' : (ev.frequency || 'monthly');
    const anchor = ev.one_time_date
      ? parseISO(ev.one_time_date)
      : clampDate(today.getFullYear(), today.getMonth(), ev.day_of_month);
    if (freq === 'once') { add(ev, anchor); return; }
    if (freq === 'weekly' || freq === 'biweekly') {
      const step = freq === 'weekly' ? 7 : 14;
      const k = Math.ceil(differenceInCalendarDays(from, anchor) / step);
      for (let d = addDays(anchor, k * step); iso(d) <= t; d = addDays(d, step)) add(ev, d);
      return;
    }
    let cur = new Date(from.getFullYear(), from.getMonth(), 1);
    while (cur <= to) {
      if (freq !== 'yearly' || cur.getMonth() === (ev.one_time_date ? anchor.getMonth() : today.getMonth())) {
        add(ev, clampDate(cur.getFullYear(), cur.getMonth(), ev.day_of_month));
      }
      cur = addMonths(cur, 1);
    }
  });
  return out;
}

const median = (a) => [...a].sort((x, y) => x - y)[Math.floor(a.length / 2)];

/** Find predictable weekly / biweekly / monthly patterns in transaction history. */
export function inferRecurring(txs, today) {
  const groups = {};
  txs.forEach((tx) => {
    const name = (tx.merchant_name || tx.description || '').trim();
    if (!name || !tx.date) return;
    const key = `${tx.is_income ? 'i' : 'e'}|${name.toLowerCase()}`;
    (groups[key] = groups[key] || []).push({ ...tx, name });
  });
  const out = [];
  Object.values(groups).forEach((list) => {
    if (list.length < 2) return;
    const sorted = [...list].sort((a, b) => a.date.localeCompare(b.date));
    const gaps = [];
    for (let i = 1; i < sorted.length; i++) {
      gaps.push(differenceInCalendarDays(parseISO(sorted[i].date), parseISO(sorted[i - 1].date)));
    }
    const med = median(gaps);
    let cadence = null;
    if (med >= 6 && med <= 8) cadence = 7;
    else if (med >= 13 && med <= 15) cadence = 14;
    else if (med >= 27 && med <= 32) cadence = 'monthly';
    if (!cadence) return;
    const steady = gaps.filter((g) => Math.abs(g - med) <= 2).length / gaps.length;
    if (steady < 0.7) return;
    const last = sorted[sorted.length - 1];
    const age = differenceInCalendarDays(today, parseISO(last.date));
    if (age > (cadence === 'monthly' ? 75 : cadence * 3)) return;
    const recent = sorted.slice(-3);
    out.push({
      name: last.name,
      type: last.is_income ? 'income' : 'expense',
      category: last.category,
      amount: recent.reduce((s, t) => s + Math.abs(t.amount), 0) / recent.length,
      cadence,
      lastDate: last.date,
      dom: parseISO(last.date).getDate(),
    });
  });
  return out;
}

function matchesScheduled(p, events) {
  return events.some((ev) => {
    if (ev.type !== p.type) return false;
    const a = (ev.name || '').toLowerCase();
    const b = p.name.toLowerCase();
    if (a && (a.includes(b) || b.includes(a))) return true;
    const close = Math.abs(ev.amount - p.amount) / Math.max(ev.amount, p.amount, 1) <= 0.1;
    if (!close) return false;
    return p.cadence === 'monthly' ? Math.abs((ev.day_of_month || 0) - p.dom) <= 3 : true;
  });
}

function inferOccurrences(txs, events, from, to, today) {
  const out = [];
  const f = iso(from);
  const t = iso(to);
  inferRecurring(txs, today).filter((p) => !matchesScheduled(p, events)).forEach((p) => {
    const push = (d) => {
      const s = iso(d);
      if (s > p.lastDate && s >= f && s <= t) {
        out.push({ id: `p-${p.name}-${s}`, date: s, name: p.name, amount: p.amount, type: p.type, category: p.category });
      }
    };
    const last = parseISO(p.lastDate);
    if (p.cadence === 'monthly') {
      for (let cur = new Date(last.getFullYear(), last.getMonth() + 1, 1); cur <= to; cur = addMonths(cur, 1)) {
        push(clampDate(cur.getFullYear(), cur.getMonth(), p.dom));
      }
    } else {
      for (let d = addDays(last, p.cadence); iso(d) <= t; d = addDays(d, p.cadence)) push(d);
    }
  });
  return out;
}

/**
 * Daily net-worth timeline. Past days walk backward from the current balance using actual
 * transactions; future days walk forward using scheduled + predicted items.
 * Returns { [yyyy-MM-dd]: { items, income, expense, net, start, end, phase } }.
 * balance === null means net worth is unavailable (start/end stay null).
 */
export function buildTimeline({ events, txs, balance, rangeStart, rangeEnd, today }) {
  const todayIso = iso(today);
  const from = rangeStart < today ? rangeStart : today;
  const to = rangeEnd > today ? rangeEnd : today;
  const fromIso = iso(from);

  const byDate = {};
  const push = (date, item) => { (byDate[date] = byDate[date] || []).push(item); };

  txs.forEach((tx) => {
    if (tx.date && tx.date >= fromIso && tx.date <= todayIso) {
      push(tx.date, {
        id: `a-${tx.id}`, date: tx.date, source: 'actual', counted: true,
        name: tx.merchant_name || tx.description || 'Transaction',
        amount: Math.abs(tx.amount), type: tx.is_income ? 'income' : 'expense', category: tx.category,
      });
    }
  });
  expandEvents(events, from, to, today).forEach((o) => push(o.date, { ...o, source: 'scheduled', counted: o.date > todayIso }));
  inferOccurrences(txs, events, addDays(today, 1), to, today).forEach((o) => push(o.date, { ...o, source: 'predicted', counted: true }));

  const list = eachDayOfInterval({ start: from, end: to }).map((d) => {
    const items = byDate[iso(d)] || [];
    const counted = items.filter((i) => i.counted);
    const income = counted.filter((i) => i.type === 'income').reduce((s, i) => s + i.amount, 0);
    const expense = counted.filter((i) => i.type === 'expense').reduce((s, i) => s + i.amount, 0);
    return { date: iso(d), items, income, expense, net: income - expense };
  });

  const ti = list.findIndex((d) => d.date === todayIso);
  const known = balance != null;
  const ends = new Array(list.length).fill(0);
  ends[ti] = known ? balance : 0;
  for (let i = ti - 1; i >= 0; i--) ends[i] = ends[i + 1] - list[i + 1].net;
  for (let i = ti + 1; i < list.length; i++) ends[i] = ends[i - 1] + list[i].net;

  const out = {};
  list.forEach((d, i) => {
    out[d.date] = {
      ...d,
      start: known ? ends[i] - d.net : null,
      end: known ? ends[i] : null,
      phase: i < ti ? 'past' : i === ti ? 'today' : 'future',
    };
  });
  return out;
}