import type { Favorite, FavoriteWithProduct } from '@/domain/Favorite';

export interface IFavoriteService {
  getByUser(userId: number): Promise<FavoriteWithProduct[]>;
  add(userId: number, productId: number): Promise<Favorite>;
  remove(userId: number, productId: number): Promise<void>;
}
