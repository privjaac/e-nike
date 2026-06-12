import type { IPromotionRepository } from '@/repositories/promotion/IPromotionRepository';
import type { IPromotionService } from '@/services/promotion/IPromotionService';

export class PromotionService implements IPromotionService {
  constructor(private promotionRepository: IPromotionRepository) {}

  async getPromotions(activeOnly: boolean) {
    if (activeOnly) {
      return this.promotionRepository.findActive(new Date());
    }
    return this.promotionRepository.findAll();
  }

  async createPromotion(data: unknown) {
    return this.promotionRepository.create(data as any);
  }
}
