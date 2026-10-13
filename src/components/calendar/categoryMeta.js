import {
  Zap, ShoppingBag, Car, Film, Heart, Plane, BookOpen, PiggyBank, DollarSign, MoreHorizontal,
} from 'lucide-react';

export const CATEGORY_META = {
  bills_utilities: { label: 'Bills & Utilities', Icon: Zap, color: '#F87171' },
  food_dining: { label: 'Food & Dining', Icon: ShoppingBag, color: '#00D4AA' },
  shopping: { label: 'Shopping', Icon: ShoppingBag, color: '#FFB347' },
  transportation: { label: 'Transportation', Icon: Car, color: '#60A5FA' },
  entertainment: { label: 'Entertainment', Icon: Film, color: '#C084FC' },
  health: { label: 'Health', Icon: Heart, color: '#34D399' },
  travel: { label: 'Travel', Icon: Plane, color: '#38BDF8' },
  education: { label: 'Education', Icon: BookOpen, color: '#A78BFA' },
  savings: { label: 'Savings', Icon: PiggyBank, color: '#FCD34D' },
  income: { label: 'Income', Icon: DollarSign, color: '#4ADE80' },
  other: { label: 'Other', Icon: MoreHorizontal, color: '#6B7280' },
};

export const money = (n) => `${n < 0 ? '-' : ''}$${Math.abs(Math.round(n)).toLocaleString()}`;
export const compact = (n) =>
  Math.abs(n) >= 1000 ? `${n < 0 ? '-' : ''}$${(Math.abs(n) / 1000).toFixed(1)}k` : money(n);