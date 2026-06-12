import type { Product, Category, Sku } from '@/domain/Product';

export interface ICatalogRepository {
  findAll(filters: { sport?: string; gender?: string; search?: string; sale?: boolean; limit: number; offset: number }): Promise<Product[]>;
  count(filters: { sport?: string; gender?: string; search?: string; sale?: boolean }): Promise<number>;
  findBySlug(slug: string): Promise<Product | undefined>;
  findSkusByProductId(productId: number): Promise<Sku[]>;
  findAllCategories(): Promise<Category[]>;
}
