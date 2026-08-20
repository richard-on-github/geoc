import { useState, useCallback } from 'react'
import { PageHeader } from '@/shared/components/layout/PageHeader'
import { AbattementFilters } from '../components/AbattementFilters'
import { AbattementsBrowser } from '../components/AbattementsBrowser'
import { useAbattementBrowserState } from '../hooks/useAbattementBrowserState'
import type { AbattementFiltersState } from '../types'

export function AbattementsListPage() {
  const [filters, setFilters] = useState<AbattementFiltersState>({
    search: '',
  })

  const handleFilterChange = useCallback((newFilters: AbattementFiltersState) => {
    setFilters(newFilters)
  }, [])

  // Une seule instance de l'état de navigation Jours/Mois/Années/Général,
  // partagée entre AbattementFilters (pour l'export) et AbattementsBrowser
  // (pour l'affichage) — évite toute divergence entre les deux.
  const nav = useAbattementBrowserState()

  return (
    <div>
      <PageHeader
        title="Abattements"
        description="Suivi des versements et calcul des pénalités par opérateur"
      />
      <AbattementFilters
        onFilterChange={handleFilterChange}
        viewMode={nav.viewMode}
        periodeFilters={nav.filtresPeriode}
      />
      <AbattementsBrowser filters={filters} nav={nav} />
    </div>
  )
}
