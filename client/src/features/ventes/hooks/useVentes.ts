import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import { ventesApi } from '../api'
import type { VenteQueryParams } from '../types'
import { ApiError } from '@/shared/types'

export const VENTE_QUERY_KEYS = {
  all: ['ventes'] as const,
  lists: () => [...VENTE_QUERY_KEYS.all, 'list'] as const,
  list: (params: object) => [...VENTE_QUERY_KEYS.lists(), params] as const,
}

export function useVentes(params: VenteQueryParams) {
  return useQuery({
    queryKey: VENTE_QUERY_KEYS.list(params),
    queryFn: () => ventesApi.getVentes(params),
    placeholderData: (prev) => prev,
  })
}

export function useImportVentes() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (file: File) => ventesApi.importVentes(file),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: VENTE_QUERY_KEYS.lists() })
      toast.success('Import des ventes réussi.')
    },
    onError: (error) => {
      toast.error(error instanceof ApiError ? error.message : 'Erreur lors de l\'import.')
    },
  })
}

