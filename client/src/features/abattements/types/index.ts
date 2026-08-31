export type StatutAbattement =
  'AUCUN' | 'RETARD' | 'MOINS_VERSE' | 'MOINS_VERSE_AVEC_RETARD' | 'NON_VERSE'

export type StatutRegularisation = 'NON_APPLICABLE' | 'REG' | 'NON_REG'

export interface AbattementCalcule {
  statut: StatutAbattement
  dateCompletion: string | null
  assiette: number
  tauxApplique: number
  montantAbattement: number
  montantEncaisseCumule: number
  totalSolde: number
  regularisation: StatutRegularisation
  montantRegularisation: number
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

export const STATUT_REGULARISATION_LABELS: Record<StatutRegularisation, string> = {
  NON_APPLICABLE: '-',
  REG: 'Régularisé',
  NON_REG: 'Non régularisé',
}

/** Les 4 vues de navigation Jours/Mois/Années/Général. */
export type AbattementViewMode = 'jours' | 'mois' | 'annees' | 'general'
