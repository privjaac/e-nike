import { get, post, patch, del } from '@/services/api';

export interface CartItem {
  id: string;
  skuId: number;
  quantity: number;
  unitPrice: number;
  name?: string;
  image?: string;
  product?: {
    name: string;
    imageUrl: string;
    slug: string;
  };
  sku?: {
    size: string;
    color: string;
  };
}

export interface Cart {
  id: number | null;
  items: CartItem[];
  subtotal: number;
}

function buildCartUrl(path: string, sessionId?: string) {
  const qs = sessionId ? `?sessionId=${encodeURIComponent(sessionId)}` : '';
  return `${path}${qs}`;
}

export const cartService = {
  getCart(sessionId?: string, token?: string | null) {
    return get<Cart>(buildCartUrl('/cart', sessionId), token);
  },

  addItem(skuId: string | number, quantity: number, unitPrice: number, sessionId: string, token?: string | null) {
    const body = { skuId: Number(skuId), quantity, unitPrice };
    return post<CartItem>(buildCartUrl('/cart/items', sessionId), body, token);
  },

  updateItem(itemId: string, quantity: number, token?: string | null) {
    return patch<void>(`/cart/items/${itemId}`, { quantity }, token);
  },

  removeItem(itemId: string, token?: string | null) {
    return del<void>(`/cart/items/${itemId}`, token);
  },
};
