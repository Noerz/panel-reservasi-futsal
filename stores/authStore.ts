import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { authService } from '@/services';
import { setCookie, deleteCookie, getCookie } from 'cookies-next';

interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'user';
}

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  initialized: boolean;

  // Actions
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  checkAuth: () => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,
      initialized: false,

      checkAuth: () => {
        const token = getCookie('token');
        const state = get();
        
        if (token && state.user) {
          set({
            token: token as string,
            isAuthenticated: true,
            initialized: true,
          });
        } else if (!token) {
          set({
            user: null,
            token: null,
            isAuthenticated: false,
            initialized: true,
          });
        } else {
          set({ initialized: true });
        }
      },

    login: async (email: string, password: string) => {
      set({ isLoading: true, error: null });
      try {
        const response = await authService.login({ email, password });
        
        // Extract token from response.data.access_token
        const token = response.data?.access_token;
        
        // Extract user data from response.data
        const userData = response.data ? {
          id: response.data.id,
          name: response.data.name,
          email: email, // email tidak ada di response, pakai dari input
          role: response.data.role as 'admin' | 'user',
        } : null;
        
        if (token) {
          // Save token to cookie
          setCookie('token', token, {
            maxAge: 60 * 60 * 24 * 7, // 7 days
            path: '/',
          });
          
          set({
            user: userData,
            token: token,
            isAuthenticated: true,
            isLoading: false,
            error: null,
          });
        } else {
          throw new Error(response.message || 'Login gagal - token tidak ditemukan');
        }
      } catch (error: any) {
        const errorMessage = error.response?.data?.message || 
                            error.message || 
                            'Login gagal. Silakan coba lagi.';
        set({
          isLoading: false,
          error: errorMessage,
        });
        throw error;
      }
    },

    logout: async () => {
      try {
        await authService.logout();
      } catch (error) {
        console.error('Logout error:', error);
      } finally {
        // Remove token from cookie
        deleteCookie('token');
        set({
          user: null,
          token: null,
          isAuthenticated: false,
          error: null,
        });
      }
    },

    setLoading: (loading) => set({ isLoading: loading }),
    setError: (error) => set({ error }),
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);
