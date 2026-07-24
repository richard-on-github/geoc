import { useMutation } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import { authApi } from '../api'
import { ApiError } from '@/shared/types'
import type { ChangePasswordPayload } from '../types'

export function useChangePassword() {
  return useMutation({
    mutationFn: (payload: ChangePasswordPayload) => authApi.changePassword(payload),
    onSuccess: () => {
      toast.success('Mot de passe modifié avec succès.')
    },
    onError: (error) => {
      if (error instanceof ApiError) {
        if (error.status === 400) {
          toast.error('Le mot de passe actuel est incorrect.')
          return
        }
        toast.error(error.message)
        return
      }
      toast.error('Une erreur est survenue lors de la modification.')
    },
  })
}
