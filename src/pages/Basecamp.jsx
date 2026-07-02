import { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Coins, CheckCircle, X, ShoppingBag, Lock } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

const GIFT_CARDS = [
  {
    id: 'amazon-10',
    brand: 'Amazon',
    amount: 10,
    coinsCost: 500,
    color: 'from-orange-500 to-amber-500',
    bg: 'bg-orange-500/10',
    border: 'border-orange-500/20',
    logo: 'https://upload.wikimedia.org/wikipedia/commons/a/a9/Amazon_logo.svg',
  },
  {
    id: 'amazon-25',
    brand: 'Amazon',
    amount: 25,
    coinsCost: 1200,
    color: 'from-orange-500 to-amber-500',
    bg: 'bg-orange-500/10',
    border: 'border-orange-500/20',
    logo: 'https://upload.wikimedia.org/wikipedia/commons/a/a9/Amazon_logo.svg',
  },
  {
    id: 'starbucks-10',
    brand: 'Starbucks',
    amount: 10,
    coinsCost: 500,
    color: 'from-green-600 to-emerald-500',
    bg: 'bg-green-500/10',
    border: 'border-green-500/20',
    logo: 'https://upload.wikimedia.org/wikipedia/en/d/d3/Starbucks_Corporation_Logo_2011.svg',
  },
  {
    id: 'starbucks-25',
    brand: 'Starbucks',
    amount: 25,
    coinsCost: 1200,
    color: 'from-green-600 to-emerald-500',
    bg: 'bg-green-500/10',
    border: 'border-green-500/20',
    logo: 'https://upload.wikimedia.org/wikipedia/en/d/d3/Starbucks_Corporation_Logo_2011.svg',
  },
  {
    id: 'netflix-10',
    brand: 'Netflix',
    amount: 10,
    coinsCost: 500,
    color: 'from-red-600 to-rose-500',
    bg: 'bg-red-500/10',
    border: 'border-red-500/20',
    logo: 'https://upload.wikimedia.org/wikipedia/commons/0/08/Netflix_2015_logo.svg',
  },
  {
    id: 'netflix-25',
    brand: 'Netflix',
    amount: 25,
    coinsCost: 1200,
    color: 'from-red-600 to-rose-500',
    bg: 'bg-red-500/10',
    border: 'border-red-500/20',
    logo: 'https://upload.wikimedia.org/wikipedia/commons/0/08/Netflix_2015_logo.svg',
  },
  {
    id: 'spotify-10',
    brand: 'Spotify',
    amount: 10,
    coinsCost: 500,
    color: 'from-green-400 to-lime-400',
    bg: 'bg-lime-500/10',
    border: 'border-lime-500/20',
    logo: 'https://upload.wikimedia.org/wikipedia/commons/2/26/Spotify_logo_with_text.svg',
  },
  {
    id: 'target-10',
    brand: 'Target',
    amount: 10,
    coinsCost: 500,
    color: 'from-red-500 to-rose-400',
    bg: 'bg-rose-500/10',
    border: 'border-rose-500/20',
    logo: 'https://upload.wikimedia.org/wikipedia/commons/9/9a/Target_logo.svg',
  },
  {
    id: 'target-25',
    brand: 'Target',
    amount: 25,
    coinsCost: 1200,
    color: 'from-red-500 to-rose-400',
    bg: 'bg-rose-500/10',
    border: 'border-rose-500/20',
    logo: 'https://upload.wikimedia.org/wikipedia/commons/9/9a/Target_logo.svg',
  },
  {
    id: 'doordash-10',
    brand: 'DoorDash',
    amount: 10,
    coinsCost: 500,
    color: 'from-orange-600 to-red-500',
    bg: 'bg-orange-600/10',
    border: 'border-orange-600/20',
    logo: 'https://upload.wikimedia.org/wikipedia/commons/4/42/DoorDash_Logo.svg',
  },
];

export default function Basecamp() {
  const [balance, setBalance] = useState(0);
  const [loading, setLoading] = useState(true);
  const [selectedCard, setSelectedCard] = useState(null);
  const [redeeming, setRedeeming] = useState(false);
  const { toast } = useToast();

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
      setSelectedCard(null);
      toast({
        title: 'Redemption successful!',
        description: `Your $${selectedCard.amount} ${selectedCard.brand} gift card is on its way to your email.`,
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
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-8 h-8 border-4 border-border border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-1">
          <div className="w-9 h-9 rounded-xl bg-primary/15 flex items-center justify-center">
            <ShoppingBag className="w-5 h-5 text-primary" />
          </div>
          <h1 className="text-3xl font-display font-extrabold">Basecamp Store</h1>
        </div>
        <p className="text-muted-foreground text-sm ml-12">Redeem your Base Coins for real-world rewards</p>
      </div>

      {/* Balance */}
      <div className="flex items-center gap-3 bg-card border border-border rounded-2xl px-5 py-4 mb-8">
        <div className="w-10 h-10 rounded-xl bg-primary/15 flex items-center justify-center">
          <Coins className="w-5 h-5 text-primary" />
        </div>
        <div>
          <p className="text-xs text-muted-foreground font-medium">Your Balance</p>
          <p className="text-2xl font-display font-extrabold text-primary">{balance.toLocaleString()} <span className="text-sm font-normal text-muted-foreground">Base Coins</span></p>
        </div>
      </div>

      {/* Gift Cards Grid */}
      <div className="grid sm:grid-cols-2 gap-4">
        {GIFT_CARDS.map(card => {
          const affordable = canAfford(card);
          return (
            <button
              key={card.id}
              onClick={() => affordable && setSelectedCard(card)}
              disabled={!affordable}
              className={`text-left bg-card border rounded-2xl p-5 transition-all duration-200 ${
                affordable
                  ? `${card.border} hover:scale-[1.02] hover:shadow-lg cursor-pointer`
                  : 'border-border opacity-50 cursor-not-allowed'
              }`}
            >
              <div className="flex items-center justify-between mb-4">
                <div className={`${card.bg} rounded-xl px-3 py-2 flex items-center justify-center h-10 w-28`}>
                  <img src={card.logo} alt={card.brand} className="h-5 object-contain" />
                </div>
                {!affordable && <Lock className="w-4 h-4 text-muted-foreground" />}
              </div>
              <div className="flex items-end justify-between">
                <div>
                  <p className="text-2xl font-display font-extrabold">${card.amount}</p>
                  <p className="text-xs text-muted-foreground">{card.brand} Gift Card</p>
                </div>
                <div className={`flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-bold bg-gradient-to-r ${card.color} text-white`}>
                  <Coins className="w-3 h-3" />
                  {card.coinsCost.toLocaleString()} BC
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {/* Confirm Redemption Modal */}
      {selectedCard && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm flex items-end md:items-center justify-center z-50 p-4">
          <div className="bg-card border border-border rounded-3xl p-6 w-full max-w-sm">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-lg font-heading font-bold">Confirm Redemption</h3>
              <button onClick={() => setSelectedCard(null)} className="text-muted-foreground hover:text-foreground transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className={`${selectedCard.bg} border ${selectedCard.border} rounded-2xl p-5 text-center mb-6`}>
              <div className="flex items-center justify-center h-10 mb-3">
                <img src={selectedCard.logo} alt={selectedCard.brand} className="h-7 object-contain" />
              </div>
              <p className="text-3xl font-display font-extrabold">${selectedCard.amount}</p>
              <p className="text-sm text-muted-foreground">{selectedCard.brand} Gift Card</p>
            </div>

            <div className="flex items-center justify-between text-sm mb-1">
              <span className="text-muted-foreground">Your Balance</span>
              <span className="font-semibold">{balance.toLocaleString()} BC</span>
            </div>
            <div className="flex items-center justify-between text-sm mb-1">
              <span className="text-muted-foreground">Cost</span>
              <span className="font-semibold text-destructive">- {selectedCard.coinsCost.toLocaleString()} BC</span>
            </div>
            <div className="h-px bg-border my-3" />
            <div className="flex items-center justify-between text-sm mb-6">
              <span className="font-semibold">Remaining Balance</span>
              <span className="font-bold text-primary">{(balance - selectedCard.coinsCost).toLocaleString()} BC</span>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setSelectedCard(null)}
                className="flex-1 py-3 bg-secondary text-foreground rounded-xl font-semibold hover:bg-secondary/80 transition-all"
              >
                Cancel
              </button>
              <button
                onClick={handleRedeem}
                disabled={redeeming}
                className="flex-1 py-3 bg-primary text-primary-foreground rounded-xl font-semibold hover:bg-primary/90 transition-all disabled:opacity-50"
              >
                {redeeming ? 'Redeeming...' : 'Redeem'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}