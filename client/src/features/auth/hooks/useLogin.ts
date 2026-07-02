import { useMutation } from '@tanstack/react-query'
import { useNavigate } from 'react-router'
import toast from 'react-hot-toast'
import { authApi } from '../api'
import { useAuthStore } from './useAuthStore'
import { AUTH_ROUTES } from '../constants'
import type { LoginPayload } from '../types'
import { ApiError } from '@/shared/types'
import { tokenStorage } from '@/shared/api/axios-instance'

export function useLogin() {
  const navigate = useNavigate()
  const { setSession } = useAuthStore()

  return useMutation({
    mutationFn: async (payload: LoginPayload) => {
      const response = await authApi.login(payload)
      const tokensData = response.data || response

      if (!tokensData?.accessToken) {
        throw new Error('Format de réponse login invalide')
      }

      tokenStorage.setTokens(tokensData.accessToken, tokensData.refreshToken)

      try {
        const meResponse = await authApi.getMe(tokensData.accessToken)

        const userData = meResponse.data || meResponse

        const finalUser = userData.data || userData

        if (!finalUser || (!finalUser.id && !finalUser._id)) {
          throw new Error('Format de réponse /auth/me invalide : utilisateur introuvable')
        }

        return { user: finalUser, tokens: tokensData }
      } catch (err) {
        tokenStorage.clearAll()
        throw err
      }
    },

    onSuccess: (data) => {
      setSession(data.user, data.tokens)
      toast.success(`Bienvenue, ${data.user.prenom} !`)
      void navigate(AUTH_ROUTES.DASHBOARD, { replace: true })
    },

    onError: (error) => {
      console.error('DEBUG LOGIN ERROR:', error)

      // 2. ON VERIFIE EN PREMIER "ApiError" (plus spécifique)
      if (error instanceof ApiError) {
        toast.error(error.message)
        return
      }

      // 3. ON VERIFIE SI C'EST UNE ERREUR AXIOS BRUTE (si pas interceptée globalement)
      if (typeof error === 'object' && error !== null && 'isAxiosError' in error) {
        const axiosError = error as any
        const backendMessage =
          axiosError.response?.data?.message ||
          axiosError.response?.data?.error ||
          'Identifiants invalides ou compte bloqué.'

        toast.error(backendMessage)
        return
      }

      if (error instanceof Error) {
        toast.error(error.message)
        return
      }

      toast.error('Une erreur inattendue est survenue.')
    },
  })
}
