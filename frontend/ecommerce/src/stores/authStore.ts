import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { authService, type User } from '../services/auth.service';

export type { User };

export interface RegisterData {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
}

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  isLoading: boolean;
  isInitialized: boolean;
  error: string | null;

  login: (email: string, password: string) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => void;
  fetchMe: () => Promise<void>;
  setInitialized: (v: boolean) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      isAdmin: false,
      isLoading: false,
      isInitialized: false,
      error: null,

      setInitialized: (v) => set({ isInitialized: v }),

      login: async (email: string, password: string) => {
        set({ isLoading: true, error: null });
        try {
          const payload = await authService.login(email, password);
          const token = payload.token;
          set({
            token,
            user: payload.user,
            isAuthenticated: true,
            isAdmin: payload.user?.role === 'admin',
            isLoading: false,
          });
        } catch (err) {
          set({
            error: err instanceof Error ? err.message : 'Login failed',
            isLoading: false,
          });
          throw err;
        }
      },

      register: async (data: RegisterData) => {
        set({ isLoading: true, error: null });
        try {
          const payload = await authService.register(data);
          const token = payload.token;
          set({
            token,
            user: payload.user,
            isAuthenticated: true,
            isAdmin: payload.user?.role === 'admin',
            isLoading: false,
          });
        } catch (err) {
          set({
            error: err instanceof Error ? err.message : 'Registration failed',
            isLoading: false,
          });
          throw err;
        }
      },

      logout: () => {
        set({
          user: null,
          token: null,
          isAuthenticated: false,
          isAdmin: false,
          error: null,
        });
      },

      fetchMe: async () => {
        const { token } = get();
        if (!token) {
          set({ isInitialized: true });
          return;
        }

        set({ isLoading: true, error: null });
        try {
          const payload = await authService.me(token);
          set({
            token,
            user: payload.user,
            isAuthenticated: true,
            isAdmin: (payload.user)?.role === 'admin',
            isLoading: false,
            isInitialized: true,
          });
        } catch (err) {
          set({
            user: null,
            token: null,
            isAuthenticated: false,
            isAdmin: false,
            error: err instanceof Error ? err.message : 'Failed to fetch user',
            isLoading: false,
            isInitialized: true,
          });
        }
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        token: state.token,
        user: state.user,
        isAuthenticated: state.isAuthenticated,
        isAdmin: state.isAdmin,
      }),
    }
  )
);
