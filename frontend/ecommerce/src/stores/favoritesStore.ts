import { create } from 'zustand';
import { useAuthStore } from './authStore';

const API_URL = 'http://localhost:3001/api/v1';

export interface FavoriteProduct {
  id: string;
  name: string;
  slug: string;
  price: number;
  imageUrl: string;
  category?: string;
}

interface FavoritesState {
  items: FavoriteProduct[];
  isLoading: boolean;
  error: string | null;

  fetchFavorites: () => Promise<void>;
  addFavorite: (productId: string) => Promise<void>;
  removeFavorite: (productId: string) => Promise<void>;
}

export const useFavoritesStore = create<FavoritesState>()((set, get) => ({
  items: [],
  isLoading: false,
  error: null,

  fetchFavorites: async () => {
    const token = useAuthStore.getState().token;
    if (!token) {
      set({ items: [], isLoading: false, error: null });
      return;
    }

    set({ isLoading: true, error: null });
    try {
      const res = await fetch(`${API_URL}/favorites`, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || 'Failed to fetch favorites');
      }

      const favorites: FavoriteProduct[] = data.data || data || [];
      set({ items: favorites, isLoading: false });
    } catch (err) {
      set({
        error: err instanceof Error ? err.message : 'Failed to fetch favorites',
        isLoading: false,
      });
    }
  },

  addFavorite: async (productId: string) => {
    const token = useAuthStore.getState().token;
    if (!token) return;

    set({ isLoading: true, error: null });
    try {
      const res = await fetch(`${API_URL}/favorites`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ productId }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || 'Failed to add favorite');
      }

      await get().fetchFavorites();
    } catch (err) {
      set({
        error: err instanceof Error ? err.message : 'Failed to add favorite',
        isLoading: false,
      });
      throw err;
    }
  },

  removeFavorite: async (productId: string) => {
    const token = useAuthStore.getState().token;
    if (!token) return;

    set({ isLoading: true, error: null });
    try {
      const res = await fetch(`${API_URL}/favorites/${productId}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || 'Failed to remove favorite');
      }

      await get().fetchFavorites();
    } catch (err) {
      set({
        error: err instanceof Error ? err.message : 'Failed to remove favorite',
        isLoading: false,
      });
      throw err;
    }
  },
}));
