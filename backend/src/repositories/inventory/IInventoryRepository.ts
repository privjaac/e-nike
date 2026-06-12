import type { InventoryStock, InventoryNode } from '@/domain/Inventory';
import type { Sku } from '@/domain/Product';

export interface IInventoryRepository {
  findSkusByProductId(productId: number): Promise<Sku[]>;
  findStockBySkuIds(skuIds: number[]): Promise<InventoryStock[]>;
  findNodesByIds(nodeIds: number[]): Promise<InventoryNode[]>;
  findSkuNodes(skuId: number): Promise<Array<{ node: InventoryNode; quantity: number; reserved: number }>>;
  countLowStock(): Promise<number>;
  sumTotalUnits(): Promise<number>;
}
