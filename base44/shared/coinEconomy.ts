// Single source of truth for the BaseCoin economy on the server.
// Earning: a flat reward per completed lesson (unit), credited once per lesson.
// Spending: ~$1 per 200 BC, with a small discount on larger cards.
// At one lesson a day, a first $10 reward lands in about 3 weeks.
export const LESSON_REWARD = 100;

export const GIFT_CARD_PRICES = {
  'amazon-10': { brand: 'Amazon', amount: 10, coinsCost: 2000 },
  'amazon-25': { brand: 'Amazon', amount: 25, coinsCost: 4500 },
  'starbucks-10': { brand: 'Starbucks', amount: 10, coinsCost: 2000 },
  'starbucks-25': { brand: 'Starbucks', amount: 25, coinsCost: 4500 },
  'netflix-10': { brand: 'Netflix', amount: 10, coinsCost: 2000 },
  'netflix-25': { brand: 'Netflix', amount: 25, coinsCost: 4500 },
  'spotify-10': { brand: 'Spotify', amount: 10, coinsCost: 2000 },
  'target-10': { brand: 'Target', amount: 10, coinsCost: 2000 },
  'target-25': { brand: 'Target', amount: 25, coinsCost: 4500 },
  'doordash-10': { brand: 'DoorDash', amount: 10, coinsCost: 2000 },
};