'use client';

import { useCallback } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { Product, CategoryId } from '@/types';
import { useLocalStorage } from './useLocalStorage';

export function useShoppingList() {
  const [products, setProducts] = useLocalStorage<Product[]>('alisveris-listesi', []);

  const addProduct = useCallback((name: string, category: CategoryId, quantity: number = 1) => {
    const newProduct: Product = {
      id: uuidv4(),
      name,
      category,
      quantity,
      checked: false,
      createdAt: Date.now(),
    };
    setProducts((prev) => [newProduct, ...prev]);
  }, [setProducts]);

  const removeProduct = useCallback((id: string) => {
    setProducts((prev) => prev.filter((p) => p.id !== id));
  }, [setProducts]);

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
    removeProduct,
    toggleProduct,
    updateProduct,
    clearChecked,
    clearAll,
  };
}
