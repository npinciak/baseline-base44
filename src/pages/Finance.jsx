import { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { Link } from 'react-router-dom';
import { Wallet, TrendingUp, TrendingDown, Plus, RefreshCw, Zap } from 'lucide-react';

const CATEGORY_COLORS = {
  food_dining: '#00D4AA',
  shopping: '#FFB347',
  transportation: '#60A5FA',
  entertainment: '#C084FC',
  bills_utilities: '#F87171',
  health: '#34D399',
  travel: '#38BDF8',
  education: '#A78BFA',
  income: '#4ADE80',
  transfers: '#94A3B8',
  other: '#6B7280',
};

const CATEGORY_LABELS = {
  food_dining: 'Food & Dining',
  shopping: 'Shopping',
  transportation: 'Transportation',
  entertainment: 'Entertainment',
  bills_utilities: 'Bills & Utilities',
  health: 'Health',
  travel: 'Travel',
  education: 'Education',
  income: 'Income',
  transfers: 'Transfers',
  other: 'Other',
};

export default function Finance() {
  const [transactions, setTransactions] = useState([]);
  const [connections, setConnections] = useState([]);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeMonth, setActiveMonth] = useState(new Date().toISOString().slice(0, 7));
  const [showAddModal, setShowAddModal] = useState(false);
  const [newTx, setNewTx] = useState({ description: '', amount: '', category: 'food_dining', date: new Date().toISOString().slice(0, 10), is_income: false });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const init = async () => {
      const u = await base44.auth.me();
      setUser(u);
      const [txs, conns] = await Promise.all([
        base44.entities.Transaction.filter({ user_id: u.id }, '-date', 200),
        base44.entities.BankConnection.filter({ user_id: u.id }),
      ]);
      setTransactions(txs);
      setConnections(conns);
      setLoading(false);
    };
    init().catch(() => setLoading(false));
  }, []);

  const monthTxs = transactions.filter(tx => tx.date?.startsWith(activeMonth) && !tx.is_income);
  const monthIncome = transactions.filter(tx => tx.date?.startsWith(activeMonth) && tx.is_income);

  const totalSpend = monthTxs.reduce((sum, tx) => sum + Math.abs(tx.amount), 0);
  const totalIncome = monthIncome.reduce((sum, tx) => sum + Math.abs(tx.amount), 0);

  // Category breakdown
  const categoryTotals = {};
  monthTxs.forEach(tx => {
    categoryTotals[tx.category] = (categoryTotals[tx.category] || 0) + Math.abs(tx.amount);
  });
  const pieData = Object.entries(categoryTotals)
    .map(([cat, total]) => ({ name: CATEGORY_LABELS[cat] || cat, value: total, cat }))
    .sort((a, b) => b.value - a.value);

  // Last 6 months bar data
  const last6 = Array.from({ length: 6 }, (_, i) => {
    const d = new Date();
    d.setMonth(d.getMonth() - (5 - i));
    const key = d.toISOString().slice(0, 7);
    const total = transactions
      .filter(tx => tx.date?.startsWith(key) && !tx.is_income)
      .reduce((sum, tx) => sum + Math.abs(tx.amount), 0);
    return { month: d.toLocaleString('default', { month: 'short' }), total };
  });

  const handleAddTransaction = async () => {
    if (!user || !newTx.amount) return;
    setSaving(true);
    await base44.entities.Transaction.create({
      user_id: user.id,
      description: newTx.description || 'Manual entry',
      amount: parseFloat(newTx.amount),
      category: newTx.category,
      date: newTx.date,
      is_income: newTx.is_income,
    });
    const txs = await base44.entities.Transaction.filter({ user_id: user.id }, '-date', 200);
    setTransactions(txs);
    setShowAddModal(false);
    setSaving(false);
    setNewTx({ description: '', amount: '', category: 'food_dining', date: new Date().toISOString().slice(0, 10), is_income: false });
  };

  // Lesson recommendations based on spending
  const getRecommendation = () => {
    if (pieData.length === 0) return null;
    const topCat = pieData[0]?.cat;
    const recs = {
      food_dining: { label: 'Budgeting Basics', desc: 'Your top expense is dining — learn how to set a food budget', link: '/learn' },
      shopping: { label: 'Needs vs. Wants', desc: 'High shopping spend detected — learn to distinguish needs from wants', link: '/learn' },
      entertainment: { label: 'The 50/30/20 Rule', desc: 'Optimize your entertainment budget with this proven framework', link: '/learn' },
    };
    return recs[topCat] || { label: 'Smart Budgeting', desc: 'Level up your money management skills', link: '/learn' };
  };

  const rec = getRecommendation();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-8 h-8 border-4 border-border border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-display font-extrabold mb-1">Finance Tracker</h1>
          <p className="text-muted-foreground">Your spending at a glance</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-primary text-primary-foreground rounded-xl font-semibold text-sm hover:bg-primary/90 transition-all duration-200"
        >
          <Plus className="w-4 h-4" /> Add
        </button>
      </div>

      {/* Smart lesson rec */}
      {rec && transactions.length > 0 && (
        <Link
          to={rec.link}
          className="flex items-center gap-4 bg-primary/10 border border-primary/25 rounded-2xl p-4 mb-6 hover:border-primary/50 transition-all duration-200 group"
        >
          <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center shrink-0">
            <Zap className="w-5 h-5 text-primary" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold text-primary uppercase tracking-wider mb-0.5">Lesson Recommendation</p>
            <p className="text-sm font-semibold text-foreground">{rec.label}</p>
            <p className="text-xs text-muted-foreground truncate">{rec.desc}</p>
          </div>
          <TrendingUp className="w-4 h-4 text-primary group-hover:translate-x-0.5 transition-transform" />
        </Link>
      )}

      {/* Month selector */}
      <div className="flex items-center gap-2 mb-6 overflow-x-auto pb-1">
        {Array.from({ length: 6 }, (_, i) => {
          const d = new Date();
          d.setMonth(d.getMonth() - (5 - i));
          const key = d.toISOString().slice(0, 7);
          const label = d.toLocaleString('default', { month: 'short', year: '2-digit' });
          return (
            <button
              key={key}
              onClick={() => setActiveMonth(key)}
              className={`px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all duration-200 ${
                activeMonth === key
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-secondary text-muted-foreground hover:text-foreground'
              }`}
            >
              {label}
            </button>
          );
        })}
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="bg-card border border-border rounded-2xl p-5">
          <div className="flex items-center gap-2 mb-3">
            <TrendingDown className="w-4 h-4 text-red-400" />
            <span className="text-sm text-muted-foreground">Total Spent</span>
          </div>
          <p className="text-3xl font-display font-extrabold">${totalSpend.toFixed(2)}</p>
        </div>
        <div className="bg-card border border-border rounded-2xl p-5">
          <div className="flex items-center gap-2 mb-3">
            <TrendingUp className="w-4 h-4 text-green-400" />
            <span className="text-sm text-muted-foreground">Total Income</span>
          </div>
          <p className="text-3xl font-display font-extrabold text-green-400">${totalIncome.toFixed(2)}</p>
        </div>
      </div>

      {transactions.length === 0 ? (
        /* Empty state */
        <div className="bg-card border border-dashed border-border rounded-3xl p-12 text-center">
          <div className="w-16 h-16 bg-secondary rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Wallet className="w-8 h-8 text-muted-foreground" />
          </div>
          <h3 className="text-xl font-heading font-bold mb-2">No transactions yet</h3>
          <p className="text-muted-foreground text-sm mb-6">Add transactions manually or connect your bank account to import them automatically.</p>
          <button
            onClick={() => setShowAddModal(true)}
            className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-xl font-semibold hover:bg-primary/90 transition-all"
          >
            <Plus className="w-4 h-4" /> Add Transaction
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Donut chart */}
          {pieData.length > 0 && (
            <div className="bg-card border border-border rounded-2xl p-6">
              <h3 className="text-base font-heading font-semibold mb-4">Spending by Category</h3>
              <div className="flex flex-col md:flex-row items-center gap-6">
                <ResponsiveContainer width="100%" height={200}>
                  <PieChart>
                    <Pie data={pieData} cx="50%" cy="50%" innerRadius={55} outerRadius={90} dataKey="value" strokeWidth={0}>
                      {pieData.map((entry, i) => (
                        <Cell key={i} fill={CATEGORY_COLORS[entry.cat] || '#6B7280'} />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(val) => [`$${val.toFixed(2)}`, '']}
                      contentStyle={{ background: 'hsl(222,40%,9%)', border: '1px solid hsl(222,25%,16%)', borderRadius: '12px', color: 'hsl(210,40%,96%)' }}
                    />
                  </PieChart>
                </ResponsiveContainer>
                <div className="w-full md:w-auto space-y-2">
                  {pieData.slice(0, 6).map((item) => (
                    <div key={item.cat} className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full shrink-0" style={{ background: CATEGORY_COLORS[item.cat] || '#6B7280' }} />
                      <span className="text-xs text-muted-foreground flex-1 min-w-0 truncate">{item.name}</span>
                      <span className="text-xs font-semibold">${item.value.toFixed(0)}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Bar chart */}
          <div className="bg-card border border-border rounded-2xl p-6">
            <h3 className="text-base font-heading font-semibold mb-4">6-Month Spending Trend</h3>
            <ResponsiveContainer width="100%" height={160}>
              <BarChart data={last6} barSize={28}>
                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: 'hsl(215,20%,55%)', fontSize: 12 }} />
                <YAxis hide />
                <Tooltip
                  formatter={(val) => [`$${val.toFixed(2)}`, 'Spent']}
                  contentStyle={{ background: 'hsl(222,40%,9%)', border: '1px solid hsl(222,25%,16%)', borderRadius: '12px', color: 'hsl(210,40%,96%)' }}
                />
                <Bar dataKey="total" fill="hsl(168,100%,42%)" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Recent transactions */}
          <div className="bg-card border border-border rounded-2xl p-6">
            <h3 className="text-base font-heading font-semibold mb-4">Recent Transactions</h3>
            <div className="space-y-3">
              {transactions.slice(0, 15).map((tx) => (
                <div key={tx.id} className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full flex items-center justify-center shrink-0" style={{ background: `${CATEGORY_COLORS[tx.category]}22` }}>
                    <div className="w-3 h-3 rounded-full" style={{ background: CATEGORY_COLORS[tx.category] }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{tx.description || tx.merchant_name || 'Transaction'}</p>
                    <p className="text-xs text-muted-foreground">{CATEGORY_LABELS[tx.category]} · {tx.date}</p>
                  </div>
                  <span className={`text-sm font-semibold ${tx.is_income ? 'text-green-400' : 'text-foreground'}`}>
                    {tx.is_income ? '+' : '-'}${Math.abs(tx.amount).toFixed(2)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Add transaction modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm flex items-end md:items-center justify-center z-50 p-4">
          <div className="bg-card border border-border rounded-3xl p-6 w-full max-w-md">
            <h3 className="text-lg font-heading font-bold mb-5">Add Transaction</h3>
            <div className="space-y-4">
              <div>
                <label className="text-xs text-muted-foreground font-medium mb-1 block">Description</label>
                <input
                  value={newTx.description}
                  onChange={e => setNewTx(p => ({ ...p, description: e.target.value }))}
                  placeholder="e.g. Lunch at Chipotle"
                  className="w-full bg-secondary border border-border rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-primary transition-colors"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-muted-foreground font-medium mb-1 block">Amount ($)</label>
                  <input
                    type="number"
                    value={newTx.amount}
                    onChange={e => setNewTx(p => ({ ...p, amount: e.target.value }))}
                    placeholder="0.00"
                    className="w-full bg-secondary border border-border rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-primary transition-colors"
                  />
                </div>
                <div>
                  <label className="text-xs text-muted-foreground font-medium mb-1 block">Date</label>
                  <input
                    type="date"
                    value={newTx.date}
                    onChange={e => setNewTx(p => ({ ...p, date: e.target.value }))}
                    className="w-full bg-secondary border border-border rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-primary transition-colors"
                  />
                </div>
              </div>
              <div>
                <label className="text-xs text-muted-foreground font-medium mb-1 block">Category</label>
                <select
                  value={newTx.category}
                  onChange={e => setNewTx(p => ({ ...p, category: e.target.value }))}
                  className="w-full bg-secondary border border-border rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-primary transition-colors"
                >
                  {Object.entries(CATEGORY_LABELS).map(([val, label]) => (
                    <option key={val} value={val}>{label}</option>
                  ))}
                </select>
              </div>
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={newTx.is_income}
                  onChange={e => setNewTx(p => ({ ...p, is_income: e.target.checked, category: e.target.checked ? 'income' : 'food_dining' }))}
                  className="rounded"
                />
                <span className="text-sm font-medium">This is income</span>
              </label>
            </div>
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowAddModal(false)}
                className="flex-1 py-3 bg-secondary text-foreground rounded-xl font-semibold hover:bg-secondary/80 transition-all"
              >
                Cancel
              </button>
              <button
                onClick={handleAddTransaction}
                disabled={saving}
                className="flex-1 py-3 bg-primary text-primary-foreground rounded-xl font-semibold hover:bg-primary/90 transition-all disabled:opacity-50"
              >
                {saving ? 'Saving...' : 'Add'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}