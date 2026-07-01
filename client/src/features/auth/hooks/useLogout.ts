import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from 'react-router'
import { authApi } from '../api'
import { useAuthStore } from './useAuthStore'
import { AUTH_ROUTES } from '../constants'

export function useLogout() {
  const navigate = useNavigate()
  const { clearSession } = useAuthStore()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: () => authApi.logout(),

    onSettled: () => {
      /*
       * On nettoie la session localement dans tous les cas,
       * même si le serveur retourne une erreur (token déjà expiré).
       */
      clearSession()
      queryClient.clear()
      void navigate(AUTH_ROUTES.LOGIN, { replace: true })
    },
  })
}
