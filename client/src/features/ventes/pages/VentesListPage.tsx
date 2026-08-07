// import { useState, useCallback } from 'react'
// import { PageHeader } from '@/shared/components/layout/PageHeader'
// import { VentesTable } from '../components/VentesTable'
// import { VenteFilters } from '../components/VenteFilters'

// interface VentesListFilters {
//   search: string
//   agenceId?: string
//   dateDebut?: string
//   dateFin?: string
//   clotureId?: string
//   nonClotureesOnly?: boolean
// }

// export function VentesListPage() {
//   const [filters, setFilters] = useState<VentesListFilters>({
//     search: '',
//     nonClotureesOnly: false,
//   })

//   const handleFilterChange = useCallback((newFilters: VentesListFilters) => {
//     setFilters(newFilters)
//   }, [])

//   return (
//     <div>
//       <PageHeader title="Ventes" description="Historique des ventes importées" />
//       <VenteFilters onFilterChange={handleFilterChange} />
//       <VentesTable filters={filters} />
//     </div>
//   )
// }

import { useState, useCallback } from 'react'
import { PageHeader } from '@/shared/components/layout/PageHeader'
import { VentesBrowser } from '../components/VentesBrowser'
import { VenteFilters } from '../components/VenteFilters'
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

  // Une seule instance de l'état de navigation Jours/Mois/Années/Général,
  // partagée entre VenteFilters (qui en a besoin pour l'export et pour savoir
  // quels contrôles afficher) et VentesBrowser (qui l'utilise pour rendre la
  // bonne vue) — évite toute divergence entre ce qui est affiché et ce qui
  // est exporté.
  const nav = useVenteBrowserState()

  return (
    <div>
      <PageHeader title="Ventes" description="Historique des ventes importées" />
      <VenteFilters
        onFilterChange={handleFilterChange}
        viewMode={nav.viewMode}
        periodeFilters={nav.filtresPeriode}
      />
      <VentesBrowser filters={filters} nav={nav} />
    </div>
  )
}
