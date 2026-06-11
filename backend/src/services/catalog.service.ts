import { CatalogRepository } from '../repositories/catalog.repository';

export class CatalogService {
  private catalogRepo = new CatalogRepository();

  async getProducts(filters: { category?: string; sport?: string; gender?: string; search?: string; page: number; limit: number }) {
    const { page, limit } = filters;
    const offset = (page - 1) * limit;

    const items = await this.catalogRepo.findAll({
      sport: filters.sport,
      gender: filters.gender,
      search: filters.search,
      limit,
      offset,
    });

    const total = await this.catalogRepo.count({
      sport: filters.sport,
      gender: filters.gender,
      search: filters.search,
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
    const product = await this.catalogRepo.findBySlug(slug);
    if (!product) return null;

    const productSkus = await this.catalogRepo.findSkusByProductId(product.id);
    return { ...product, skus: productSkus };
  }

  async getCategories() {
    return this.catalogRepo.findAllCategories();
  }
}
