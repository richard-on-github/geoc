import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import { ventesApi } from '../api'
import type { EncaissementInput } from '../types'
import { ApiError } from '@/shared/types'
import { VENTE_QUERY_KEYS } from './useVentes'

export function useHistoriqueEncaissements(venteId: string | null) {
  return useQuery({
    queryKey: [...VENTE_QUERY_KEYS.all, 'encaissements', venteId],
    queryFn: () => ventesApi.getHistoriqueEncaissements(venteId!),
    enabled: venteId !== null,
  })
}

export function useEnregistrerEncaissement() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (input: EncaissementInput) => ventesApi.enregistrerEncaissement(input),
    onSuccess: (result, variables) => {
      void qc.invalidateQueries({ queryKey: VENTE_QUERY_KEYS.lists() })
      void qc.invalidateQueries({
        queryKey: [...VENTE_QUERY_KEYS.all, 'encaissements', variables.venteId],
      })
      toast.success(
        `Encaissement enregistré. Statut : ${
          result.statutEncaissement === 'SOLDE'
            ? 'soldé'
            : result.statutEncaissement === 'PARTIELLEMENT_SOLDE'
              ? 'partiellement soldé'
              : 'non soldé'
        }.`,
      )
    },
    onError: (error) => {
      toast.error(
        error instanceof ApiError
          ? error.message
          : "Erreur lors de l'enregistrement de l'encaissement.",
      )
    },
  })
}
