import { create } from 'zustand';
import { cartService, type CartItem } from '@/services/CartService';
import { useAuthStore } from './authStore';

export type { CartItem };

const SESSION_KEY = 'e-nike-session-id';

function getOrCreateSessionId(): string {
  let sessionId = localStorage.getItem(SESSION_KEY);
  if (!sessionId) {
    sessionId = Math.random().toString(36).slice(2) + Date.now().toString(36);
    localStorage.setItem(SESSION_KEY, sessionId);
  }
  return sessionId;
}

interface CartState {
  items: CartItem[];
  cartId: string | null;
  subtotal: number;
  itemCount: number;
  isLoading: boolean;
  error: string | null;

  addItem: (skuId: string | number, quantity: number, unitPrice: number) => Promise<void>;
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

  addItem: async (skuId: string | number, quantity: number, unitPrice: number) => {
    const token = useAuthStore.getState().token;
    const sessionId = getOrCreateSessionId();
    set({ isLoading: true, error: null });
    try {
      await cartService.addItem(skuId, quantity, unitPrice, sessionId, token);
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
      await cartService.removeItem(itemId, token);
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
      await cartService.updateItem(itemId, quantity, token);
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
    set({ isLoading: true, error: null });
    try {
      const cart = await cartService.getCart(sessionId, token);
      const items = cart?.items || [];
      set({
        items,
        cartId: cart?.id ? String(cart.id) : get().cartId,
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
