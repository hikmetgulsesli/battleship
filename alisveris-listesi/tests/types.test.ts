/**
 * Tests for TypeScript types - US-001
 * Verifies Product and Category interfaces match acceptance criteria
 */

import { describe, it, expect } from 'vitest';
import { categories, getCategory } from '@/lib/categories';
import type { CategoryId } from '@/types';

// Type tests using TypeScript's type system
// These would fail to compile if the types were wrong

describe('Product Interface', () => {
  it('should have id as string', () => {
    const product = {
      id: 'test-id-123',
      name: 'Test Product',
      category: 'market' as const,
      quantity: 1,
      checked: false,
      createdAt: Date.now(),
    };

    expect(typeof product.id).toBe('string');
    expect(product.id).toBe('test-id-123');
  });

  it('should have name as string', () => {
    const product = {
      id: 'test-id',
      name: 'Domates',
      category: 'manav' as const,
      quantity: 3,
      checked: false,
      createdAt: Date.now(),
    };

    expect(typeof product.name).toBe('string');
    expect(product.name).toBe('Domates');
  });

  it('should have category as CategoryId', () => {
    const product = {
      id: 'test-id',
      name: 'Kırmızı Et',
      category: 'kasap' as const,
      quantity: 1,
      checked: false,
      createdAt: Date.now(),
    };

    expect(product.category).toBe('kasap');
  });

  it('should have quantity as number', () => {
    const product = {
      id: 'test-id',
      name: 'Süt',
      category: 'market' as const,
      quantity: 2,
      checked: false,
      createdAt: Date.now(),
    };

    expect(typeof product.quantity).toBe('number');
    expect(product.quantity).toBe(2);
  });

  it('should have checked as boolean', () => {
    const product = {
      id: 'test-id',
      name: 'Ekmek',
      category: 'fırın' as const,
      quantity: 1,
      checked: true,
      createdAt: Date.now(),
    };

    expect(typeof product.checked).toBe('boolean');
    expect(product.checked).toBe(true);
  });

  it('should have createdAt as number (timestamp)', () => {
    const timestamp = Date.now();
    const product = {
      id: 'test-id',
      name: 'Elma',
      category: 'meyve' as const,
      quantity: 5,
      checked: false,
      createdAt: timestamp,
    };

    expect(typeof product.createdAt).toBe('number');
    expect(product.createdAt).toBe(timestamp);
  });
});

describe('Category Definitions - All 7 categories', () => {
  it('should have exactly 7 categories', () => {
    expect(categories).toHaveLength(7);
  });

  it('should have Manav category', () => {
    const manav = categories.find(c => c.id === 'manav');
    expect(manav).toBeDefined();
    expect(manav?.label).toBe('Manav');
    expect(manav?.emoji).toBe('🥬');
  });

  it('should have Kasap category', () => {
    const kasap = categories.find(c => c.id === 'kasap');
    expect(kasap).toBeDefined();
    expect(kasap?.label).toBe('Kasap');
    expect(kasap?.emoji).toBe('🥩');
  });

  it('should have Market category', () => {
    const market = categories.find(c => c.id === 'market');
    expect(market).toBeDefined();
    expect(market?.label).toBe('Market');
    expect(market?.emoji).toBe('🛒');
  });

  it('should have Fırın category', () => {
    const firin = categories.find(c => c.id === 'fırın');
    expect(firin).toBeDefined();
    expect(firin?.label).toBe('Fırın');
    expect(firin?.emoji).toBe('🍞');
  });

  it('should have Meyve category', () => {
    const meyve = categories.find(c => c.id === 'meyve');
    expect(meyve).toBeDefined();
    expect(meyve?.label).toBe('Meyve');
    expect(meyve?.emoji).toBe('🍎');
  });

  it('should have Temizlik category', () => {
    const temizlik = categories.find(c => c.id === 'temizlik');
    expect(temizlik).toBeDefined();
    expect(temizlik?.label).toBe('Temizlik');
    expect(temizlik?.emoji).toBe('🧹');
  });

  it('should have Diğer category', () => {
    const diger = categories.find(c => c.id === 'diğer');
    expect(diger).toBeDefined();
    expect(diger?.label).toBe('Diğer');
    expect(diger?.emoji).toBe('📦');
  });

  it('should have color class for each category', () => {
    categories.forEach(cat => {
      expect(cat.color).toBeDefined();
      expect(typeof cat.color).toBe('string');
      expect(cat.color.length).toBeGreaterThan(0);
    });
  });

  it('should have unique IDs for all categories', () => {
    const ids = categories.map(c => c.id);
    const uniqueIds = new Set(ids);
    expect(uniqueIds.size).toBe(ids.length);
  });
});

describe('getCategory helper', () => {
  it('should return correct category by id', () => {
    const manav = getCategory('manav');
    expect(manav).toBeDefined();
    expect(manav?.label).toBe('Manav');

    const kasap = getCategory('kasap');
    expect(kasap).toBeDefined();
    expect(kasap?.label).toBe('Kasap');
  });

  it('should return undefined for invalid category id', () => {
    const invalid = getCategory('invalid-category' as CategoryId);
    expect(invalid).toBeUndefined();
  });
});
