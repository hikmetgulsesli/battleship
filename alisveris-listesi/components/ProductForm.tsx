'use client';

import { useState, FormEvent } from 'react';
import { Plus } from 'lucide-react';
import { CategoryId } from '@/types';
import { categories } from '@/lib/categories';

interface ProductFormProps {
  onAdd: (name: string, category: CategoryId, quantity: number) => void;
}

export default function ProductForm({ onAdd }: ProductFormProps) {
  const [name, setName] = useState('');
  const [category, setCategory] = useState<CategoryId>('market');
  const [quantity, setQuantity] = useState(1);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (name.trim()) {
      onAdd(name.trim(), category, quantity);
      setName('');
      setQuantity(1);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-xl p-4 shadow-sm mb-6">
      <div className="flex flex-col gap-3">
        <div className="flex gap-2">
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Ürün adı..."
            className="flex-1 px-4 py-3 bg-gray-50 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-400/40 focus:border-orange-400 transition-all"
            autoFocus
          />
          <button
            type="submit"
            disabled={!name.trim()}
            className="px-5 py-3 bg-gradient-to-br from-orange-600 to-orange-500 text-white font-semibold rounded-xl hover:from-orange-500 hover:to-orange-400 disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-sm flex items-center gap-2"
          >
            <Plus className="w-5 h-5" strokeWidth={2} />
            <span>Ekle</span>
          </button>
        </div>
        <div className="flex gap-2">
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value as CategoryId)}
            className="flex-1 px-4 py-2 bg-gray-50 rounded-xl text-gray-700 focus:outline-none focus:ring-2 focus:ring-orange-400/40 focus:border-orange-400"
          >
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.emoji} {cat.label}
              </option>
            ))}
          </select>
          <input
            type="number"
            value={quantity}
            onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
            min={1}
            className="w-20 px-3 py-2 bg-gray-50 rounded-xl text-gray-700 focus:outline-none focus:ring-2 focus:ring-orange-400/40 focus:border-orange-400 text-center"
          />
        </div>
      </div>
    </form>
  );
}
