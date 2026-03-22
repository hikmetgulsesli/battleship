import { describe, it, expect } from 'vitest';
import { groupByCategory } from './utils';
import { Product } from '@/types';

describe('groupByCategory', () => {
  const mockProducts: Product[] = [
    { id: '1', name: 'Elma', category: 'meyve', quantity: 2, checked: false, createdAt: Date.now() },
    { id: '2', name: 'Armut', category: 'meyve', quantity: 1, checked: true, createdAt: Date.now() },
    { id: '3', name: 'Tavuk', category: 'kasap', quantity: 1, checked: false, createdAt: Date.now() },
    { id: '4', name: 'Ekmek', category: 'fırın', quantity: 3, checked: true, createdAt: Date.now() },
  ];

  it('groups products by category with category metadata', () => {
    const groups = groupByCategory(mockProducts);

    expect(groups).toHaveLength(3); // Only non-empty categories

    const meyveGroup = groups.find((g) => g.category.id === 'meyve');
    expect(meyveGroup).toBeDefined();
    expect(meyveGroup!.products).toHaveLength(2);
    expect(meyveGroup!.checkedCount).toBe(1);
    expect(meyveGroup!.totalCount).toBe(2);

    const kasapGroup = groups.find((g) => g.category.id === 'kasap');
    expect(kasapGroup).toBeDefined();
    expect(kasapGroup!.products).toHaveLength(1);
    expect(kasapGroup!.checkedCount).toBe(0);

    const firinGroup = groups.find((g) => g.category.id === 'fırın');
    expect(firinGroup).toBeDefined();
    expect(firinGroup!.products).toHaveLength(1);
    expect(firinGroup!.checkedCount).toBe(1);
  });

  it('returns empty array for empty product list', () => {
    const groups = groupByCategory([]);
    expect(groups).toHaveLength(0);
  });

  it('includes category metadata (emoji, label, color)', () => {
    const groups = groupByCategory(mockProducts);
    
    const meyveGroup = groups.find((g) => g.category.id === 'meyve');
    expect(meyveGroup!.category.emoji).toBe('🍎');
    expect(meyveGroup!.category.label).toBe('Meyve');
  });
});
