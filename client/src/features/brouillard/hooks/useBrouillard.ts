import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import { brouillardApi } from '../api/brouillard.api'
import type { BrouillardQueryParams, ClotureBrouillardInput, RejeterBrouillardInput } from '../types'
import { ApiError } from '@/shared/types'

export const BROUILLARD_QUERY_KEYS = {
  all: ['brouillards'] as const,
  lists: () => [...BROUILLARD_QUERY_KEYS.all, 'list'] as const,
  list: (params: object) => [...BROUILLARD_QUERY_KEYS.lists(), params] as const,
}

export function useBrouillards(params: BrouillardQueryParams) {
  return useQuery({
    queryKey: BROUILLARD_QUERY_KEYS.list(params),
    queryFn: () => brouillardApi.getBrouillards(params),
    placeholderData: (prev) => prev,
  })
}

export function useClotureBrouillard() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: ClotureBrouillardInput }) =>
      brouillardApi.cloturer(id, input),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: BROUILLARD_QUERY_KEYS.lists() })
      toast.success('Brouillard clôturé avec succès.')
    },
    onError: (error) => {
      toast.error(error instanceof ApiError ? error.message : 'Erreur lors de la clôture.')
    },
  })
}

export function useValiderBrouillard() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => brouillardApi.valider(id),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: BROUILLARD_QUERY_KEYS.lists() })
      toast.success('Brouillard validé avec succès.')
    },
    onError: (error) => {
      toast.error(error instanceof ApiError ? error.message : 'Erreur lors de la validation.')
    },
  })
}

export function useRejeterBrouillard() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: RejeterBrouillardInput }) =>
      brouillardApi.rejeter(id, input),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: BROUILLARD_QUERY_KEYS.lists() })
      toast.success('Brouillard rejeté.')
    },
    onError: (error) => {
      toast.error(error instanceof ApiError ? error.message : 'Erreur lors du rejet.')
    },
  })
}
