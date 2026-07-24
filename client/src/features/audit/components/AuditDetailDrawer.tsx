import { X } from 'lucide-react'
import { AuditActionBadge } from './AuditActionBadge'
import { AUDIT_ENTITY_LABELS } from '../constants'
import { formatDateTime } from '@/shared/utils'
import type { AuditLog } from '../types'

interface AuditDetailDrawerProps {
  log: AuditLog
  onClose: () => void
}

function formatValue(value: unknown): string {
  if (value === null || value === undefined) return '—'
  if (typeof value === 'boolean') return value ? '✅ Oui' : '❌ Non'
  if (typeof value === 'object') return JSON.stringify(value, null, 2)
  return String(value)
}

function renderDiff(before: Record<string, unknown> | null, after: Record<string, unknown> | null) {
  if (!before && !after) {
    return (
      <p className="text-sm text-[hsl(var(--muted-foreground))] italic">
        Aucune modification enregistrée.
      </p>
    )
  }

  const allKeys = new Set([...Object.keys(before || {}), ...Object.keys(after || {})])

  // Filtrer les champs qui ont changé ou qui sont présents
  const entries = Array.from(allKeys)
    .filter((key) => {
      const beforeVal = before?.[key]
      const afterVal = after?.[key]
      return JSON.stringify(beforeVal) !== JSON.stringify(afterVal)
    })
    .sort()

  if (entries.length === 0) {
    return (
      <p className="text-sm text-[hsl(var(--muted-foreground))] italic">
        Aucune modification détectée.
      </p>
    )
  }

  return (
    <div className="overflow-hidden rounded-lg border border-[hsl(var(--border))]">
      <table className="w-full text-sm">
        <thead className="bg-[hsl(var(--muted))]">
          <tr>
            <th className="w-1/4 px-3 py-2 text-left text-xs font-medium tracking-wider text-[hsl(var(--muted-foreground))] uppercase">
              Champ
            </th>
            <th className="w-2/5 px-3 py-2 text-left text-xs font-medium tracking-wider text-[hsl(var(--muted-foreground))] uppercase">
              Avant
            </th>
            <th className="w-2/5 px-3 py-2 text-left text-xs font-medium tracking-wider text-[hsl(var(--muted-foreground))] uppercase">
              Après
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-[hsl(var(--border))] bg-[hsl(var(--card))]">
          {entries.map((key) => {
            const beforeVal = before?.[key]
            const afterVal = after?.[key]
            const isAdded = before === null || !(key in (before || {}))
            const isRemoved = after === null || !(key in (after || {}))
            const rowClass = isAdded
              ? 'bg-[hsl(142,_64%,_96%)] border-l-2 border-l-[hsl(142,_64%,_38%)]'
              : isRemoved
                ? 'bg-[hsl(0,_84%,_97%)] border-l-2 border-l-[hsl(var(--destructive))]'
                : 'bg-[hsl(38,_92%,_97%)] border-l-2 border-l-[hsl(38,_92%,_50%)]'
            return (
              <tr key={key} className={rowClass}>
                <td className="px-3 py-2.5 align-top font-mono text-sm text-[hsl(var(--foreground))]">
                  {key}
                </td>
                <td className="px-3 py-2.5 align-top font-mono text-sm break-all whitespace-pre-wrap text-[hsl(var(--muted-foreground))]">
                  {isAdded ? '—' : formatValue(beforeVal)}
                </td>
                <td className="px-3 py-2.5 align-top font-mono text-sm break-all whitespace-pre-wrap text-[hsl(var(--foreground))]">
                  {isRemoved ? '—' : formatValue(afterVal)}
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}

export function AuditDetailDrawer({ log, onClose }: AuditDetailDrawerProps) {
  const hasDiff = log.before !== null || log.after !== null

  return (
    <div role="dialog" aria-modal="true" className="fixed inset-0 z-50 flex justify-end">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative z-10 flex h-full w-full max-w-xl flex-col bg-[hsl(var(--card))] shadow-lg">
        <div className="flex shrink-0 items-center justify-between border-b border-[hsl(var(--border))] px-6 py-4">
          <h2 className="text-base font-semibold">Détail de l'événement</h2>
          <button
            onClick={onClose}
            className="rounded-md p-1.5 text-[hsl(var(--muted-foreground))] hover:bg-[hsl(var(--muted))]"
          >
            <X size={16} />
          </button>
        </div>

        <div className="flex-1 space-y-6 overflow-y-auto p-6">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="mb-1 text-xs font-medium tracking-wider text-[hsl(var(--muted-foreground))] uppercase">
                Action
              </p>
              <AuditActionBadge action={log.action} />
            </div>
            <div>
              <p className="mb-1 text-xs font-medium tracking-wider text-[hsl(var(--muted-foreground))] uppercase">
                Entité
              </p>
              <p className="text-sm text-[hsl(var(--foreground))]">
                {AUDIT_ENTITY_LABELS[log.entity] ?? log.entity}
              </p>
            </div>
            <div>
              <p className="mb-1 text-xs font-medium tracking-wider text-[hsl(var(--muted-foreground))] uppercase">
                Utilisateur
              </p>
              <p className="text-sm text-[hsl(var(--foreground))]">{log.userName}</p>
              <p className="text-xs text-[hsl(var(--muted-foreground))]">{log.userEmail}</p>
            </div>
            <div>
              <p className="mb-1 text-xs font-medium tracking-wider text-[hsl(var(--muted-foreground))] uppercase">
                Adresse IP
              </p>
              <p className="font-mono text-sm text-[hsl(var(--foreground))]">{log.ipAddress}</p>
            </div>
            <div>
              <p className="mb-1 text-xs font-medium tracking-wider text-[hsl(var(--muted-foreground))] uppercase">
                Date
              </p>
              <p className="text-sm text-[hsl(var(--foreground))]">
                {formatDateTime(log.createdAt)}
              </p>
            </div>
            <div>
              <p className="mb-1 text-xs font-medium tracking-wider text-[hsl(var(--muted-foreground))] uppercase">
                ID entité
              </p>
              <p
                className="truncate font-mono text-sm text-[hsl(var(--foreground))]"
                title={log.entityId}
              >
                {log.entityId}
              </p>
            </div>
          </div>

          <div>
            <p className="mb-2 text-sm font-semibold text-[hsl(var(--foreground))]">
              Détails de la modification
            </p>
            {hasDiff ? (
              renderDiff(log.before, log.after)
            ) : (
              <p className="text-sm text-[hsl(var(--muted-foreground))] italic">
                {log.message || 'Aucune donnée supplémentaire.'}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
