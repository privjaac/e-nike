import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { CartController } from '../controllers/cart.controller';
import { addCartItemSchema, updateCartItemSchema } from '../dtos';

const cart = new Hono();
const controller = new CartController();

cart.get('/:cartId?', (c) => controller.getCart(c));
cart.post('/items', zValidator('json', addCartItemSchema), (c) => controller.addItem(c));
cart.patch('/items/:itemId', zValidator('json', updateCartItemSchema), (c) => controller.updateItem(c));
cart.delete('/items/:itemId', (c) => controller.removeItem(c));

export { cart as cartRoutes };
