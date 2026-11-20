import { Coins, Sparkles, TrendingUp } from 'lucide-react';
import { COIN_LEVELS, getLevelInfo } from '@/lib/coinLevels';
import LevelTierRow from '@/components/levels/LevelTierRow';

export default function LevelBenefitsPanel({
  lifetimeCoins = 0,
  walletBalance = 0,
  shieldActive = false,
  activatingShield = false,
  onActivateShield,
  onDownloadPlaybook,
}) {
  const info = getLevelInfo(lifetimeCoins);

  return (
    <section id="levels" className="bg-white/[0.03] border border-white/10 backdrop-blur-sm rounded-3xl p-6 mb-6">
      <div className="flex flex-wrap items-start justify-between gap-4 mb-5">
        <div>
          <p className="text-[11px] uppercase tracking-[0.22em] text-[#2EFD7A] font-semibold mb-1 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5" /> BaseCoin Levels & Unlockable Benefits
          </p>
          <h3 className="text-xl font-display font-extrabold text-white">
            Level {info.current.level} · {info.current.title}
          </h3>
          <p className="text-xs text-white/60 mt-1 max-w-xl">
            Levels track <strong className="text-white/90">Lifetime Earned BaseCoins</strong> (+100 BC per completed lesson). Spending BaseCoins in Basecamp or on Streak Shields uses your <strong className="text-white/90">Spendable Wallet</strong> and never lowers your Level.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-2.5 w-full sm:w-auto">
          <div className="rounded-2xl bg-black/50 border border-white/10 px-3.5 py-2.5">
            <p className="text-[10px] uppercase tracking-wider text-white/45 flex items-center gap-1">
              <TrendingUp className="w-3 h-3 text-[#2EFD7A]" /> Lifetime Earned
            </p>
            <p className="text-lg font-display font-extrabold text-white tabular-nums mt-0.5">
              {lifetimeCoins.toLocaleString()} <span className="text-xs font-normal text-white/50">BC</span>
            </p>
          </div>
          <div className="rounded-2xl bg-black/50 border border-white/10 px-3.5 py-2.5">
            <p className="text-[10px] uppercase tracking-wider text-white/45 flex items-center gap-1">
              <Coins className="w-3 h-3 text-[#2EA0FD]" /> Spendable Wallet
            </p>
            <p className="text-lg font-display font-extrabold text-[#2EA0FD] tabular-nums mt-0.5">
              {(walletBalance ?? 0).toLocaleString()} <span className="text-xs font-normal text-white/50">BC</span>
            </p>
          </div>
        </div>
      </div>

      {info.next ? (
        <div className="rounded-2xl bg-black/40 border border-white/10 p-4 mb-5">
          <div className="flex flex-wrap items-center justify-between gap-2 text-xs mb-2">
            <span className="text-white/80 font-medium">
              Next unlock: <strong className="text-white">Level {info.next.level} · {info.next.benefitTitle}</strong>
            </span>
            <span className="text-[#2EFD7A] font-semibold">
              {info.coinsToNext.toLocaleString()} BC to go ({info.lessonsToNext} {info.lessonsToNext === 1 ? 'lesson' : 'lessons'})
            </span>
          </div>
          <div className="h-2.5 rounded-full bg-white/10 overflow-hidden">
            <div
              className="h-full rounded-full bg-gradient-to-r from-[#2EFD7A] to-[#2EA0FD] transition-all duration-500"
              style={{ width: `${Math.max(info.progressPct, 4)}%` }}
            />
          </div>
        </div>
      ) : (
        <div className="rounded-2xl bg-[#2EFD7A]/10 border border-[#2EFD7A]/30 px-4 py-3 mb-5 text-xs text-[#2EFD7A] font-semibold">
          Summit reached — every BaseCoin level benefit and gift card rebate is permanently unlocked!
        </div>
      )}

      <div className="space-y-3">
        {COIN_LEVELS.map((tier) => (
          <LevelTierRow
            key={tier.level}
            tier={tier}
            isCurrent={tier.level === info.current.level}
            unlocked={lifetimeCoins >= tier.minLifetimeCoins}
            walletBalance={walletBalance}
            shieldActive={shieldActive}
            activatingShield={activatingShield}
            onActivateShield={onActivateShield}
            onDownloadPlaybook={onDownloadPlaybook}
          />
        ))}
      </div>
    </section>
  );
}