import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { authMiddleware, optionalAuthMiddleware, requireRole } from '@/middleware/AuthMiddleware';
import type { IOrderController } from '@/controllers/IOrderController';
import { createOrderSchema, updateStatusSchema } from '@/dtos/OrderDto';

export function createOrderRoutes(controller: IOrderController) {
  const orders = new Hono();
  orders.get('/', authMiddleware, (c) => controller.getOrders(c));
  orders.get('/:id', optionalAuthMiddleware, (c) => controller.getOrderById(c));
  orders.post('/', zValidator('json', createOrderSchema), (c) => controller.createOrder(c));
  orders.patch('/:id/status', authMiddleware, requireRole('admin'), zValidator('json', updateStatusSchema), (c) => controller.updateStatus(c));
  return orders;
}
