// Display copy of the BaseCoin economy. The server enforces the same values on credit and redemption.
// Levels move LESSON_REWARD points per lesson for everyone; spendable coins depend on the plan.
export const LESSON_REWARD = 100;
export const FREE_LESSON_COINS = 50;
export const PLUS_LESSON_COINS = 100;

export const GIFT_CARDS = [
  { id: 'amazon-10', brand: 'Amazon', amount: 10, coinsCost: 3000, bg: 'bg-white/[0.04]', border: 'border-white/10', logo: 'https://upload.wikimedia.org/wikipedia/commons/a/a9/Amazon_logo.svg' },
  { id: 'amazon-25', brand: 'Amazon', amount: 25, coinsCost: 7000, bg: 'bg-white/[0.04]', border: 'border-white/10', logo: 'https://upload.wikimedia.org/wikipedia/commons/a/a9/Amazon_logo.svg' },
  { id: 'starbucks-10', brand: 'Starbucks', amount: 10, coinsCost: 3000, bg: 'bg-green-500/10', border: 'border-green-500/25', logo: 'https://upload.wikimedia.org/wikipedia/en/d/d3/Starbucks_Corporation_Logo_2011.svg' },
  { id: 'starbucks-25', brand: 'Starbucks', amount: 25, coinsCost: 7000, bg: 'bg-green-500/10', border: 'border-green-500/25', logo: 'https://upload.wikimedia.org/wikipedia/en/d/d3/Starbucks_Corporation_Logo_2011.svg' },
  { id: 'netflix-10', brand: 'Netflix', amount: 10, coinsCost: 3000, bg: 'bg-red-500/10', border: 'border-red-500/25', logo: 'https://upload.wikimedia.org/wikipedia/commons/0/08/Netflix_2015_logo.svg' },
  { id: 'netflix-25', brand: 'Netflix', amount: 25, coinsCost: 7000, bg: 'bg-red-500/10', border: 'border-red-500/25', logo: 'https://upload.wikimedia.org/wikipedia/commons/0/08/Netflix_2015_logo.svg' },
  { id: 'spotify-10', brand: 'Spotify', amount: 10, coinsCost: 3000, bg: 'bg-lime-500/10', border: 'border-lime-500/25', logo: 'https://upload.wikimedia.org/wikipedia/commons/2/26/Spotify_logo_with_text.svg' },
  { id: 'target-10', brand: 'Target', amount: 10, coinsCost: 3000, bg: 'bg-rose-500/10', border: 'border-rose-500/25', logo: 'https://upload.wikimedia.org/wikipedia/commons/9/9a/Target_logo.svg' },
  { id: 'target-25', brand: 'Target', amount: 25, coinsCost: 7000, bg: 'bg-rose-500/10', border: 'border-rose-500/25', logo: 'https://upload.wikimedia.org/wikipedia/commons/9/9a/Target_logo.svg' },
  { id: 'doordash-10', brand: 'DoorDash', amount: 10, coinsCost: 3000, bg: 'bg-white/[0.04]', border: 'border-white/10', logo: 'https://upload.wikimedia.org/wikipedia/commons/4/42/DoorDash_Logo.svg' },
];