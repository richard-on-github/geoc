import { axiosInstance } from '@/shared/api'
import type { ApiResponse, ApiPaginatedResponse, ListParams } from '@/shared/types'
import type { User, CreateUserPayload, UpdateUserPayload } from '../types'

function mapUser(raw: any): User {
  const cleanPermissions = (raw.permissions ?? []).map((p: any) => {
    const perm = p.permission ? p.permission : p
    return { id: perm.id, nom: perm.nom }
  })

  return {
    id: raw.id,
    prenom: raw.prenom,
    nom: raw.nom,
    telephone: raw.telephone ?? null,

    fullName: `${raw.prenom} ${raw.nom}`.trim(),
    email: raw.email,
    phoneNumber: raw.telephone ?? undefined,
    isActive: raw.actif,
    mustChangePassword: raw.mustChangePassword,
    role: {
      id: raw.role.id,
      name: raw.role.code,
      displayName: raw.role.nom,
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
        users: any[]
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
    const response = await axiosInstance.get<ApiResponse<any>>(`/users/${id}`)
    return mapUser(response.data.data)
  },

  async createUser(payload: CreateUserPayload): Promise<User> {
    const response = await axiosInstance.post<ApiResponse<any>>('/users', payload)
    return mapUser(response.data.data)
  },

  async updateUser(id: string, payload: UpdateUserPayload): Promise<User> {
    const response = await axiosInstance.patch<ApiResponse<any>>(`/users/${id}`, payload)
    return mapUser(response.data.data)
  },

  async deleteUser(id: string): Promise<void> {
    await axiosInstance.delete(`/users/${id}`)
  },

  async toggleUserStatus(id: string, actif: boolean): Promise<User> {
    const response = await axiosInstance.patch<ApiResponse<any>>(`/users/${id}/status`, {
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
