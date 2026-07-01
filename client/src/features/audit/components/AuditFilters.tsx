import { AUDIT_ACTION_OPTIONS, AUDIT_ENTITY_OPTIONS } from '../constants'
import type { AuditLogFilters } from '../types'

interface AuditFiltersProps {
  filters: AuditLogFilters
  onChange: (filters: AuditLogFilters) => void
}

const selectClass =
  'rounded-[var(--radius)] border border-[hsl(var(--input))] bg-[hsl(var(--card))] px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[hsl(var(--ring))] focus:ring-offset-1'

export function AuditFilters({ filters, onChange }: AuditFiltersProps) {
  return (
    <div className="mb-4 flex flex-wrap items-center gap-3">
      <select
        value={filters.entity ?? ''}
        onChange={(e) => { onChange({ ...filters, entity: e.target.value || undefined }); }}
        className={selectClass}
      >
        <option value="">Toutes les entités</option>
        {AUDIT_ENTITY_OPTIONS.map(({ value, label }) => (
          <option key={value} value={value}>
            {label}
          </option>
        ))}
      </select>

      <select
        value={filters.action ?? ''}
        onChange={(e) => { onChange({ ...filters, action: e.target.value || undefined }); }}
        className={selectClass}
      >
        <option value="">Toutes les actions</option>
        {AUDIT_ACTION_OPTIONS.map(({ value, label }) => (
          <option key={value} value={value}>
            {label}
          </option>
        ))}
      </select>

      <input
        type="date"
        value={filters.startDate ?? ''}
        onChange={(e) => { onChange({ ...filters, startDate: e.target.value || undefined }); }}
        className={selectClass}
        aria-label="Date de début"
      />
      <input
        type="date"
        value={filters.endDate ?? ''}
        onChange={(e) => { onChange({ ...filters, endDate: e.target.value || undefined }); }}
        className={selectClass}
        aria-label="Date de fin"
      />

      {(filters.entity || filters.action || filters.startDate || filters.endDate) && (
        <button
          type="button"
          onClick={() => { onChange({}); }}
          className="text-sm text-[hsl(var(--muted-foreground))] underline hover:text-[hsl(var(--foreground))]"
        >
          Réinitialiser
        </button>
      )}
    </div>
  )
}
