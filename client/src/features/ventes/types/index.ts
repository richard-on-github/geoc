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
  search?: string
  agenceId?: string
  dateDebut?: string
  dateFin?: string
  clotureId?: string
  nonClotureesOnly?: boolean
  sortBy?: 'dateDebut' | 'totalVente' | 'createdAt'
  sortOrder?: 'asc' | 'desc'
}

export type ImportVentePayload = FormData
