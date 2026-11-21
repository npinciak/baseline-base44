import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { base44 } from '@/api/base44Client';
import { Link } from 'react-router-dom';
import { Coins, CheckCircle, X, Sparkles } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import AmbientBackdrop from '@/components/dashboard/AmbientBackdrop';
import MountainHero from '@/components/basecamp/MountainHero';
import CampSection from '@/components/basecamp/CampSection';

import { GIFT_CARDS } from '@/lib/coinEconomy';
import { getEffectiveCardCost, getLevelInfo, getLifetimeCoins } from '@/lib/coinLevels';

const containerVariants = { hidden: {}, show: { transition: { staggerChildren: 0.06 } } };
const itemVariants = {
  hidden: { opacity: 0, y: 18, scale: 0.96 },
  show: { opacity: 1, y: 0, scale: 1, transition: { type: 'spring', stiffness: 280, damping: 20 } },
};

export default function Basecamp() {
  const [balance, setBalance] = useState(0);
  const [lifetimeCoins, setLifetimeCoins] = useState(0);
  const [loading, setLoading] = useState(true);
  const [selectedCard, setSelectedCard] = useState(null);
  const [redeeming, setRedeeming] = useState(false);
  const [redeemSuccess, setRedeemSuccess] = useState(null);
  const { toast } = useToast();
  const camps = [...new Set(GIFT_CARDS.map(c => c.coinsCost))].sort((a, b) => a - b);

  useEffect(() => {
    const load = async () => {
      const u = await base44.auth.me().catch(() => null);
      const [walletRes, statsArr, awards] = await Promise.all([
        base44.functions.invoke('getWallet', {}).catch(() => null),
        u ? base44.entities.UserStats.filter({ user_id: u.id }).catch(() => []) : [],
        u ? base44.entities.CoinAward.filter({ user_id: u.id }).catch(() => []) : [],
      ]);
      setBalance(walletRes?.data?.balance ?? 0);
      const awardSum = (awards || []).reduce((s, a) => s + Number(a.amount || 0), 0);
      setLifetimeCoins(Math.max(getLifetimeCoins(statsArr?.[0]), awardSum));
      setLoading(false);
    };
    load();
  }, []);

  const levelInfo = getLevelInfo(lifetimeCoins);
  const selectedPricing = selectedCard ? getEffectiveCardCost(selectedCard, lifetimeCoins) : null;
  const canAfford = (card) => balance >= getEffectiveCardCost(card, lifetimeCoins).effectiveCost;

  const handleRedeem = async () => {
    if (!selectedCard || !canAfford(selectedCard)) return;
    setRedeeming(true);
    try {
      const res = await base44.functions.invoke('redeemGiftCard', {
        giftCardId: selectedCard.id,
      });
      setBalance(res.data.newBalance);
      window.dispatchEvent(new CustomEvent('wallet-updated', { detail: { balance: res.data.newBalance } }));
      const redeemedCard = selectedCard;
      setSelectedCard(null);
      setRedeemSuccess(redeemedCard);
      toast({
        title: 'Redemption successful!',
        description: `We'll email your $${redeemedCard.amount} ${redeemedCard.brand} gift card code within 3 business days.`,
      });
    } catch (err) {
      const msg = err?.response?.data?.error || 'Redemption failed. Please try again.';
      toast({ title: 'Error', description: msg, variant: 'destructive' });
    } finally {
      setRedeeming(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-black">
        <div className="w-8 h-8 border-4 border-white/10 border-t-[#2EFD7A] rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="relative min-h-screen bg-black px-4 py-8 overflow-hidden">
      <AmbientBackdrop />
      <motion.div variants={containerVariants} initial="hidden" animate="show" className="relative z-10 max-w-5xl mx-auto">
        <motion.div variants={itemVariants} className="mb-6">
          <MountainHero balance={balance} camps={camps} />
        </motion.div>

        <motion.div variants={itemVariants} className="mb-10 rounded-2xl border border-white/10 bg-white/[0.03] px-5 py-4 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#2EFD7A]/15 border border-[#2EFD7A]/30 flex items-center justify-center text-[#2EFD7A]">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <p className="text-sm font-bold text-white">
                Level {levelInfo.current.level} · {levelInfo.current.title} ({lifetimeCoins.toLocaleString()} Lifetime BC)
              </p>
              <p className="text-xs text-white/60">
                {lifetimeCoins >= 5600
                  ? 'Summit Perks active: -200 BC on $10 cards & -500 BC on $25 cards. Spending coins never lowers your level.'
                  : lifetimeCoins >= 2000
                    ? 'Camp I Member Perks active: -200 BC on all $10 cards! Reach Level 6 for -500 BC on $25 cards.'
                    : 'Reach Level 4 (20 lessons) for -200 BC on $10 cards, and Level 6 (56 lessons) for -500 BC on $25 cards.'}
              </p>
              <p className="text-xs text-white/45 mt-1">Free accounts earn 50 BC per lesson. Plus members earn 100 BC. Levels count lessons, so they rise at the same pace for everyone.</p>
            </div>
          </div>
          <Link to="/profile#levels" className="text-xs font-semibold text-[#2EFD7A] hover:underline shrink-0">
            All Level Benefits →
          </Link>
        </motion.div>

        <div className="space-y-12">
          {camps.map((cost, i) => (
            <CampSection
              key={cost}
              index={i}
              cost={cost}
              cards={GIFT_CARDS.filter(c => c.coinsCost === cost)}
              balance={balance}
              lifetimeCoins={lifetimeCoins}
              onSelect={setSelectedCard}
            />
          ))}
        </div>

        {/* Success Modal */}
        {redeemSuccess && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-end md:items-center justify-center z-50 p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ type: 'spring', stiffness: 300, damping: 22 }}
              className="bg-white/[0.05] border border-white/10 backdrop-blur-md rounded-3xl p-8 w-full max-w-sm text-center"
            >
              <div className="w-16 h-16 rounded-full bg-[#2EFD7A]/20 border-4 border-[#2EFD7A] flex items-center justify-center mx-auto mb-5">
                <CheckCircle className="w-8 h-8 text-[#2EFD7A]" />
              </div>
              <h3 className="text-2xl font-display font-extrabold mb-2 text-white">Redemption Successful!</h3>
              <p className="text-white/60 text-sm mb-2">
                Your <strong className="text-white">${redeemSuccess.amount} {redeemSuccess.brand}</strong> gift card code will arrive by email within 3 business days. A confirmation is in your inbox now.
              </p>
              <div className="flex items-center justify-center gap-2 text-[#2EFD7A] font-bold text-lg mb-6">
                <Coins className="w-5 h-5" />
                {balance.toLocaleString()} BC remaining
              </div>
              <button
                onClick={() => setRedeemSuccess(null)}
                className="w-full py-3 bg-[#2EFD7A] text-black rounded-xl font-semibold hover:bg-[#2EFD7A]/90 transition-all"
              >
                Done
              </button>
            </motion.div>
          </div>
        )}

        {/* Confirm Redemption Modal */}
        {selectedCard && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-end md:items-center justify-center z-50 p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ type: 'spring', stiffness: 300, damping: 22 }}
              className="bg-white/[0.05] border border-white/10 backdrop-blur-md rounded-3xl p-6 w-full max-w-sm"
            >
              <div className="flex items-center justify-between mb-5">
                <h3 className="text-lg font-heading font-bold text-white">Confirm Redemption</h3>
                <button onClick={() => setSelectedCard(null)} className="text-white/50 hover:text-white transition-colors">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className={`${selectedCard.bg} border ${selectedCard.border} rounded-2xl p-5 text-center mb-6`}>
                <div className="flex items-center justify-center h-10 mb-3">
                  <img src={selectedCard.logo} alt={selectedCard.brand} className="h-7 object-contain" />
                </div>
                <p className="text-3xl font-display font-extrabold text-white">${selectedCard.amount}</p>
                <p className="text-sm text-white/60">{selectedCard.brand} Gift Card</p>
              </div>

              <div className="flex items-center justify-between text-sm mb-1">
                <span className="text-white/50">Your Balance</span>
                <span className="font-semibold text-white">{balance.toLocaleString()} BC</span>
              </div>
              <div className="flex items-center justify-between text-sm mb-1">
                <span className="text-white/50">Cost</span>
                <span className="font-semibold text-red-400">
                  - {(selectedPricing?.effectiveCost ?? selectedCard.coinsCost).toLocaleString()} BC
                </span>
              </div>
              {selectedPricing?.rebate > 0 && (
                <div className="flex items-center justify-between text-xs mb-1 text-[#2EFD7A]">
                  <span>Level {selectedPricing.tierRequired} Member Rebate</span>
                  <span>Saved {selectedPricing.rebate} BC</span>
                </div>
              )}
              <div className="h-px bg-white/10 my-3" />
              <div className="flex items-center justify-between text-sm mb-6">
                <span className="font-semibold text-white">Remaining Balance</span>
                <span className="font-bold text-[#2EFD7A]">
                  {(balance - (selectedPricing?.effectiveCost ?? selectedCard.coinsCost)).toLocaleString()} BC
                </span>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setSelectedCard(null)}
                  className="flex-1 py-3 bg-white/10 text-white rounded-xl font-semibold hover:bg-white/15 transition-all"
                >
                  Cancel
                </button>
                <button
                  onClick={handleRedeem}
                  disabled={redeeming}
                  className="flex-1 py-3 bg-[#2EFD7A] text-black rounded-xl font-semibold hover:bg-[#2EFD7A]/90 transition-all disabled:opacity-50"
                >
                  {redeeming ? 'Redeeming...' : 'Redeem'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </motion.div>
    </div>
  );
}