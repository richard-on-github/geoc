export type StatutAbattement =
  | 'AUCUN'
  | 'RETARD'
  | 'MOINS_VERSE'
  | 'MOINS_VERSE_AVEC_RETARD'
  | 'NON_VERSE'

export interface AbattementCalcule {
  statut: StatutAbattement
  heureVersement: string | null
  /** Montant sur lequel le taux est appliqué (manquant, ou total des ventes pour un simple retard). */
  assiette: number
  tauxApplique: number
  montantAbattement: number
}

export interface VersementInfo {
  id: string
  montantVerse: number
  dateVersement: string
}

export interface VenteAvecAbattement {
  id: string
  agenceId: string
  agenceNom: string
  kiosque: string
  agent: string
  numeroTS10: string
  totalVente: number
  totalPaye: number
  totalSolde: number
  dateDebut: string
  dateFin: string
  jourAnnee: number
  mois: number
  annee: number
  abattementVersement?: VersementInfo | null
  agence?: {
    nom: string
    code: string
  }
}

export interface AbattementLigne {
  vente: VenteAvecAbattement
  abattement: AbattementCalcule
}

export interface AbattementParametres {
  id: string
  heureLimiteUTC: number
  tauxRetard: number
  tauxMoinsVerse: number
  tauxMoinsVerseAvecRetard: number
  tauxNonVerse: number
  updatedAt: string
}

export interface AbattementParametresInput {
  heureLimiteUTC?: number
  tauxRetard?: number
  tauxMoinsVerse?: number
  tauxMoinsVerseAvecRetard?: number
  tauxNonVerse?: number
}

export interface AbattementQueryParams {
  page?: number
  limit?: number
  search?: string | undefined
  agenceId?: string | undefined
  dateDebut?: string | undefined
  dateFin?: string | undefined
  jour?: number | undefined
  mois?: number | undefined
  annee?: number | undefined
  statut?: StatutAbattement | undefined
  sortBy?: 'dateDebut' | 'totalVente' | 'jourAnnee' | undefined
  sortOrder?: 'asc' | 'desc' | undefined
}

export interface VersementInput {
  venteId: string
  montantVerse: number
  /** ISO 8601 */
  dateVersement: string
}

/**
 * Filtres "classiques" du module abattements (recherche, agence, dates, statut),
 * sur le même principe que VenteFiltersState.
 */
export interface AbattementFiltersState {
  search: string
  agenceId?: string | undefined
  dateDebut?: string | undefined
  dateFin?: string | undefined
  statut?: StatutAbattement | undefined
}

export const STATUT_ABATTEMENT_LABELS: Record<StatutAbattement, string> = {
  AUCUN: 'RAS',
  RETARD: 'Retard',
  MOINS_VERSE: 'Moins versé',
  MOINS_VERSE_AVEC_RETARD: 'Moins versé + retard',
  NON_VERSE: 'Non versé',
}

/** Les 4 vues de navigation Jours/Mois/Années/Général, sur le même principe que VenteViewMode. */
export type AbattementViewMode = 'jours' | 'mois' | 'annees' | 'general'
