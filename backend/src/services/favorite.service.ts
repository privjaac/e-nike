import { FavoriteRepository } from '../repositories/favorite.repository';
import type { Favorite, FavoriteWithProduct } from '../types';

export class FavoriteService {
  private favRepo = new FavoriteRepository();

  async getByUser(userId: number): Promise<FavoriteWithProduct[]> {
    return this.favRepo.findByUser(userId);
  }

  async add(userId: number, productId: number): Promise<Favorite> {
    const existing = await this.favRepo.findOne(userId, productId);
    if (existing) throw new Error('Already in favorites');
    return this.favRepo.create(userId, productId);
  }

  async remove(userId: number, productId: number): Promise<void> {
    await this.favRepo.delete(userId, productId);
  }
}
