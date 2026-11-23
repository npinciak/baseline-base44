import { Zap } from 'lucide-react';
import { COIN_LEVELS, getLevelInfo } from '@/lib/coinLevels';
import LevelTierRow from '@/components/levels/LevelTierRow';
import LevelBarcode from '@/components/levels/LevelBarcode';
import ProfileSection from '@/components/profile/ProfileSection';

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
    <ProfileSection id="levels" icon={Zap} title="Levels & Power-ups"
      action={<span className="text-xs text-white/50 tabular-nums">{lifetimeCoins.toLocaleString()} Lifetime BC</span>}>
      <div className="flex flex-wrap items-end justify-between gap-2 mb-4">
        <h4 className="text-xl font-display font-extrabold text-white">
          Level {info.current.level} · {info.current.title}
        </h4>
        <span className="text-xs font-semibold text-[#2EFD7A]">
          {info.next
            ? `${info.lessonsToNext} ${info.lessonsToNext === 1 ? 'lesson' : 'lessons'} to ${info.next.title}`
            : 'Summit reached'}
        </span>
      </div>

      <LevelBarcode lifetimeCoins={lifetimeCoins} currentLevel={info.current.level} />

      <div className="space-y-1.5 mt-6">
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
    </ProfileSection>
  );
}