import { axiosInstance } from '@/shared/api'
import type { ApiResponse } from '@/shared/types'
import type {
  LoginPayload,
  LoginData,
  AuthUser,
  ChangePasswordPayload,
  ResetPasswordPayload,
} from '../types'

export const authApi = {
  async login(payload: LoginPayload): Promise<LoginData> {
    const { data } = await axiosInstance.post<ApiResponse<LoginData>>('/auth/login', payload)
    return data.data
  },

  async logout(): Promise<void> {
    await axiosInstance.post('/auth/logout')
  },

  async getMe(): Promise<AuthUser> {
    const { data } = await axiosInstance.get<ApiResponse<AuthUser>>('/auth/me')
    return data.data
  },

  async changePassword(payload: ChangePasswordPayload): Promise<void> {
    await axiosInstance.post<ApiResponse<null>>('/auth/change-password', payload)
  },

  async resetPassword(payload: ResetPasswordPayload): Promise<void> {
    await axiosInstance.post(`/auth/reset-password`, payload)
  },
}
