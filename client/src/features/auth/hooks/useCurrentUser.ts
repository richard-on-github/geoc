import { useQuery } from '@tanstack/react-query'
import { authApi } from '../api'
import { useAuthStore, selectIsAuthenticated } from './useAuthStore'
import { authQueryKeys } from './query-keys'

/**
 * Charge et synchronise le profil de l'utilisateur connecté.
 * Actif uniquement si l'utilisateur est authentifié.
 * Met à jour le store Zustand à chaque succès.
 */
export function useCurrentUser() {
  const isAuthenticated = useAuthStore(selectIsAuthenticated)
  const { setUser } = useAuthStore()

  return useQuery({
    queryKey: authQueryKeys.me(),
    queryFn: async () => {
      const user = await authApi.getMe()
      setUser(user)
      return user
    },
    enabled: isAuthenticated,
    staleTime: 1000 * 60 * 5,   // 5 minutes
    retry: false,
  })
}
