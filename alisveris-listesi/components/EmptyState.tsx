'use client';

import { ShoppingCart } from 'lucide-react';

export default function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-8 text-center">
      <div className="w-20 h-20 rounded-full bg-gray-100 flex items-center justify-center mb-6">
        <ShoppingCart className="w-10 h-10 text-gray-400" strokeWidth={1.5} />
      </div>
      <h2 className="text-xl font-semibold text-gray-900 mb-2">Liste Boş</h2>
      <p className="text-gray-500 text-sm max-w-xs">
        Alışveriş listeniz boş görünüyor. Yukarıdaki formu kullanarak ürün ekleyin.
      </p>
    </div>
  );
}
