import { get } from './api';

export interface InventoryNode {
  id: number;
  name: string;
  code: string;
  type: string;
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

export interface Sku {
  id: number;
  productId: number;
  sku: string;
  size: string;
  color: string;
  colorHex: string | null;
  stockQuantity: number;
  weightGrams: number | null;
}

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

export const inventoryService = {
  getProductInventory(productId: number, token?: string | null) {
    return get<ProductInventory>(`/inventory/product/${productId}`, token);
  },

  getSkuNodes(skuId: number, token?: string | null) {
    return get<SkuNode[]>(`/inventory/sku/${skuId}/nodes`, token);
  },
};
