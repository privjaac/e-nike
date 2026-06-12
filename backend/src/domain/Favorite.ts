import type { Product } from '@/domain/Product';

export interface Favorite {
  id: number;
  userId: number;
  productId: number;
  createdAt: string;
}

export interface FavoriteWithProduct extends Favorite {
  product: Product;
}
