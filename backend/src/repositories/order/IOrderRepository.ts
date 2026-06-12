import type { CartItem } from '@/domain/Cart';
import type { Order, OrderItem } from '@/domain/Order';
import type { OrderInsert } from '@/db/Schema';

export interface IOrderRepository {
  findAll(userId?: number): Promise<Order[]>;
  findById(id: number): Promise<Order | undefined>;
  findItemsByOrderId(orderId: number): Promise<OrderItem[]>;
  findByGuestTokenHash(hash: string): Promise<Order | undefined>;
  create(data: OrderInsert): Promise<Order>;
  createItems(items: Omit<OrderItem, 'id' | 'createdAt'>[]): Promise<OrderItem[]>;
  updateStatus(id: number, status: string): Promise<Order>;
  getCartItems(cartId: number): Promise<CartItem[]>;
}
