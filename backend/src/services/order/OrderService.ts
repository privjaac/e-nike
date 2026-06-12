import type { OrderWithItems } from '@/domain/Order';

import type { ICartRepository } from '@/repositories/cart/ICartRepository';
import type { IOrderRepository } from '@/repositories/order/IOrderRepository';
import type { IOrderService } from '@/services/order/IOrderService';

export class OrderService implements IOrderService {
  constructor(
    private orderRepository: IOrderRepository,
    private cartRepository: ICartRepository,
  ) {}

  async getOrders(userId?: number) {
    return this.orderRepository.findAll(userId);
  }

  async createOrder(data: { userId: number; cartId: number; shippingAddress: unknown }): Promise<OrderWithItems> {
    const items = await this.orderRepository.getCartItems(data.cartId);
    const totalAmount = items.reduce((sum, i) => sum + i.quantity * i.unitPrice, 0);
    const orderNumber = `NIKE-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

    const order = await this.orderRepository.create({
      userId: data.userId,
      orderNumber,
      totalAmount,
      shippingAddress: data.shippingAddress,
      status: 'pending',
    });

    await this.cartRepository.markConverted(data.cartId);

    return {
      ...order,
      items,
    };
  }
}
