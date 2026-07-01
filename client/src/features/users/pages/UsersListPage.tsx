import { useState, useCallback } from 'react'
import { useNavigate } from 'react-router'
import { UserPlus, Search } from 'lucide-react'
import { PageHeader } from '@/shared/components/layout/PageHeader'
import { Can } from '@/shared/components/navigation/Can'
import { UsersTable } from '../components/UsersTable'
import { CreateUserModal } from '../components/CreateUserModal'
import { DeleteUserDialog } from '../components/DeleteUserDialog'
import { useToggleUserStatus } from '../hooks'
import type { User } from '../types'
import { useDebounce } from '@/shared/hooks/useDebounce'

export function UsersListPage() {
  const navigate = useNavigate()
  const [searchInput, setSearchInput] = useState('')
  const search = useDebounce(searchInput, 350)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [userToDelete, setUserToDelete] = useState<User | null>(null)
  const { mutate: toggleStatus } = useToggleUserStatus()

  const handleViewDetail = useCallback(
    (id: string) => {
      void navigate(`/users/${id}`)
    },
    [navigate],
  )
  const handleToggleStatus = useCallback(
    (user: User) => {
      toggleStatus({ id: user.id, activate: !user.isActive })
    },
    [toggleStatus],
  )

  return (
    <div>
      <PageHeader
        title="Utilisateurs"
        description="Gestion des comptes utilisateurs GEOC"
        actions={
          <Can permission="user.create">
            <button
              type="button"
              onClick={() => { navigate('/users/new') }}
              className="flex items-center gap-2 rounded-[var(--radius)] bg-[hsl(var(--primary))] px-4 py-2 text-sm font-medium text-[hsl(var(--primary-foreground))] transition-opacity hover:opacity-90"
            >
              <UserPlus size={16} aria-hidden="true" />
              Nouvel utilisateur
            </button>
          </Can>
        }
      />
      <div className="relative mb-4 max-w-sm">
        <Search
          size={15}
          className="absolute top-1/2 left-3 -translate-y-1/2 text-[hsl(var(--muted-foreground))]"
          aria-hidden="true"
        />
        <input
          type="search"
          placeholder="Rechercher un utilisateur..."
          value={searchInput}
          onChange={(e) => { setSearchInput(e.target.value); }}
          className="w-full rounded-[var(--radius)] border border-[hsl(var(--input))] bg-[hsl(var(--card))] py-2 pr-3 pl-9 text-sm focus:ring-2 focus:ring-[hsl(var(--ring))] focus:ring-offset-1 focus:outline-none"
          aria-label="Rechercher"
        />
      </div>
      <UsersTable
        search={search}
        onEdit={() => void 0}
        onDelete={(user) => { setUserToDelete(user); }}
        onToggleStatus={handleToggleStatus}
        onViewDetail={handleViewDetail}
      />
      {showCreateModal && <CreateUserModal onClose={() => { setShowCreateModal(false); }} />}
      {userToDelete !== null && (
        <DeleteUserDialog user={userToDelete} onClose={() => { setUserToDelete(null); }} />
      )}
    </div>
  )
}
