import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import { AUTH_STORAGE_KEYS } from '../constants'
import type { AuthUser, AuthTokens } from '../types'

/* ============================================================
   State & Actions
   ============================================================ */

interface AuthState {
  user: AuthUser | null
  accessToken: string | null
  isAuthenticated: boolean
  isInitialized: boolean   // true une fois que /auth/me a été tenté au démarrage
}

interface AuthActions {
  setSession: (user: AuthUser, tokens: AuthTokens) => void
  setUser: (user: AuthUser) => void
  updateAccessToken: (accessToken: string) => void
  clearSession: () => void
  setInitialized: () => void
}

type AuthStore = AuthState & AuthActions

/* ============================================================
   Store
   ============================================================ */

export const useAuthStore = create<AuthStore>()(
  persist(
    (set) => ({
      /* State initial */
      user: null,
      accessToken: null,
      isAuthenticated: false,
      isInitialized: false,

      /* Actions */
      setSession: (user, tokens) => {
        localStorage.setItem(AUTH_STORAGE_KEYS.REFRESH_TOKEN, tokens.refreshToken)
        set({
          user,
          accessToken: tokens.accessToken,
          isAuthenticated: true,
        })
      },

      setUser: (user) => set({ user }),

      updateAccessToken: (accessToken) => {
        set({ accessToken })
      },

      clearSession: () => {
        Object.values(AUTH_STORAGE_KEYS).forEach((key) =>
          localStorage.removeItem(key),
        )
        set({
          user: null,
          accessToken: null,
          isAuthenticated: false,
        })
      },

      setInitialized: () => set({ isInitialized: true }),
    }),
    {
      name: AUTH_STORAGE_KEYS.USER,
      storage: createJSONStorage(() => localStorage),
      /*
       * On ne persiste que user et accessToken.
       * Le refreshToken est stocké séparément (hors du JSON sérialisé)
       * pour plus de contrôle sur son cycle de vie.
       */
      partialize: (state) => ({
        user: state.user,
        accessToken: state.accessToken,
        isAuthenticated: state.isAuthenticated,
      }),
    },
  ),
)

/* ============================================================
   Sélecteurs dérivés — évitent les re-renders inutiles
   ============================================================ */

export const selectUser = (state: AuthStore) => state.user
export const selectIsAuthenticated = (state: AuthStore) => state.isAuthenticated
export const selectIsInitialized = (state: AuthStore) => state.isInitialized
export const selectUserPermissions = (state: AuthStore) => state.user?.permissions ?? []
export const selectUserRole = (state: AuthStore) => state.user?.role ?? null
