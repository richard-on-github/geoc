export type UserStatus = 'active' | 'inactive'

export interface Permission {
  id: string
  nom: string
}

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
  agenceId: string | null
  agence: {
    id: string
    nom: string
    code: string
  } | null

  permissions: Permission[]

  fullName: string
  phoneNumber?: string
  isActive: boolean
  agencyName: string | null
}

export interface CreateUserPayload {
  prenom: string
  nom: string
  email: string
  telephone?: string | null
  roleId: string
  password?: string
  permissionIds?: string[]
  agenceId?: string | null
}

export interface UpdateUserPayload {
  prenom?: string
  nom?: string
  email?: string
  telephone?: string | null
  roleId?: string
  mustChangePassword?: boolean
  permissionIds?: string[]
  agenceId?: string | null
}

export interface UpdateUserStatusPayload {
  actif: boolean
}

export interface UserQueryParams {
  page?: number
  limit?: number
  search?: string
  roleId?: string
  actif?: boolean
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
}
