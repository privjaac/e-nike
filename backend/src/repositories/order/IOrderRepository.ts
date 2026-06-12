import type { CartItem } from '@/domain/Cart';
import type { Order } from '@/domain/Order';

export interface IOrderRepository {
  findAll(userId?: number): Promise<Order[]>;
  create(data: {
    userId: number;
    orderNumber: string;
    totalAmount: number;
    shippingAddress?: unknown;
    status: string;
  }): Promise<Order>;
  getCartItems(cartId: number): Promise<CartItem[]>;
}
