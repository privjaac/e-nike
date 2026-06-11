import { OrderRepository } from '../repositories/order.repository';
import { CartRepository } from '../repositories/cart.repository';

export class OrderService {
  private orderRepo = new OrderRepository();
  private cartRepo = new CartRepository();

  async getOrders(userId?: number) {
    return this.orderRepo.findAll(userId);
  }

  async createOrder(data: { userId: number; cartId: number; shippingAddress: any }) {
    const items = await this.orderRepo.getCartItems(data.cartId);
    const totalAmount = items.reduce((sum, i) => sum + i.quantity * i.unitPrice, 0);
    const orderNumber = `NIKE-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

    const order = await this.orderRepo.create({
      userId: data.userId,
      orderNumber,
      totalAmount,
      shippingAddress: data.shippingAddress,
      status: 'pending',
    });

    await this.cartRepo.markConverted(data.cartId);

    return {
      ...order,
      items,
    };
  }
}
