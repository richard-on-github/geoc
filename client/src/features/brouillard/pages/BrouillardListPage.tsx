import { useState, useCallback } from 'react'
import { PageHeader } from '@/shared/components/layout/PageHeader'
import { BrouillardFilters } from '../components/BrouillardFilters'
import { BrouillardTable } from '../components/BrouillardTable'
import type { BrouillardFiltersState } from '../types'

export function BrouillardListPage() {
  const [filters, setFilters] = useState<BrouillardFiltersState>({})

  const handleFilterChange = useCallback((newFilters: BrouillardFiltersState) => {
    setFilters(newFilters)
  }, [])

  return (
    <div>
      <PageHeader
        title="Brouillard"
        description="Récapitulatif journalier des opérations par opérateur, avec workflow de clôture et validation"
      />
      <BrouillardFilters onFilterChange={handleFilterChange} />
      <BrouillardTable filters={filters} />
    </div>
  )
}
