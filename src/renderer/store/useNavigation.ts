import { create } from 'zustand';

export type Page = 'home' | 'test' | 'settings' | 'about';

interface NavigationState {
  currentPage: Page;
  isSidebarCollapsed: boolean;
  setPage: (page: Page) => void;
  toggleSidebar: () => void;
}

export const useNavigation = create<NavigationState>((set) => ({
  currentPage: 'home',
  isSidebarCollapsed: false,
  setPage: (page) => set({ currentPage: page }),
  toggleSidebar: () => set((state) => ({
    isSidebarCollapsed: !state.isSidebarCollapsed
  })),
}));
