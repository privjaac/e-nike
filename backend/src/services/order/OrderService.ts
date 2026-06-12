import type { Order, OrderWithItems } from '@/domain/Order';

import { SignJWT } from 'jose';
import type { ICartRepository } from '@/repositories/cart/ICartRepository';
import type { IOrderRepository } from '@/repositories/order/IOrderRepository';
import type { IOrderService } from '@/services/order/IOrderService';
import type { CreateOrderDto } from '@/dtos/OrderDto';

async function hashToken(token: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(token);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
}

export class OrderService implements IOrderService {
  constructor(
    private orderRepository: IOrderRepository,
    private cartRepository: ICartRepository,
  ) {}

  async getOrders(userId?: number) {
    return this.orderRepository.findAll(userId);
  }

  async getOrderById(id: number): Promise<OrderWithItems | null> {
    const order = await this.orderRepository.findById(id);
    if (!order) return null;
    const items = await this.orderRepository.findItemsByOrderId(id);
    return { ...order, items };
  }

  async createOrder(data: CreateOrderDto): Promise<{ order: OrderWithItems; guestToken?: string }> {
    const cartItems = await this.orderRepository.getCartItems(data.cartId);
    const totalAmount = cartItems.reduce((sum, i) => sum + i.quantity * i.unitPrice, 0);
    const orderNumber = `NIKE-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

    let guestToken: string | undefined;
    let guestTokenHash: string | undefined;

    if (!data.userId) {
      guestToken = await new SignJWT({ orderId: 0, sub: 'guest' })
        .setProtectedHeader({ alg: 'HS256' })
        .setExpirationTime('7d')
        .sign(new TextEncoder().encode(process.env.JWT_SECRET || 'fallback-secret'));
      guestTokenHash = await hashToken(guestToken);
    }

    const order = await this.orderRepository.create({
      userId: data.userId ?? null,
      orderNumber,
      totalAmount,
      shippingAddress: data.shippingAddress,
      status: 'pending',
      guestTokenHash,
    });

    if (guestToken) {
      guestToken = await new SignJWT({ orderId: order.id, sub: 'guest' })
        .setProtectedHeader({ alg: 'HS256' })
        .setExpirationTime('7d')
        .sign(new TextEncoder().encode(process.env.JWT_SECRET || 'fallback-secret'));
    }

    await this.orderRepository.createItems(
      cartItems
        .filter((ci) => ci.sku && ci.product)
        .map((ci) => ({
          orderId: order.id,
          skuId: ci.skuId,
          productId: ci.sku!.productId,
          productName: ci.product!.name,
          skuCode: ci.sku!.sku,
          size: ci.sku!.size,
          color: ci.sku!.color,
          quantity: ci.quantity,
          unitPrice: ci.unitPrice,
        }))
    );

    await this.cartRepository.markConverted(data.cartId);

    const items = await this.orderRepository.findItemsByOrderId(order.id);

    return { order: { ...order, items }, guestToken };
  }

  async updateStatus(id: number, status: string): Promise<Order> {
    const order = await this.orderRepository.findById(id);
    if (!order) throw new Error('Order not found');
    return this.orderRepository.updateStatus(id, status);
  }
}
