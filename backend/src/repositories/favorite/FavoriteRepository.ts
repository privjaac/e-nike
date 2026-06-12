import type { Favorite, FavoriteWithProduct } from '@/domain/Favorite';

import { db } from '@/db/Database';
import { favorites, products } from '@/db/Schema';
import { eq, and } from 'drizzle-orm';
import type { IFavoriteRepository } from '@/repositories/favorite/IFavoriteRepository';

export class FavoriteRepository implements IFavoriteRepository {
  async findByUser(userId: number): Promise<FavoriteWithProduct[]> {
    const rows = await db
      .select({
        favorite: favorites,
        product: products,
      })
      .from(favorites)
      .innerJoin(products, eq(favorites.productId, products.id))
      .where(eq(favorites.userId, userId))
      .all();

    return rows.map((r) => ({
      ...r.favorite,
      product: r.product,
    })) as FavoriteWithProduct[];
  }

  async findOne(userId: number, productId: number): Promise<Favorite | undefined> {
    return db
      .select()
      .from(favorites)
      .where(and(eq(favorites.userId, userId), eq(favorites.productId, productId)))
      .get() as Favorite | undefined;
  }

  async create(userId: number, productId: number): Promise<Favorite> {
    return db
      .insert(favorites)
      .values({ userId, productId })
      .returning()
      .get() as Favorite;
  }

  async delete(userId: number, productId: number): Promise<void> {
    await db
      .delete(favorites)
      .where(and(eq(favorites.userId, userId), eq(favorites.productId, productId)));
  }
}
