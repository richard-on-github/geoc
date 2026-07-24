import { axiosInstance } from '@/shared/api'
import type { ApiResponse, ListParams } from '@/shared/types'
import type { Role, Permission, CreateRolePayload, UpdateRolePayload } from '../types'

function mapPermission(raw: any): Permission {
  return {
    id: raw.id,
    code: raw.code,
    nom: raw.nom,
    resource: raw.resource ?? raw.code?.split('.')[0] ?? '',
    action: raw.action ?? raw.code?.split('.')[1] ?? '',
    description: raw.description ?? null,
  }
}

function mapRole(raw: any): Role {
  // Si raw est undefined ou null, on renvoie un objet par défaut pour éviter une erreur
  if (!raw) {
    return {
      id: '',
      nom: '',
      code: '',
      description: null,
      isSystem: false,
      actif: true,
      dataScope: 'GLOBAL',
      niveau: 0,
      permissionCount: 0,
      userCount: 0,
      permissions: [],
      users: [],
      createdAt: '',
      updatedAt: '',
    }
  }

  return {
    id: raw.id ?? '',
    nom: raw.nom ?? '',
    code: raw.code ?? '',
    description: raw.description ?? null,
    isSystem: raw.isSystem ?? false,
    actif: raw.actif ?? true,
    dataScope: raw.dataScope ?? 'GLOBAL', // valeur par défaut
    niveau: raw.niveau ?? 0,
    permissionCount: raw.permissions?.length ?? raw._count?.permissions ?? 0,
    userCount: raw.users?.length ?? raw._count?.users ?? 0,
    permissions: (raw.permissions ?? []).map(mapPermission),
    users: (raw.users ?? []).map((u: any) => ({
      id: u.id,
      nom: u.nom,
      prenom: u.prenom,
      email: u.email,
      telephone: u.telephone ?? null,
      actif: u.actif,
      agence: u.agence ? { id: u.agence.id, nom: u.agence.nom } : null,
    })),
    createdAt: raw.createdAt ?? new Date().toISOString(),
    updatedAt: raw.updatedAt ?? new Date().toISOString(),
  }
}

export const securityApi = {
  // ... méthodes getRoles, getAllRoles, getRoleById

  async createRole(payload: CreateRolePayload): Promise<Role> {
    const response = await axiosInstance.post<ApiResponse<any>>('/roles', payload)
    // S'assurer que le rôle est bien dans response.data.data, sinon utiliser response.data
    const rawRole = response.data.data ?? response.data
    return mapRole(rawRole)
  },

  async updateRole(id: string, payload: UpdateRolePayload): Promise<Role> {
    const response = await axiosInstance.patch<ApiResponse<any>>(`/roles/${id}`, payload)
    // Fallback si la réponse n'a pas de wrapper "data"
    const rawRole = response.data.data ?? response.data
    return mapRole(rawRole)
  },

  async deleteRole(id: string): Promise<void> {
    await axiosInstance.delete(`/roles/${id}`)
  },

  // ... méthodes getPermissions, getAllPermissions

  async getRoleById(id: string): Promise<Role> {
    const response = await axiosInstance.get<ApiResponse<any>>(`/roles/${id}`)
    const rawRole = response.data.data ?? response.data
    return mapRole(rawRole)
  },

  async getAllRoles(): Promise<Role[]> {
    const response = await axiosInstance.get<{
      success: boolean
      message: string
      data: { roles: any[] }
    }>('/roles/all')
    // La réponse peut être directement un tableau ou sous data.roles
    const roles = response.data.data?.roles ?? response.data?.roles ?? []
    return roles.map(mapRole)
  },

  async getRoles(params?: ListParams): Promise<{
    items: Role[]
    total: number
    page: number
    limit: number
    totalPages: number
  }> {
    const response = await axiosInstance.get<{
      success: boolean
      message: string
      data: {
        roles: any[]
        pagination: { total: number; page: number; limit: number; totalPages: number }
      }
    }>('/roles', { params })

    const roles = response.data.data?.roles ?? response.data?.roles ?? []
    const pagination = response.data.data?.pagination ?? {
      total: roles.length,
      page: 1,
      limit: roles.length,
      totalPages: 1,
    }

    return {
      items: roles.map(mapRole),
      total: pagination.total,
      page: pagination.page,
      limit: pagination.limit,
      totalPages: pagination.totalPages,
    }
  },

  async getAllPermissions(): Promise<Permission[]> {
    const response = await axiosInstance.get<{
      success: boolean
      message: string
      data: { permissions: any[] }
    }>('/permissions/all')
    const permissions = response.data.data?.permissions ?? response.data?.permissions ?? []
    return permissions.map(mapPermission)
  },

  async getPermissions(params?: ListParams): Promise<{
    items: Permission[]
    total: number
    page: number
    limit: number
    totalPages: number
  }> {
    const response = await axiosInstance.get<{
      success: boolean
      message: string
      data: {
        permissions: any[]
        pagination: { total: number; page: number; limit: number; totalPages: number }
      }
    }>('/permissions', { params })

    const permissions = response.data.data?.permissions ?? response.data?.permissions ?? []
    const pagination = response.data.data?.pagination ?? {
      total: permissions.length,
      page: 1,
      limit: permissions.length,
      totalPages: 1,
    }

    return {
      items: permissions.map(mapPermission),
      total: pagination.total,
      page: pagination.page,
      limit: pagination.limit,
      totalPages: pagination.totalPages,
    }
  },
}
