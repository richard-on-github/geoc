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
  sortBy?: 'dateDebut' | 'totalVente' | 'createdAt'
  sortOrder?: 'asc' | 'desc'
}

export type ImportVentePayload = FormData
