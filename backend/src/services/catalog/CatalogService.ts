import type { ICatalogRepository } from '@/repositories/catalog/ICatalogRepository';
import type { ICatalogService, PaginatedProducts } from '@/services/catalog/ICatalogService';

export class CatalogService implements ICatalogService {
  constructor(private catalogRepository: ICatalogRepository) {}

  async getProducts(filters: { category?: string; sport?: string; gender?: string; search?: string; sale?: boolean; page: number; limit: number }): Promise<PaginatedProducts> {
    const { page, limit } = filters;
    const offset = (page - 1) * limit;

    const items = await this.catalogRepository.findAll({
      sport: filters.sport,
      gender: filters.gender,
      search: filters.search,
      sale: filters.sale,
      limit,
      offset,
    });

    const total = await this.catalogRepository.count({
      sport: filters.sport,
      gender: filters.gender,
      search: filters.search,
      sale: filters.sale,
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
}
