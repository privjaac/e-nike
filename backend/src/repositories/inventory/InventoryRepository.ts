import type { InventoryNode, InventoryStock } from '@/domain/Inventory';
import type { Sku } from '@/domain/Product';

import { db } from '@/db/Database';
import { inventory, inventoryNodes, skus } from '@/db/Schema';
import { eq, sql } from 'drizzle-orm';
import type { IInventoryRepository } from '@/repositories/inventory/IInventoryRepository';

export class InventoryRepository implements IInventoryRepository {
  async findSkusByProductId(productId: number): Promise<Sku[]> {
    return db.select().from(skus).where(eq(skus.productId, productId)).all() as Sku[];
  }

  async findStockBySkuIds(skuIds: number[]): Promise<InventoryStock[]> {
    if (skuIds.length === 0) return [];
    return db
      .select()
      .from(inventory)
      .where(sql`${inventory.skuId} IN ${skuIds}`)
      .all() as InventoryStock[];
  }

  async findNodesByIds(nodeIds: number[]): Promise<InventoryNode[]> {
    if (nodeIds.length === 0) return [];
    return db
      .select()
      .from(inventoryNodes)
      .where(sql`${inventoryNodes.id} IN ${nodeIds}`)
      .all() as InventoryNode[];
  }

  async findSkuNodes(skuId: number) {
    return db
      .select({
        node: inventoryNodes,
        quantity: inventory.quantity,
        reserved: inventory.reservedQuantity,
      })
      .from(inventory)
      .innerJoin(inventoryNodes, eq(inventory.nodeId, inventoryNodes.id))
      .where(eq(inventory.skuId, skuId))
      .all();
  }

  async countLowStock(): Promise<number> {
    const result = await db
      .select({ count: sql<number>`count(*)` })
      .from(inventory)
      .where(sql`${inventory.quantity} - ${inventory.reservedQuantity} < 10`)
      .get();
    return result?.count || 0;
  }

  async sumTotalUnits(): Promise<number> {
    const result = await db
      .select({ total: sql<number>`sum(${inventory.quantity})` })
      .from(inventory)
      .get();
    return result?.total || 0;
  }
}
