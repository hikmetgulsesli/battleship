import { Category, CategoryId } from '@/types';

export const categories: Category[] = [
  { id: 'manav', label: 'Manav', emoji: '🥬', color: 'text-green-600' },
  { id: 'kasap', label: 'Kasap', emoji: '🥩', color: 'text-red-600' },
  { id: 'market', label: 'Market', emoji: '🛒', color: 'text-blue-600' },
  { id: 'fırın', label: 'Fırın', emoji: '🍞', color: 'text-orange-600' },
  { id: 'meyve', label: 'Meyve', emoji: '🍎', color: 'text-red-500' },
  { id: 'temizlik', label: 'Temizlik', emoji: '🧹', color: 'text-purple-600' },
  { id: 'diğer', label: 'Diğer', emoji: '📦', color: 'text-gray-500' },
];

export const getCategory = (id: CategoryId) => categories.find((c) => c.id === id);
