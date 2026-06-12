import type { Product, Category, ProductWithSkus, Sku } from '@/domain/Product';
import type { ProductFiltersDto, CreateProductDto, UpdateProductDto } from '@/dtos/CatalogDto';
import type { CreateSkuDto, UpdateSkuDto } from '@/dtos/SkuDto';

export interface PaginatedProducts {
  items: Product[];
  pagination: { page: number; limit: number; total: number; totalPages: number };
}

export interface ICatalogService {
  getProducts(filters: ProductFiltersDto): Promise<PaginatedProducts>;
  getProductBySlug(slug: string): Promise<ProductWithSkus | null>;
  getCategories(): Promise<Category[]>;
  createProduct(data: CreateProductDto): Promise<Product>;
  updateProduct(id: number, data: UpdateProductDto): Promise<Product>;
  deleteProduct(id: number): Promise<void>;
  getProductSkus(productId: number): Promise<Sku[]>;
  createSku(productId: number, data: CreateSkuDto): Promise<Sku>;
  updateSku(id: number, data: UpdateSkuDto): Promise<Sku>;
  deleteSku(id: number): Promise<void>;
}
