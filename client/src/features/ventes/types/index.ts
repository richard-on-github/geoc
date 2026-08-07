// export interface VenteCloture {
//   id: string
//   periode: string
//   dateDebut: string
//   dateFin: string
//   totalVentes: number
//   totalPayes: number
//   totalSoldes: number
//   nbLignes: number
//   clotureParId: string
//   cloturePar?: {
//     nom: string
//     prenom: string
//     email: string
//   }
//   createdAt: string
//   updatedAt: string
// }

// export interface Vente {
//   id: string
//   agenceId: string
//   agenceNom: string
//   kiosque: string
//   agent: string
//   banque: string
//   numeroTS10: string
//   totalVente: number
//   totalPaye: number
//   totalSolde: number
//   dateDebut: string
//   dateFin: string
//   importId: string
//   clotureId?: string | null
//   createdAt: string
//   updatedAt: string
//   agence?: {
//     nom: string
//     code: string
//   }
// }

// export interface VenteQueryParams {
//   page?: number
//   limit?: number
//   search?: string | undefined
//   agenceId?: string | undefined
//   dateDebut?: string | undefined
//   dateFin?: string | undefined
//   clotureId?: string | undefined
//   nonClotureesOnly?: boolean | undefined
//   sortBy?: 'dateDebut' | 'totalVente' | 'createdAt' | undefined
//   sortOrder?: 'asc' | 'desc' | undefined
// }

// export type ImportVentePayload = FormData

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
  /** Jour de l'année (1-366), indépendant de dateDebut/dateFin. */
  jour?: number | undefined
  /** Mois (1-12), indépendant de dateDebut/dateFin. */
  mois?: number | undefined
  /** Année civile, indépendante de dateDebut/dateFin. */
  annee?: number | undefined
  sortBy?: 'agenceNom' | 'dateDebut' | 'totalVente' | 'createdAt' | undefined
  sortOrder?: 'asc' | 'desc' | undefined
}

export type ImportVentePayload = FormData

/**
 * Filtres "classiques" du module Ventes (recherche, agence, dates, clôture...),
 * indépendants de la navigation par jour/mois/année. Centralisé ici pour éviter
 * de dupliquer la même forme dans VenteFilters/VentesListPage/VentesTable.
 */
export interface VenteFiltersState {
  search: string
  agenceId?: string
  dateDebut?: string
  dateFin?: string
  clotureId?: string
  nonClotureesOnly?: boolean
}

/** Les 4 vues de navigation de la liste des ventes. */
export type VenteViewMode = 'jours' | 'mois' | 'annees' | 'general'

export interface AnnulerClotureResult {
  periode: string
  annule: boolean
}
