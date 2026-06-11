import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const API_URL = 'http://localhost:3001/api/v1';

export interface User {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  role: 'customer' | 'admin' | 'merchandiser';
  membershipTier: string;
  preferences?: Record<string, unknown>;
  createdAt?: string;
  updatedAt?: string;
}

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
          const res = await fetch(`${API_URL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password }),
          });

          const data = await res.json();

          if (!res.ok) {
            throw new Error(data.error || data.message || 'Login failed');
          }

          const payload = data.data || data;
          const token = payload.token || payload.accessToken;
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
          const res = await fetch(`${API_URL}/auth/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
          });

          const responseData = await res.json();

          if (!res.ok) {
            throw new Error(responseData.error || responseData.message || 'Registration failed');
          }

          const payload = responseData.data || responseData;
          const token = payload.token || payload.accessToken;
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
          const res = await fetch(`${API_URL}/auth/me`, {
            headers: {
              Authorization: `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
          });

          const data = await res.json();

          if (!res.ok) {
            throw new Error(data.error || data.message || 'Failed to fetch user');
          }

          const payload = data.data || data;
          set({
            user: payload.user || payload,
            isAuthenticated: true,
            isAdmin: (payload.user || payload)?.role === 'admin',
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
