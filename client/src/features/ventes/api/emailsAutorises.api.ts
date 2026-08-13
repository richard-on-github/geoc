import { axiosInstance } from '@/shared/api'
import type { EmailAutorise } from '../types'

const BASE_URL = '/emails-autorises'

export const emailsAutorisesApi = {
  async getEmailsAutorises(): Promise<EmailAutorise[]> {
    const response = await axiosInstance.get<{ success: boolean; data: EmailAutorise[] }>(BASE_URL)
    return response.data.data
  },

  async ajouterEmailAutorise(email: string): Promise<EmailAutorise> {
    const response = await axiosInstance.post<{ success: boolean; data: EmailAutorise }>(BASE_URL, {
      email,
    })
    return response.data.data
  },

  async supprimerEmailAutorise(id: string): Promise<void> {
    await axiosInstance.delete(`${BASE_URL}/${id}`)
  },
}
