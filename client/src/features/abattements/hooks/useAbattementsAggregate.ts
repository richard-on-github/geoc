import { useQuery } from '@tanstack/react-query'
import { abattementsApi } from '../api/abattements.api'
import type { AbattementFiltersState, AbattementQueryParams } from '../types'
import { ABATTEMENT_QUERY_KEYS } from './useAbattements'

export interface AbattementAggregateBucket {
  /** Jour du mois (1-31) si groupBy = 'jour', mois (1-12) si groupBy = 'mois'. */
  cle: number
  nombreLignes: number
  /** Nombre de lignes dont le statut n'est pas AUCUN (retard, moins versé, non versé...). */
  nombreProblemes: number
  montantAbattement: number
}

const LIMITE_AGREGATION = 1000

export interface UseAbattementsAggregateParams extends AbattementFiltersState {
  annee: number
  /** Si fourni, agrège par jour du mois sur ce mois précis ; sinon agrège par mois sur l'année. */
  mois?: number
  groupBy: 'jour' | 'mois'
}

/**
 * Récupère les lignes d'une année (ou d'un mois précis) et les agrège
 * côté client par jour du mois ou par mois, pour alimenter AbattementDaysGrid.
 * Même principe que useVentesAggregate côté module ventes.
 */
export function useAbattementsAggregate(params: UseAbattementsAggregateParams) {
  const { annee, mois, groupBy, ...filtres } = params

  const queryParams: AbattementQueryParams = {
    search: filtres.search === '' ? undefined : filtres.search,
    agenceId: filtres.agenceId,
    dateDebut: filtres.dateDebut,
    dateFin: filtres.dateFin,
    statut: filtres.statut,
    annee,
    mois,
    page: 1,
    limit: LIMITE_AGREGATION,
  }

  const query = useQuery({
    queryKey: [...ABATTEMENT_QUERY_KEYS.lists(), 'aggregate', groupBy, queryParams],
    queryFn: () => abattementsApi.getAbattements(queryParams),
  })

  const buckets = new Map<number, AbattementAggregateBucket>()

  for (const ligne of query.data?.lignes ?? []) {
    // Le jour du mois est dérivé de dateDebut (et non de jourAnnee, qui est le
    // jour dans l'année complète, pas dans le mois affiché).
    const cle =
      groupBy === 'jour'
        ? new Date(ligne.vente.dateDebut).getUTCDate()
        : ligne.vente.mois

    const estProbleme = ligne.abattement.statut !== 'AUCUN'
    const existant = buckets.get(cle)

    if (existant) {
      existant.nombreLignes += 1
      if (estProbleme) existant.nombreProblemes += 1
      existant.montantAbattement += ligne.abattement.montantAbattement
    } else {
      buckets.set(cle, {
        cle,
        nombreLignes: 1,
        nombreProblemes: estProbleme ? 1 : 0,
        montantAbattement: ligne.abattement.montantAbattement,
      })
    }
  }

  return {
    buckets,
    isLoading: query.isLoading,
    isFetching: query.isFetching,
    estPartiel: (query.data?.pagination.total ?? 0) > LIMITE_AGREGATION,
  }
}
