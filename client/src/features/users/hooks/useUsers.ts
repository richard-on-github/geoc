import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import { usersApi } from '../api'
import { USER_QUERY_KEYS } from '../constants'
import { ApiError } from '@/shared/types'
import type { ListParams } from '@/shared/types'
import type { CreateUserPayload, UpdateUserPayload } from '../types'

/* ---- Lecture ---- */

export function useUsers(params: ListParams) {
  return useQuery({
    queryKey: USER_QUERY_KEYS.list(params),
    queryFn: () => usersApi.getUsers(params),
    placeholderData: (prev) => prev, // garde les données précédentes pendant la pagination
  })
}

export function useUser(id: string) {
  return useQuery({
    queryKey: USER_QUERY_KEYS.detail(id),
    queryFn: () => usersApi.getUserById(id),
    enabled: id !== '',
  })
}

/* ---- Mutations ---- */

export function useCreateUser() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (payload: CreateUserPayload) => usersApi.createUser(payload),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: USER_QUERY_KEYS.lists() })
      toast.success('Utilisateur créé avec succès.')
    },
    onError: (error) => {
      toast.error(error instanceof ApiError ? error.message : 'Erreur lors de la création.')
    },
  })
}

export function useUpdateUser() {
  const qc = useQueryClient()

  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdateUserPayload }) =>
      usersApi.updateUser(id, payload),

    // TanStack Query donne accès aux variables envoyées en 2ème argument d'onSuccess
    onSuccess: (updated, variables) => {
      qc.setQueryData(USER_QUERY_KEYS.detail(variables.id), updated)
      void qc.invalidateQueries({ queryKey: USER_QUERY_KEYS.lists() })
      toast.success('Utilisateur modifié.')
    },
    onError: (error) => {
      toast.error(error instanceof ApiError ? error.message : 'Erreur lors de la modification.')
    },
  })
}

export function useDeleteUser() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => usersApi.deleteUser(id),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: USER_QUERY_KEYS.lists() })
      toast.success('Utilisateur supprimé.')
    },
    onError: (error) => {
      toast.error(error instanceof ApiError ? error.message : 'Erreur lors de la suppression.')
    },
  })
}

export function useToggleUserStatus() {
  const qc = useQueryClient()

  return useMutation({
    mutationFn: ({ id, actif }: { id: string; actif: boolean }) =>
      usersApi.toggleUserStatus(id, actif),

    onSuccess: (updated) => {
      qc.setQueryData(USER_QUERY_KEYS.detail(updated.id), updated)
      void qc.invalidateQueries({ queryKey: USER_QUERY_KEYS.lists() })

      toast.success(updated.isActive ? 'Compte activé.' : 'Compte désactivé.')
    },
    onError: (error) => {
      toast.error(
        error instanceof ApiError ? error.message : 'Erreur lors du changement de statut.',
      )
    },
  })
}

export function useResetPassword() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ userId, newPassword }: { userId: string; newPassword: string }) =>
      usersApi.resetPassword(userId, newPassword),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: USER_QUERY_KEYS.lists() })
      toast.success('Mot de passe réinitialisé avec succès.')
    },
    onError: (error) => {
      toast.error(error instanceof ApiError ? error.message : 'Erreur lors de la réinitialisation.')
    },
  })
}
