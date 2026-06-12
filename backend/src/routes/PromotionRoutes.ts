import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import type { PromotionController } from '@/controllers/PromotionController';
import { createPromotionSchema } from '@/dtos/PromotionDto';

export function createPromotionRoutes(controller: PromotionController) {
  const promotions = new Hono();
  promotions.get('/', (c) => controller.getPromotions(c));
  promotions.post('/', zValidator('json', createPromotionSchema), (c) => controller.createPromotion(c));
  return promotions;
}
