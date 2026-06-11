import { InventoryRepository } from '../repositories/inventory.repository';

export class InventoryService {
  private inventoryRepo = new InventoryRepository();

  async getProductInventory(productId: number) {
    const productSkus = await this.inventoryRepo.findSkusByProductId(productId);
    const skuIds = productSkus.map((s) => s.id);

    if (skuIds.length === 0) return { skus: [], stock: [], nodes: [] };

    const stock = await this.inventoryRepo.findStockBySkuIds(skuIds);
    const nodeIds = [...new Set(stock.map((s) => s.nodeId))];
    const nodes = await this.inventoryRepo.findNodesByIds(nodeIds);

    return { skus: productSkus, stock, nodes };
  }

  async getSkuNodes(skuId: number) {
    return this.inventoryRepo.findSkuNodes(skuId);
  }
}
