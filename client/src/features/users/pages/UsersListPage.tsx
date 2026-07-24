import { useState, useCallback } from 'react'
import { useNavigate } from 'react-router'
import { UserPlus, Search } from 'lucide-react'
import { PageHeader } from '@/shared/components/layout/PageHeader'
import { Can } from '@/shared/components/navigation/Can'
import { UsersTable } from '../components/UsersTable'
import { DeleteUserDialog } from '../components/DeleteUserDialog'
import { useToggleUserStatus } from '../hooks'
import { useRoles } from '@/features/security/hooks' // Assurez-vous que ce hook existe
import { useAgences } from '@/features/agences/hooks'
import { useDebounce } from '@/shared/hooks/useDebounce'
import type { User } from '../types'

export function UsersListPage() {
  const navigate = useNavigate()
  const [searchInput, setSearchInput] = useState('')
  const search = useDebounce(searchInput, 350)
  const [statusFilter, setStatusFilter] = useState<boolean | undefined>(undefined)
  const [roleFilter, setRoleFilter] = useState<string>('')
  const [agenceFilter, setAgenceFilter] = useState<string>('')
  const [userToDelete, setUserToDelete] = useState<User | null>(null)
  const { mutate: toggleStatus } = useToggleUserStatus()

  // Récupération des listes
  const { data: rolesData, isLoading: rolesLoading } = useRoles({ limit: 100 })
  const { data: agencesData, isLoading: agencesLoading } = useAgences({ limit: 100 })

  const roles = rolesData?.roles ?? []
  const agences = agencesData?.items ?? []

  const handleViewDetail = useCallback((id: string) => navigate(`/users/${id}`), [navigate])
  const handleToggleStatus = useCallback(
    (user: User) => {
      toggleStatus({ id: user.id, actif: !user.isActive })
    },
    [toggleStatus],
  )

  return (
    <>
      <div>
        <PageHeader
          title="Utilisateurs"
          description="Gestion des comptes utilisateurs GEOC"
          actions={
            <Can permission="user.create">
              <button
                type="button"
                onClick={() => navigate('/users/new')}
                className="flex items-center gap-2 rounded-[var(--radius)] bg-[hsl(var(--primary))] px-4 py-2 text-sm font-medium text-[hsl(var(--primary-foreground))] transition-opacity hover:opacity-90"
              >
                <UserPlus size={16} aria-hidden="true" />
                Nouvel utilisateur
              </button>
            </Can>
          }
        />

        {/* Barre de filtres */}
        <div className="mb-4 flex flex-wrap items-center gap-4">
          {/* Recherche */}
          <div className="relative max-w-sm min-w-[200px] flex-1">
            <Search
              size={15}
              className="absolute top-1/2 left-3 -translate-y-1/2 text-[hsl(var(--muted-foreground))]"
              aria-hidden="true"
            />
            <input
              type="search"
              placeholder="Rechercher un utilisateur..."
              value={searchInput}
              onChange={(e) => {
                setSearchInput(e.target.value)
              }}
              className="w-full rounded-[var(--radius)] border border-[hsl(var(--input))] bg-[hsl(var(--card))] py-2 pr-3 pl-9 text-sm focus:ring-2 focus:ring-[hsl(var(--ring))] focus:outline-none"
              aria-label="Rechercher"
            />
          </div>

          {/* Filtre statut */}
          <select
            value={statusFilter === undefined ? '' : String(statusFilter)}
            onChange={(e) => {
              const val = e.target.value
              setStatusFilter(val === '' ? undefined : val === 'true')
            }}
            className="rounded-[var(--radius)] border border-[hsl(var(--input))] bg-[hsl(var(--card))] px-3 py-2 text-sm focus:ring-2 focus:ring-[hsl(var(--ring))] focus:outline-none"
          >
            <option value="">Tous les statuts</option>
            <option value="true">Actif</option>
            <option value="false">Inactif</option>
          </select>

          {/* Filtre rôle */}
          <select
            value={roleFilter}
            onChange={(e) => {
              setRoleFilter(e.target.value)
            }}
            className="rounded-[var(--radius)] border border-[hsl(var(--input))] bg-[hsl(var(--card))] px-3 py-2 text-sm focus:ring-2 focus:ring-[hsl(var(--ring))] focus:outline-none"
            disabled={rolesLoading}
          >
            <option value="">Tous les rôles</option>
            {roles.map((role) => (
              <option key={role.id} value={role.id}>
                {role.nom}
              </option>
            ))}
          </select>

          {/* Filtre agence */}
          <select
            value={agenceFilter}
            onChange={(e) => {
              setAgenceFilter(e.target.value)
            }}
            className="rounded-[var(--radius)] border border-[hsl(var(--input))] bg-[hsl(var(--card))] px-3 py-2 text-sm focus:ring-2 focus:ring-[hsl(var(--ring))] focus:outline-none"
            disabled={agencesLoading}
          >
            <option value="">Toutes les agences</option>
            {agences.map((agence) => (
              <option key={agence.id} value={agence.id}>
                {agence.nom}
              </option>
            ))}
          </select>

          {/* Réinitialisation */}
          <button
            type="button"
            onClick={() => {
              setStatusFilter(undefined)
              setRoleFilter('')
              setAgenceFilter('')
              setSearchInput('')
            }}
            className="text-sm text-[hsl(var(--muted-foreground))] transition-colors hover:text-[hsl(var(--foreground))]"
          >
            Réinitialiser
          </button>
        </div>

        <UsersTable
          search={search}
          statusFilter={statusFilter}
          roleFilter={roleFilter}
          agenceFilter={agenceFilter}
          onEdit={() => void 0}
          onDelete={setUserToDelete}
          onToggleStatus={handleToggleStatus}
          onViewDetail={handleViewDetail}
        />
        {userToDelete && (
          <DeleteUserDialog
            user={userToDelete}
            onClose={() => {
              setUserToDelete(null)
            }}
          />
        )}
      </div>
    </>
  )
}
