import { Context } from 'hono';
import type { IPromotionService } from '@/services/promotion/IPromotionService';
import type { CreatePromotionDto, UpdatePromotionDto } from '@/dtos/PromotionDto';

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

  async updatePromotion(c: Context) {
    const id = parseInt(c.req.param('id')!, 10);
    const data = await c.req.json<UpdatePromotionDto>();
    const result = await this.promotionService.updatePromotion(id, data);
    return c.json({ success: true, data: result });
  }

  async deletePromotion(c: Context) {
    const id = parseInt(c.req.param('id')!, 10);
    await this.promotionService.deletePromotion(id);
    return c.json({ success: true });
  }
}
