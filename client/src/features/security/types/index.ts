export interface Permission {
  id: string
  code: string // ex: "agence.create"
  nom: string // ex: "Créer une agence"
  resource: string // ex: "agence"
  action: string // ex: "create"
  description: string | null
}

export interface Role {
  id: string
  nom: string
  code: string
  description: string | null
  isSystem: boolean
  actif: boolean
  permissionCount: number
  userCount: number
  permissions: Permission[]
  createdAt: string
  updatedAt: string
}

export interface CreateRolePayload {
  nom: string
  code: string
  description?: string
  permissionIds: string[]
}

export interface UpdateRolePayload {
  nom?: string
  code?: string
  description?: string
  actif?: boolean
  permissionIds?: string[]
}
