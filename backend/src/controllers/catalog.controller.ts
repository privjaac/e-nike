import type { Context } from 'hono';
import { CatalogService } from '../services/catalog.service';

export class CatalogController {
  private service = new CatalogService();

  async getProducts(c: Context) {
    const category = c.req.query('category');
    const sport = c.req.query('sport');
    const gender = c.req.query('gender');
    const search = c.req.query('search');
    const page = parseInt(c.req.query('page') || '1');
    const limit = parseInt(c.req.query('limit') || '24');

    const result = await this.service.getProducts({ category, sport, gender, search, page, limit });
    return c.json({ success: true, data: result });
  }

  async getProductBySlug(c: Context) {
    const slug = c.req.param('slug')!;
    const result = await this.service.getProductBySlug(slug);
    if (!result) return c.json({ success: false, error: 'Product not found' }, 404);
    return c.json({ success: true, data: result });
  }

  async getCategories(c: Context) {
    const result = await this.service.getCategories();
    return c.json({ success: true, data: result });
  }
}
