import { Hono } from 'hono';
import type { CatalogController } from '@/controllers/CatalogController';

export function createCatalogRoutes(controller: CatalogController) {
  const catalog = new Hono();
  catalog.get('/products', (c) => controller.getProducts(c));
  catalog.get('/products/:slug', (c) => controller.getProductBySlug(c));
  catalog.get('/categories', (c) => controller.getCategories(c));
  return catalog;
}
