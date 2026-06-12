import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import type { CatalogController } from '@/controllers/CatalogController';
import { createProductSchema, updateProductSchema } from '@/dtos/CatalogDto';
import { createSkuSchema, updateSkuSchema } from '@/dtos/SkuDto';
import { authMiddleware, requireRole } from '@/middleware/AuthMiddleware';

export function createCatalogRoutes(controller: CatalogController) {
  const catalog = new Hono();

  // Public routes
  catalog.get('/products', (c) => controller.getProducts(c));
  catalog.get('/products/:slug', (c) => controller.getProductBySlug(c));
  catalog.get('/categories', (c) => controller.getCategories(c));

  // Admin-only routes
  catalog.use('/admin/*', authMiddleware, requireRole('admin'));

  // Product admin
  catalog.post('/admin/products', zValidator('json', createProductSchema), (c) => controller.createProduct(c));
  catalog.put('/admin/products/:id', zValidator('json', updateProductSchema), (c) => controller.updateProduct(c));
  catalog.delete('/admin/products/:id', (c) => controller.deleteProduct(c));

  // SKU admin
  catalog.get('/admin/products/:productId/skus', (c) => controller.getProductSkus(c));
  catalog.post('/admin/products/:productId/skus', zValidator('json', createSkuSchema), (c) => controller.createSku(c));
  catalog.put('/admin/skus/:skuId', zValidator('json', updateSkuSchema), (c) => controller.updateSku(c));
  catalog.delete('/admin/skus/:skuId', (c) => controller.deleteSku(c));

  return catalog;
}
