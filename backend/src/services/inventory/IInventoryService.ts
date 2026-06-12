import type { InventoryStock, InventoryNode } from '@/domain/Inventory';
import type { Sku } from '@/domain/Product';

export interface ProductInventory {
  skus: Sku[];
  stock: InventoryStock[];
  nodes: InventoryNode[];
}

export interface SkuNode {
  node: InventoryNode;
  quantity: number;
  reserved: number;
}

export interface IInventoryService {
  getProductInventory(productId: number): Promise<ProductInventory>;
  getSkuNodes(skuId: number): Promise<SkuNode[]>;
}
