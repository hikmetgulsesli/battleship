export type CategoryId = 'manav' | 'kasap' | 'market' | 'fırın' | 'meyve' | 'temizlik' | 'diğer';

export interface Product {
  id: string;
  name: string;
  category: CategoryId;
  quantity: number;
  checked: boolean;
  createdAt: number;
}

export interface Category {
  id: CategoryId;
  label: string;
  emoji: string;
  color: string;
}
