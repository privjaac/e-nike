import { Context } from 'hono';
import type { IPromotionService } from '@/services/promotion/IPromotionService';
import type { CreatePromotionDto } from '@/dtos/PromotionDto';

export class PromotionController {
  constructor(private promotionService: IPromotionService) {}

  async getPromotions(c: Context) {
    const active = c.req.query('active') === 'true';
    const result = await this.promotionService.getPromotions(active);
    return c.json({ success: true, data: result });
  }

  async createPromotion(c: Context) {
    const data = await c.req.json<CreatePromotionDto>();
    const result = await this.promotionService.createPromotion(data);
    return c.json({ success: true, data: result }, 201);
  }
}
