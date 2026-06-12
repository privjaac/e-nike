import type { IInventoryRepository } from '@/repositories/inventory/IInventoryRepository';
import type { IInventoryService, ProductInventory, SkuNode } from '@/services/inventory/IInventoryService';

export class InventoryService implements IInventoryService {
  constructor(private inventoryRepository: IInventoryRepository) {}

  async getProductInventory(productId: number): Promise<ProductInventory> {
    const productSkus = await this.inventoryRepository.findSkusByProductId(productId);
    const skuIds = productSkus.map((s) => s.id);

    if (skuIds.length === 0) return { skus: [], stock: [], nodes: [] };

    const stock = await this.inventoryRepository.findStockBySkuIds(skuIds);
    const nodeIds = [...new Set(stock.map((s) => s.nodeId))];
    const nodes = await this.inventoryRepository.findNodesByIds(nodeIds);

    return { skus: productSkus, stock, nodes };
  }

  async getSkuNodes(skuId: number): Promise<SkuNode[]> {
    return this.inventoryRepository.findSkuNodes(skuId) as Promise<SkuNode[]>;
  }
}
