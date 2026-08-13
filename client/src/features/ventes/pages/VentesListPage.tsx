import { useState, useCallback } from 'react'
import { PageHeader } from '@/shared/components/layout/PageHeader'
import { VentesBrowser } from '../components/VentesBrowser'
import { VenteFilters } from '../components/VenteFilters'
import { EmailsAutorisesButton } from '../components/EmailsAutorisesButton'
import { useVenteBrowserState } from '../hooks'
import type { VenteFiltersState } from '../types'

export function VentesListPage() {
  const [filters, setFilters] = useState<VenteFiltersState>({
    search: '',
    nonClotureesOnly: false,
  })

  const handleFilterChange = useCallback((newFilters: VenteFiltersState) => {
    setFilters(newFilters)
  }, [])

  const nav = useVenteBrowserState()

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <PageHeader title="Ventes" description="Historique des ventes importées" />
        <EmailsAutorisesButton />
      </div>
      <VenteFilters
        onFilterChange={handleFilterChange}
        viewMode={nav.viewMode}
        periodeFilters={nav.filtresPeriode}
      />
      <VentesBrowser filters={filters} nav={nav} />
    </div>
  )
}
