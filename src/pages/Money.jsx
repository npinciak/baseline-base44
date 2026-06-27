import { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import {
  Wallet, RefreshCw, ChevronDown, ChevronUp,
  TrendingUp, TrendingDown, Repeat, Tag, Plus, X
} from 'lucide-react';

const CATEGORY_COLORS = {
  food_dining: '#00D4AA', shopping: '#FFB347', transportation: '#60A5FA',
  entertainment: '#C084FC', bills_utilities: '#F87171', health: '#34D399',
  travel: '#38BDF8', education: '#A78BFA', income: '#4ADE80',
  transfers: '#94A3B8', other: '#6B7280',
};

const CATEGORY_LABELS = {
  food_dining: 'Food & Dining', shopping: 'Shopping', transportation: 'Transportation',
  entertainment: 'Entertainment', bills_utilities: 'Bills & Utilities', health: 'Health',
  travel: 'Travel', education: 'Education', income: 'Income',
  transfers: 'Transfers', other: 'Other',
};

function detectRecurring(transactions) {
  // Group by description similarity and find those appearing monthly
  const groups = {};
  transactions.filter(tx => !tx.is_income).forEach(tx => {
    const key = (tx.merchant_name || tx.description || '').toLowerCase().trim();
    if (!key) return;
    if (!groups[key]) groups[key] = [];
    groups[key].push(tx);
  });
  return Object.entries(groups)
    .filter(([, txs]) => txs.length >= 2)
    .map(([name, txs]) => {
      const avg = txs.reduce((s, t) => s + Math.abs(t.amount), 0) / txs.length;
      return { name: txs[0].merchant_name || txs[0].description || name, avg, count: txs.length, category: txs[0].category };
    })
    .sort((a, b) => b.avg - a.avg)
    .slice(0, 10);
}

export default function Money() {
  const [user, setUser] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [txFilter, setTxFilter] = useState('all');
  const [expandedCategory, setExpandedCategory] = useState(null);

  useEffect(() => {
    const init = async () => {
      const u = await base44.auth.me();
      setUser(u);
      const txs = await base44.entities.Transaction.filter({ user_id: u.id }, '-date', 500);
      setTransactions(txs);
      setLoading(false);
    };
    init().catch(() => setLoading(false));
  }, []);

  // Category totals (expenses only)
  const expenses = transactions.filter(tx => !tx.is_income);
  const categoryTotals = {};
  expenses.forEach(tx => {
    categoryTotals[tx.category] = (categoryTotals[tx.category] || 0) + Math.abs(tx.amount);
  });
  const categoryList = Object.entries(categoryTotals)
    .map(([cat, total]) => ({ cat, total, label: CATEGORY_LABELS[cat] || cat, color: CATEGORY_COLORS[cat] || '#6B7280' }))
    .sort((a, b) => b.total - a.total);
  const grandTotal = categoryList.reduce((s, c) => s + c.total, 0);

  // Recurring
  const recurring = detectRecurring(transactions);

  // Filtered transactions
  const filteredTxs = transactions.filter(tx => {
    if (txFilter === 'income') return tx.is_income;
    if (txFilter === 'expenses') return !tx.is_income;
    return true;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-8 h-8 border-4 border-border border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 space-y-8">
      <div>
        <h1 className="text-3xl font-display font-extrabold mb-1">Money</h1>
        <p className="text-muted-foreground">Your full financial picture</p>
      </div>

      {/* Categories */}
      <section>
        <h2 className="text-lg font-heading font-bold mb-4 flex items-center gap-2">
          <Tag className="w-5 h-5 text-primary" /> Categories
        </h2>
        {categoryList.length === 0 ? (
          <div className="bg-card border border-dashed border-border rounded-2xl p-8 text-center text-muted-foreground text-sm">
            No expense data yet
          </div>
        ) : (
          <div className="bg-card border border-border rounded-2xl overflow-hidden divide-y divide-border">
            {categoryList.map(({ cat, total, label, color }) => {
              const pct = grandTotal > 0 ? (total / grandTotal) * 100 : 0;
              const isExpanded = expandedCategory === cat;
              const catTxs = expenses.filter(tx => tx.category === cat);
              return (
                <div key={cat}>
                  <button
                    onClick={() => setExpandedCategory(isExpanded ? null : cat)}
                    className="w-full flex items-center gap-4 px-5 py-4 hover:bg-secondary/50 transition-colors text-left"
                  >
                    <div className="w-3 h-3 rounded-full shrink-0" style={{ background: color }} />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-sm font-medium">{label}</span>
                        <div className="flex items-center gap-3">
                          <span className="text-xs text-muted-foreground">{pct.toFixed(1)}%</span>
                          <span className="text-sm font-bold">${total.toFixed(2)}</span>
                          {isExpanded ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
                        </div>
                      </div>
                      <div className="h-1.5 bg-secondary rounded-full overflow-hidden">
                        <div className="h-full rounded-full" style={{ width: `${pct}%`, background: color }} />
                      </div>
                    </div>
                  </button>
                  {isExpanded && (
                    <div className="bg-secondary/30 px-5 pb-3 space-y-2">
                      {catTxs.slice(0, 8).map(tx => (
                        <div key={tx.id} className="flex items-center justify-between py-1.5">
                          <div>
                            <p className="text-xs font-medium">{tx.description || tx.merchant_name || 'Transaction'}</p>
                            <p className="text-xs text-muted-foreground">{tx.date}</p>
                          </div>
                          <span className="text-xs font-semibold">-${Math.abs(tx.amount).toFixed(2)}</span>
                        </div>
                      ))}
                      {catTxs.length > 8 && (
                        <p className="text-xs text-muted-foreground pb-1">+{catTxs.length - 8} more</p>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* Recurring Expenses */}
      <section>
        <h2 className="text-lg font-heading font-bold mb-4 flex items-center gap-2">
          <Repeat className="w-5 h-5 text-primary" /> Recurring Expenses
        </h2>
        {recurring.length === 0 ? (
          <div className="bg-card border border-dashed border-border rounded-2xl p-8 text-center text-muted-foreground text-sm">
            No recurring expenses detected yet
          </div>
        ) : (
          <div className="bg-card border border-border rounded-2xl overflow-hidden divide-y divide-border">
            {recurring.map(({ name, avg, count, category }) => (
              <div key={name} className="flex items-center gap-4 px-5 py-4">
                <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0" style={{ background: `${CATEGORY_COLORS[category] || '#6B7280'}22` }}>
                  <Repeat className="w-4 h-4" style={{ color: CATEGORY_COLORS[category] || '#6B7280' }} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate capitalize">{name}</p>
                  <p className="text-xs text-muted-foreground">{CATEGORY_LABELS[category]} · {count}x detected</p>
                </div>
                <span className="text-sm font-bold">~${avg.toFixed(2)}</span>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* All Transactions */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-heading font-bold flex items-center gap-2">
            <Wallet className="w-5 h-5 text-primary" /> All Transactions
          </h2>
          <div className="flex gap-1 bg-secondary rounded-xl p-1">
            {['all', 'expenses', 'income'].map(f => (
              <button
                key={f}
                onClick={() => setTxFilter(f)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold capitalize transition-all ${txFilter === f ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}
              >
                {f}
              </button>
            ))}
          </div>
        </div>
        {filteredTxs.length === 0 ? (
          <div className="bg-card border border-dashed border-border rounded-2xl p-8 text-center text-muted-foreground text-sm">
            No transactions found
          </div>
        ) : (
          <div className="bg-card border border-border rounded-2xl overflow-hidden divide-y divide-border">
            {filteredTxs.map(tx => (
              <div key={tx.id} className="flex items-center gap-3 px-5 py-3.5">
                <div className="w-8 h-8 rounded-full flex items-center justify-center shrink-0" style={{ background: `${CATEGORY_COLORS[tx.category] || '#6B7280'}22` }}>
                  <div className="w-2.5 h-2.5 rounded-full" style={{ background: CATEGORY_COLORS[tx.category] || '#6B7280' }} />
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
        )}
      </section>
    </div>
  );
}