'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { api } from '@/lib/api';

interface User {
  _id: string;
  username: string;
  email: string;
  role: 'admin' | 'super_admin' | 'user';
  profile?: {
    firstName?: string;
    lastName?: string;
    avatar?: string;
  };
}

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (userData: RegisterData) => Promise<void>;
  logout: () => Promise<void>;
  forgotPassword: (email: string) => Promise<void>;
  resetPassword: (token: string, password: string) => Promise<void>;
  setLoading: (loading: boolean) => void;
}

interface RegisterData {
  username: string;
  email: string;
  password: string;
}

export const useAuth = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      loading: true,

      setLoading: (loading: boolean) => set({ loading }),

      login: async (email: string, password: string) => {
        try {
          set({ loading: true });
          const response = await api.post('/auth/login', { email, password });
          const { user, token } = response.data.data;
          
          set({
            user,
            token,
            isAuthenticated: true,
            loading: false,
          });

          // Set token in API client
          api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        } catch (error: any) {
          set({ loading: false });
          throw new Error(error.response?.data?.message || 'Login failed');
        }
      },

      register: async (userData: RegisterData) => {
        try {
          set({ loading: true });
          const response = await api.post('/auth/register', userData);
          const { user, token } = response.data.data;
          
          set({
            user,
            token,
            isAuthenticated: true,
            loading: false,
          });

          // Set token in API client
          api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        } catch (error: any) {
          set({ loading: false });
          throw new Error(error.response?.data?.message || 'Registration failed');
        }
      },

      logout: async () => {
        try {
          // Call logout endpoint if token exists
          const { token } = get();
          if (token) {
            await api.post('/auth/logout');
          }
        } catch (error) {
          // Ignore logout errors
        } finally {
          set({
            user: null,
            token: null,
            isAuthenticated: false,
            loading: false,
          });

          // Remove token from API client
          delete api.defaults.headers.common['Authorization'];
        }
      },

      forgotPassword: async (email: string) => {
        try {
          set({ loading: true });
          await api.post('/auth/forgot-password', { email });
          set({ loading: false });
        } catch (error: any) {
          set({ loading: false });
          throw new Error(error.response?.data?.message || 'Failed to send reset email');
        }
      },

      resetPassword: async (token: string, password: string) => {
        try {
          set({ loading: true });
          await api.post('/auth/reset-password', { token, password });
          set({ loading: false });
        } catch (error: any) {
          set({ loading: false });
          throw new Error(error.response?.data?.message || 'Failed to reset password');
        }
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);

// Initialize API client with stored token
if (typeof window !== 'undefined') {
  const { token } = useAuth.getState();
  if (token) {
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  }
}
