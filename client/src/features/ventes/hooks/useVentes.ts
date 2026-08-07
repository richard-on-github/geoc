// import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
// import toast from 'react-hot-toast'
// import { ventesApi } from '../api'
// import type { VenteQueryParams } from '../types'
// import { ApiError } from '@/shared/types'

// export const VENTE_QUERY_KEYS = {
//   all: ['ventes'] as const,
//   lists: () => [...VENTE_QUERY_KEYS.all, 'list'] as const,
//   list: (params: object) => [...VENTE_QUERY_KEYS.lists(), params] as const,
//   clotures: () => [...VENTE_QUERY_KEYS.all, 'clotures'] as const,
// }

// export function useVentes(params: VenteQueryParams) {
//   return useQuery({
//     queryKey: VENTE_QUERY_KEYS.list(params),
//     queryFn: () => ventesApi.getVentes(params),
//     placeholderData: (prev) => prev,
//   })
// }

// export function useImportVentes() {
//   const qc = useQueryClient()
//   return useMutation({
//     mutationFn: (file: File) => ventesApi.importVentes(file),
//     onSuccess: () => {
//       void qc.invalidateQueries({ queryKey: VENTE_QUERY_KEYS.lists() })
//       toast.success('Import des ventes réussi.')
//     },
//     onError: (error) => {
//       toast.error(error instanceof ApiError ? error.message : "Erreur lors de l'import.")
//     },
//   })
// }

// export function useClotures() {
//   return useQuery({
//     queryKey: VENTE_QUERY_KEYS.clotures(),
//     queryFn: () => ventesApi.getClotures(),
//   })
// }

// export function useCloturerMois() {
//   const qc = useQueryClient()
//   return useMutation({
//     mutationFn: (periode: string) => ventesApi.cloturerMois(periode),
//     onSuccess: (data) => {
//       void qc.invalidateQueries({ queryKey: VENTE_QUERY_KEYS.lists() })
//       void qc.invalidateQueries({ queryKey: VENTE_QUERY_KEYS.clotures() })
//       toast.success(`La période ${data.periode} a été clôturée avec succès.`)
//     },
//     onError: (error) => {
//       toast.error(error instanceof ApiError ? error.message : 'Erreur lors de la clôture.')
//     },
//   })
// }

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import { ventesApi } from '../api'
import type { VenteQueryParams } from '../types'
import { ApiError } from '@/shared/types'

export const VENTE_QUERY_KEYS = {
  all: ['ventes'] as const,
  lists: () => [...VENTE_QUERY_KEYS.all, 'list'] as const,
  list: (params: object) => [...VENTE_QUERY_KEYS.lists(), params] as const,
  clotures: () => [...VENTE_QUERY_KEYS.all, 'clotures'] as const,
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
    mutationFn: (input: { file: File; periode: string }) =>
      ventesApi.importVentes(input.file, input.periode),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: VENTE_QUERY_KEYS.lists() })
      toast.success('Import des ventes réussi.')
    },
    onError: (error) => {
      toast.error(error instanceof ApiError ? error.message : "Erreur lors de l'import.")
    },
  })
}

export function useClotures() {
  return useQuery({
    queryKey: VENTE_QUERY_KEYS.clotures(),
    queryFn: () => ventesApi.getClotures(),
  })
}

export function useCloturerMois() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (periode: string) => ventesApi.cloturerMois(periode),
    onSuccess: (data) => {
      void qc.invalidateQueries({ queryKey: VENTE_QUERY_KEYS.lists() })
      void qc.invalidateQueries({ queryKey: VENTE_QUERY_KEYS.clotures() })
      toast.success(`La période ${data.periode} a été clôturée avec succès.`)
    },
    onError: (error) => {
      toast.error(error instanceof ApiError ? error.message : 'Erreur lors de la clôture.')
    },
  })
}

/** Annule la clôture d'un mois (le backend refuse si le mois suivant a déjà des ventes). */
export function useAnnulerCloture() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (periode: string) => ventesApi.annulerCloture(periode),
    onSuccess: (data) => {
      void qc.invalidateQueries({ queryKey: VENTE_QUERY_KEYS.lists() })
      void qc.invalidateQueries({ queryKey: VENTE_QUERY_KEYS.clotures() })
      toast.success(`La clôture de la période ${data.periode} a été annulée.`)
    },
    onError: (error) => {
      toast.error(
        error instanceof ApiError ? error.message : "Erreur lors de l'annulation de la clôture.",
      )
    },
  })
}
