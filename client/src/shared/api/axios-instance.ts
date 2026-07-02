import axios, { type AxiosError, type AxiosResponse, type InternalAxiosRequestConfig } from 'axios'
import { env } from '@/app/config'
import { ApiError } from '@/shared/types'
import { AUTH_STORAGE_KEYS } from '@/features/auth/constants'

export const axiosInstance = axios.create({
  baseURL: env.apiBaseUrl,
  timeout: env.apiTimeout,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
  withCredentials: false,
})

interface PendingRequest {
  resolve: (token: string) => void
  reject: (error: unknown) => void
}

let isRefreshing = false
let pendingQueue: PendingRequest[] = []

function processPendingQueue(error: unknown, token: string | null): void {
  pendingQueue.forEach(({ resolve, reject }) => {
    if (error !== null) {
      reject(error)
    } else if (token !== null) {
      resolve(token)
    }
  })
  pendingQueue = []
}

export const tokenStorage = {
  getAccessToken(): string | null {
    return localStorage.getItem(AUTH_STORAGE_KEYS.ACCESS_TOKEN)
  },
  setAccessToken(token: string): void {
    localStorage.setItem(AUTH_STORAGE_KEYS.ACCESS_TOKEN, token)
  },
  getRefreshToken(): string | null {
    return localStorage.getItem(AUTH_STORAGE_KEYS.REFRESH_TOKEN)
  },
  setTokens(accessToken: string, refreshToken: string): void {
    localStorage.setItem(AUTH_STORAGE_KEYS.ACCESS_TOKEN, accessToken)
    localStorage.setItem(AUTH_STORAGE_KEYS.REFRESH_TOKEN, refreshToken)
  },
  clearAll(): void {
    Object.values(AUTH_STORAGE_KEYS).forEach((key) => {
      localStorage.removeItem(key)
    })
  },
}

axiosInstance.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = tokenStorage.getAccessToken()
    if (token !== null && token !== '') {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error: unknown) => Promise.reject(error),
)

axiosInstance.interceptors.response.use(
  (response: AxiosResponse) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & {
      _retry?: boolean
    }

    const status = error.response?.status

    if (originalRequest.url?.includes('/auth/login') === true) {
      return Promise.reject(buildApiError(error))
    }

    if (status !== 401 || originalRequest._retry === true) {
      return Promise.reject(buildApiError(error))
    }

    if (originalRequest.url?.includes('/auth/refresh-token') === true) {
      tokenStorage.clearAll()
      window.location.href = '/login'
      return Promise.reject(buildApiError(error))
    }

    if (isRefreshing) {
      return new Promise<AxiosResponse>((resolve, reject) => {
        pendingQueue.push({
          resolve: (token: string) => {
            originalRequest.headers.Authorization = `Bearer ${token}`
            resolve(axiosInstance(originalRequest))
          },
          reject,
        })
      })
    }

    /* Déclenchement du refresh */
    originalRequest._retry = true
    isRefreshing = true

    const refreshToken = tokenStorage.getRefreshToken()

    if (refreshToken === null || refreshToken === '') {
      isRefreshing = false
      tokenStorage.clearAll()
      window.location.href = '/login'
      return Promise.reject(buildApiError(error))
    }

    try {
      const response = await axios.post<{
        success: boolean
        data: { accessToken: string; refreshToken: string; expiresIn: number }
      }>(
        `${env.apiBaseUrl}/auth/refresh-token`,
        { refreshToken },
        { headers: { 'Content-Type': 'application/json' } },
      )
      const { accessToken, refreshToken: newRefreshToken } = response.data.data
      tokenStorage.setTokens(accessToken, newRefreshToken)

      /* Notifier le store Zustand du nouveau token */
      window.dispatchEvent(new CustomEvent('geoc:token-refreshed', { detail: { accessToken } }))

      processPendingQueue(null, accessToken)

      originalRequest.headers.Authorization = `Bearer ${accessToken}`
      return axiosInstance(originalRequest)
    } catch (refreshError) {
      processPendingQueue(refreshError, null)
      tokenStorage.clearAll()
      window.location.href = '/login'
      return Promise.reject(refreshError)
    } finally {
      isRefreshing = false
    }
  },
)

/* ============================================================
   Conversion AxiosError → ApiError
   ============================================================ */

function buildApiError(error: AxiosError): ApiError {
  if (error.response !== undefined) {
    const data = error.response.data as {
      message?: string
      errors?: Record<string, string[]>
    }
    return new ApiError(
      error.response.status,
      data.message ?? 'Une erreur est survenue',
      data.errors,
    )
  }

  if (error.request !== undefined) {
    return new ApiError(0, 'Impossible de contacter le serveur. Vérifiez votre connexion.')
  }

  return new ApiError(0, error.message)
}
