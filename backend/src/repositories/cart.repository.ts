import { db } from '../db';
import { carts, cartItems, skus, products } from '../db/schema';
import { eq } from 'drizzle-orm';
import type { CartItem } from '../types';

export class CartRepository {
  async findById(id: number) {
    return db.select().from(carts).where(eq(carts.id, id)).get();
  }

  async findBySessionId(sessionId: string) {
    return db.select().from(carts).where(eq(carts.sessionId, sessionId)).get();
  }

  async create(sessionId?: string) {
    return db.insert(carts).values({ sessionId }).returning().get();
  }

  async getItems(cartId: number) {
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

  async addItem(data: { cartId: number; skuId: number; quantity: number; unitPrice: number }) {
    return db.insert(cartItems).values(data).returning().get();
  }

  async updateItem(itemId: number, quantity: number) {
    await db.update(cartItems).set({ quantity }).where(eq(cartItems.id, itemId));
  }

  async removeItem(itemId: number) {
    await db.delete(cartItems).where(eq(cartItems.id, itemId));
  }

  async markConverted(cartId: number) {
    await db.update(carts).set({ status: 'converted' }).where(eq(carts.id, cartId));
  }
}
