import { useState, useCallback } from 'react'
import { useNavigate } from 'react-router'
import { Plus, Search } from 'lucide-react'
import { PageHeader } from '@/shared/components/layout/PageHeader'
import { Can } from '@/shared/components/navigation/Can'
import { AgencesTable } from '../components/AgencesTable'
import { DeleteAgenceDialog } from '../components/DeleteAgenceDialog'
import { useToggleAgenceStatus } from '../hooks'
import { useDebounce } from '@/shared/hooks/useDebounce'
import type { Agence } from '../types'

export function AgencesListPage() {
  const navigate = useNavigate()
  const [searchInput, setSearchInput] = useState('')
  const search = useDebounce(searchInput, 350)
  const [agenceToDelete, setAgenceToDelete] = useState<Agence | null>(null)
  const { mutate: toggleStatus } = useToggleAgenceStatus()

  const handleViewDetail = useCallback((id: string) => navigate(`/agences/${id}`), [navigate])
  const handleToggleStatus = useCallback(
    (agence: Agence) => { toggleStatus({ id: agence.id, actif: !agence.actif }); },
    [toggleStatus],
  )

  return (
    <div>
      <PageHeader
        title="Agences"
        description="Gestion des agences GEOC"
        actions={
          <Can permission="agence.create">
            <button
              type="button"
              onClick={() => navigate('/agences/new')}
              className="flex items-center gap-2 rounded-[var(--radius)] bg-[hsl(var(--primary))] px-4 py-2 text-sm font-medium text-[hsl(var(--primary-foreground))] transition-opacity hover:opacity-90"
            >
              <Plus size={16} aria-hidden="true" />
              Nouvelle agence
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
          placeholder="Rechercher une agence..."
          value={searchInput}
          onChange={(e) => { setSearchInput(e.target.value); }}
          className="w-full rounded-[var(--radius)] border border-[hsl(var(--input))] bg-[hsl(var(--card))] py-2 pr-3 pl-9 text-sm focus:ring-2 focus:ring-[hsl(var(--ring))] focus:outline-none"
        />
      </div>
      <AgencesTable
        search={search}
        onEdit={() => void 0}
        onDelete={setAgenceToDelete}
        onToggleStatus={handleToggleStatus}
        onViewDetail={handleViewDetail}
      />
      {agenceToDelete && (
        <DeleteAgenceDialog agence={agenceToDelete} onClose={() => { setAgenceToDelete(null); }} />
      )}
    </div>
  )
}
