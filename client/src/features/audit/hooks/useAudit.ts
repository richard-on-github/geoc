import { useQuery } from '@tanstack/react-query'
import { auditApi } from '../api'
import { AUDIT_QUERY_KEYS } from '../constants'
import type { ListParams } from '@/shared/types'
import type { AuditLogFilters } from '../types'

export type AuditListParams = ListParams &
  AuditLogFilters &
  Record<string, string | number | boolean | null | undefined>

export function useAuditLogs(params: AuditListParams) {
  return useQuery({
    queryKey: AUDIT_QUERY_KEYS.list(params),
    queryFn: () => auditApi.getAuditLogs(params),
    placeholderData: (prev) => prev,
  })
}
