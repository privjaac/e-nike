import type { Context } from 'hono';
import { InventoryService } from '../services/inventory.service';

export class InventoryController {
  private service = new InventoryService();

  async getProductInventory(c: Context) {
    const productId = parseInt(c.req.param('productId')!);
    const result = await this.service.getProductInventory(productId);
    return c.json({ success: true, data: result });
  }

  async getSkuNodes(c: Context) {
    const skuId = parseInt(c.req.param('skuId')!);
    const result = await this.service.getSkuNodes(skuId);
    return c.json({ success: true, data: result });
  }
}
