import { axiosInstance } from '@/shared/api'
import type {
  AbattementLigne,
  AbattementParametres,
  AbattementParametresInput,
  AbattementQueryParams,
  VersementInput,
} from '../types'

const BASE_URL = '/abattements'

interface PaginationMeta {
  total: number
  page: number
  limit: number
  totalPages: number
}

export const abattementsApi = {
  async getAbattements(params: AbattementQueryParams): Promise<{
    lignes: AbattementLigne[]
    pagination: PaginationMeta
    parametres: AbattementParametres
  }> {
    const response = await axiosInstance.get<{
      success: boolean
      data: {
        lignes: AbattementLigne[]
        pagination: PaginationMeta
        parametres: AbattementParametres
      }
    }>(BASE_URL, { params })
    return response.data.data
  },

  async getParametres(): Promise<AbattementParametres> {
    const response = await axiosInstance.get<{ success: boolean; data: AbattementParametres }>(
      `${BASE_URL}/parametres`,
    )
    return response.data.data
  },

  async updateParametres(input: AbattementParametresInput): Promise<AbattementParametres> {
    const response = await axiosInstance.put<{ success: boolean; data: AbattementParametres }>(
      `${BASE_URL}/parametres`,
      input,
    )
    return response.data.data
  },

  async enregistrerVersement(input: VersementInput): Promise<void> {
    await axiosInstance.post(`${BASE_URL}/versements`, input)
  },

  async exportAbattements(
    params: AbattementQueryParams,
    format: 'csv' | 'excel' | 'pdf',
  ): Promise<string | null> {
    const queryString = new URLSearchParams(
      Object.fromEntries(
        Object.entries(params)
          .filter(([_, v]) => v !== undefined && v !== '' && v !== false)
          .map(([k, v]) => [k, String(v)]),
      ),
    ).toString()

    const url = `${BASE_URL}/export/${format}?${queryString}`

    const response = await axiosInstance.get(url, {
      responseType: 'blob',
    })

    const contentTypeHeader = response.headers['content-type']
    const contentType = typeof contentTypeHeader === 'string' ? contentTypeHeader : ''

    const isUnexpectedResponse =
      contentType.includes('text/html') || contentType.includes('application/json')

    if (isUnexpectedResponse) {
      throw new Error("Erreur lors de l'export : réponse inattendue.")
    }

    const rawExportPassword = response.headers['x-export-password'] as unknown
    const exportPassword =
      typeof rawExportPassword === 'string' && rawExportPassword !== '' ? rawExportPassword : null

    const blob = new Blob([response.data], { type: 'application/zip' })
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.download = `export_abattements_${String(Date.now())}.zip`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(link.href)

    return exportPassword
  },
}
