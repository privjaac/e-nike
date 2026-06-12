import type { CartItem } from '@/domain/Cart';
import type { Order } from '@/domain/Order';
import type { OrderInsert } from '@/db/Schema';

export interface IOrderRepository {
  findAll(userId?: number): Promise<Order[]>;
  create(data: OrderInsert): Promise<Order>;
  getCartItems(cartId: number): Promise<CartItem[]>;
}
