import { Hono } from 'hono';
import type { InventoryController } from '@/controllers/InventoryController';

export function createInventoryRoutes(controller: InventoryController) {
  const inventory = new Hono();
  inventory.get('/product/:productId', (c) => controller.getProductInventory(c));
  inventory.get('/sku/:skuId/nodes', (c) => controller.getSkuNodes(c));
  return inventory;
}
