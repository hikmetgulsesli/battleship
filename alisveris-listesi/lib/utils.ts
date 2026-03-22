import { Product, Category, CategoryId } from '@/types';
import { categories } from './categories';

export interface CategoryGroup {
  category: Category;
  products: Product[];
  checkedCount: number;
  totalCount: number;
}

/**
 * Groups products by their categoryId with category metadata
 */
export function groupByCategory(products: Product[]): CategoryGroup[] {
  const groups: Record<CategoryId, Product[]> = {} as Record<CategoryId, Product[]>;

  // Initialize groups for all categories
  for (const cat of categories) {
    groups[cat.id] = [];
  }

  // Distribute products into their categories
  for (const product of products) {
    if (groups[product.category]) {
      groups[product.category].push(product);
    } else {
      // Fallback to 'diğer' for unknown categories
      groups['diğer'].push(product);
    }
  }

  // Build category groups with metadata, only for non-empty categories
  return categories
    .map((cat) => {
      const catProducts = groups[cat.id];
      return {
        category: cat,
        products: catProducts,
        checkedCount: catProducts.filter((p) => p.checked).length,
        totalCount: catProducts.length,
      };
    })
    .filter((group) => group.totalCount > 0);
}
