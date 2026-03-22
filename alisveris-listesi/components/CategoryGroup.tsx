'use client';

import { Product, CategoryId } from '@/types';
import { getCategory } from '@/lib/categories';
import ProductItem from './ProductItem';

interface CategoryGroupProps {
  categoryId: string;
  products: Product[];
  onToggle: (id: string) => void;
  onRemove: (id: string) => void;
  onUpdate: (id: string, updates: Partial<Omit<Product, 'id' | 'createdAt'>>) => void;
}

export default function CategoryGroup({ categoryId, products, onToggle, onRemove, onUpdate }: CategoryGroupProps) {
  const category = getCategory(categoryId as CategoryId);
  if (!category) return null;

  return (
    <div className="mb-6">
      <h2 className="text-lg font-semibold text-gray-800 mb-3 flex items-center gap-2">
        <span>{category.emoji}</span>
        <span>{category.label}</span>
        <span className="text-sm font-normal text-gray-500">({products.length})</span>
      </h2>
      <div className="space-y-2">
        {products.map((product) => (
          <ProductItem
            key={product.id}
            product={product}
            onToggle={onToggle}
            onRemove={onRemove}
            onUpdate={onUpdate}
          />
        ))}
      </div>
    </div>
  );
}
