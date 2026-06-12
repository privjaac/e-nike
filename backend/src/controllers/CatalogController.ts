import { Context } from 'hono';
import type { ICatalogService } from '@/services/catalog/ICatalogService';
import { productFiltersSchema } from '@/dtos/CatalogDto';

export class CatalogController {
  constructor(private catalogService: ICatalogService) {}

  async getProducts(c: Context) {
    const query = c.req.query();
    const parsed = productFiltersSchema.parse(query);

    const result = await this.catalogService.getProducts({
      category: parsed.category,
      sport: parsed.sport,
      gender: parsed.gender,
      search: parsed.search,
      page: parsed.page,
      limit: parsed.limit,
    });
    return c.json({ success: true, data: result });
  }

  async getProductBySlug(c: Context) {
    const slug = c.req.param('slug')!;
    const result = await this.catalogService.getProductBySlug(slug);
    if (!result) return c.json({ success: false, error: 'Product not found' }, 404);
    return c.json({ success: true, data: result });
  }

  async getCategories(c: Context) {
    const result = await this.catalogService.getCategories();
    return c.json({ success: true, data: result });
  }
}
