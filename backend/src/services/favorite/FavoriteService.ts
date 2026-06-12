import type { IFavoriteRepository } from '@/repositories/favorite/IFavoriteRepository';
import type { IFavoriteService } from '@/services/favorite/IFavoriteService';

export class FavoriteService implements IFavoriteService {
  constructor(private favoriteRepository: IFavoriteRepository) {}

  async getByUser(userId: number) {
    return this.favoriteRepository.findByUser(userId);
  }

  async add(userId: number, productId: number) {
    const existing = await this.favoriteRepository.findOne(userId, productId);
    if (existing) throw new Error('Already in favorites');
    return this.favoriteRepository.create(userId, productId);
  }

  async remove(userId: number, productId: number) {
    await this.favoriteRepository.delete(userId, productId);
  }
}
