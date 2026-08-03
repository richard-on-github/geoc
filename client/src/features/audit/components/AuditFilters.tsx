import { AUDIT_ACTION_OPTIONS, AUDIT_ENTITY_OPTIONS } from '../constants'
import type { AuditLogFilters } from '../types'

interface AuditFiltersProps {
  filters: AuditLogFilters
  onChange: (filters: AuditLogFilters) => void
}

const selectClass =
  'rounded-[var(--radius)] border border-[hsl(var(--input))] bg-[hsl(var(--card))] px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[hsl(var(--ring))] focus:ring-offset-1'

function hasFilterValue(value: string | null | undefined): value is string {
  return value !== null && value !== undefined && value !== ''
}

export function AuditFilters({ filters, onChange }: AuditFiltersProps) {
  const hasActiveFilters =
    hasFilterValue(filters.entity) ||
    hasFilterValue(filters.action) ||
    hasFilterValue(filters.startDate) ||
    hasFilterValue(filters.endDate)

  return (
    <div className="mb-4 flex flex-wrap items-center gap-3">
      <select
        value={filters.entity ?? ''}
        onChange={(e) => {
          onChange({
            ...filters,
            ...(e.target.value === '' ? {} : { entity: e.target.value }),
          })
        }}
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
        onChange={(e) => {
          onChange({
            ...filters,
            ...(e.target.value === '' ? {} : { action: e.target.value }),
          })
        }}
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
        onChange={(e) => {
          onChange({
            ...filters,
            ...(e.target.value === '' ? {} : { startDate: e.target.value }),
          })
        }}
        className={selectClass}
        aria-label="Date de début"
      />

      <input
        type="date"
        value={filters.endDate ?? ''}
        onChange={(e) => {
          onChange({
            ...filters,
            ...(e.target.value === '' ? {} : { endDate: e.target.value }),
          })
        }}
        className={selectClass}
        aria-label="Date de fin"
      />

      {hasActiveFilters && (
        <button
          type="button"
          onClick={() => {
            onChange({})
          }}
          className="text-sm text-[hsl(var(--muted-foreground))] underline hover:text-[hsl(var(--foreground))]"
        >
          Réinitialiser
        </button>
      )}
    </div>
  )
}
