import { axiosInstance } from '@/shared/api'
import type { ApiResponse, ApiPaginatedResponse, ListParams } from '@/shared/types'
import type { User, CreateUserPayload, UpdateUserPayload } from '../types'

interface RawUserPermission {
  id: string
  nom: string
  permission?: { id: string; nom: string }
}

interface RawUser {
  id: string
  prenom: string
  nom: string
  email: string
  telephone?: string | null
  actif: boolean
  mustChangePassword: boolean
  roleId?: string
  role: {
    id: string
    nom: string
    code: string
  }
  agenceId?: string | null
  agence?: {
    id: string
    nom: string
    code: string
  } | null
  createdAt: string
  updatedAt: string
  lastLoginAt?: string | null
  permissions?: RawUserPermission[]
}

function mapUser(raw: RawUser): User {
  const cleanPermissions = (raw.permissions ?? []).map((p) => {
    const perm = p.permission ?? p
    return { id: perm.id, nom: perm.nom }
  })

  return {
    id: raw.id,
    prenom: raw.prenom,
    nom: raw.nom,
    telephone: raw.telephone ?? null,

    fullName: `${raw.prenom} ${raw.nom}`.trim(),
    email: raw.email,
    ...(raw.telephone != null ? { phoneNumber: raw.telephone } : {}),
    actif: raw.actif,
    isActive: raw.actif,
    mustChangePassword: raw.mustChangePassword,
    roleId: raw.roleId ?? raw.role.id,
    role: {
      id: raw.role.id,
      nom: raw.role.nom,
      code: raw.role.code,
    },
    // Nouveaux champs
    agenceId: raw.agenceId ?? null,
    agence: raw.agence
      ? {
          id: raw.agence.id,
          nom: raw.agence.nom,
          code: raw.agence.code,
        }
      : null,
    agencyName: raw.agence?.nom ?? null,

    createdAt: raw.createdAt,
    updatedAt: raw.updatedAt,
    lastLoginAt: raw.lastLoginAt ?? null,

    permissions: cleanPermissions,
  }
}

export const usersApi = {
  async getUsers(params: ListParams): Promise<ApiPaginatedResponse<User>['data']> {
    // Récupération brute
    const response = await axiosInstance.get<{
      success: boolean
      message: string
      data: {
        users: RawUser[]
        pagination: {
          total: number
          page: number
          limit: number
          totalPages: number
        }
      }
    }>('/users', { params })

    const { users, pagination } = response.data.data

    return {
      items: users.map(mapUser),
      total: pagination.total,
      page: pagination.page,
      limit: pagination.limit,
      totalPages: pagination.totalPages,
    }
  },

  async getUserById(id: string): Promise<User> {
    const response = await axiosInstance.get<ApiResponse<RawUser>>(`/users/${id}`)
    return mapUser(response.data.data)
  },

  async createUser(payload: CreateUserPayload): Promise<User> {
    const response = await axiosInstance.post<ApiResponse<RawUser>>('/users', payload)
    return mapUser(response.data.data)
  },

  async updateUser(id: string, payload: UpdateUserPayload): Promise<User> {
    const response = await axiosInstance.patch<ApiResponse<RawUser>>(`/users/${id}`, payload)
    return mapUser(response.data.data)
  },

  async deleteUser(id: string): Promise<void> {
    await axiosInstance.delete(`/users/${id}`)
  },

  async toggleUserStatus(id: string, actif: boolean): Promise<User> {
    const response = await axiosInstance.patch<ApiResponse<RawUser>>(`/users/${id}/status`, {
      actif,
    })
    return mapUser(response.data.data)
  },

  async resetPassword(userId: string, newPassword: string): Promise<void> {
    await axiosInstance.post('/auth/reset-password', {
      userId,
      newPassword,
    })
  },
}
