import type { Context } from 'hono';
import { PromotionService } from '../services/promotion.service';
import type { CreatePromotionDto } from '../dtos';

export class PromotionController {
  private service = new PromotionService();

  async getPromotions(c: Context) {
    const active = c.req.query('active') === 'true';
    const result = await this.service.getPromotions(active);
    return c.json({ success: true, data: result });
  }

  async createPromotion(c: Context) {
    const data = await c.req.json<CreatePromotionDto>();
    const result = await this.service.createPromotion(data);
    return c.json({ success: true, data: result }, 201);
  }
}
