import type { Order, OrderWithItems } from '@/domain/Order';
import type { CreateOrderDto } from '@/dtos/OrderDto';

export interface IOrderService {
  getOrders(userId?: number): Promise<Order[]>;
  getOrderById(id: number): Promise<OrderWithItems | null>;
  createOrder(data: CreateOrderDto): Promise<{ order: OrderWithItems; guestToken?: string }>;
  updateStatus(id: number, status: string): Promise<Order>;
}
