import type { Product, Category, Sku } from '@/domain/Product';
import type { ProductInsert, ProductUpdate, SkuInsert, SkuUpdate } from '@/db/Schema';

export interface ICatalogRepository {
  findAll(filters: { sport?: string; gender?: string; search?: string; size?: string; sale?: boolean; isMemberOnly?: boolean; limit: number; offset: number }): Promise<Product[]>;
  count(filters: { sport?: string; gender?: string; search?: string; size?: string; sale?: boolean; isMemberOnly?: boolean }): Promise<number>;
  findById(id: number): Promise<Product | undefined>;
  findBySlug(slug: string): Promise<Product | undefined>;
  create(data: ProductInsert): Promise<Product>;
  update(id: number, data: ProductUpdate): Promise<Product>;
  remove(id: number): Promise<void>;
  findSkusByProductId(productId: number): Promise<Sku[]>;
  findSkuById(id: number): Promise<Sku | undefined>;
  createSku(data: SkuInsert): Promise<Sku>;
  updateSku(id: number, data: SkuUpdate): Promise<Sku>;
  removeSku(id: number): Promise<void>;
  findAllCategories(): Promise<Category[]>;
}
