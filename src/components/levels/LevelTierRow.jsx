import { Check, Lock, Shield, Coins, Download, Compass, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';
import { STREAK_SHIELD_COST } from '@/lib/coinLevels';

export default function LevelTierRow({
  tier,
  isCurrent,
  unlocked,
  walletBalance,
  shieldActive,
  activatingShield,
  onActivateShield,
  onDownloadPlaybook,
}) {
  const canAffordShield = (walletBalance ?? 0) >= STREAK_SHIELD_COST;

  const renderAction = () => {
    if (!unlocked) {
      return (
        <span className="inline-flex items-center gap-1.5 text-xs text-white/45 bg-white/[0.04] border border-white/10 px-3 py-1.5 rounded-xl">
          <Lock className="w-3.5 h-3.5" />
          Level {tier.level} · {tier.lessonsNeeded} lessons
        </span>
      );
    }

    if (tier.actionType === 'shield') {
      if (shieldActive) {
        return (
          <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#2EA0FD] bg-[#2EA0FD]/15 border border-[#2EA0FD]/30 px-3 py-1.5 rounded-xl">
            <Shield className="w-3.5 h-3.5" />
            Streak Shield Armed
          </span>
        );
      }
      return (
        <button
          type="button"
          onClick={onActivateShield}
          disabled={!onActivateShield || activatingShield || !canAffordShield}
          className="inline-flex items-center gap-1.5 text-xs font-bold bg-[#2EFD7A] text-black px-3.5 py-2 rounded-xl hover:bg-[#2EFD7A]/90 disabled:opacity-45 transition-all"
        >
          <Shield className="w-3.5 h-3.5" />
          {activatingShield
            ? 'Arming...'
            : canAffordShield
              ? `Arm Shield (${STREAK_SHIELD_COST} BC)`
              : `Need ${STREAK_SHIELD_COST} Spendable BC`}
        </button>
      );
    }

    if (tier.actionType === 'playbook') {
      return (
        <button
          type="button"
          onClick={onDownloadPlaybook}
          className="inline-flex items-center gap-1.5 text-xs font-bold bg-[#2EFD7A] text-black px-3.5 py-2 rounded-xl hover:bg-[#2EFD7A]/90 transition-all"
        >
          <Download className="w-3.5 h-3.5" />
          {tier.actionLabel}
        </button>
      );
    }

    const to = tier.actionType === 'forecast'
      ? '/money#calendar'
      : tier.actionType === 'basecamp'
        ? '/basecamp'
        : '/dashboard';

    return (
      <Link
        to={to}
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-white bg-white/10 hover:bg-white/15 border border-white/15 px-3.5 py-2 rounded-xl transition-colors"
      >
        <Compass className="w-3.5 h-3.5 text-[#2EFD7A]" />
        {tier.actionLabel}
      </Link>
    );
  };

  return (
    <div
      className={`rounded-2xl border px-4 py-3 transition-all ${
        isCurrent
          ? 'border-[#2EFD7A]/50 bg-[#2EFD7A]/[0.06]'
          : unlocked
            ? 'border-white/10 bg-white/[0.03]'
            : 'border-white/5 bg-white/[0.015] opacity-70'
      }`}
    >
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0 flex-1">
          <div
            className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 font-display font-extrabold text-xs ${
              unlocked ? 'bg-gradient-to-br from-[#2EFD7A] to-[#2EA0FD] text-black' : 'bg-white/10 text-white/50'
            }`}
          >
            {unlocked ? <Check className="w-4 h-4 stroke-[2.5]" /> : `L${tier.level}`}
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <h4 className="text-sm font-heading font-bold text-white">{tier.benefitTitle}</h4>
              {isCurrent && (
                <span className="inline-flex items-center gap-1 text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-[#2EFD7A] text-black">
                  <Sparkles className="w-2.5 h-2.5" /> Current
                </span>
              )}
            </div>
            <p className="text-xs text-white/55 mt-0.5 leading-relaxed" title={tier.whenUsed}>{tier.summary}</p>
          </div>
        </div>
        <div className="shrink-0">{renderAction()}</div>
      </div>
    </div>
  );
}