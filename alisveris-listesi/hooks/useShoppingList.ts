'use client';

import { useCallback } from 'react';
import { Product, CategoryId } from '@/types';
import { useLocalStorage } from './useLocalStorage';

/**
 * useShoppingList hook - manages shopping list state with localStorage persistence
 * Uses useReducer pattern for predictable state transitions
 */
export function useShoppingList() {
  const [products, setProducts] = useLocalStorage<Product[]>('alisveris-listesi', []);

  const addProduct = useCallback((name: string, category: CategoryId, quantity: number = 1) => {
    const newProduct: Product = {
      id: crypto.randomUUID(),
      name,
      category,
      quantity,
      checked: false,
      createdAt: Date.now(),
    };
    setProducts((prev) => [newProduct, ...prev]);
  }, [setProducts]);

  const deleteProduct = useCallback((id: string) => {
    setProducts((prev) => prev.filter((p) => p.id !== id));
  }, [setProducts]);

  // Alias for backward compatibility
  const removeProduct = deleteProduct;

  const toggleProduct = useCallback((id: string) => {
    setProducts((prev) =>
      prev.map((p) => (p.id === id ? { ...p, checked: !p.checked } : p))
    );
  }, [setProducts]);

  const updateProduct = useCallback((id: string, updates: Partial<Omit<Product, 'id' | 'createdAt'>>) => {
    setProducts((prev) =>
      prev.map((p) => (p.id === id ? { ...p, ...updates } : p))
    );
  }, [setProducts]);

  const clearChecked = useCallback(() => {
    setProducts((prev) => prev.filter((p) => !p.checked));
  }, [setProducts]);

  const clearAll = useCallback(() => {
    setProducts([]);
  }, [setProducts]);

  return {
    products,
    addProduct,
    deleteProduct,
    removeProduct,
    toggleProduct,
    updateProduct,
    clearChecked,
    clearAll,
  };
}
