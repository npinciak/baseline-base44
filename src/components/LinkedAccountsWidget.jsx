import { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { CreditCard, Landmark, TrendingUp, Wallet, Link } from 'lucide-react';
import { Link as RouterLink } from 'react-router-dom';

const ACCOUNT_TYPE_ICONS = {
  checking: Landmark,
  savings: Wallet,
  credit_card: CreditCard,
  investment: TrendingUp,
  loan: CreditCard,
};

const ACCOUNT_TYPE_LABELS = {
  checking: 'Checking',
  savings: 'Savings',
  credit_card: 'Credit Card',
  investment: 'Investment',
  loan: 'Loan',
};

export default function LinkedAccountsWidget() {
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    base44.functions.invoke('getMxAccounts', {})
      .then(res => setAccounts(res.data?.accounts || []))
      .catch(() => setAccounts([]))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="bg-card border border-border rounded-2xl p-5">
        <h3 className="text-sm font-heading font-semibold mb-4">Linked Accounts</h3>
        <div className="space-y-3">
          {[1, 2].map(i => (
            <div key={i} className="h-10 bg-secondary rounded-xl animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  if (accounts.length === 0) {
    return (
      <div className="bg-card border border-border rounded-2xl p-5">
        <h3 className="text-sm font-heading font-semibold mb-3">Linked Accounts</h3>
        <RouterLink
          to="/money"
          className="flex flex-col items-center gap-2 py-4 text-center text-xs text-muted-foreground hover:text-primary transition-colors"
        >
          <Link className="w-5 h-5" />
          <span>No accounts linked.<br />Connect a bank account.</span>
        </RouterLink>
      </div>
    );
  }

  return (
    <div className="bg-card border border-border rounded-2xl p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-heading font-semibold">Linked Accounts</h3>
        <RouterLink to="/money" className="text-xs text-primary font-semibold hover:underline">
          View
        </RouterLink>
      </div>
      <div className="space-y-3">
        {accounts.slice(0, 5).map(account => {
          const type = account.account_type?.toLowerCase().replace(' ', '_') || 'checking';
          const Icon = ACCOUNT_TYPE_ICONS[type] || Landmark;
          const balance = account.balance ?? account.available_balance ?? 0;
          const isNegative = balance < 0;
          return (
            <div key={account.guid} className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-secondary flex items-center justify-center shrink-0">
                <Icon className="w-4 h-4 text-muted-foreground" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium truncate leading-tight">{account.name || account.institution_name || 'Account'}</p>
                <p className="text-xs text-muted-foreground capitalize">{ACCOUNT_TYPE_LABELS[type] || type}</p>
              </div>
              <span className={`text-xs font-bold shrink-0 ${isNegative ? 'text-destructive' : 'text-foreground'}`}>
                {isNegative ? '-' : ''}${Math.abs(balance).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}