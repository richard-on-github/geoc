import { useQuery } from '@tanstack/react-query'
import { brouillardApi } from '../api/brouillard.api'
import type { BrouillardQueryParams } from '../types'

export const BROUILLARD_QUERY_KEYS = {
  all: ['brouillard'] as const,
  detail: (params: BrouillardQueryParams) => [...BROUILLARD_QUERY_KEYS.all, params] as const,
}

/**
 * Contrairement à la version précédente, ce hook est TOUJOURS actif : les
 * filtres (agence, dates) sont facultatifs, donc la liste complète du
 * brouillard se charge dès l'arrivée sur la page.
 */
export function useBrouillard(params: BrouillardQueryParams) {
  return useQuery({
    queryKey: BROUILLARD_QUERY_KEYS.detail(params),
    queryFn: () => brouillardApi.getBrouillard(params),
    placeholderData: (prev) => prev,
  })
}
