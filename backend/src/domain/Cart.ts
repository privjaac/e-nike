import type { Sku, Product } from '@/domain/Product';

export interface Cart {
  id: number;
  userId: number | null;
  sessionId: string | null;
  status: 'active' | 'converted' | 'abandoned';
  items: CartItem[];
  subtotal: number;
}

export interface CartItem {
  id: number;
  cartId: number;
  skuId: number;
  quantity: number;
  unitPrice: number;
  sku?: Sku;
  product?: Product;
}
