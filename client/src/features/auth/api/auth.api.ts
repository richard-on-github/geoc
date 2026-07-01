import { axiosInstance } from '@/shared/api'
import type { ApiResponse } from '@/shared/types'
import type {
  LoginPayload,
  LoginData,
  AuthUser,
  ChangePasswordPayload,
  ResetPasswordRequestPayload,
  ResetPasswordPayload,
} from '../types'

/**
 * Service API du domaine auth.
 * Chaque fonction retourne directement la donnée extraite de ApiResponse<T>.
 */
export const authApi = {
  /**
   * Authentification — retourne user + tokens.
   */
  async login(payload: LoginPayload): Promise<LoginData> {
    const { data } = await axiosInstance.post<ApiResponse<LoginData>>(
      '/auth/login',
      payload,
    )
    return data.data
  },

  /**
   * Déconnexion — invalide le refresh token côté serveur.
   */
  async logout(): Promise<void> {
    await axiosInstance.post('/auth/logout')
  },

  /**
   * Récupère le profil de l'utilisateur connecté.
   */
  async getMe(): Promise<AuthUser> {
    const { data } = await axiosInstance.get<ApiResponse<AuthUser>>('/auth/me')
    return data.data
  },

  /**
   * Changement de mot de passe (utilisateur connecté).
   */
  async changePassword(payload: ChangePasswordPayload): Promise<void> {
    await axiosInstance.post('/auth/change-password', payload)
  },

  /**
   * Demande de réinitialisation par email.
   */
  async requestPasswordReset(payload: ResetPasswordRequestPayload): Promise<void> {
    await axiosInstance.post('/auth/reset-password', payload)
  },

  /**
   * Confirmation de la réinitialisation avec le token reçu par email.
   */
  async confirmPasswordReset(payload: ResetPasswordPayload): Promise<void> {
    await axiosInstance.post('/auth/reset-password/confirm', payload)
  },
}
