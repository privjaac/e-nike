import type { Context } from 'hono';

export interface IInventoryController {
  getProductInventory(c: Context): Promise<Response>;
  getSkuNodes(c: Context): Promise<Response>;
}
