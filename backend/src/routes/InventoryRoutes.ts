import { Hono } from 'hono';
import type { IInventoryController } from '@/controllers/IInventoryController';

export function createInventoryRoutes(controller: IInventoryController) {
  const inventory = new Hono();
  inventory.get('/product/:productId', (c) => controller.getProductInventory(c));
  inventory.get('/sku/:skuId/nodes', (c) => controller.getSkuNodes(c));
  return inventory;
}
