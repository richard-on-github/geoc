import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import { agencesApi } from '../api'
import type { ListParams } from '@/shared/types'
import type { CreateAgencePayload, UpdateAgencePayload } from '../types'
import { ApiError } from '@/shared/types'

export const AGENCE_QUERY_KEYS = {
  all: ['agences'] as const,
  lists: () => [...AGENCE_QUERY_KEYS.all, 'list'] as const,
  list: (params: object) => [...AGENCE_QUERY_KEYS.lists(), params] as const,
  details: () => [...AGENCE_QUERY_KEYS.all, 'detail'] as const,
  detail: (id: string) => [...AGENCE_QUERY_KEYS.details(), id] as const,
}

/* ---- Lecture ---- */

export function useAgences(params: ListParams) {
  return useQuery({
    queryKey: AGENCE_QUERY_KEYS.list(params),
    queryFn: () => agencesApi.getAgences(params),
    placeholderData: (prev) => prev,
  })
}

export function useAgence(id: string) {
  return useQuery({
    queryKey: AGENCE_QUERY_KEYS.detail(id),
    queryFn: () => agencesApi.getAgenceById(id),
    enabled: !!id,
  })
}

/* ---- Mutations ---- */

export function useCreateAgence() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (payload: CreateAgencePayload) => agencesApi.createAgence(payload),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: AGENCE_QUERY_KEYS.lists() })
      toast.success('Agence créée avec succès.')
    },
    onError: (error) => {
      toast.error(error instanceof ApiError ? error.message : 'Erreur lors de la création.')
    },
  })
}

export function useUpdateAgence() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdateAgencePayload }) =>
      agencesApi.updateAgence(id, payload),
    onSuccess: (updated, variables) => {
      qc.setQueryData(AGENCE_QUERY_KEYS.detail(variables.id), updated)
      void qc.invalidateQueries({ queryKey: AGENCE_QUERY_KEYS.lists() })
      toast.success('Agence modifiée.')
    },
    onError: (error) => {
      toast.error(error instanceof ApiError ? error.message : 'Erreur lors de la modification.')
    },
  })
}

export function useDeleteAgence() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => agencesApi.deleteAgence(id),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: AGENCE_QUERY_KEYS.lists() })
      toast.success('Agence supprimée.')
    },
    onError: (error) => {
      toast.error(error instanceof ApiError ? error.message : 'Erreur lors de la suppression.')
    },
  })
}

export function useToggleAgenceStatus() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, actif }: { id: string; actif: boolean }) =>
      agencesApi.toggleAgenceStatus(id, actif),
    onSuccess: (updated) => {
      qc.setQueryData(AGENCE_QUERY_KEYS.detail(updated.id), updated)
      void qc.invalidateQueries({ queryKey: AGENCE_QUERY_KEYS.lists() })
      toast.success(updated.actif ? 'Agence activée.' : 'Agence désactivée.')
    },
    onError: (error) => {
      toast.error(
        error instanceof ApiError ? error.message : 'Erreur lors du changement de statut.',
      )
    },
  })
}
