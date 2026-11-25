import { Check, Lock, Shield, Download, Compass, Sparkles } from 'lucide-react';
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
    if (tier.actionType === 'shield') {
      if (shieldActive) {
        return (
          <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-[#2EA0FD] bg-[#2EA0FD]/15 border border-[#2EA0FD]/30 px-2.5 py-1.5 rounded-lg whitespace-nowrap">
            <Shield className="w-3 h-3" />
            Armed
          </span>
        );
      }
      return (
        <button
          type="button"
          onClick={onActivateShield}
          disabled={!onActivateShield || activatingShield || !canAffordShield}
          className="inline-flex items-center gap-1.5 text-[11px] font-bold bg-[#2EFD7A] text-black px-3 py-1.5 rounded-lg hover:bg-[#2EFD7A]/90 disabled:opacity-45 transition-all whitespace-nowrap"
        >
          <Shield className="w-3 h-3" />
          {activatingShield ? 'Arming...' : canAffordShield ? `Arm · ${STREAK_SHIELD_COST} BC` : `Need ${STREAK_SHIELD_COST} BC`}
        </button>
      );
    }

    if (tier.actionType === 'playbook') {
      return (
        <button
          type="button"
          onClick={onDownloadPlaybook}
          className="inline-flex items-center gap-1.5 text-[11px] font-bold bg-[#2EFD7A] text-black px-3 py-1.5 rounded-lg hover:bg-[#2EFD7A]/90 transition-all whitespace-nowrap"
        >
          <Download className="w-3 h-3" />
          Download
        </button>
      );
    }

    const to = tier.actionType === 'forecast'
      ? '/money#calendar'
      : tier.actionType === 'basecamp'
        ? '/basecamp'
        : '/dashboard';

    const label = tier.actionType === 'basecamp'
      ? 'Rewards'
      : tier.actionType === 'forecast'
        ? 'Forecast'
        : 'BasePath';

    return (
      <Link
        to={to}
        className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-white bg-white/10 hover:bg-white/15 border border-white/15 px-2.5 py-1.5 rounded-lg transition-colors whitespace-nowrap"
      >
        <Compass className="w-3 h-3 text-[#2EFD7A]" />
        {label}
      </Link>
    );
  };

  return (
    <div
      className={`flex items-center gap-3 rounded-xl border px-3 py-2.5 transition-all ${
        isCurrent
          ? 'border-[#2EFD7A]/50 bg-[#2EFD7A]/[0.06]'
          : unlocked
            ? 'border-white/10 bg-white/[0.03]'
            : 'border-white/5 bg-white/[0.015] opacity-70'
      }`}
    >
      <div
        className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 font-display font-extrabold text-[11px] ${
          unlocked ? 'bg-gradient-to-br from-[#2EFD7A] to-[#2EA0FD] text-black' : 'bg-white/10 text-white/50'
        }`}
      >
        {unlocked ? <Check className="w-3.5 h-3.5 stroke-[2.5]" /> : `L${tier.level}`}
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <span className="text-[10px] uppercase tracking-[0.14em] font-semibold text-white/40 truncate">
            {tier.title}
          </span>
          {isCurrent && (
            <span className="inline-flex items-center gap-1 text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-full bg-[#2EFD7A] text-black shrink-0">
              <Sparkles className="w-2.5 h-2.5" /> Now
            </span>
          )}
        </div>
        <p className="text-sm font-heading font-bold text-white leading-snug sm:truncate" title={tier.benefitTitle}>
          {tier.benefitTitle}
        </p>
      </div>

      <div className="shrink-0">
        {unlocked ? (
          renderAction()
        ) : (
          <span className="inline-flex items-center gap-1.5 text-[11px] text-white/45 bg-white/[0.04] border border-white/10 px-2.5 py-1.5 rounded-lg whitespace-nowrap">
            <Lock className="w-3 h-3" />
            {tier.lessonsNeeded} lessons
          </span>
        )}
      </div>
    </div>
  );
}