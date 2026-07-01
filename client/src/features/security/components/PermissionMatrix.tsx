// features/security/components/PermissionMatrix.tsx
import { useMemo } from 'react'
import { cn } from '@/shared/lib'
import { RESOURCE_LABELS } from '../constants'
import type { Permission, PermissionGroup } from '../types'

interface PermissionMatrixProps {
  permissions: Permission[]
  selected: string[] // IDs sélectionnés
  onChange: (ids: string[]) => void
  disabled?: boolean
  readonly?: boolean
}

function groupPermissions(permissions: Permission[]): PermissionGroup[] {
  const map = new Map<string, PermissionGroup>()

  for (const perm of permissions) {
    const existing = map.get(perm.resource)
    if (existing !== undefined) {
      existing.permissions.push(perm)
    } else {
      map.set(perm.resource, {
        resource: perm.resource,
        label: RESOURCE_LABELS[perm.resource] ?? perm.resource,
        permissions: [perm],
      })
    }
  }

  return Array.from(map.values()).sort((a, b) => a.label.localeCompare(b.label, 'fr'))
}

export function PermissionMatrix({
  permissions,
  selected,
  onChange,
  disabled = false,
  readonly = false,
}: PermissionMatrixProps) {
  const groups = useMemo(() => groupPermissions(permissions), [permissions])
  const selectedSet = useMemo(() => new Set(selected), [selected])

  function togglePermission(id: string) {
    if (readonly || disabled) return
    if (selectedSet.has(id)) {
      onChange(selected.filter((s) => s !== id))
    } else {
      onChange([...selected, id])
    }
  }

  function toggleGroup(group: PermissionGroup) {
    if (readonly || disabled) return
    const groupIds = group.permissions.map((p) => p.id)
    const allSelected = groupIds.every((id) => selectedSet.has(id))

    if (allSelected) {
      onChange(selected.filter((id) => !groupIds.includes(id)))
    } else {
      const toAdd = groupIds.filter((id) => !selectedSet.has(id))
      onChange([...selected, ...toAdd])
    }
  }

  if (groups.length === 0) {
    return (
      <p className="py-4 text-sm text-[hsl(var(--muted-foreground))]">
        Aucune permission disponible.
      </p>
    )
  }

  return (
    <div className="space-y-4" role="group" aria-label="Matrice des permissions">
      {groups.map((group) => {
        const groupIds = group.permissions.map((p) => p.id)
        const selectedCount = groupIds.filter((id) => selectedSet.has(id)).length
        const isAllSelected = selectedCount === groupIds.length
        const isPartial = selectedCount > 0 && !isAllSelected

        return (
          <div
            key={group.resource}
            className="overflow-hidden rounded-lg border border-[hsl(var(--border))]"
          >
            {/* En-tête du groupe */}
            <div className="flex items-center gap-3 bg-[hsl(var(--muted))] px-4 py-2.5">
              {!readonly && (
                <input
                  type="checkbox"
                  id={`group-${group.resource}`}
                  checked={isAllSelected}
                  ref={(el) => {
                    if (el !== null) el.indeterminate = isPartial
                  }}
                  onChange={() => {
                    toggleGroup(group)
                  }}
                  disabled={disabled}
                  aria-label={`Tout sélectionner — ${group.label}`}
                  className="h-4 w-4 rounded border-[hsl(var(--border))] accent-[hsl(var(--primary))]"
                />
              )}
              <label
                htmlFor={`group-${group.resource}`}
                className={cn(
                  'text-sm font-semibold text-[hsl(var(--foreground))]',
                  !readonly && 'cursor-pointer',
                )}
              >
                {group.label}
              </label>
              <span className="ml-auto text-xs text-[hsl(var(--muted-foreground))]">
                {selectedCount}/{groupIds.length}
              </span>
            </div>

            {/* Permissions du groupe */}
            <div className="grid grid-cols-1 divide-y divide-[hsl(var(--border))] bg-[hsl(var(--card))] sm:grid-cols-2 sm:divide-y-0">
              {group.permissions.map((perm) => {
                const isChecked = selectedSet.has(perm.id)
                return (
                  <label
                    key={perm.id}
                    className={cn(
                      'flex items-start gap-3 px-4 py-3',
                      !readonly &&
                        !disabled &&
                        'cursor-pointer transition-colors hover:bg-[hsl(var(--muted))]/50',
                      disabled && 'opacity-60',
                    )}
                  >
                    {!readonly && (
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => {
                          togglePermission(perm.id)
                        }}
                        disabled={disabled}
                        aria-label={perm.nom} // ← CORRECTION : nom au lieu de name
                        className="mt-0.5 h-4 w-4 shrink-0 rounded border-[hsl(var(--border))] accent-[hsl(var(--primary))]"
                      />
                    )}
                    {readonly && (
                      <span
                        className={cn(
                          'mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full',
                          isChecked
                            ? 'bg-[hsl(var(--primary))] text-white'
                            : 'border border-[hsl(var(--border))]',
                        )}
                        aria-hidden="true"
                      >
                        {isChecked && (
                          <svg
                            viewBox="0 0 10 8"
                            className="h-2.5 w-2.5"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                          >
                            <path
                              d="M1 4L3.5 6.5L9 1"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                          </svg>
                        )}
                      </span>
                    )}
                    <div className="min-w-0">
                      <p className="text-sm leading-tight font-medium text-[hsl(var(--foreground))]">
                        {perm.nom} {/* ← CORRECTION : nom au lieu de name */}
                      </p>
                      {/* <p className="mt-0.5 font-mono text-xs text-[hsl(var(--muted-foreground))]">
                        {perm.code}
                      </p> */}
                      {perm.description !== null && (
                        <p className="mt-0.5 text-xs text-[hsl(var(--muted-foreground))]">
                          {perm.description}
                        </p>
                      )}
                    </div>
                  </label>
                )
              })}
            </div>
          </div>
        )
      })}
    </div>
  )
}
