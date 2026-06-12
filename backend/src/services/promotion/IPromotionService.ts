import type { Promotion } from '@/domain/Promotion';
import type { CreatePromotionDto, UpdatePromotionDto } from '@/dtos/PromotionDto';

export interface IPromotionService {
  getPromotions(activeOnly: boolean): Promise<Promotion[]>;
  getPromotionById(id: number): Promise<Promotion | undefined>;
  createPromotion(data: CreatePromotionDto): Promise<Promotion>;
  updatePromotion(id: number, data: UpdatePromotionDto): Promise<Promotion>;
  deletePromotion(id: number): Promise<void>;
}
