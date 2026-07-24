import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import { securityApi } from '../api'
import { SECURITY_QUERY_KEYS } from '../constants'
import { ApiError } from '@/shared/types'
import type { ListParams } from '@/shared/types'
import type { CreateRolePayload, UpdateRolePayload } from '../types'

/* ---- Rôles ---- */

export function useRoles(params?: ListParams) {
  return useQuery({
    queryKey: SECURITY_QUERY_KEYS.roles.lists(),
    queryFn: () => securityApi.getRoles(params),
    placeholderData: (prev) => prev,
  })
}

export function useAllRoles() {
  return useQuery({
    queryKey: [...SECURITY_QUERY_KEYS.roles.all, 'all'],
    queryFn: () => securityApi.getAllRoles(),
    staleTime: 1000 * 60 * 10,
  })
}

export function useRole(id: string) {
  return useQuery({
    queryKey: SECURITY_QUERY_KEYS.roles.detail(id),
    queryFn: () => securityApi.getRoleById(id),
    enabled: id !== '',
  })
}

export function useCreateRole() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (payload: CreateRolePayload) => securityApi.createRole(payload),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: SECURITY_QUERY_KEYS.roles.all })
      toast.success('Rôle créé avec succès.')
    },
    onError: (error) => {
      toast.error(error instanceof ApiError ? error.message : 'Erreur lors de la création.')
    },
  })
}

export function useUpdateRole(id: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (payload: UpdateRolePayload) => securityApi.updateRole(id, payload),
    onSuccess: (updated) => {
      qc.setQueryData(SECURITY_QUERY_KEYS.roles.detail(id), updated)
      void qc.invalidateQueries({ queryKey: SECURITY_QUERY_KEYS.roles.lists() })
      toast.success('Rôle modifié.')
    },
    onError: (error) => {
      toast.error(error instanceof ApiError ? error.message : 'Erreur lors de la modification.')
    },
  })
}

export function useDeleteRole() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => securityApi.deleteRole(id),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: SECURITY_QUERY_KEYS.roles.all })
      toast.success('Rôle supprimé.')
    },
    onError: (error) => {
      toast.error(error instanceof ApiError ? error.message : 'Erreur lors de la suppression.')
    },
  })
}

export function usePermissions(params?: ListParams) {
  return useQuery({
    queryKey: [...SECURITY_QUERY_KEYS.permissions.lists(), params],
    queryFn: () => securityApi.getPermissions(params),
    placeholderData: (prev) => prev,
  })
}

export function useAllPermissions() {
  return useQuery({
    queryKey: [...SECURITY_QUERY_KEYS.permissions.all, 'all'],
    queryFn: () => securityApi.getAllPermissions(),
    staleTime: 1000 * 60 * 10,
  })
}
