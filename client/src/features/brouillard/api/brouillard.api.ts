import { axiosInstance } from '@/shared/api'
import type {
  BrouillardItem,
  BrouillardQueryParams,
  ClotureBrouillardInput,
  RejeterBrouillardInput,
} from '../types'

const BASE_URL = '/brouillards'

interface PaginationMeta {
  total: number
  page: number
  limit: number
  totalPages: number
}

export const brouillardApi = {
  async getBrouillards(params: BrouillardQueryParams): Promise<{
    items: BrouillardItem[]
    pagination: PaginationMeta
  }> {
    const response = await axiosInstance.get<{
      success: boolean
      data: { items: BrouillardItem[]; pagination: PaginationMeta }
    }>(BASE_URL, { params })
    return response.data.data
  },

  async cloturer(id: string, input: ClotureBrouillardInput): Promise<BrouillardItem> {
    const response = await axiosInstance.post<{ success: boolean; data: BrouillardItem }>(
      `${BASE_URL}/${id}/cloturer`,
      input,
    )
    return response.data.data
  },

  async valider(id: string): Promise<BrouillardItem> {
    const response = await axiosInstance.post<{ success: boolean; data: BrouillardItem }>(
      `${BASE_URL}/${id}/valider`,
    )
    return response.data.data
  },

  async rejeter(id: string, input: RejeterBrouillardInput): Promise<BrouillardItem> {
    const response = await axiosInstance.post<{ success: boolean; data: BrouillardItem }>(
      `${BASE_URL}/${id}/rejeter`,
      input,
    )
    return response.data.data
  },
}
