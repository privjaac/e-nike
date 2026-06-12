import type { IPromotionRepository } from '@/repositories/promotion/IPromotionRepository';
import type { IPromotionService } from '@/services/promotion/IPromotionService';
import type { CreatePromotionDto, UpdatePromotionDto } from '@/dtos/PromotionDto';

export class PromotionService implements IPromotionService {
  constructor(private promotionRepository: IPromotionRepository) {}

  async getPromotions(activeOnly: boolean) {
    if (activeOnly) {
      return this.promotionRepository.findActive(new Date());
    }
    return this.promotionRepository.findAll();
  }

  async getPromotionById(id: number) {
    return this.promotionRepository.findById(id);
  }

  async createPromotion(data: CreatePromotionDto) {
    return this.promotionRepository.create(data);
  }

  async updatePromotion(id: number, data: UpdatePromotionDto) {
    const existing = await this.promotionRepository.findById(id);
    if (!existing) throw new Error('Promotion not found');
    return this.promotionRepository.update(id, data);
  }

  async deletePromotion(id: number) {
    const existing = await this.promotionRepository.findById(id);
    if (!existing) throw new Error('Promotion not found');
    await this.promotionRepository.remove(id);
  }
}
