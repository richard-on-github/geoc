import { X } from 'lucide-react'
import { AuditActionBadge } from './AuditActionBadge'
import { JsonDiffViewer } from './JsonDiffViewer'
import { AUDIT_ENTITY_LABELS } from '../constants'
import { formatDateTime } from '@/shared/utils'
import type { AuditLog } from '../types'

interface AuditDetailDrawerProps {
  log: AuditLog
  onClose: () => void
}

export function AuditDetailDrawer({ log, onClose }: AuditDetailDrawerProps) {
  return (
    <div role="dialog" aria-modal="true" aria-labelledby="audit-detail-title" className="fixed inset-0 z-50 flex justify-end">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative z-10 flex h-full w-full max-w-xl flex-col bg-[hsl(var(--card))] shadow-lg">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[hsl(var(--border))] px-6 py-4 shrink-0">
          <h2 id="audit-detail-title" className="text-base font-semibold">Détail de l'événement</h2>
          <button type="button" onClick={onClose} aria-label="Fermer"
            className="rounded-md p-1.5 hover:bg-[hsl(var(--muted))] transition-colors text-[hsl(var(--muted-foreground))]">
            <X size={16} aria-hidden="true" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Métadonnées */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-xs font-medium text-[hsl(var(--muted-foreground))] uppercase tracking-wider mb-1">Action</p>
              <AuditActionBadge action={log.action} />
            </div>
            <div>
              <p className="text-xs font-medium text-[hsl(var(--muted-foreground))] uppercase tracking-wider mb-1">Entité</p>
              <p className="text-sm text-[hsl(var(--foreground))]">
                {AUDIT_ENTITY_LABELS[log.entity] ?? log.entity}
              </p>
            </div>
            <div>
              <p className="text-xs font-medium text-[hsl(var(--muted-foreground))] uppercase tracking-wider mb-1">Utilisateur</p>
              <p className="text-sm text-[hsl(var(--foreground))]">{log.userName}</p>
              <p className="text-xs text-[hsl(var(--muted-foreground))]">{log.userEmail}</p>
            </div>
            <div>
              <p className="text-xs font-medium text-[hsl(var(--muted-foreground))] uppercase tracking-wider mb-1">Adresse IP</p>
              <p className="text-sm text-[hsl(var(--foreground))] font-mono">{log.ipAddress}</p>
            </div>
            <div>
              <p className="text-xs font-medium text-[hsl(var(--muted-foreground))] uppercase tracking-wider mb-1">Date</p>
              <p className="text-sm text-[hsl(var(--foreground))]">{formatDateTime(log.createdAt)}</p>
            </div>
            <div>
              <p className="text-xs font-medium text-[hsl(var(--muted-foreground))] uppercase tracking-wider mb-1">ID entité</p>
              <p className="text-sm text-[hsl(var(--foreground))] font-mono truncate">{log.entityId}</p>
            </div>
          </div>

          {/* Diff */}
          <div>
            <p className="text-sm font-semibold text-[hsl(var(--foreground))] mb-2">Modifications</p>
            <JsonDiffViewer before={log.before} after={log.after} />
          </div>
        </div>
      </div>
    </div>
  )
}
