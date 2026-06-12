import { Context } from 'hono';
import type { ICatalogController } from '@/controllers/ICatalogController';
import type { ICatalogService } from '@/services/catalog/ICatalogService';
import { productFiltersSchema, createProductSchema, updateProductSchema } from '@/dtos/CatalogDto';
import type { ProductFiltersDto, CreateProductDto, UpdateProductDto } from '@/dtos/CatalogDto';
import { createSkuSchema, updateSkuSchema } from '@/dtos/SkuDto';
import type { CreateSkuDto, UpdateSkuDto } from '@/dtos/SkuDto';

export class CatalogController implements ICatalogController {
  constructor(private catalogService: ICatalogService) {}

  async getProducts(c: Context) {
    const query = c.req.query();
    const parsed: ProductFiltersDto = productFiltersSchema.parse(query);
    const result = await this.catalogService.getProducts(parsed);
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

  async createProduct(c: Context) {
    const data = await c.req.json<CreateProductDto>();
    const parsed = createProductSchema.parse(data);
    const result = await this.catalogService.createProduct(parsed);
    return c.json({ success: true, data: result }, 201);
  }

  async updateProduct(c: Context) {
    const id = parseInt(c.req.param('id')!, 10);
    const data = await c.req.json<UpdateProductDto>();
    const parsed = updateProductSchema.parse(data);
    const result = await this.catalogService.updateProduct(id, parsed);
    return c.json({ success: true, data: result });
  }

  async deleteProduct(c: Context) {
    const id = parseInt(c.req.param('id')!, 10);
    await this.catalogService.deleteProduct(id);
    return c.json({ success: true });
  }

  async getProductSkus(c: Context) {
    const productId = parseInt(c.req.param('productId')!, 10);
    const result = await this.catalogService.getProductSkus(productId);
    return c.json({ success: true, data: result });
  }

  async createSku(c: Context) {
    const productId = parseInt(c.req.param('productId')!, 10);
    const data = await c.req.json<CreateSkuDto>();
    const parsed = createSkuSchema.parse(data);
    const result = await this.catalogService.createSku(productId, parsed);
    return c.json({ success: true, data: result }, 201);
  }

  async updateSku(c: Context) {
    const skuId = parseInt(c.req.param('skuId')!, 10);
    const data = await c.req.json<UpdateSkuDto>();
    const parsed = updateSkuSchema.parse(data);
    const result = await this.catalogService.updateSku(skuId, parsed);
    return c.json({ success: true, data: result });
  }

  async deleteSku(c: Context) {
    const skuId = parseInt(c.req.param('skuId')!, 10);
    await this.catalogService.deleteSku(skuId);
    return c.json({ success: true });
  }
}
