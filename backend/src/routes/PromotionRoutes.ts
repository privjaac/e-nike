import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import type { PromotionController } from '@/controllers/PromotionController';
import { createPromotionSchema, updatePromotionSchema } from '@/dtos/PromotionDto';

export function createPromotionRoutes(controller: PromotionController) {
  const promotions = new Hono();
  promotions.get('/', (c) => controller.getPromotions(c));
  promotions.post('/', zValidator('json', createPromotionSchema), (c) => controller.createPromotion(c));
  promotions.put('/:id', zValidator('json', updatePromotionSchema), (c) => controller.updatePromotion(c));
  promotions.delete('/:id', (c) => controller.deletePromotion(c));
  return promotions;
}
