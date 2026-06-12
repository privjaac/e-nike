import { get, post, patch, del } from './api';

export interface CartItem {
  id: string;
  skuId: string;
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

export const cartService = {
  getCart(cartId?: string, sessionId?: string, token?: string | null) {
    const url = cartId && token ? `/cart/${cartId}` : `/cart?sessionId=${encodeURIComponent(sessionId || '')}`;
    return get<Cart>(url, token);
  },

  addItem(skuId: string, quantity: number, unitPrice: number, sessionId: string, cartId?: string | null, token?: string | null) {
    const body: Record<string, unknown> = { skuId, quantity, unitPrice, sessionId };
    if (cartId && token) body.cartId = cartId;
    return post<CartItem>('/cart/items', body, token);
  },

  updateItem(itemId: string, quantity: number, token?: string | null) {
    return patch<void>(`/cart/items/${itemId}`, { quantity }, token);
  },

  removeItem(itemId: string, token?: string | null) {
    return del<void>(`/cart/items/${itemId}`, token);
  },
};
