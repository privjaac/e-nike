import { db } from '../db';
import { orders, cartItems, skus, products } from '../db/schema';
import { eq } from 'drizzle-orm';
import type { Order, CartItem } from '../types';

export class OrderRepository {
  async findAll(userId?: number): Promise<Order[]> {
    if (userId) {
      return db.select().from(orders).where(eq(orders.userId, userId)).all() as Order[];
    }
    return db.select().from(orders).all() as Order[];
  }

  async create(data: {
    userId: number;
    orderNumber: string;
    totalAmount: number;
    shippingAddress?: any;
    status: string;
  }): Promise<Order> {
    return db.insert(orders).values(data as any).returning().get() as Order;
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
