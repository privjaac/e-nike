import type { Promotion } from '@/domain/Promotion';

export interface IPromotionService {
  getPromotions(activeOnly: boolean): Promise<Promotion[]>;
  createPromotion(data: unknown): Promise<Promotion>;
}
