import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useShoppingList } from './useShoppingList';

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: vi.fn((key: string) => store[key] ?? null),
    setItem: vi.fn((key: string, value: string) => { store[key] = value; }),
    removeItem: vi.fn((key: string) => { delete store[key]; }),
    clear: vi.fn(() => { store = {}; }),
  };
})();

Object.defineProperty(window, 'localStorage', { value: localStorageMock });

describe('useShoppingList', () => {
  beforeEach(() => {
    localStorageMock.clear();
    vi.clearAllMocks();
  });

  describe('addProduct', () => {
    it('adds a product with unique UUID', async () => {
      const { result } = renderHook(() => useShoppingList());
      
      await act(async () => {
        result.current.addProduct('Elma', 'meyve', 2);
      });

      expect(result.current.products).toHaveLength(1);
      expect(result.current.products[0].name).toBe('Elma');
      expect(result.current.products[0].category).toBe('meyve');
      expect(result.current.products[0].quantity).toBe(2);
      expect(result.current.products[0].checked).toBe(false);
      expect(result.current.products[0].id).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i);
    });

    it('generates different UUIDs for each product', async () => {
      const { result } = renderHook(() => useShoppingList());
      
      await act(async () => {
        result.current.addProduct('Elma', 'meyve');
        result.current.addProduct('Armut', 'meyve');
      });

      expect(result.current.products[0].id).not.toBe(result.current.products[1].id);
    });
  });

  describe('deleteProduct', () => {
    it('removes a product by id', async () => {
      const { result } = renderHook(() => useShoppingList());
      
      await act(async () => {
        result.current.addProduct('Elma', 'meyve');
        result.current.addProduct('Armut', 'meyve');
      });

      // addProduct prepends, so Armut is at index 0, Elma at index 1
      const productId = result.current.products[0].id;
      
      await act(async () => {
        result.current.deleteProduct(productId);
      });

      expect(result.current.products).toHaveLength(1);
      expect(result.current.products[0].name).toBe('Elma');
    });
  });

  describe('toggleProduct', () => {
    it('toggles checked status of a product', async () => {
      const { result } = renderHook(() => useShoppingList());
      
      await act(async () => {
        result.current.addProduct('Elma', 'meyve');
      });

      const productId = result.current.products[0].id;
      expect(result.current.products[0].checked).toBe(false);

      await act(async () => {
        result.current.toggleProduct(productId);
      });

      expect(result.current.products[0].checked).toBe(true);

      await act(async () => {
        result.current.toggleProduct(productId);
      });

      expect(result.current.products[0].checked).toBe(false);
    });
  });

  describe('clearChecked', () => {
    it('removes all checked products', async () => {
      const { result } = renderHook(() => useShoppingList());
      
      await act(async () => {
        result.current.addProduct('Elma', 'meyve');
        result.current.addProduct('Armut', 'meyve');
      });

      // addProduct prepends, so Armut is at index 0
      const armutId = result.current.products[0].id;
      
      await act(async () => {
        result.current.toggleProduct(armutId);
        result.current.clearChecked();
      });

      // Armut was checked and removed, Elma remains
      expect(result.current.products).toHaveLength(1);
      expect(result.current.products[0].name).toBe('Elma');
    });
  });

  describe('clearAll', () => {
    it('removes all products', async () => {
      const { result } = renderHook(() => useShoppingList());
      
      await act(async () => {
        result.current.addProduct('Elma', 'meyve');
        result.current.addProduct('Armut', 'meyve');
        result.current.addProduct('Ekmek', 'fırın');
      });

      await act(async () => {
        result.current.clearAll();
      });

      expect(result.current.products).toHaveLength(0);
    });
  });

  describe('updateProduct', () => {
    it('updates product fields', async () => {
      const { result } = renderHook(() => useShoppingList());
      
      await act(async () => {
        result.current.addProduct('Elma', 'meyve', 2);
      });

      const productId = result.current.products[0].id;

      await act(async () => {
        result.current.updateProduct(productId, { name: 'Yeşil Elma', quantity: 5, checked: true });
      });

      expect(result.current.products[0].name).toBe('Yeşil Elma');
      expect(result.current.products[0].quantity).toBe(5);
      expect(result.current.products[0].checked).toBe(true);
    });

    it('does not change id or createdAt on update', async () => {
      const { result } = renderHook(() => useShoppingList());
      
      await act(async () => {
        result.current.addProduct('Elma', 'meyve');
      });

      const product = result.current.products[0];
      const originalId = product.id;
      const originalCreatedAt = product.createdAt;

      await act(async () => {
        result.current.updateProduct(originalId, { name: 'Armut' });
      });

      expect(result.current.products[0].id).toBe(originalId);
      expect(result.current.products[0].createdAt).toBe(originalCreatedAt);
    });
  });

  describe('localStorage persistence', () => {
    it('persists products to localStorage', async () => {
      const { result } = renderHook(() => useShoppingList());
      
      await act(async () => {
        result.current.addProduct('Elma', 'meyve');
      });

      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        'alisveris-listesi',
        expect.any(String)
      );
    });

    it('hydrates state from localStorage on mount', async () => {
      // Pre-populate localStorage
      const existingProducts = [
        { id: 'test-id-1', name: 'Mevcut Ürün', category: 'meyve' as const, quantity: 1, checked: false, createdAt: Date.now() }
      ];
      localStorageMock.setItem('alisveris-listesi', JSON.stringify(existingProducts));

      const { result } = renderHook(() => useShoppingList());

      expect(result.current.products).toHaveLength(1);
      expect(result.current.products[0].name).toBe('Mevcut Ürün');
    });
  });
});
