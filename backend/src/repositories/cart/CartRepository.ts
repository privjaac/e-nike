import type { CartItem } from '@/domain/Cart';

import { db } from '@/db/Database';
import { carts, cartItems, skus, products } from '@/db/Schema';
import { eq, and } from 'drizzle-orm';
import type { ICartRepository, CartRow } from '@/repositories/cart/ICartRepository';

export class CartRepository implements ICartRepository {
  async findById(id: number): Promise<CartRow | undefined> {
    const row = db.select().from(carts).where(eq(carts.id, id)).get();
    return row as CartRow | undefined;
  }

  async findByUserId(userId: number): Promise<CartRow | undefined> {
    const row = db
      .select()
      .from(carts)
      .where(and(eq(carts.userId, userId), eq(carts.status, 'active')))
      .get();
    return row as CartRow | undefined;
  }

  async findBySessionId(sessionId: string): Promise<CartRow | undefined> {
    const row = db.select().from(carts).where(eq(carts.sessionId, sessionId)).get();
    return row as CartRow | undefined;
  }

  async create(data: { userId?: number; sessionId?: string }): Promise<CartRow> {
    const row = db.insert(carts).values(data).returning().get();
    return row as CartRow;
  }

  async assignUser(sessionId: string, userId: number): Promise<void> {
    await db
      .update(carts)
      .set({ userId, sessionId: null })
      .where(eq(carts.sessionId, sessionId));
  }

  async getItems(cartId: number): Promise<CartItem[]> {
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

  async findItemByCartAndSku(cartId: number, skuId: number): Promise<CartItem | undefined> {
    const row = db.select().from(cartItems).where(and(eq(cartItems.cartId, cartId), eq(cartItems.skuId, skuId))).get();
    return row as CartItem | undefined;
  }

  async addItem(data: { cartId: number; skuId: number; quantity: number; unitPrice: number }): Promise<CartItem> {
    const row = db.insert(cartItems).values(data).returning().get();
    return row as CartItem;
  }

  async updateItem(itemId: number, quantity: number): Promise<void> {
    await db.update(cartItems).set({ quantity }).where(eq(cartItems.id, itemId));
  }

  async removeItem(itemId: number): Promise<void> {
    await db.delete(cartItems).where(eq(cartItems.id, itemId));
  }

  async markConverted(cartId: number): Promise<void> {
    await db.update(carts).set({ status: 'converted' }).where(eq(carts.id, cartId));
  }
}
