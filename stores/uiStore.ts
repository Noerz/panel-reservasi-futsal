import { create } from 'zustand';

interface UIState {
  activeNav: string;
  sidebarCollapsed: boolean;
  isLoading: boolean;
  setActiveNav: (nav: string) => void;
  toggleSidebar: () => void;
  setLoading: (loading: boolean) => void;
}

export const useUIStore = create<UIState>((set) => ({
  activeNav: '/admin',
  sidebarCollapsed: false,
  isLoading: false,
  setActiveNav: (nav) => set({ activeNav: nav }),
  toggleSidebar: () => set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),
  setLoading: (loading) => set({ isLoading: loading }),
}));
