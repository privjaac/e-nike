import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import type { ICartController } from '@/controllers/ICartController';
import { addCartItemSchema, updateCartItemSchema } from '@/dtos/CartDto';
import { optionalAuthMiddleware } from '@/middleware/AuthMiddleware';

export function createCartRoutes(controller: ICartController) {
  const cart = new Hono();
  cart.use(optionalAuthMiddleware);
  cart.get('/', (c) => controller.getCart(c));
  cart.post('/items', zValidator('json', addCartItemSchema), (c) => controller.addItem(c));
  cart.patch('/items/:itemId', zValidator('json', updateCartItemSchema), (c) => controller.updateItem(c));
  cart.delete('/items/:itemId', (c) => controller.removeItem(c));
  return cart;
}
