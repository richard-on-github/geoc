export interface Agence {
  id: string
  nom: string
  code: string
  adresse: string | null
  telephone: string | null
  email: string | null
  actif: boolean
  createdAt: string
  updatedAt: string
  _count?: {
    users: number
    ventes: number
  }
}

export type CreateAgencePayload = {
  nom: string
  code: string
  adresse?: string
  telephone?: string
  email?: string
}

export type UpdateAgencePayload = Partial<CreateAgencePayload> & {
  actif?: boolean
}

export interface AgenceQueryParams {
  page?: number
  limit?: number
  search?: string
  actif?: boolean
  sortBy?: 'nom' | 'code' | 'createdAt' | 'updatedAt'
  sortOrder?: 'asc' | 'desc'
}
