export type AuditAction =
  'create' | 'update' | 'delete' | 'activate' | 'deactivate' | 'login' | 'logout'

export interface AuditLog {
  id: string
  action: AuditAction
  entity: string // ex: "User", "Role"
  entityId: string
  userId: string
  userName: string
  userEmail: string
  ipAddress: string
  before: Record<string, unknown> | null
  after: Record<string, unknown> | null
  createdAt: string
}

export interface AuditLogFilters {
  action?: string
  userId?: string
  entity?: string
  startDate?: string
  endDate?: string
}
