import { Pencil, Trash2, Users, Key } from 'lucide-react'
import { RoleSystemBadge } from './RoleSystemBadge'
import { EmptyState } from '@/shared/components/feedback/EmptyState'
import { Can } from '@/shared/components/navigation/Can'
import { useRoles } from '../hooks'
import { ShieldCheck } from 'lucide-react'
import type { Role } from '../types'

interface RolesGridProps {
  onEdit: (role: Role) => void
  onDelete: (role: Role) => void
  onViewDetail: (id: string) => void
}

export function RolesGrid({ onEdit, onDelete, onViewDetail }: RolesGridProps) {
  const { data: response, isLoading } = useRoles()

  // Extraction sécurisée du tableau de rôles
  const rolesList = response?.data?.items ?? response?.items ?? []

  /* ---- Skeleton ---- */
  if (isLoading) {
    return (
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className="space-y-3 rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-5"
          >
            <div className="h-5 w-32 animate-pulse rounded bg-[hsl(var(--muted))]" />
            <div className="h-3.5 w-full animate-pulse rounded bg-[hsl(var(--muted))]" />
            <div className="h-3.5 w-2/3 animate-pulse rounded bg-[hsl(var(--muted))]" />
            <div className="flex gap-3 pt-2">
              <div className="h-3 w-16 animate-pulse rounded bg-[hsl(var(--muted))]" />
              <div className="h-3 w-16 animate-pulse rounded bg-[hsl(var(--muted))]" />
            </div>
          </div>
        ))}
      </div>
    )
  }

  /* ---- Empty ---- */
  if (rolesList.length === 0) {
    return (
      <>
        <div className="rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--card))]">
          <EmptyState
            icon={ShieldCheck}
            title="Aucun rôle"
            description="Commencez par créer un rôle pour organiser les permissions."
          />
        </div>
      </>
    )
  }

  /* ---- Grid ---- */
  return (
    <>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {rolesList.map((role: any) => {
          // Calcul des compteurs
          const permCount = role.permissions?.length ?? role._count?.permissions ?? 0
          const userCount = role.users?.length ?? role._count?.users ?? 0

          return (
            <div
              key={role.id}
              onClick={() => {
                onViewDetail(role.id)
              }}
              className="group cursor-pointer rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-5 transition-shadow hover:shadow-sm"
            >
              {/* Header */}
              <div className="mb-2 flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <h3 className="truncate text-sm font-semibold text-[hsl(var(--foreground))]">
                    {role.nom}
                  </h3>
                  <RoleSystemBadge isSystem={role.isSystem} className="mt-1" />
                </div>

                {/* Actions — masquées pour les rôles système (suppression) */}
                <div className="flex shrink-0 gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                  {role.code !== 'SYSTEM' && (
                    <Can permission="role.update">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation()
                          onEdit(role)
                        }}
                        aria-label={`Modifier ${role.nom}`}
                        className="rounded-md p-1.5 text-[hsl(var(--muted-foreground))] transition-colors hover:bg-[hsl(var(--muted))] hover:text-[hsl(var(--foreground))]"
                      >
                        <Pencil size={14} aria-hidden="true" />
                      </button>
                    </Can>
                  )}

                  {!role.isSystem && (
                    <Can permission="role.delete">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation()
                          onDelete(role)
                        }}
                        aria-label={`Supprimer ${role.nom}`}
                        className="rounded-md p-1.5 text-[hsl(var(--muted-foreground))] transition-colors hover:bg-[hsl(var(--destructive))]/10 hover:text-[hsl(var(--destructive))]"
                      >
                        <Trash2 size={14} aria-hidden="true" />
                      </button>
                    </Can>
                  )}
                </div>
              </div>

              {/* Description */}
              <p className="line-clamp-2 min-h-[2rem] text-xs text-[hsl(var(--muted-foreground))]">
                {role.description ?? 'Aucune description.'}
              </p>

              {/* Stats */}
              <div className="mt-3 flex items-center gap-4 border-t border-[hsl(var(--border))] pt-3">
                <span className="flex items-center gap-1.5 text-xs text-[hsl(var(--muted-foreground))]">
                  <Key size={12} aria-hidden="true" />
                  {permCount} permission{permCount > 1 ? 's' : ''}
                </span>
                <span className="flex items-center gap-1.5 text-xs text-[hsl(var(--muted-foreground))]">
                  <Users size={12} aria-hidden="true" />
                  {userCount} utilisateur{userCount > 1 ? 's' : ''}
                </span>
              </div>
            </div>
          )
        })}
      </div>
    </>
  )
}
