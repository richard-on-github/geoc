import { useParams, useNavigate } from 'react-router'
import { ArrowLeft, Users, Key, Building2, Globe } from 'lucide-react'
import { useRole } from '../hooks'
import { PageHeader } from '@/shared/components/layout/PageHeader'
import { ErrorState } from '@/shared/components/feedback/ErrorState'
import { formatDateTime } from '@/shared/utils'
import { RoleSystemBadge } from '../components/RoleSystemBadge'

export function RoleDetailPage() {
  const { id = '' } = useParams()
  const navigate = useNavigate()
  const { data: role, isLoading, isError, refetch } = useRole(id)

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-48 animate-pulse rounded bg-[hsl(var(--muted))]" />
        <div className="space-y-4 rounded-lg border border-[hsl(var(--border))] p-6">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-5 w-full animate-pulse rounded bg-[hsl(var(--muted))]" />
          ))}
        </div>
      </div>
    )
  }

  if (isError || !role) {
    return <ErrorState title="Rôle introuvable" onRetry={() => void refetch()} />
  }

  return (
    <div>
      <button
        type="button"
        onClick={() => navigate('/security/roles')}
        className="mb-4 flex items-center gap-1.5 text-sm text-[hsl(var(--muted-foreground))] transition-colors hover:text-[hsl(var(--foreground))]"
      >
        <ArrowLeft size={15} aria-hidden="true" />
        Retour à la liste
      </button>

      <PageHeader
        title={role.nom}
        description={role.code}
        actions={<RoleSystemBadge isSystem={role.isSystem} />}
      />

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Informations générales */}
        <div className="rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-6 lg:col-span-2">
          <dl className="grid gap-4 text-sm sm:grid-cols-2">
            {[
              { label: 'Nom', value: role.nom },
              { label: 'Code', value: role.code },
              { label: 'Description', value: role.description || 'Aucune' },
              { label: 'Scope', value: role.dataScope === 'GLOBAL' ? '🌐 Global' : '🏢 Agence' },
              { label: 'Niveau', value: role.niveau },
              { label: 'Statut', value: role.actif ? 'Actif' : 'Inactif' },
              { label: 'Créé le', value: formatDateTime(role.createdAt) },
              { label: 'Modifié le', value: formatDateTime(role.updatedAt) },
            ].map(({ label, value }) => (
              <div key={label}>
                <dt className="mb-0.5 text-xs font-medium tracking-wider text-[hsl(var(--muted-foreground))] uppercase">
                  {label}
                </dt>
                <dd className="text-[hsl(var(--foreground))]">{value}</dd>
              </div>
            ))}
          </dl>
        </div>

        {/* Statistiques */}
        <div className="space-y-4">
          <div className="rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-6">
            <div className="flex items-center gap-3">
              <Key size={20} className="text-[hsl(var(--muted-foreground))]" />
              <div>
                <p className="text-2xl font-bold">{role.permissions.length}</p>
                <p className="text-xs text-[hsl(var(--muted-foreground))]">Permissions</p>
              </div>
            </div>
          </div>
          <div className="rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-6">
            <div className="flex items-center gap-3">
              <Users size={20} className="text-[hsl(var(--muted-foreground))]" />
              <div>
                <p className="text-2xl font-bold">{role.users?.length ?? 0}</p>
                <p className="text-xs text-[hsl(var(--muted-foreground))]">Utilisateurs</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Liste des permissions */}
      <div className="mt-6 rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-6">
        <h3 className="mb-4 text-sm font-semibold">Permissions associées</h3>
        {role.permissions.length === 0 ? (
          <p className="text-sm text-[hsl(var(--muted-foreground))]">Aucune permission.</p>
        ) : (
          <ul className="flex flex-wrap gap-2">
            {role.permissions.map((p) => (
              <li
                key={p.id}
                className="inline-flex items-center rounded-md border border-[hsl(var(--border))] px-2 py-0.5 font-mono text-xs text-[hsl(var(--muted-foreground))]"
              >
                {p.nom} ({p.code})
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Liste des utilisateurs */}
      <div className="mt-6 rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-6">
        <h3 className="mb-4 text-sm font-semibold">Utilisateurs avec ce rôle</h3>
        {!role.users || role.users.length === 0 ? (
          <p className="text-sm text-[hsl(var(--muted-foreground))]">Aucun utilisateur.</p>
        ) : (
          <ul className="divide-y divide-[hsl(var(--border))]">
            {role.users.map((u) => (
              <li key={u.id} className="flex items-center justify-between py-2">
                <div>
                  <p className="text-sm font-medium">
                    {u.prenom} {u.nom}
                  </p>
                  <p className="text-xs text-[hsl(var(--muted-foreground))]">{u.email}</p>
                </div>
                <div className="text-xs">
                  {u.agence ? (
                    <span className="flex items-center gap-1">
                      <Building2 size={12} />
                      {u.agence.nom}
                    </span>
                  ) : (
                    <span className="text-[hsl(var(--muted-foreground))]">Sans agence</span>
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}
