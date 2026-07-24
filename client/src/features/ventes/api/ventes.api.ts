import { axiosInstance } from '@/shared/api'
import type { ApiResponse, ApiPaginatedResponse, ListParams } from '@/shared/types'
import type { Vente, VenteQueryParams } from '../types'

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

  // Import : envoi d'un fichier (multipart/form-data)
  async importVentes(file: File): Promise<void> {
    const formData = new FormData()
    formData.append('file', file)
    await axiosInstance.post(`${BASE_URL}/import`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
  },

  async exportVentes(params: VenteQueryParams, format: 'csv' | 'excel' | 'pdf'): Promise<void> {
    const queryString = new URLSearchParams(
      Object.fromEntries(
        Object.entries(params)
          .filter(([_, v]) => v !== undefined && v !== '')
          .map(([k, v]) => [k, String(v)]),
      ),
    ).toString()

    const url = `${BASE_URL}/export/${format}?${queryString}`

    // 1. Récupérer le blob avec axios (inclut les headers d'authentification)
    const response = await axiosInstance.get(url, {
      responseType: 'blob',
    })

    // 2. Vérifier si la réponse est bien un fichier (et non une page d'erreur HTML)
    const contentType = response.headers['content-type'] || ''
    if (contentType.includes('text/html')) {
      // Si le backend renvoie une erreur sous forme HTML, on la rejette
      throw new Error("Erreur lors de l'export : réponse HTML inattendue.")
    }

    // 3. Créer un lien de téléchargement à partir du blob
    const blob = new Blob([response.data], { type: contentType })
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.download = `export_ventes_${new Date().getTime()}.${format === 'excel' ? 'xlsx' : format}`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(link.href)
  },
}
