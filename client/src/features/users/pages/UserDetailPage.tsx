import { useParams, useNavigate } from 'react-router'
import { ArrowLeft } from 'lucide-react'
import { useUser } from '../hooks'
import { UserStatusBadge } from '../components/UserStatusBadge'
import { PageHeader } from '@/shared/components/layout/PageHeader'
import { ErrorState } from '@/shared/components/feedback/ErrorState'
import { formatDateTime } from '@/shared/utils'
import { getInitials } from '@/shared/utils'

export function UserDetailPage() {
  const { id = '' } = useParams()
  const navigate = useNavigate()
  const { data: user, isLoading, isError, refetch } = useUser(id)

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-48 rounded bg-[hsl(var(--muted))] animate-pulse" />
        <div className="rounded-lg border border-[hsl(var(--border))] p-6 space-y-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-5 w-full rounded bg-[hsl(var(--muted))] animate-pulse" />
          ))}
        </div>
      </div>
    )
  }

  if (isError || user === undefined) {
    return <ErrorState title="Utilisateur introuvable" onRetry={() => void refetch()} />
  }

  return (
    <div>
      <button type="button" onClick={() => void navigate('/users')}
        className="mb-4 flex items-center gap-1.5 text-sm text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))] transition-colors">
        <ArrowLeft size={15} aria-hidden="true" />
        Retour à la liste
      </button>
      <PageHeader title={user.fullName} description={user.email}
        actions={<UserStatusBadge isActive={user.isActive} />} />

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Infos principales */}
        <div className="lg:col-span-2 rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-6">
          <div className="flex items-start gap-4 mb-6">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-[hsl(var(--primary))] text-lg font-bold text-white">
              {getInitials(user.fullName)}
            </div>
            <div>
              <h2 className="text-base font-semibold">{user.fullName}</h2>
              <p className="text-sm text-[hsl(var(--muted-foreground))]">{user.email}</p>
              <p className="text-sm text-[hsl(var(--muted-foreground))] mt-0.5">{user.role.displayName}</p>
            </div>
          </div>
          <dl className="grid gap-4 sm:grid-cols-2 text-sm">
            {[
              { label: 'Rôle', value: user.role.displayName },
              { label: 'Agence', value: user.agencyName ?? 'Non assigné' },
              { label: 'Créé le', value: formatDateTime(user.createdAt) },
              { label: 'Modifié le', value: formatDateTime(user.updatedAt) },
              { label: 'Dernière connexion', value: user.lastLoginAt !== null ? formatDateTime(user.lastLoginAt) : 'Jamais' },
            ].map(({ label, value }) => (
              <div key={label}>
                <dt className="text-xs font-medium text-[hsl(var(--muted-foreground))] uppercase tracking-wider mb-0.5">{label}</dt>
                <dd className="text-[hsl(var(--foreground))]">{value}</dd>
              </div>
            ))}
          </dl>
        </div>

        {/* Permissions individuelles */}
        <div className="rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-6">
          <h3 className="text-sm font-semibold mb-3">Permissions individuelles</h3>
          {user.permissions.length === 0 ? (
            <p className="text-sm text-[hsl(var(--muted-foreground))]">Aucune permission individuelle.</p>
          ) : (
            <ul className="space-y-1.5">
              {user.permissions.map((p) => (
                <li key={p} className="inline-flex items-center rounded-md border border-[hsl(var(--border))] px-2 py-0.5 text-xs text-[hsl(var(--muted-foreground))] font-mono">
                  {p}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  )
}
