import type { Category, Product, Sku } from '@/domain/Product';

import { db } from '@/db/Database';
import { products, categories, skus } from '@/db/Schema';
import { eq, like, and, sql, isNotNull, inArray } from 'drizzle-orm';
import type { ICatalogRepository } from '@/repositories/catalog/ICatalogRepository';
import type { ProductInsert, ProductUpdate, SkuInsert, SkuUpdate } from '@/db/Schema';

export class CatalogRepository implements ICatalogRepository {
  async findAll(filters: {
    sport?: string;
    gender?: string;
    search?: string;
    size?: string;
    sale?: boolean;
    limit: number;
    offset: number;
  }): Promise<Product[]> {
    const conditions = [];
    if (filters.sport) conditions.push(eq(sql`lower(${products.sport})`, filters.sport.toLowerCase()));
    if (filters.gender) conditions.push(eq(sql`lower(${products.gender})`, filters.gender.toLowerCase()));
    if (filters.search) conditions.push(like(products.name, `%${filters.search}%`));
    if (filters.size) {
      conditions.push(
        inArray(
          products.id,
          db.select({ productId: skus.productId }).from(skus).where(eq(skus.size, filters.size))
        )
      );
    }
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

  async count(filters: { sport?: string; gender?: string; search?: string; size?: string; sale?: boolean }): Promise<number> {
    const conditions = [];
    if (filters.sport) conditions.push(eq(sql`lower(${products.sport})`, filters.sport.toLowerCase()));
    if (filters.gender) conditions.push(eq(sql`lower(${products.gender})`, filters.gender.toLowerCase()));
    if (filters.search) conditions.push(like(products.name, `%${filters.search}%`));
    if (filters.size) {
      conditions.push(
        inArray(
          products.id,
          db.select({ productId: skus.productId }).from(skus).where(eq(skus.size, filters.size))
        )
      );
    }
    if (filters.sale) conditions.push(isNotNull(products.salePrice));

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

    const result = await db
      .select({ count: sql<number>`count(*)` })
      .from(products)
      .where(whereClause)
      .get();
    return result?.count || 0;
  }

  async findById(id: number): Promise<Product | undefined> {
    return db.select().from(products).where(eq(products.id, id)).get() as Product | undefined;
  }

  async findBySlug(slug: string): Promise<Product | undefined> {
    return db.select().from(products).where(eq(products.slug, slug)).get() as Product | undefined;
  }

  async create(data: ProductInsert): Promise<Product> {
    const row = db.insert(products).values(data).returning().get();
    return row as Product;
  }

  async update(id: number, data: ProductUpdate): Promise<Product> {
    const row = db.update(products).set(data).where(eq(products.id, id)).returning().get();
    return row as Product;
  }

  async remove(id: number): Promise<void> {
    db.delete(products).where(eq(products.id, id)).run();
  }

  async findSkusByProductId(productId: number): Promise<Sku[]> {
    return db.select().from(skus).where(eq(skus.productId, productId)).all() as Sku[];
  }

  async findSkuById(id: number): Promise<Sku | undefined> {
    return db.select().from(skus).where(eq(skus.id, id)).get() as Sku | undefined;
  }

  async createSku(data: SkuInsert): Promise<Sku> {
    const row = db.insert(skus).values(data).returning().get();
    return row as Sku;
  }

  async updateSku(id: number, data: SkuUpdate): Promise<Sku> {
    const row = db.update(skus).set(data).where(eq(skus.id, id)).returning().get();
    return row as Sku;
  }

  async removeSku(id: number): Promise<void> {
    db.delete(skus).where(eq(skus.id, id)).run();
  }

  async findAllCategories(): Promise<Category[]> {
    return db.select().from(categories).all() as Category[];
  }
}
