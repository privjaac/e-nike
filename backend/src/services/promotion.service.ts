import { PromotionRepository } from '../repositories/promotion.repository';

export class PromotionService {
  private promoRepo = new PromotionRepository();

  async getPromotions(activeOnly: boolean) {
    if (activeOnly) {
      return this.promoRepo.findActive(new Date());
    }
    return this.promoRepo.findAll();
  }

  async createPromotion(data: any) {
    return this.promoRepo.create(data);
  }
}
