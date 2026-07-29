import { useState, useCallback } from 'react'
import { PageHeader } from '@/shared/components/layout/PageHeader'
import { VentesTable } from '../components/VentesTable'
import { VenteFilters } from '../components/VenteFilters'

export function VentesListPage() {
  const [filters, setFilters] = useState({
    search: '',
    agenceId: '',
    dateDebut: '',
    dateFin: '',
    clotureId: '',
    nonClotureesOnly: false,
  })

  const handleFilterChange = useCallback((newFilters: typeof filters) => {
    setFilters(newFilters)
  }, [])

  return (
    <div>
      <PageHeader title="Ventes" description="Historique des ventes importées" />
      <VenteFilters onFilterChange={handleFilterChange} />
      <VentesTable filters={filters} />
    </div>
  )
}
