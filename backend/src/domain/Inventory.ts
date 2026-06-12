export interface InventoryNode {
  id: number;
  name: string;
  code: string;
  type: 'warehouse' | 'store' | 'partner';
  city: string;
  country: string;
}

export interface InventoryStock {
  id: number;
  skuId: number;
  nodeId: number;
  quantity: number;
  reservedQuantity: number;
  updatedAt: string;
}
