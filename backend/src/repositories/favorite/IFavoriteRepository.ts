import type { Favorite, FavoriteWithProduct } from '@/domain/Favorite';

export interface IFavoriteRepository {
  findByUser(userId: number): Promise<FavoriteWithProduct[]>;
  findOne(userId: number, productId: number): Promise<Favorite | undefined>;
  create(userId: number, productId: number): Promise<Favorite>;
  delete(userId: number, productId: number): Promise<void>;
}
