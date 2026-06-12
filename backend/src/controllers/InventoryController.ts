import { Context } from 'hono';
import type { IInventoryController } from '@/controllers/IInventoryController';
import type { IInventoryService } from '@/services/inventory/IInventoryService';

export class InventoryController implements IInventoryController {
  constructor(private inventoryService: IInventoryService) {}

  async getProductInventory(c: Context) {
    const productId = parseInt(c.req.param('productId')!);
    const result = await this.inventoryService.getProductInventory(productId);
    return c.json({ success: true, data: result });
  }

  async getSkuNodes(c: Context) {
    const skuId = parseInt(c.req.param('skuId')!);
    const result = await this.inventoryService.getSkuNodes(skuId);
    return c.json({ success: true, data: result });
  }
}
