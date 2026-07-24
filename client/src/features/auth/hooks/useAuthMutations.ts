import { useMutation, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import { authApi } from '../api'
import type {  ResetPasswordPayload } from '../types'
import { ApiError } from '@/shared/types'

export function useChangePassword() {
  return useMutation({
    mutationFn: ({ currentPassword, newPassword }: { currentPassword: string; newPassword: string }) =>
      authApi.changePassword(currentPassword, newPassword),
    onSuccess: () => {
      toast.success('Mot de passe modifié avec succès.')
    },
    onError: (error) => {
      toast.error(error instanceof ApiError ? error.message : 'Erreur lors du changement de mot de passe.')
    },
  })
}

export function useResetPassword() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (payload: ResetPasswordPayload) => authApi.resetPassword(payload),
    onSuccess: () => {
      // Invalider les détails de l'utilisateur pour rafraîchir les infos
      void qc.invalidateQueries({ queryKey: ['users', 'detail'] })
      toast.success('Mot de passe réinitialisé avec succès.')
    },
    onError: (error) => {
      toast.error(error instanceof ApiError ? error.message : 'Erreur lors de la réinitialisation.')
    },
  })
}
