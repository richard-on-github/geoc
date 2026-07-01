import { create } from 'zustand'

interface UiState {
  theme: 'light' | 'dark' | 'system'
  isMobileMenuOpen: boolean
}

interface UiActions {
  setTheme: (theme: UiState['theme']) => void
  toggleMobileMenu: () => void
  closeMobileMenu: () => void
}

type UiStore = UiState & UiActions

export const useUiStore = create<UiStore>()((set) => ({
  theme: 'light',
  isMobileMenuOpen: false,

  setTheme: (theme) => set({ theme }),
  toggleMobileMenu: () => set((s) => ({ isMobileMenuOpen: !s.isMobileMenuOpen })),
  closeMobileMenu: () => set({ isMobileMenuOpen: false }),
}))
