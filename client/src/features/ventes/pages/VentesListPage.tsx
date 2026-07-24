import { useState, useCallback } from 'react'
import { PageHeader } from '@/shared/components/layout/PageHeader'
import { Can } from '@/shared/components/navigation/Can'
import { VentesTable } from '../components/VentesTable'
import { VenteFilters } from '../components/VenteFilters'
import type { Vente } from '../types'

export function VentesListPage() {
  const [filters, setFilters] = useState({
    search: '',
    agenceId: '',
    dateDebut: '',
    dateFin: '',
  })

  const handleFilterChange = useCallback((newFilters: typeof filters) => {
    setFilters(newFilters)
  }, [])

  return (
    <div>
      <PageHeader
        title="Ventes"
        description="Historique des ventes importées"
        actions={
          <Can permission="vente.export">{/* Les boutons d'export sont dans VenteFilters */}</Can>
        }
      />
      <VenteFilters onFilterChange={handleFilterChange} />
      <VentesTable filters={filters} />
    </div>
  )
}
