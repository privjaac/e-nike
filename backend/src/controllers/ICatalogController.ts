import type { Context } from 'hono';

export interface ICatalogController {
  getProducts(c: Context): Promise<Response>;
  getProductBySlug(c: Context): Promise<Response>;
  getCategories(c: Context): Promise<Response>;
  createProduct(c: Context): Promise<Response>;
  updateProduct(c: Context): Promise<Response>;
  deleteProduct(c: Context): Promise<Response>;
  getProductSkus(c: Context): Promise<Response>;
  createSku(c: Context): Promise<Response>;
  updateSku(c: Context): Promise<Response>;
  deleteSku(c: Context): Promise<Response>;
}
