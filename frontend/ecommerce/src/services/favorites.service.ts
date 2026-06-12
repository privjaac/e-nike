import { get, post, del } from './api';

export interface FavoriteProduct {
  id: number;
  name: string;
  slug: string;
  basePrice: number;
  imageUrl: string;
  sport: string;
}

export interface FavoriteItem {
  id: number;
  userId: number;
  productId: number;
  product: FavoriteProduct;
  createdAt: string;
}

export const favoritesService = {
  getAll(token: string) {
    return get<FavoriteItem[]>('/favorites', token);
  },

  add(productId: string | number, token: string) {
    return post<FavoriteItem>('/favorites', { productId }, token);
  },

  remove(productId: string | number, token: string) {
    return del<void>(`/favorites/${productId}`, token);
  },
};
