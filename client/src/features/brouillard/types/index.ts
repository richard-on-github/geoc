export type StatutAnomalieBrouillard =
  | 'OK'
  | 'MOINS_VERSE'
  | 'MOINS_VERSE_RETARD'
  | 'RETARD'
  | 'NON_VERSE'
  | 'TROP_VERSE'
  | 'ANOMALIE'

export type StatutBrouillard = 'OUVERT' | 'CLOTURE' | 'VALIDE' | 'REJETE'

export const STATUT_ANOMALIE_LABELS: Record<StatutAnomalieBrouillard, string> = {
  OK: 'OK',
  MOINS_VERSE: 'Moins versé',
  MOINS_VERSE_RETARD: 'Moins versé + retard',
  RETARD: 'Retard',
  NON_VERSE: 'Non versé',
  TROP_VERSE: 'Trop versé',
  ANOMALIE: 'Anomalie',
}

export const STATUT_BROUILLARD_LABELS: Record<StatutBrouillard, string> = {
  OUVERT: 'Ouvert',
  CLOTURE: 'Clôturé',
  VALIDE: 'Validé',
  REJETE: 'Rejeté',
}

interface UtilisateurResume {
  nom: string
  prenom: string
}

export interface BrouillardItem {
  id: string
  venteId: string
  journee: string
  agenceId: string | null
  numeroTS10: string
  ventes: number
  gainsPayes: number
  soldeAttendu: number
  montantVerse: number
  ecart: number
  penalite: number
  situation: string | null
  statutAnomalie: StatutAnomalieBrouillard
  statut: StatutBrouillard
  clotureParId: string | null
  clotureParUser?: UtilisateurResume | null
  clotureAt: string | null
  valideParId: string | null
  valideParUser?: UtilisateurResume | null
  valideAt: string | null
  rejeteParId: string | null
  rejeteParUser?: UtilisateurResume | null
  rejeteAt: string | null
  rejetRaison: string | null
  createdAt: string
  updatedAt: string
  vente?: {
    agenceNom: string
    kiosque: string
    agent: string
  }
}

export interface BrouillardQueryParams {
  page?: number
  limit?: number
  agenceId?: string | undefined
  numeroTS10?: string | undefined
  dateDebut?: string | undefined
  dateFin?: string | undefined
  statutAnomalie?: StatutAnomalieBrouillard | undefined
  statut?: StatutBrouillard | undefined
  sortBy?: 'journee' | 'ecart' | 'penalite' | undefined
  sortOrder?: 'asc' | 'desc' | undefined
}

export interface ClotureBrouillardInput {
  situation?: string
}

export interface RejeterBrouillardInput {
  raison: string
}

export interface BrouillardFiltersState {
  agenceId?: string | undefined
  numeroTS10?: string | undefined
  dateDebut?: string | undefined
  dateFin?: string | undefined
  statutAnomalie?: StatutAnomalieBrouillard | undefined
  statut?: StatutBrouillard | undefined
}
