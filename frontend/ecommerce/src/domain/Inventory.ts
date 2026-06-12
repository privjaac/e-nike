export interface InventoryStock {
  id: number;
  skuId: number;
  nodeId: number;
  quantity: number;
  reservedQuantity: number;
  updatedAt: string;
}

export interface InventoryNode {
  id: number;
  name: string;
  code: string;
  type: string;
  city: string;
  country: string;
}
