import { Hono } from 'hono';
import { InventoryController } from '../controllers/inventory.controller';

const inventory = new Hono();
const controller = new InventoryController();

inventory.get('/product/:productId', (c) => controller.getProductInventory(c));
inventory.get('/sku/:skuId/nodes', (c) => controller.getSkuNodes(c));

export { inventory as inventoryRoutes };
