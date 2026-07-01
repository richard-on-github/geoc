import { cn } from '@/shared/lib'

interface JsonDiffViewerProps {
  before: Record<string, unknown> | null
  after: Record<string, unknown> | null
}

type DiffStatus = 'added' | 'removed' | 'changed' | 'unchanged'

interface DiffRow {
  key: string
  status: DiffStatus
  beforeValue: unknown
  afterValue: unknown
}

function formatValue(value: unknown): string {
  if (value === null || value === undefined) return '—'
  if (typeof value === 'boolean') return value ? 'Oui' : 'Non'
  if (typeof value === 'object') return JSON.stringify(value)
  return String(value)
}

function buildDiffRows(
  before: Record<string, unknown> | null,
  after: Record<string, unknown> | null,
): DiffRow[] {
  const beforeObj = before ?? {}
  const afterObj = after ?? {}
  const allKeys = Array.from(new Set([...Object.keys(beforeObj), ...Object.keys(afterObj)])).sort()

  return allKeys.map((key) => {
    const hasBefore = key in beforeObj
    const hasAfter = key in afterObj
    const beforeValue = beforeObj[key]
    const afterValue = afterObj[key]

    let status: DiffStatus = 'unchanged'
    if (!hasBefore && hasAfter) status = 'added'
    else if (hasBefore && !hasAfter) status = 'removed'
    else if (JSON.stringify(beforeValue) !== JSON.stringify(afterValue)) status = 'changed'

    return { key, status, beforeValue, afterValue }
  })
}

const STATUS_STYLES: Record<DiffStatus, string> = {
  added: 'bg-[hsl(142,_64%,_96%)] border-l-2 border-l-[hsl(142,_64%,_38%)]',
  removed: 'bg-[hsl(0,_84%,_97%)] border-l-2 border-l-[hsl(var(--destructive))]',
  changed: 'bg-[hsl(38,_92%,_97%)] border-l-2 border-l-[hsl(38,_92%,_50%)]',
  unchanged: 'border-l-2 border-l-transparent',
}

const STATUS_LABELS: Record<DiffStatus, string> = {
  added: 'Ajouté',
  removed: 'Supprimé',
  changed: 'Modifié',
  unchanged: 'Inchangé',
}

export function JsonDiffViewer({ before, after }: JsonDiffViewerProps) {
  const rows = buildDiffRows(before, after)
  const changedRows = rows.filter((r) => r.status !== 'unchanged')

  if (before === null && after === null) {
    return (
      <p className="text-sm text-[hsl(var(--muted-foreground))] italic">
        Aucune donnée disponible pour cet événement.
      </p>
    )
  }

  if (changedRows.length === 0) {
    return (
      <p className="text-sm text-[hsl(var(--muted-foreground))] italic">
        Aucune modification de champ détectée.
      </p>
    )
  }

  return (
    <div className="overflow-hidden rounded-lg border border-[hsl(var(--border))]">
      <table className="w-full text-sm">
        <thead className="bg-[hsl(var(--muted))]">
          <tr>
            <th className="px-3 py-2 text-left text-xs font-medium text-[hsl(var(--muted-foreground))] uppercase tracking-wider w-1/5">
              Champ
            </th>
            <th className="px-3 py-2 text-left text-xs font-medium text-[hsl(var(--muted-foreground))] uppercase tracking-wider w-2/5">
              Avant
            </th>
            <th className="px-3 py-2 text-left text-xs font-medium text-[hsl(var(--muted-foreground))] uppercase tracking-wider w-2/5">
              Après
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-[hsl(var(--border))] bg-[hsl(var(--card))]">
          {changedRows.map((row) => (
            <tr key={row.key} className={cn(STATUS_STYLES[row.status])}>
              <td className="px-3 py-2.5 align-top">
                <p className="text-sm font-medium font-mono text-[hsl(var(--foreground))]">{row.key}</p>
                <span className="text-[10px] uppercase tracking-wide text-[hsl(var(--muted-foreground))]">
                  {STATUS_LABELS[row.status]}
                </span>
              </td>
              <td className="px-3 py-2.5 align-top text-sm text-[hsl(var(--muted-foreground))] font-mono break-all">
                {row.status === 'added' ? '—' : formatValue(row.beforeValue)}
              </td>
              <td className="px-3 py-2.5 align-top text-sm text-[hsl(var(--foreground))] font-mono break-all">
                {row.status === 'removed' ? '—' : formatValue(row.afterValue)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
