import { axiosInstance } from '@/shared/api'
import type { ApiResponse, ApiPaginatedResponse, ListParams } from '@/shared/types'
import type { Agence, CreateAgencePayload, UpdateAgencePayload } from '../types'

const BASE_URL = '/agences'

function mapAgence(raw: any): Agence {
  return {
    id: raw.id,
    nom: raw.nom,
    code: raw.code,
    adresse: raw.adresse ?? null,
    telephone: raw.telephone ?? null,
    email: raw.email ?? null,
    actif: raw.actif,
    createdAt: raw.createdAt,
    updatedAt: raw.updatedAt,
    _count: raw._count,
  }
}

export const agencesApi = {
  async getAgences(params: ListParams): Promise<ApiPaginatedResponse<Agence>['data']> {
    const response = await axiosInstance.get<{
      success: boolean
      message: string
      data: {
        agences: any[]
        pagination: {
          total: number
          page: number
          limit: number
          totalPages: number
        }
      }
    }>(BASE_URL, { params })

    const { agences, pagination } = response.data.data

    return {
      items: agences.map(mapAgence),
      total: pagination.total,
      page: pagination.page,
      limit: pagination.limit,
      totalPages: pagination.totalPages,
    }
  },

  async getAgenceById(id: string): Promise<Agence> {
    const response = await axiosInstance.get<ApiResponse<any>>(`${BASE_URL}/${id}`)
    return mapAgence(response.data.data)
  },

  async createAgence(payload: CreateAgencePayload): Promise<Agence> {
    const response = await axiosInstance.post<ApiResponse<any>>(BASE_URL, payload)
    return mapAgence(response.data.data)
  },

  async updateAgence(id: string, payload: UpdateAgencePayload): Promise<Agence> {
    const response = await axiosInstance.patch<ApiResponse<any>>(`${BASE_URL}/${id}`, payload)
    return mapAgence(response.data.data)
  },

  async deleteAgence(id: string): Promise<void> {
    await axiosInstance.delete(`${BASE_URL}/${id}`)
  },

  async toggleAgenceStatus(id: string, actif: boolean): Promise<Agence> {
    const response = await axiosInstance.patch<ApiResponse<any>>(`${BASE_URL}/${id}/status`, {
      actif,
    })
    return mapAgence(response.data.data)
  },
}
