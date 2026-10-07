import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { base44 } from '@/api/base44Client';
import { CreditCard, Landmark, TrendingUp, Wallet, Link } from 'lucide-react';
import { Link as RouterLink } from 'react-router-dom';
import useCountUp from '@/hooks/useCountUp';
import ConnectBankButton from '@/components/ConnectBankButton';

const ACCOUNT_TYPE_ICONS = {
  checking: Landmark,
  savings: Wallet,
  credit_card: CreditCard,
  investment: TrendingUp,
  loan: CreditCard,
};

const ACCOUNT_TYPE_STYLES = {
  checking: 'bg-[#2BF9E9]/15 text-[#2BF9E9]',
  savings: 'bg-[#2EFD7A]/15 text-[#2EFD7A]',
  credit_card: 'bg-pink-400/15 text-pink-400',
  investment: 'bg-amber-400/15 text-amber-400',
  loan: 'bg-purple-400/15 text-purple-400',
};

const ACCOUNT_TYPE_LABELS = {
  checking: 'Checking',
  savings: 'Savings',
  credit_card: 'Credit Card',
  investment: 'Investment',
  loan: 'Loan',
};

const listVariants = { hidden: {}, show: { transition: { staggerChildren: 0.08 } } };
const rowVariants = {
  hidden: { opacity: 0, x: 16 },
  show: { opacity: 1, x: 0, transition: { type: 'spring', stiffness: 260, damping: 22 } },
};

function AccountRow({ account }) {
  const type = account.account_type?.toLowerCase().replace(' ', '_') || 'checking';
  const Icon = ACCOUNT_TYPE_ICONS[type] || Landmark;
  const style = ACCOUNT_TYPE_STYLES[type] || ACCOUNT_TYPE_STYLES.checking;
  const balance = account.balance ?? account.available_balance ?? 0;
  const isNegative = balance < 0;
  const animatedBalance = useCountUp(Math.abs(balance), 900);

  return (
    <motion.div variants={rowVariants} whileHover={{ x: 3 }} className="flex items-center gap-3">
      <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${style}`}>
        <Icon className="w-4 h-4" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs text-white truncate leading-tight">{account.name || account.institution_name || 'Account'}</p>
        <div className="flex items-center justify-between gap-2 mt-0.5">
          <p className="text-xs text-white/70 capitalize truncate">{ACCOUNT_TYPE_LABELS[type] || type}</p>
          <span className={`text-xs font-bold shrink-0 whitespace-nowrap ${isNegative ? 'text-red-400' : 'text-[#2EA0FD]'}`}>
            {isNegative ? '-' : ''}${animatedBalance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </span>
        </div>
      </div>
    </motion.div>
  );
}

export default function LinkedAccountsWidget() {
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadAccounts = () =>
    base44.functions.invoke('getMxAccounts', {})
      .then(res => setAccounts(res.data?.accounts || []))
      .catch(() => setAccounts([]))
      .finally(() => setLoading(false));

  useEffect(() => { loadAccounts(); }, []);

  const cardClass = 'bg-white/[0.03] border border-white/10 backdrop-blur-sm rounded-2xl p-5';

  if (loading) {
    return (
      <div className={cardClass}>
        <h3 className="text-white/80 text-xs font-light tracking-widest uppercase mb-4">Linked Accounts</h3>
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
      <div className={cardClass}>
        <h3 className="text-white/80 text-xs font-light tracking-widest uppercase mb-3">Linked Accounts</h3>
        <div className="flex flex-col items-center gap-3 py-3 text-center">
          <motion.div
            animate={{ y: [0, -4, 0], rotate: [0, -6, 6, 0] }}
            transition={{ duration: 3.2, repeat: Infinity, ease: 'easeInOut' }}
            className="w-12 h-12 rounded-2xl bg-[#2EA0FD]/15 flex items-center justify-center shadow-[0_0_20px_rgba(46,160,253,0.3)]"
          >
            <Link className="w-6 h-6 text-[#2EA0FD]" />
          </motion.div>
          <p className="text-xs text-white/80">No accounts linked yet.<br />Connect a bank to see your balances!</p>
          <ConnectBankButton onConnected={loadAccounts} />
        </div>
      </div>
    );
  }

  return (
    <div className={cardClass}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-white/80 text-xs font-light tracking-widest uppercase whitespace-nowrap">Linked Accounts</h3>
        <RouterLink to="/money" className="text-xs text-[#2EA0FD] font-medium hover:opacity-80 transition-opacity">
          View
        </RouterLink>
      </div>
      <motion.div variants={listVariants} initial="hidden" animate="show" className="space-y-3">
        {accounts.slice(0, 5).map(account => (
          <AccountRow key={account.guid} account={account} />
        ))}
      </motion.div>
      <div className="mt-4">
        <ConnectBankButton onConnected={loadAccounts} />
      </div>
    </div>
  );
}