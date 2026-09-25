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
      <div className="bg-white/[0.03] border border-white/10 backdrop-blur-sm rounded-2xl p-5">
        <h3 className="text-white/30 text-xs font-light tracking-widest uppercase mb-4">Linked Accounts</h3>
        <div className="space-y-3">
          {[1, 2].map(i => (
            <div key={i} className="h-10 bg-white/[0.05] rounded-xl animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  if (accounts.length === 0) {
    return (
      <div className="bg-white/[0.03] border border-white/10 backdrop-blur-sm rounded-2xl p-5">
        <h3 className="text-white/30 text-xs font-light tracking-widest uppercase mb-3">Linked Accounts</h3>
        <RouterLink
          to="/money"
          className="flex flex-col items-center gap-2 py-4 text-center text-xs text-white/30 hover:text-[#2EFD7A] transition-colors"
        >
          <Link className="w-5 h-5" />
          <span>No accounts linked.<br />Connect a bank account.</span>
        </RouterLink>
      </div>
    );
  }

  return (
    <div className="bg-white/[0.03] border border-white/10 backdrop-blur-sm rounded-2xl p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-white/30 text-xs font-light tracking-widest uppercase">Linked Accounts</h3>
        <RouterLink to="/money" className="text-xs text-[#2EFD7A] font-medium hover:opacity-80 transition-opacity">
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
              <div className="w-8 h-8 rounded-lg bg-white/[0.05] flex items-center justify-center shrink-0">
                <Icon className="w-4 h-4 text-white/40" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs text-white truncate leading-tight">{account.name || account.institution_name || 'Account'}</p>
                <p className="text-xs text-white/30 capitalize">{ACCOUNT_TYPE_LABELS[type] || type}</p>
              </div>
              <span className={`text-xs font-bold shrink-0 ${isNegative ? 'text-red-400' : 'text-white'}`}>
                {isNegative ? '-' : ''}${Math.abs(balance).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}