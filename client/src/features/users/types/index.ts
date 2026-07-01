
export type UserStatus = 'active' | 'inactive'

export interface User {
  id: string
  prenom: string
  nom: string
  email: string
  telephone: string | null
  mustChangePassword: boolean
  roleId: string
  role: {
    id: string
    nom: string
    code: string
  }
  actif: boolean
  lastLoginAt: string | null
  createdAt: string
  updatedAt: string

  /**
   * Liste des codes de permissions (ex: ["user.read", "operation.create"])
   * Agrégée par le backend (Permissions du Rôle + Surcharges utilisateur)
   */
  permissions: string[]
}
export interface CreateUserPayload {
  prenom: string
  nom: string
  email: string
  telephone?: string | null
  roleId: string
  password?: string
  permissionIds?: string[]
}

/**
 * Payload de modification d'un utilisateur
 * Aligné sur `updateUserSchema` (Note: 'actif' n'est pas dedans)
 */
export interface UpdateUserPayload {
  prenom?: string
  nom?: string
  email?: string
  telephone?: string | null
  roleId?: string
  mustChangePassword?: boolean
  permissionIds?: string[]
}

/**
 * Payload dédié au changement de statut (Actif/Inactif)
 * Aligné sur `updateUserStatusSchema`
 */
export interface UpdateUserStatusPayload {
  actif: boolean
}

/**
 * Critères de recherche et pagination pour les requêtes (Query Params)
 * Aligné sur les transformations de `userQuerySchema`
 */
export interface UserQueryParams {
  page?: number
  limit?: number
  search?: string
  roleId?: string
  actif?: boolean
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
}
