import { create } from 'zustand';
import { useAuthStore } from './authStore';

const API_URL = 'http://localhost:3001/api/v1';
const SESSION_KEY = 'e-nike-session-id';

function getOrCreateSessionId(): string {
  let sessionId = localStorage.getItem(SESSION_KEY);
  if (!sessionId) {
    sessionId = Math.random().toString(36).slice(2) + Date.now().toString(36);
    localStorage.setItem(SESSION_KEY, sessionId);
  }
  return sessionId;
}

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

interface CartState {
  items: CartItem[];
  cartId: string | null;
  subtotal: number;
  itemCount: number;
  isLoading: boolean;
  error: string | null;

  addItem: (skuId: string, quantity: number, unitPrice: number) => Promise<void>;
  removeItem: (itemId: string) => Promise<void>;
  updateQuantity: (itemId: string, quantity: number) => Promise<void>;
  fetchCart: (sessionId?: string) => Promise<void>;
  clearCart: () => void;
}

function computeTotals(items: CartItem[]) {
  const subtotal = items.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0);
  const itemCount = items.reduce((count, item) => count + item.quantity, 0);
  return { subtotal, itemCount };
}

export const useCartStore = create<CartState>()((set, get) => ({
  items: [],
  cartId: null,
  subtotal: 0,
  itemCount: 0,
  isLoading: false,
  error: null,

  addItem: async (skuId: string, quantity: number, unitPrice: number) => {
    const token = useAuthStore.getState().token;
    const cartId = get().cartId;
    const sessionId = getOrCreateSessionId();
    set({ isLoading: true, error: null });
    try {
      const body: Record<string, unknown> = {
        skuId,
        quantity,
        unitPrice,
        sessionId,
      };
      if (token && cartId) {
        body.cartId = cartId;
      }

      const res = await fetch(`${API_URL}/cart/items`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(body),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || 'Failed to add item');
      }

      // Refetch to get accurate cart state
      await get().fetchCart();
    } catch (err) {
      set({
        error: err instanceof Error ? err.message : 'Failed to add item',
        isLoading: false,
      });
      throw err;
    }
  },

  removeItem: async (itemId: string) => {
    const token = useAuthStore.getState().token;
    set({ isLoading: true, error: null });
    try {
      const res = await fetch(`${API_URL}/cart/items/${Number(itemId)}`, {
        method: 'DELETE',
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || 'Failed to remove item');
      }

      await get().fetchCart();
    } catch (err) {
      set({
        error: err instanceof Error ? err.message : 'Failed to remove item',
        isLoading: false,
      });
      throw err;
    }
  },

  updateQuantity: async (itemId: string, quantity: number) => {
    const token = useAuthStore.getState().token;
    set({ isLoading: true, error: null });
    try {
      const res = await fetch(`${API_URL}/cart/items/${Number(itemId)}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ quantity }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || 'Failed to update quantity');
      }

      await get().fetchCart();
    } catch (err) {
      set({
        error: err instanceof Error ? err.message : 'Failed to update quantity',
        isLoading: false,
      });
      throw err;
    }
  },

  fetchCart: async (overrideSessionId?: string) => {
    const token = useAuthStore.getState().token;
    const sessionId = overrideSessionId || getOrCreateSessionId();
    const cartId = get().cartId;
    set({ isLoading: true, error: null });
    try {
      let url: string;
      if (cartId && token) {
        url = `${API_URL}/cart/${cartId}`;
      } else {
        url = `${API_URL}/cart?sessionId=${encodeURIComponent(sessionId)}`;
      }

      const res = await fetch(url, {
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });

      const responseData = await res.json();

      if (!res.ok) {
        throw new Error(responseData.message || 'Failed to fetch cart');
      }

      const cart = responseData.data;
      const items = cart.items || [];
      set({
        items,
        cartId: cart.id ? String(cart.id) : get().cartId,
        ...computeTotals(items),
        isLoading: false,
      });
    } catch (err) {
      set({
        error: err instanceof Error ? err.message : 'Failed to fetch cart',
        isLoading: false,
      });
    }
  },

  clearCart: () => {
    set({ items: [], cartId: null, subtotal: 0, itemCount: 0, error: null });
  },
}));
