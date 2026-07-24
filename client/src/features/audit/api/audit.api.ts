import { axiosInstance } from '@/shared/api'
import type { ApiPaginatedResponse, ListParams } from '@/shared/types'
import type { AuditLog, AuditLogFilters, AuditAction } from '../types'

export const auditApi = {
  async getAuditLogs(
    params: ListParams & AuditLogFilters,
  ): Promise<ApiPaginatedResponse<AuditLog>['data']> {
    const response = await axiosInstance.get<{
      success: boolean
      message: string
      data: {
        logs: Array<{
          id: string
          action: string
          entity: string
          entityId: string
          userId: string
          ip: string
          before: Record<string, unknown> | null
          after: Record<string, unknown> | null
          message?: string
          createdAt: string
          user?: {
            id: string
            email: string
            nom: string
            prenom: string
          }
        }>
        pagination: {
          total: number
          page: number
          limit: number
          totalPages: number
          hasNextPage: boolean
          hasPrevPage: boolean
        }
      }
    }>('/audit', { params })

    const { logs, pagination } = response.data.data

    const mappedLogs: AuditLog[] = logs.map((log) => ({
      id: log.id,
      action: log.action,
      entity: log.entity,
      entityId: log.entityId,
      userId: log.userId,
      userName: log.user ? `${log.user.prenom} ${log.user.nom}` : 'Utilisateur inconnu',
      userEmail: log.user?.email ?? 'Email inconnu',
      ipAddress: log.ip,
      before: log.before,
      after: log.after,
      createdAt: log.createdAt,
    }))

    // 3. Retourner la structure PaginatedData
    return {
      items: mappedLogs,
      total: pagination.total,
      page: pagination.page,
      limit: pagination.limit,
      totalPages: pagination.totalPages,
    }
  },
}

function mapAction(backendAction: string): string {
  return backendAction
}
