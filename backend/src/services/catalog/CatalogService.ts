import type { ICatalogRepository } from '@/repositories/catalog/ICatalogRepository';
import type { ICatalogService, PaginatedProducts } from '@/services/catalog/ICatalogService';
import type { Product, Sku } from '@/domain/Product';
import type { ProductFiltersDto, CreateProductDto, UpdateProductDto } from '@/dtos/CatalogDto';
import type { CreateSkuDto, UpdateSkuDto } from '@/dtos/SkuDto';

export class CatalogService implements ICatalogService {
  constructor(private catalogRepository: ICatalogRepository) {}

  async getProducts(filters: ProductFiltersDto): Promise<PaginatedProducts> {
    const { page, limit } = filters;
    const offset = (page - 1) * limit;

    const items = await this.catalogRepository.findAll({
      sport: filters.sport,
      gender: filters.gender,
      search: filters.search,
      size: filters.size,
      sale: filters.sale,
      isMemberOnly: filters.isMemberOnly,
      limit,
      offset,
    });

    const total = await this.catalogRepository.count({
      sport: filters.sport,
      gender: filters.gender,
      search: filters.search,
      size: filters.size,
      sale: filters.sale,
      isMemberOnly: filters.isMemberOnly,
    });

    return {
      items,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async getProductBySlug(slug: string) {
    const product = await this.catalogRepository.findBySlug(slug);
    if (!product) return null;

    const productSkus = await this.catalogRepository.findSkusByProductId(product.id);
    return { ...product, skus: productSkus };
  }

  async getCategories() {
    return this.catalogRepository.findAllCategories();
  }

  async createProduct(data: CreateProductDto) {
    const existing = await this.catalogRepository.findBySlug(data.slug);
    if (existing) throw new Error('Slug already exists');
    return this.catalogRepository.create(data);
  }

  async updateProduct(id: number, data: UpdateProductDto) {
    const product = await this.catalogRepository.findById(id);
    if (!product) throw new Error('Product not found');
    if (data.slug && data.slug !== product.slug) {
      const existing = await this.catalogRepository.findBySlug(data.slug);
      if (existing) throw new Error('Slug already exists');
    }
    return this.catalogRepository.update(id, data);
  }

  async deleteProduct(id: number) {
    const product = await this.catalogRepository.findById(id);
    if (!product) throw new Error('Product not found');
    await this.catalogRepository.remove(id);
  }

  async getProductSkus(productId: number): Promise<Sku[]> {
    return this.catalogRepository.findSkusByProductId(productId);
  }

  async createSku(productId: number, data: CreateSkuDto): Promise<Sku> {
    const product = await this.catalogRepository.findById(productId);
    if (!product) throw new Error('Product not found');
    const existing = await this.catalogRepository.findSkusByProductId(productId);
    const duplicate = existing.find((s) => s.sku === data.sku);
    if (duplicate) throw new Error('SKU code already exists');
    return this.catalogRepository.createSku({ ...data, productId });
  }

  async updateSku(id: number, data: UpdateSkuDto): Promise<Sku> {
    const sku = await this.catalogRepository.findSkuById(id);
    if (!sku) throw new Error('SKU not found');
    return this.catalogRepository.updateSku(id, data);
  }

  async deleteSku(id: number): Promise<void> {
    const sku = await this.catalogRepository.findSkuById(id);
    if (!sku) throw new Error('SKU not found');
    await this.catalogRepository.removeSku(id);
  }
}
