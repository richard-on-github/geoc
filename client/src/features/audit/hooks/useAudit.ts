import { useQuery } from '@tanstack/react-query'
import { auditApi } from '../api'
import { AUDIT_QUERY_KEYS } from '../constants'
import type { ListParams } from '@/shared/types'
import type { AuditLogFilters } from '../types'

export function useAuditLogs(params: ListParams & AuditLogFilters) {
  return useQuery({
    queryKey: AUDIT_QUERY_KEYS.list(params),
    queryFn: () => auditApi.getAuditLogs(params),
    placeholderData: (prev) => prev,
  })
}
