export interface Permission {
  id: string
  code: string
  nom: string
  resource?: string // optionnel si backend ne le renvoie pas
  action?: string
  description?: string | null
}

export interface Role {
  id: string
  nom: string
  code: string
  description: string | null
  isSystem: boolean
  actif: boolean
  dataScope: 'GLOBAL' | 'AGENCE' // nouveau
  niveau: number // nouveau
  permissionCount?: number
  userCount?: number
  permissions: Permission[]
  users?: {
    // pour le détail
    id: string
    prenom: string
    nom: string
    email: string
    telephone: string | null
    actif: boolean
    agence: { id: string; nom: string } | null
  }[]
  createdAt: string
  updatedAt: string
}

export interface CreateRolePayload {
  nom: string
  code: string
  description?: string
  dataScope: 'GLOBAL' | 'AGENCE'
  niveau: number
  permissionIds: string[]
}

export interface UpdateRolePayload {
  nom?: string
  code?: string
  description?: string
  dataScope?: 'GLOBAL' | 'AGENCE'
  niveau?: number
  actif?: boolean
  permissionIds?: string[]
}

export interface RoleQueryParams {
  page?: number
  limit?: number
  search?: string
  dataScope?: 'GLOBAL' | 'AGENCE'
  actif?: boolean
}
