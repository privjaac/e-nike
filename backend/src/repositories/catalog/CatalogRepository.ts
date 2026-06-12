import type { Category, Product, Sku } from '@/domain/Product';

import { db } from '@/db/Database';
import { products, categories, skus } from '@/db/Schema';
import { eq, like, and, sql, isNotNull } from 'drizzle-orm';
import type { ICatalogRepository } from '@/repositories/catalog/ICatalogRepository';

export class CatalogRepository implements ICatalogRepository {
  async findAll(filters: {
    sport?: string;
    gender?: string;
    search?: string;
    sale?: boolean;
    limit: number;
    offset: number;
  }): Promise<Product[]> {
    const conditions = [];
    if (filters.sport) conditions.push(eq(sql`lower(${products.sport})`, filters.sport.toLowerCase()));
    if (filters.gender) conditions.push(eq(sql`lower(${products.gender})`, filters.gender.toLowerCase()));
    if (filters.search) conditions.push(like(products.name, `%${filters.search}%`));
    if (filters.sale) conditions.push(isNotNull(products.salePrice));

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

    return db
      .select()
      .from(products)
      .where(whereClause)
      .limit(filters.limit)
      .offset(filters.offset)
      .all() as Product[];
  }

  async count(filters: { sport?: string; gender?: string; search?: string; sale?: boolean }): Promise<number> {
    const conditions = [];
    if (filters.sport) conditions.push(eq(sql`lower(${products.sport})`, filters.sport.toLowerCase()));
    if (filters.gender) conditions.push(eq(sql`lower(${products.gender})`, filters.gender.toLowerCase()));
    if (filters.search) conditions.push(like(products.name, `%${filters.search}%`));
    if (filters.sale) conditions.push(isNotNull(products.salePrice));

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

    const result = await db
      .select({ count: sql<number>`count(*)` })
      .from(products)
      .where(whereClause)
      .get();
    return result?.count || 0;
  }

  async findBySlug(slug: string): Promise<Product | undefined> {
    return db.select().from(products).where(eq(products.slug, slug)).get() as Product | undefined;
  }

  async findSkusByProductId(productId: number): Promise<Sku[]> {
    return db.select().from(skus).where(eq(skus.productId, productId)).all() as Sku[];
  }

  async findAllCategories(): Promise<Category[]> {
    return db.select().from(categories).all() as Category[];
  }
}
