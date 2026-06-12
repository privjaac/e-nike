import { create } from 'zustand';
import { favoritesService, type FavoriteItem } from '@/services/FavoritesService';
import { useAuthStore } from './authStore';

export type { FavoriteItem };

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

function mapToFavoriteProduct(item: FavoriteItem): FavoriteProduct {
  const p = item.product;
  return {
    id: String(item.id),
    name: p.name,
    slug: p.slug,
    price: p.basePrice || 0,
    imageUrl: p.imageUrl,
    category: p.sport,
  };
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
      const favorites = await favoritesService.getAll(token);
      set({ items: favorites.map(mapToFavoriteProduct), isLoading: false });
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
      await favoritesService.add(productId, token);
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
      await favoritesService.remove(productId, token);
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
