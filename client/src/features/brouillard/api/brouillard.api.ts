import { axiosInstance } from '@/shared/api'
import type { BrouillardQueryParams, BrouillardResult } from '../types'

const BASE_URL = '/brouillards'

export const brouillardApi = {
  async getBrouillard(params: BrouillardQueryParams): Promise<BrouillardResult> {
    const response = await axiosInstance.get<{ success: boolean; data: BrouillardResult }>(
      BASE_URL,
      { params },
    )
    return response.data.data
  },

  async exportBrouillard(
    params: BrouillardQueryParams,
    format: 'csv' | 'excel' | 'pdf',
  ): Promise<void> {
    const queryString = new URLSearchParams(
      Object.fromEntries(
        Object.entries(params)
          .filter(([_, v]) => v !== undefined && v !== '')
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

    const extensions: Record<'csv' | 'excel' | 'pdf', string> = {
      csv: 'csv',
      excel: 'xlsx',
      pdf: 'pdf',
    }

    const blob = new Blob([response.data], {
      type: contentType || 'application/octet-stream',
    })
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.download = `brouillard_${String(Date.now())}.${extensions[format]}`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(link.href)
  },
}
