import type { Context } from 'hono';

export interface IOrderController {
  getOrders(c: Context): Promise<Response>;
  getOrderById(c: Context): Promise<Response>;
  createOrder(c: Context): Promise<Response>;
  updateStatus(c: Context): Promise<Response>;
}
