import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { base44 } from '@/api/base44Client';
import { Coins, CheckCircle, X } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import AmbientBackdrop from '@/components/dashboard/AmbientBackdrop';
import MountainHero from '@/components/basecamp/MountainHero';
import CampSection from '@/components/basecamp/CampSection';

const GIFT_CARDS = [
  { id: 'amazon-10', brand: 'Amazon', amount: 10, coinsCost: 500, bg: 'bg-orange-500/10', border: 'border-orange-500/25', logo: 'https://upload.wikimedia.org/wikipedia/commons/a/a9/Amazon_logo.svg' },
  { id: 'amazon-25', brand: 'Amazon', amount: 25, coinsCost: 1200, bg: 'bg-orange-500/10', border: 'border-orange-500/25', logo: 'https://upload.wikimedia.org/wikipedia/commons/a/a9/Amazon_logo.svg' },
  { id: 'starbucks-10', brand: 'Starbucks', amount: 10, coinsCost: 500, bg: 'bg-green-500/10', border: 'border-green-500/25', logo: 'https://upload.wikimedia.org/wikipedia/en/d/d3/Starbucks_Corporation_Logo_2011.svg' },
  { id: 'starbucks-25', brand: 'Starbucks', amount: 25, coinsCost: 1200, bg: 'bg-green-500/10', border: 'border-green-500/25', logo: 'https://upload.wikimedia.org/wikipedia/en/d/d3/Starbucks_Corporation_Logo_2011.svg' },
  { id: 'netflix-10', brand: 'Netflix', amount: 10, coinsCost: 500, bg: 'bg-red-500/10', border: 'border-red-500/25', logo: 'https://upload.wikimedia.org/wikipedia/commons/0/08/Netflix_2015_logo.svg' },
  { id: 'netflix-25', brand: 'Netflix', amount: 25, coinsCost: 1200, bg: 'bg-red-500/10', border: 'border-red-500/25', logo: 'https://upload.wikimedia.org/wikipedia/commons/0/08/Netflix_2015_logo.svg' },
  { id: 'spotify-10', brand: 'Spotify', amount: 10, coinsCost: 500, bg: 'bg-lime-500/10', border: 'border-lime-500/25', logo: 'https://upload.wikimedia.org/wikipedia/commons/2/26/Spotify_logo_with_text.svg' },
  { id: 'target-10', brand: 'Target', amount: 10, coinsCost: 500, bg: 'bg-rose-500/10', border: 'border-rose-500/25', logo: 'https://upload.wikimedia.org/wikipedia/commons/9/9a/Target_logo.svg' },
  { id: 'target-25', brand: 'Target', amount: 25, coinsCost: 1200, bg: 'bg-rose-500/10', border: 'border-rose-500/25', logo: 'https://upload.wikimedia.org/wikipedia/commons/9/9a/Target_logo.svg' },
  { id: 'doordash-10', brand: 'DoorDash', amount: 10, coinsCost: 500, bg: 'bg-orange-600/10', border: 'border-orange-600/25', logo: 'https://upload.wikimedia.org/wikipedia/commons/4/42/DoorDash_Logo.svg' },
];

const containerVariants = { hidden: {}, show: { transition: { staggerChildren: 0.06 } } };
const itemVariants = {
  hidden: { opacity: 0, y: 18, scale: 0.96 },
  show: { opacity: 1, y: 0, scale: 1, transition: { type: 'spring', stiffness: 280, damping: 20 } },
};

export default function Basecamp() {
  const [balance, setBalance] = useState(0);
  const [loading, setLoading] = useState(true);
  const [selectedCard, setSelectedCard] = useState(null);
  const [redeeming, setRedeeming] = useState(false);
  const [redeemSuccess, setRedeemSuccess] = useState(null);
  const { toast } = useToast();
  const camps = [...new Set(GIFT_CARDS.map(c => c.coinsCost))].sort((a, b) => a - b);

  useEffect(() => {
    base44.functions.invoke('getWallet', {})
      .then(res => setBalance(res?.data?.balance ?? 0))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const canAfford = (card) => balance >= card.coinsCost;

  const handleRedeem = async () => {
    if (!selectedCard || !canAfford(selectedCard)) return;
    setRedeeming(true);
    try {
      const res = await base44.functions.invoke('redeemGiftCard', {
        giftCardId: selectedCard.id,
        brand: selectedCard.brand,
        amountUsd: selectedCard.amount,
        coinsCost: selectedCard.coinsCost,
      });
      setBalance(res.data.newBalance);
      const redeemedCard = selectedCard;
      setSelectedCard(null);
      setRedeemSuccess(redeemedCard);
      toast({
        title: 'Redemption successful!',
        description: `Your $${redeemedCard.amount} ${redeemedCard.brand} gift card is on its way to your email.`,
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
        <motion.div variants={itemVariants} className="mb-10">
          <MountainHero balance={balance} camps={camps} />
        </motion.div>

        <div className="space-y-12">
          {camps.map((cost, i) => (
            <CampSection
              key={cost}
              index={i}
              cost={cost}
              cards={GIFT_CARDS.filter(c => c.coinsCost === cost)}
              balance={balance}
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
                Your <strong className="text-white">${redeemSuccess.amount} {redeemSuccess.brand}</strong> gift card is on its way to your email.
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
                <span className="font-semibold text-red-400">- {selectedCard.coinsCost.toLocaleString()} BC</span>
              </div>
              <div className="h-px bg-white/10 my-3" />
              <div className="flex items-center justify-between text-sm mb-6">
                <span className="font-semibold text-white">Remaining Balance</span>
                <span className="font-bold text-[#2EFD7A]">{(balance - selectedCard.coinsCost).toLocaleString()} BC</span>
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