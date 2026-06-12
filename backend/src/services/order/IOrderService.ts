import type { Order, OrderWithItems } from '@/domain/Order';
import type { CreateOrderDto } from '@/dtos/OrderDto';

export interface IOrderService {
  getOrders(userId?: number): Promise<Order[]>;
  createOrder(data: CreateOrderDto): Promise<OrderWithItems>;
}
