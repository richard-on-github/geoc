import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import { abattementsApi } from '../api/abattements.api'
import type { AbattementParametresInput, AbattementQueryParams, VersementInput } from '../types'
import { ApiError } from '@/shared/types'

export const ABATTEMENT_QUERY_KEYS = {
  all: ['abattements'] as const,
  lists: () => [...ABATTEMENT_QUERY_KEYS.all, 'list'] as const,
  list: (params: object) => [...ABATTEMENT_QUERY_KEYS.lists(), params] as const,
  parametres: () => [...ABATTEMENT_QUERY_KEYS.all, 'parametres'] as const,
}

export function useAbattements(params: AbattementQueryParams) {
  return useQuery({
    queryKey: ABATTEMENT_QUERY_KEYS.list(params),
    queryFn: () => abattementsApi.getAbattements(params),
    placeholderData: (prev) => prev,
  })
}

export function useAbattementParametres() {
  return useQuery({
    queryKey: ABATTEMENT_QUERY_KEYS.parametres(),
    queryFn: () => abattementsApi.getParametres(),
  })
}

export function useUpdateAbattementParametres() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (input: AbattementParametresInput) => abattementsApi.updateParametres(input),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ABATTEMENT_QUERY_KEYS.parametres() })
      void qc.invalidateQueries({ queryKey: ABATTEMENT_QUERY_KEYS.lists() })
      toast.success('Paramètres mis à jour avec succès.')
    },
    onError: (error) => {
      toast.error(
        error instanceof ApiError ? error.message : 'Erreur lors de la mise à jour des paramètres.',
      )
    },
  })
}

export function useEnregistrerVersement() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (input: VersementInput) => abattementsApi.enregistrerVersement(input),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ABATTEMENT_QUERY_KEYS.lists() })
      toast.success('Versement enregistré avec succès.')
    },
    onError: (error) => {
      toast.error(
        error instanceof ApiError ? error.message : "Erreur lors de l'enregistrement du versement.",
      )
    },
  })
}
