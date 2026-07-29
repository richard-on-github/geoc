import { axiosInstance } from '@/shared/api'
import type { ApiResponse, ApiPaginatedResponse } from '@/shared/types'
import type { Vente, VenteQueryParams, VenteCloture } from '../types'

const BASE_URL = '/ventes'

function mapVente(raw: any): Vente {
  return {
    id: raw.id,
    agenceId: raw.agenceId,
    agenceNom: raw.agenceNom,
    kiosque: raw.kiosque,
    agent: raw.agent,
    banque: raw.banque,
    numeroTS10: raw.numeroTS10,
    totalVente: Number(raw.totalVente),
    totalPaye: Number(raw.totalPaye),
    totalSolde: Number(raw.totalSolde),
    dateDebut: raw.dateDebut,
    dateFin: raw.dateFin,
    importId: raw.importId,
    clotureId: raw.clotureId,
    createdAt: raw.createdAt,
    updatedAt: raw.updatedAt,
    agence: raw.agence,
  }
}

export const ventesApi = {
  async getVentes(params: VenteQueryParams): Promise<ApiPaginatedResponse<Vente>['data']> {
    const response = await axiosInstance.get<{
      success: boolean
      message: string
      data: {
        ventes: any[]
        pagination: {
          total: number
          page: number
          limit: number
          totalPages: number
        }
      }
    }>(BASE_URL, { params })

    const { ventes, pagination } = response.data.data

    return {
      items: ventes.map(mapVente),
      total: pagination.total,
      page: pagination.page,
      limit: pagination.limit,
      totalPages: pagination.totalPages,
    }
  },

  async importVentes(file: File): Promise<void> {
    const formData = new FormData()
    formData.append('file', file)
    await axiosInstance.post(`${BASE_URL}/import`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
  },

  async getClotures(): Promise<VenteCloture[]> {
    const response = await axiosInstance.get<{ success: boolean; data: VenteCloture[] }>(
      `${BASE_URL}/clotures`,
    )
    return response.data.data
  },

  async cloturerMois(periode: string): Promise<VenteCloture> {
    const response = await axiosInstance.post<{ success: boolean; data: VenteCloture }>(
      `${BASE_URL}/cloturer`,
      { periode },
    )
    return response.data.data
  },

  async exportVentes(
    params: VenteQueryParams,
    format: 'csv' | 'excel' | 'pdf',
  ): Promise<string | null> {
    const queryString = new URLSearchParams(
      Object.fromEntries(
        Object.entries(params)
          .filter(([_, v]) => v !== undefined && v !== '' && v !== false) // Ignore les false
          .map(([k, v]) => [k, String(v)]),
      ),
    ).toString()

    const url = `${BASE_URL}/export/${format}?${queryString}`

    const response = await axiosInstance.get(url, {
      responseType: 'blob',
    })

    const contentType = response.headers['content-type'] || ''
    if (contentType.includes('text/html') || contentType.includes('application/json')) {
      throw new Error("Erreur lors de l'export : réponse inattendue.")
    }

    const exportPassword = (response.headers['x-export-password'] as string) || null

    const blob = new Blob([response.data], { type: 'application/zip' })
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.download = `export_ventes_${new Date().getTime()}.zip`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(link.href)

    return exportPassword
  },
}
