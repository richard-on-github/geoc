export type AuditAction = string

export interface AuditLog {
  id: string
  action: string // au lieu de AuditAction
  entity: string
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
