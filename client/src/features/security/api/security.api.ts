import { axiosInstance } from '@/shared/api'
import type { ApiResponse, ListParams } from '@/shared/types'
import type { Role, Permission, CreateRolePayload, UpdateRolePayload } from '../types'

interface RawPermission {
  id: string
  code: string
  nom: string
  resource?: string
  action?: string
  description?: string | null
}

interface RawRoleUser {
  id: string
  nom: string
  prenom: string
  email: string
  telephone?: string | null
  actif: boolean
  agence?: { id: string; nom: string } | null
}

interface RawRole {
  id?: string
  nom?: string
  code?: string
  description?: string | null
  isSystem?: boolean
  actif?: boolean
  dataScope?: 'GLOBAL' | 'AGENCE'
  niveau?: number
  permissionCount?: number
  userCount?: number
  _count?: { permissions?: number; users?: number }
  permissions?: RawPermission[]
  users?: RawRoleUser[]
  createdAt?: string
  updatedAt?: string
}

function mapPermission(raw: RawPermission): Permission {
  return {
    id: raw.id,
    code: raw.code,
    nom: raw.nom,
    resource: raw.resource ?? raw.code.split('.')[0] ?? '',
    action: raw.action ?? raw.code.split('.')[1] ?? '',
    description: raw.description ?? null,
  }
}

function mapRole(raw: RawRole | null | undefined): Role {
  if (raw === undefined || raw === null) {
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
    dataScope: raw.dataScope ?? 'GLOBAL',
    niveau: raw.niveau ?? 0,
    permissionCount: raw.permissions?.length ?? raw._count?.permissions ?? 0,
    userCount: raw.users?.length ?? raw._count?.users ?? 0,
    permissions: (raw.permissions ?? []).map(mapPermission),
    users: (raw.users ?? []).map((u) => ({
      id: u.id,
      nom: u.nom,
      prenom: u.prenom,
      email: u.email,
      telephone: u.telephone ?? null,
      actif: u.actif,
      agence: u.agence !== undefined && u.agence !== null ? { id: u.agence.id, nom: u.agence.nom } : null,
    })),
    createdAt: raw.createdAt ?? new Date().toISOString(),
    updatedAt: raw.updatedAt ?? new Date().toISOString(),
  }
}

export const securityApi = {
  async createRole(payload: CreateRolePayload): Promise<Role> {
    const response = await axiosInstance.post<ApiResponse<RawRole>>('/roles', payload)
    const rawRole = response.data.data
    return mapRole(rawRole)
  },

  async updateRole(id: string, payload: UpdateRolePayload): Promise<Role> {
    const response = await axiosInstance.patch<ApiResponse<RawRole>>(`/roles/${id}`, payload)
    const rawRole = response.data.data
    return mapRole(rawRole)
  },

  async deleteRole(id: string): Promise<void> {
    await axiosInstance.delete(`/roles/${id}`)
  },

  async getRoleById(id: string): Promise<Role> {
    const response = await axiosInstance.get<ApiResponse<RawRole>>(`/roles/${id}`)
    const rawRole = response.data.data
    return mapRole(rawRole)
  },

  async getAllRoles(): Promise<Role[]> {
    const response = await axiosInstance.get<{
      success: boolean
      message: string
      data: { roles: RawRole[] }
    }>('/roles/all')
    const roles = response.data.data.roles
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
        roles: RawRole[]
        pagination: { total: number; page: number; limit: number; totalPages: number }
      }
    }>('/roles', { params })

    const { roles, pagination } = response.data.data

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
      data: { permissions: RawPermission[] }
    }>('/permissions/all')
    const permissions = response.data.data.permissions
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
        permissions: RawPermission[]
        pagination: { total: number; page: number; limit: number; totalPages: number }
      }
    }>('/permissions', { params })

    const { permissions, pagination } = response.data.data

    return {
      items: permissions.map(mapPermission),
      total: pagination.total,
      page: pagination.page,
      limit: pagination.limit,
      totalPages: pagination.totalPages,
    }
  },
}
