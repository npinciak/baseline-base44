import { Landmark, Lock } from 'lucide-react';
import { Link } from 'react-router-dom';
import ConnectBankButton from '@/components/ConnectBankButton';

const fmt = (n) => n.toLocaleString('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 });

export default function BankBalanceSection({ connected, balance, accountCount, locked, onConnected }) {
  return (
    <section id="bank" className="scroll-mt-6 rounded-2xl border border-white/10 bg-gradient-to-br from-[#022C22]/60 via-black to-black p-5 sm:p-6">
      <div className="flex flex-wrap items-center justify-between gap-5">
        <div className="flex items-center gap-4 min-w-0">
          <div className="w-12 h-12 rounded-2xl bg-[#2EFD7A]/10 border border-[#2EFD7A]/30 flex items-center justify-center shrink-0">
            {locked ? <Lock className="w-5 h-5 text-[#2EFD7A]" /> : <Landmark className="w-5 h-5 text-[#2EFD7A]" />}
          </div>
          <div className="min-w-0">
            <p className="text-xs uppercase tracking-widest text-white/50">Bank balance</p>
            {connected ? (
              <>
                <p className="text-3xl font-display font-bold text-white tabular-nums">{fmt(balance)}</p>
                <p className="text-sm text-white/50">Across {accountCount} linked account{accountCount === 1 ? '' : 's'}</p>
              </>
            ) : locked ? (
              <p className="text-sm text-white/70 mt-1">
                Finish the Banking Basics lessons to link your bank and see your real balance.{' '}
                <Link to="/dashboard" className="text-[#2EFD7A] underline">Continue BasePath</Link>
              </p>
            ) : (
              <>
                <p className="text-lg font-semibold text-white">Connect your bank to see your balance</p>
                <p className="text-sm text-white/50">Your real numbers will replace the sample data below.</p>
              </>
            )}
          </div>
        </div>
        {!locked && <ConnectBankButton onConnected={onConnected} />}
      </div>
    </section>
  );
}