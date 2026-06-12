import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import type { OrderController } from '@/controllers/OrderController';
import { createOrderSchema } from '@/dtos/OrderDto';

export function createOrderRoutes(controller: OrderController) {
  const orders = new Hono();
  orders.get('/', (c) => controller.getOrders(c));
  orders.post('/', zValidator('json', createOrderSchema), (c) => controller.createOrder(c));
  return orders;
}
