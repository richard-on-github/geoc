import { useState, useMemo } from 'react'
import { ClipboardList } from 'lucide-react'
import { AuditActionBadge } from './AuditActionBadge'
import { AuditDetailDrawer } from './AuditDetailDrawer'
import { useAuditLogs } from '../hooks'
import { AUDIT_ENTITY_LABELS } from '../constants'
import { EmptyState } from '@/shared/components/feedback/EmptyState'
import { formatDateTime, getInitials } from '@/shared/utils'
import { cn } from '@/shared/lib'
import type { AuditLogFilters } from '../types'

interface AuditTableProps {
  filters: AuditLogFilters
}

const PAGE_SIZES = [10, 20, 50]

export function AuditTable({ filters }: AuditTableProps) {
  const [page, setPage] = useState(1)
  const [limit, setLimit] = useState(10)
  const [selectedLogId, setSelectedLogId] = useState<string | null>(null)

  const params = useMemo(() => ({ page, limit, ...filters }), [page, limit, filters])
  const { data, isLoading } = useAuditLogs(params)

  const selectedLog = data?.items?.find((log) => log.id === selectedLogId) ?? null

  /* ---- Skeleton ---- */
  if (isLoading) {
    return (
      <div className="overflow-hidden rounded-lg border border-[hsl(var(--border))]">
        <div className="divide-y divide-[hsl(var(--border))]">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="flex items-center gap-4 px-4 py-3">
              <div className="h-8 w-8 shrink-0 animate-pulse rounded-full bg-[hsl(var(--muted))]" />
              <div className="flex-1 space-y-1.5">
                <div className="h-3.5 w-48 animate-pulse rounded bg-[hsl(var(--muted))]" />
                <div className="h-3 w-32 animate-pulse rounded bg-[hsl(var(--muted))]" />
              </div>
              <div className="h-6 w-20 animate-pulse rounded-full bg-[hsl(var(--muted))]" />
            </div>
          ))}
        </div>
      </div>
    )
  }

  /* ---- Empty ---- */
  if (data?.items.length === 0) {
    return (
      <div className="rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--card))]">
        <EmptyState
          icon={ClipboardList}
          title="Aucun événement"
          description="Aucun événement d'audit ne correspond à ces critères."
        />
      </div>
    )
  }

  const total = data?.total ?? 0
  const totalPages = data?.totalPages ?? 1

  return (
    <div className="space-y-3">
      <div className="overflow-hidden rounded-lg border border-[hsl(var(--border))]">
        <table className="w-full text-sm" aria-label="Journal d'audit">
          <thead className="bg-[hsl(var(--muted))]">
            <tr>
              {['Événement', 'Entité', 'Action', 'Date', 'IP'].map((h) => (
                <th
                  key={h}
                  className="px-4 py-3 text-left text-xs font-medium tracking-wider text-[hsl(var(--muted-foreground))] uppercase"
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-[hsl(var(--border))] bg-[hsl(var(--card))]">
            {data?.items.map((log) => (
              <tr
                key={log.id}
                onClick={() => { setSelectedLogId(log.id); }}
                className="cursor-pointer transition-colors hover:bg-[hsl(var(--muted))]/50"
              >
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[hsl(var(--primary))] text-xs font-semibold text-white">
                      {getInitials(log.userName)}
                    </div>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-[hsl(var(--foreground))]">
                        {log.userName}
                      </p>
                      <p className="truncate text-xs text-[hsl(var(--muted-foreground))]">
                        {log.userEmail}
                      </p>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3 text-sm text-[hsl(var(--muted-foreground))]">
                  {AUDIT_ENTITY_LABELS[log.entity] ?? log.entity}
                </td>
                <td className="px-4 py-3">
                  <AuditActionBadge action={log.action} />
                </td>
                <td className="px-4 py-3 text-sm text-[hsl(var(--muted-foreground))]">
                  {formatDateTime(log.createdAt)}
                </td>
                <td className="px-4 py-3 font-mono text-sm text-[hsl(var(--muted-foreground))]">
                  {log.ipAddress}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {total > 0 && (
        <div className="flex items-center justify-between text-sm">
          <p className="text-[hsl(var(--muted-foreground))]">
            {total} événement{total > 1 ? 's' : ''}
          </p>
          <div className="flex items-center gap-3">
            {/* Boutons de taille de page */}
            <div className="flex items-center gap-1">
              {PAGE_SIZES.map((size) => (
                <button
                  key={size}
                  type="button"
                  onClick={() => {
                    setLimit(size)
                    setPage(1) // réinitialiser la page lors du changement de taille
                  }}
                  className={cn(
                    'rounded-[var(--radius-sm)] border border-[hsl(var(--border))] px-2 py-1 text-xs transition-colors hover:bg-[hsl(var(--muted))]',
                    limit === size &&
                      'bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))]',
                  )}
                >
                  {size}
                </button>
              ))}
            </div>

            {/* Boutons de navigation */}
            <div className="flex items-center gap-1">
              <button
                type="button"
                disabled={page <= 1}
                onClick={() => { setPage((p) => p - 1); }}
                className="rounded-[var(--radius-sm)] border border-[hsl(var(--border))] px-2 py-1 text-xs transition-colors hover:bg-[hsl(var(--muted))] disabled:cursor-not-allowed disabled:opacity-40"
              >
                Précédent
              </button>
              <span className="px-2 text-[hsl(var(--muted-foreground))]">
                Page {page} / {totalPages}
              </span>
              <button
                type="button"
                disabled={page >= totalPages}
                onClick={() => { setPage((p) => p + 1); }}
                className="rounded-[var(--radius-sm)] border border-[hsl(var(--border))] px-2 py-1 text-xs transition-colors hover:bg-[hsl(var(--muted))] disabled:cursor-not-allowed disabled:opacity-40"
              >
                Suivant
              </button>
            </div>
          </div>
        </div>
      )}

      {selectedLog !== null && (
        <AuditDetailDrawer log={selectedLog} onClose={() => { setSelectedLogId(null); }} />
      )}
    </div>
  )
}
