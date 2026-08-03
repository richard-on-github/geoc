import { isAxiosError } from 'axios'
import { useMutation } from '@tanstack/react-query'
import { useNavigate } from 'react-router'
import toast from 'react-hot-toast'
import { authApi } from '../api'
import { useAuthStore } from './useAuthStore'
import { AUTH_ROUTES } from '../constants'
import type { AuthTokens, LoginPayload } from '../types'
import { ApiError } from '@/shared/types'
import { tokenStorage } from '@/shared/api/axios-instance'

type LoginTokensPayload = {
  accessToken?: string
  refreshToken?: string
  expiresIn?: number
  tokens?: {
    accessToken?: string
    refreshToken?: string
    expiresIn?: number
  }
}

export function useLogin() {
  const navigate = useNavigate()
  const { setSession } = useAuthStore()

  function isNonEmptyString(value: string | null | undefined): value is string {
    return typeof value === 'string' && value.trim() !== ''
  }

  return useMutation({
    mutationFn: async (payload: LoginPayload) => {
      const loginResponse = (await authApi.login(payload)) as LoginTokensPayload

      const accessToken = loginResponse.tokens?.accessToken ?? loginResponse.accessToken
      const refreshToken = loginResponse.tokens?.refreshToken ?? loginResponse.refreshToken
      const expiresIn = loginResponse.tokens?.expiresIn ?? loginResponse.expiresIn ?? 0

      if (!isNonEmptyString(accessToken) || !isNonEmptyString(refreshToken)) {
        throw new Error('Format de réponse login invalide')
      }

      const authTokens: AuthTokens = {
        accessToken,
        refreshToken,
        expiresIn,
      }

      tokenStorage.setTokens(accessToken, refreshToken)

      try {
        const meResponse = await authApi.getMe()

        if (typeof meResponse.id !== 'string' || meResponse.id.trim() === '') {
          throw new Error('Format de réponse /auth/me invalide : utilisateur introuvable')
        }

        return {
          user: meResponse,
          tokens: authTokens,
        }
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

      if (error instanceof ApiError) {
        toast.error(error.message)
        return
      }

      if (isAxiosError(error)) {
        const responseData: unknown = error.response?.data

        const backendMessage = (() => {
          if (typeof responseData === 'object' && responseData !== null) {
            const record = responseData as Record<string, unknown>

            if (typeof record.message === 'string') {
              return record.message
            }

            if (typeof record.error === 'string') {
              return record.error
            }
          }

          return 'Identifiants invalides ou compte bloqué.'
        })()

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
