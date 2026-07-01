/**
 * Format uniforme de toutes les réponses de l'API GEOC.
 * Backend : Node.js / Express / Prisma
 */

export interface ApiResponse<T> {
  success: boolean
  message: string
  data: T
}

export interface ApiErrorResponse {
  success: false
  message: string
  errors?: Record<string, string[]>
}

/**
 * Réponse de liste paginée côté serveur.
 */
export interface PaginatedData<T> {
  items: T[]
  total: number
  page: number
  limit: number
  totalPages: number
}

export type ApiPaginatedResponse<T> = ApiResponse<PaginatedData<T>>

/**
 * Paramètres de pagination/tri/recherche communs aux listes.
 */
export interface ListParams {
  page?: number
  limit?: number
  search?: string
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
}

/**
 * Erreur API avec contexte HTTP.
 */
export class ApiError extends Error {
  constructor(
    public readonly status: number,
    public readonly message: string,
    public readonly errors?: Record<string, string[]>,
  ) {
    super(message)
    this.name = 'ApiError'
  }
}
