import { axiosInstance } from '@/shared/api'
import type { ApiResponse, ApiPaginatedResponse, ListParams } from '@/shared/types'
import type {
  User,
  CreateUserPayload,
  UpdateUserPayload,
  UpdateUserPermissionsPayload,
} from '../types'

// Mapping d'un utilisateur brut vers le type User attendu
function mapUser(raw: any): User {
  return {
    id: raw.id,
    fullName: `${raw.prenom} ${raw.nom}`.trim(),
    email: raw.email,
    phoneNumber: raw.telephone ?? undefined,
    isActive: raw.actif,
    mustChangePassword: raw.mustChangePassword,
    role: {
      id: raw.role.id,
      name: raw.role.code, // ou raw.role.nom selon votre besoin
      displayName: raw.role.nom,
    },
    agencyName: raw.agence?.nom ?? null, // si l'API renvoie une agence
    createdAt: raw.createdAt,
    updatedAt: raw.updatedAt,
    lastLoginAt: raw.lastLoginAt ?? null,
    permissions: raw.permissions ?? [],
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

    // Mapping et retour
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

  // Les autres méthodes doivent aussi mapper la réponse si elles retournent un User
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

  async toggleUserStatus(id: string, activate: boolean): Promise<User> {
    const response = await axiosInstance.patch<ApiResponse<any>>(`/users/${id}/status`, {
      activate,
    })
    return mapUser(response.data.data)
  },
}
