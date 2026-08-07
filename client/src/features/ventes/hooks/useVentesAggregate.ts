import { useQuery } from '@tanstack/react-query'
import { ventesApi } from '../api'
import type { VenteFiltersState, VenteQueryParams } from '../types'
import { VENTE_QUERY_KEYS } from './useVentes'

export interface VenteAggregateBucket {
  /** Jour du mois (1-31) si groupBy = 'jour', mois (1-12) si groupBy = 'mois'. */
  cle: number
  nombreVentes: number
  totalVente: number
}

/**
 * Limite maximale de lignes agrégées côté client, alignée sur le plafond de
 * l'API (`limit` max = 1000, cf. vente.schema.ts backend). Au-delà, l'agrégat
 * affiché est partiel (voir `estPartiel`). Une évolution possible serait
 * d'exposer un endpoint d'agrégation dédié côté backend
 * (ex: GET /ventes/stats?annee=...&mois=...) pour ne plus dépendre de cette
 * limite, mais ce n'est pas nécessaire tant que les volumes mensuels/annuels
 * restent raisonnables.
 */
const LIMITE_AGREGATION = 1000

export interface UseVentesAggregateParams extends VenteFiltersState {
  annee: number
  /** Si fourni, agrège par jour du mois sur ce mois précis ; sinon agrège par mois sur l'année. */
  mois?: number
  groupBy: 'jour' | 'mois'
}

/**
 * Récupère les ventes d'une année (ou d'un mois précis) et les agrège
 * côté client par jour du mois ou par mois, pour alimenter les vues
 * calendrier (VenteDaysGrid / VenteMonthsGrid). Combine les filtres
 * "classiques" (recherche, agence, dates, clôture) déjà utilisés ailleurs
 * dans le module, pour que les grilles reflètent les mêmes filtres que le
 * reste de la liste des ventes.
 */
export function useVentesAggregate(params: UseVentesAggregateParams) {
  const { annee, mois, groupBy, ...filtres } = params

  const queryParams: VenteQueryParams = {
    search: filtres.search === '' ? undefined : filtres.search,
    agenceId: filtres.agenceId,
    dateDebut: filtres.dateDebut,
    dateFin: filtres.dateFin,
    clotureId: filtres.clotureId,
    nonClotureesOnly: filtres.nonClotureesOnly === true ? true : undefined,
    annee,
    mois,
    page: 1,
    limit: LIMITE_AGREGATION,
  }

  const query = useQuery({
    queryKey: [...VENTE_QUERY_KEYS.lists(), 'aggregate', groupBy, queryParams],
    queryFn: () => ventesApi.getVentes(queryParams),
  })

  const buckets = new Map<number, VenteAggregateBucket>()

  for (const vente of query.data?.items ?? []) {
    // Le jour du mois est dérivé de dateDebut (et non de jourAnnee, qui est le
    // jour dans l'année complète, pas dans le mois affiché).
    const cle = groupBy === 'jour' ? new Date(vente.dateDebut).getUTCDate() : vente.mois

    const existant = buckets.get(cle)
    if (existant) {
      existant.nombreVentes += 1
      existant.totalVente += vente.totalVente
    } else {
      buckets.set(cle, { cle, nombreVentes: 1, totalVente: vente.totalVente })
    }
  }

  return {
    buckets,
    isLoading: query.isLoading,
    isFetching: query.isFetching,
    estPartiel: (query.data?.total ?? 0) > LIMITE_AGREGATION,
  }
}
