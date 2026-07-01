import { axiosInstance } from '@/shared/api'
import type { ApiResponse, ApiPaginatedResponse, ListParams } from '@/shared/types'
import type { Role, Permission, CreateRolePayload, UpdateRolePayload } from '../types'

export const securityApi = {
  /* ---- Rôles ---- */
  async getRoles(params?: ListParams): Promise<ApiPaginatedResponse<Role>['data']> {
    const { data } = await axiosInstance.get<ApiPaginatedResponse<Role>>('/roles', { params })
    return data.data
  },

  async getAllRoles(): Promise<Role[]> {
    const { data } = await axiosInstance.get<ApiResponse<Role[]>>('/roles')
    return data.data
  },

  async getRoleById(id: string): Promise<Role> {
    const { data } = await axiosInstance.get<ApiResponse<Role>>(`/roles/${id}`)
    return data.data
  },

  async createRole(payload: CreateRolePayload): Promise<Role> {
    const { data } = await axiosInstance.post<ApiResponse<Role>>('/roles', payload)
    return data.data
  },

  async updateRole(id: string, payload: UpdateRolePayload): Promise<Role> {
    const { data } = await axiosInstance.patch<ApiResponse<Role>>(`/roles/${id}`, payload)
    return data.data
  },

  async deleteRole(id: string): Promise<void> {
    await axiosInstance.delete(`/roles/${id}`)
  },

  async getAllPermissions(): Promise<Permission[]> {
    const { data } = await axiosInstance.get<
      ApiResponse<{ permissions: Permission[]; pagination: any }>
    >('/permissions', {
      params: { limit: 999 },
    })
    const rawPermissions = data.data.permissions
    return rawPermissions.map((p: any): Permission => ({
      id: p.id,
      code: p.code,
      nom: p.nom,
      description: p.description ?? null,
      resource: p.code.includes('.') ? p.code.split('.')[0] : p.code,
      action: p.code.includes('.') ? p.code.split('.')[1] : 'manage',
    }))
  },
}
