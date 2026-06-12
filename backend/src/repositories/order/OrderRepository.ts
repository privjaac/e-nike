import type { CartItem } from '@/domain/Cart';
import type { Order, OrderItem } from '@/domain/Order';

import { db } from '@/db/Database';
import { orders, orderItems, cartItems, skus, products } from '@/db/Schema';
import { eq, and } from 'drizzle-orm';
import type { IOrderRepository } from '@/repositories/order/IOrderRepository';
import type { OrderInsert } from '@/db/Schema';

export class OrderRepository implements IOrderRepository {
  async findAll(userId?: number): Promise<Order[]> {
    if (userId) {
      return db.select().from(orders).where(eq(orders.userId, userId)).all() as Order[];
    }
    return db.select().from(orders).all() as Order[];
  }

  async findById(id: number): Promise<Order | undefined> {
    return db.select().from(orders).where(eq(orders.id, id)).get() as Order | undefined;
  }

  async findItemsByOrderId(orderId: number): Promise<OrderItem[]> {
    return db.select().from(orderItems).where(eq(orderItems.orderId, orderId)).all() as OrderItem[];
  }

  async findByGuestTokenHash(hash: string): Promise<Order | undefined> {
    return db.select().from(orders).where(eq(orders.guestTokenHash, hash)).get() as Order | undefined;
  }

  async create(data: OrderInsert): Promise<Order> {
    return db.insert(orders).values(data).returning().get() as Order;
  }

  async createItems(items: Omit<OrderItem, 'id' | 'createdAt'>[]): Promise<OrderItem[]> {
    if (items.length === 0) return [];
    return db.insert(orderItems).values(items).returning().all() as OrderItem[];
  }

  async updateStatus(id: number, status: string): Promise<Order> {
    return db.update(orders).set({ status: status as any }).where(eq(orders.id, id)).returning().get() as Order;
  }

  async getCartItems(cartId: number): Promise<CartItem[]> {
    const rows = await db
      .select({
        item: cartItems,
        sku: skus,
        product: products,
      })
      .from(cartItems)
      .innerJoin(skus, eq(cartItems.skuId, skus.id))
      .innerJoin(products, eq(skus.productId, products.id))
      .where(eq(cartItems.cartId, cartId))
      .all();

    return rows.map((r) => ({
      ...r.item,
      sku: r.sku,
      product: r.product,
    })) as CartItem[];
  }
}
