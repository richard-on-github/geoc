export interface VenteCloture {
  id: string
  periode: string
  dateDebut: string
  dateFin: string
  totalVentes: number
  totalPayes: number
  totalSoldes: number
  nbLignes: number
  clotureParId: string
  cloturePar?: {
    nom: string
    prenom: string
    email: string
  }
  createdAt: string
  updatedAt: string
}

export interface Vente {
  id: string
  agenceId: string
  agenceNom: string
  kiosque: string
  agent: string
  banque: string
  numeroTS10: string
  totalVente: number
  totalPaye: number
  totalSolde: number
  dateDebut: string
  dateFin: string
  importId: string
  clotureId?: string | null
  /** Jour de l'année (1-366), calculé côté backend à partir de dateDebut. */
  jourAnnee: number
  /** Mois (1-12), calculé côté backend à partir de dateDebut. */
  mois: number
  /** Année civile, calculée côté backend à partir de dateDebut. */
  annee: number
  /** Statut d'encaissement du solde à verser, mis à jour à chaque encaissement enregistré. */
  statutEncaissement: StatutEncaissement
  createdAt: string
  updatedAt: string
  agence?: {
    nom: string
    code: string
  }
}

export interface VenteQueryParams {
  page?: number
  limit?: number
  search?: string | undefined
  agenceId?: string | undefined
  dateDebut?: string | undefined
  dateFin?: string | undefined
  clotureId?: string | undefined
  nonClotureesOnly?: boolean | undefined
  statutEncaissement?: StatutEncaissement | undefined
  jour?: number | undefined
  mois?: number | undefined
  annee?: number | undefined
  sortBy?: 'agenceNom' | 'dateDebut' | 'totalVente' | 'createdAt' | undefined
  sortOrder?: 'asc' | 'desc' | undefined
}

export type ImportVentePayload = FormData

export interface VenteFiltersState {
  search: string
  agenceId?: string
  dateDebut?: string
  dateFin?: string
  clotureId?: string
  statutEncaissement?: StatutEncaissement
  nonClotureesOnly?: boolean
}

/** Les 4 vues de navigation de la liste des ventes. */
export type VenteViewMode = 'jours' | 'mois' | 'annees' | 'general'

export interface AnnulerClotureResult {
  periode: string
  annule: boolean
}

export interface EmailAutorise {
  id: string
  email: string
  ajouteParId: string
  ajoutePar?: {
    nom: string
    prenom: string
    email: string
  }
  createdAt: string
}

export type StatutEncaissement = 'NON_SOLDE' | 'PARTIELLEMENT_SOLDE' | 'SOLDE'

export const STATUT_ENCAISSEMENT_LABELS: Record<StatutEncaissement, string> = {
  NON_SOLDE: 'Non soldé',
  PARTIELLEMENT_SOLDE: 'Partiellement soldé',
  SOLDE: 'Soldé',
}

export interface Encaissement {
  id: string
  venteId: string
  montant: number
  dateEncaissement: string
  enregistrePar?: {
    nom: string
    prenom: string
    email: string
  }
  createdAt: string
}

export interface EncaissementInput {
  venteId: string
  montant: number
  /** ISO 8601 */
  dateEncaissement: string
}

export interface EncaissementResult {
  encaissement: Encaissement
  montantEncaisseCumule: number
  totalSolde: number
  statutEncaissement: StatutEncaissement
}

export interface HistoriqueEncaissement {
  encaissements: Encaissement[]
  montantEncaisseCumule: number
  totalSolde: number
  statutEncaissement: StatutEncaissement
}
