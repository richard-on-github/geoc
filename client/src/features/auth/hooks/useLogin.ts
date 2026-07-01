import { useMutation } from '@tanstack/react-query'
import { useNavigate } from 'react-router'
import toast from 'react-hot-toast'
import { authApi } from '../api'
import { useAuthStore } from './useAuthStore'
import { AUTH_ROUTES } from '../constants'
import type { LoginPayload } from '../types'
import { ApiError } from '@/shared/types'
import { tokenStorage } from '@/shared/api/axios-instance' // 👈 AJOUT : Ajuste le chemin vers ton fichier axiosInstance

export function useLogin() {
  const navigate = useNavigate()
  const { setSession } = useAuthStore()

  return useMutation({
    mutationFn: async (payload: LoginPayload) => {
      // 1. Login
      const response = await authApi.login(payload)
      const tokensData = response.data || response;

      if (!tokensData?.accessToken) {
        throw new Error("Format de réponse login invalide");
      }

      tokenStorage.setTokens(tokensData.accessToken, tokensData.refreshToken)

      // 2. Me
      try {
        const meResponse = await authApi.getMe(tokensData.accessToken)

        // DEBUG: On log l'objet entier pour voir où se cachent les données
        console.log("DEBUG: Réponse complète de getMe =", meResponse);

        // Tentative d'extraction plus large
        const userData = meResponse.data || meResponse;

        // Si userData contient une propriété 'data', on plonge dedans, sinon on garde userData
        const finalUser = userData.data || userData;

        console.log("DEBUG: Utilisateur final extrait =", finalUser);

        if (!finalUser || (!finalUser.id && !finalUser._id)) {
          throw new Error("Format de réponse /auth/me invalide : utilisateur introuvable");
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
      if (error instanceof Error) {
        console.error("DEBUG: Erreur capturée =", error.message);
        toast.error(error.message);
      } else if (error instanceof ApiError) {
        toast.error(error.message)
      } else {
        toast.error('Une erreur inattendue est survenue.')
      }
    },
  })
}
