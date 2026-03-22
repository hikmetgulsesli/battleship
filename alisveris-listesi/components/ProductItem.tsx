'use client';

import { useState } from 'react';
import { Trash2, Check } from 'lucide-react';
import { Product } from '@/types';
import { getCategory } from '@/lib/categories';

interface ProductItemProps {
  product: Product;
  onToggle: (id: string) => void;
  onRemove: (id: string) => void;
  onUpdate: (id: string, updates: Partial<Omit<Product, 'id' | 'createdAt'>>) => void;
}

export default function ProductItem({ product, onToggle, onRemove, onUpdate }: ProductItemProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState(product.name);
  const category = getCategory(product.category);

  const handleNameSubmit = () => {
    if (editName.trim() && editName !== product.name) {
      onUpdate(product.id, { name: editName.trim() });
    } else {
      setEditName(product.name);
    }
    setIsEditing(false);
  };

  return (
    <div
      className={`flex items-center gap-3 p-3 bg-white rounded-lg transition-all duration-150 ${
        product.checked ? 'opacity-60' : ''
      }`}
    >
      <button
        onClick={() => onToggle(product.id)}
        className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all duration-150 flex-shrink-0 ${
          product.checked
            ? 'bg-green-500 border-green-500 text-white'
            : 'border-gray-300 hover:border-green-400'
        }`}
        aria-label={product.checked ? 'İşareti kaldır' : 'İşaretle'}
      >
        {product.checked && <Check className="w-4 h-4" strokeWidth={2.5} />}
      </button>

      <div className="flex-1 min-w-0">
        {isEditing ? (
          <input
            type="text"
            value={editName}
            onChange={(e) => setEditName(e.target.value)}
            onBlur={handleNameSubmit}
            onKeyDown={(e) => e.key === 'Enter' && handleNameSubmit()}
            className="w-full px-2 py-1 border border-gray-300 rounded text-gray-900 focus:outline-none focus:ring-2 focus:ring-orange-400/40 focus:border-orange-400"
            autoFocus
          />
        ) : (
          <span
            onDoubleClick={() => setIsEditing(true)}
            className={`block text-base font-medium truncate cursor-default ${
              product.checked ? 'line-through text-gray-400' : 'text-gray-900'
            }`}
            title="Düzenlemek için çift tıklayın"
          >
            {product.name}
          </span>
        )}
        <div className="flex items-center gap-2 text-xs text-gray-500">
          <span className={category?.color}>{category?.emoji} {category?.label}</span>
          <span>{product.quantity > 1 ? `${product.quantity} adet` : ''}</span>
        </div>
      </div>

      <button
        onClick={() => onRemove(product.id)}
        className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors flex-shrink-0"
        aria-label="Ürünü sil"
      >
        <Trash2 className="w-5 h-5" strokeWidth={1.5} />
      </button>
    </div>
  );
}
