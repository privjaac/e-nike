import type { CartItem } from '@/domain/Cart';
import type { Order } from '@/domain/Order';

import { db } from '@/db/Database';
import { orders, cartItems, skus, products } from '@/db/Schema';
import { eq } from 'drizzle-orm';
import type { IOrderRepository } from '@/repositories/order/IOrderRepository';
import type { OrderInsert } from '@/db/Schema';

export class OrderRepository implements IOrderRepository {
  async findAll(userId?: number): Promise<Order[]> {
    if (userId) {
      return db.select().from(orders).where(eq(orders.userId, userId)).all() as Order[];
    }
    return db.select().from(orders).all() as Order[];
  }

  async create(data: OrderInsert): Promise<Order> {
    return db.insert(orders).values(data).returning().get() as Order;
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
