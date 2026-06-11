import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { PromotionController } from '../controllers/promotion.controller';
import { createPromotionSchema } from '../dtos';

const promotions = new Hono();
const controller = new PromotionController();

promotions.get('/', (c) => controller.getPromotions(c));
promotions.post('/', zValidator('json', createPromotionSchema), (c) => controller.createPromotion(c));

export { promotions as promotionRoutes };
