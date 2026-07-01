import { useEffect, type ReactNode } from 'react'
import { useAuthStore, selectIsAuthenticated, selectIsInitialized, useTokenRefreshListener } from '@/features/auth'
import { authApi } from '@/features/auth'
import { tokenStorage } from '@/shared/api'
import { PageLoader } from '@/shared/components/feedback/PageLoader'

interface AuthInitializerProps {
  children: ReactNode
}

/**
 * Vérifie la session au démarrage :
 * - Si un token existe en storage → appel /auth/me pour valider + récupérer le profil frais
 * - Si l'appel échoue → clearSession automatique (via interceptor 401)
 * - Marque isInitialized = true dans tous les cas
 *
 * Écoute aussi l'event de refresh token pour synchroniser le store.
 */
export function AuthInitializer({ children }: AuthInitializerProps) {
  const isAuthenticated = useAuthStore(selectIsAuthenticated)
  const isInitialized = useAuthStore(selectIsInitialized)
  const { setUser, clearSession, setInitialized } = useAuthStore()

  // Synchronise le store quand l'interceptor rafraîchit le token
  useTokenRefreshListener()

  useEffect(() => {
    async function initSession() {
      const token = tokenStorage.getAccessToken()

      if (token === null || token === '') {
        setInitialized()
        return
      }

      try {
        const user = await authApi.getMe()
        setUser(user)
      } catch {
        // Token invalide ou expiré sans refresh possible → on efface
        clearSession()
      } finally {
        setInitialized()
      }
    }

    if (!isInitialized) {
      void initSession()
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Tant que la session n'est pas vérifiée, on bloque le rendu
  if (!isInitialized && isAuthenticated) {
    return <PageLoader />
  }

  return <>{children}</>
}
