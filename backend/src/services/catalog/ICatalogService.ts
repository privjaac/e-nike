import type { Product, Category, ProductWithSkus } from '@/domain/Product';

export interface PaginatedProducts {
  items: Product[];
  pagination: { page: number; limit: number; total: number; totalPages: number };
}

export interface ICatalogService {
  getProducts(filters: { category?: string; sport?: string; gender?: string; search?: string; sale?: boolean; page: number; limit: number }): Promise<PaginatedProducts>;
  getProductBySlug(slug: string): Promise<ProductWithSkus | null>;
  getCategories(): Promise<Category[]>;
}
