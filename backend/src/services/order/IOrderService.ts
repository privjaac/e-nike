import type { Order, OrderWithItems } from '@/domain/Order';

export interface IOrderService {
  getOrders(userId?: number): Promise<Order[]>;
  createOrder(data: { userId: number; cartId: number; shippingAddress: unknown }): Promise<OrderWithItems>;
}
