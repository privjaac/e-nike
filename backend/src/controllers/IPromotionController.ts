import type { Context } from 'hono';

export interface IPromotionController {
  getPromotions(c: Context): Promise<Response>;
  createPromotion(c: Context): Promise<Response>;
  updatePromotion(c: Context): Promise<Response>;
  deletePromotion(c: Context): Promise<Response>;
}
