'use client';

import { useState } from 'react';
import { Trash2, CheckCircle2 } from 'lucide-react';
import { useShoppingList } from '@/hooks/useShoppingList';
import { categories } from '@/lib/categories';
import ProductForm from './ProductForm';
import CategoryGroup from './CategoryGroup';
import EmptyState from './EmptyState';

export default function ShoppingList() {
  const { products, addProduct, removeProduct, toggleProduct, updateProduct, clearChecked, clearAll } = useShoppingList();
  const [showClearAllConfirm, setShowClearAllConfirm] = useState(false);

  const groupedProducts = categories.reduce((acc, cat) => {
    const catProducts = products
      .filter((p) => p.category === cat.id)
      .sort((a, b) => {
        if (a.checked !== b.checked) return a.checked ? 1 : -1;
        return b.createdAt - a.createdAt;
      });
    if (catProducts.length > 0) {
      acc[cat.id] = catProducts;
    }
    return acc;
  }, {} as Record<string, typeof products>);

  const checkedCount = products.filter((p) => p.checked).length;
  const hasChecked = checkedCount > 0;

  const handleClearAll = () => {
    if (showClearAllConfirm) {
      clearAll();
      setShowClearAllConfirm(false);
    } else {
      setShowClearAllConfirm(true);
      setTimeout(() => setShowClearAllConfirm(false), 3000);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="sticky top-0 z-10 bg-white/85 backdrop-blur-md border-b border-gray-100 px-4 py-4">
        <div className="max-w-lg mx-auto flex items-center gap-3">
          <span className="text-2xl">🛒</span>
          <h1 className="text-xl font-bold text-gray-900">Alışveriş Listesi</h1>
        </div>
      </header>

      <main className="max-w-lg mx-auto px-4 py-6">
        <ProductForm onAdd={addProduct} />

        {products.length === 0 ? (
          <EmptyState />
        ) : (
          <>
            {Object.entries(groupedProducts).map(([catId, catProducts]) => (
              <CategoryGroup
                key={catId}
                categoryId={catId}
                products={catProducts}
                onToggle={toggleProduct}
                onRemove={removeProduct}
                onUpdate={updateProduct}
              />
            ))}

            {hasChecked && (
              <div className="flex gap-3 mt-6 pt-4 border-t border-gray-200">
                <button
                  onClick={clearChecked}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-green-50 text-green-700 font-semibold rounded-xl hover:bg-green-100 transition-colors"
                >
                  <CheckCircle2 className="w-5 h-5" strokeWidth={1.5} />
                  <span>İşaretlileri Temizle ({checkedCount})</span>
                </button>
                <button
                  onClick={handleClearAll}
                  className={`flex items-center justify-center gap-2 px-4 py-3 font-semibold rounded-xl transition-colors ${
                    showClearAllConfirm
                      ? 'bg-red-500 text-white'
                      : 'bg-red-50 text-red-600 hover:bg-red-100'
                  }`}
                >
                  <Trash2 className="w-5 h-5" strokeWidth={1.5} />
                  <span>{showClearAllConfirm ? 'Onayla!' : 'Tümünü Sil'}</span>
                </button>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}
