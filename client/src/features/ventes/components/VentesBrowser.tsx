import { ChevronLeft, ChevronRight } from 'lucide-react'
import { VenteViewSwitcher } from './VenteViewSwitcher'
import { VenteDaysGrid } from './VenteDaysGrid'
import { VentePeriodeControls } from './VentePeriodeControls'
import { VenteClotureAction } from './VenteClotureAction'
import { VentesTable } from './VentesTable'
import { NOMS_MOIS } from '../../../shared/utils'
import type { VenteBrowserNav } from '../hooks'
import type { VenteFiltersState } from '../types'

interface VentesBrowserProps {
  filters: VenteFiltersState
  nav: VenteBrowserNav
}

/**
 * - "Jours" (vue par défaut) : grille des journées de l'année (numérotées
 *   1-366, groupées par mois affiché) pour le mois/année sélectionné. Cliquer
 *   sur une journée affiche la table des ventes de ce jour.
 * - "Mois" : va directement à la table des ventes du mois sélectionné (pas de
 *   grille intermédiaire). Le bouton de clôture/annulation du mois s'affiche
 *   ici, contextuel au mois affiché.
 * - "Années" : va directement à la table des ventes de l'année sélectionnée.
 * - "Général" : table plate, sans filtre jour/mois/année (comportement
 *   d'origine, inchangé).
 *
 * Dans les 3 premières vues, `nav.filtresPeriode` (jour/mois/année dérivés de
 * la vue active) est fusionné avec les filtres classiques pour interroger la
 * table - exactement la même valeur que celle utilisée par VenteFilters pour
 * l'export, donc export et affichage restent toujours cohérents.
 */
export function VentesBrowser({ filters, nav }: VentesBrowserProps) {
  const { viewMode, annee, mois, jour, filtresPeriode, setViewMode, setAnnee, setMois, decalerMois, selectJour, retourJours } =
    nav

  const filtresTable = { ...filters, ...filtresPeriode }

  return (
    <div className="space-y-4">
      <VenteViewSwitcher value={viewMode} onChange={setViewMode} />

      {viewMode === 'annees' && (
        <div className="space-y-4">
          <VentePeriodeControls annee={annee} onChangeAnnee={setAnnee} />
          <VentesTable filters={filtresTable} />
        </div>
      )}

      {viewMode === 'mois' && (
        <div className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <VentePeriodeControls
              annee={annee}
              mois={mois}
              onChangeAnnee={setAnnee}
              onChangeMois={setMois}
            />
            <VenteClotureAction annee={annee} mois={mois} />
          </div>
          <VentesTable filters={filtresTable} />
        </div>
      )}

      {viewMode === 'jours' && jour === null && (
        <div className="space-y-3">
          <VentePeriodeControls
            annee={annee}
            mois={mois}
            onChangeAnnee={setAnnee}
            onChangeMois={setMois}
          />

          <div className="flex items-center justify-center gap-3">
            <button
              type="button"
              onClick={() => {
                decalerMois(-1)
              }}
              className="flex h-8 w-8 items-center justify-center rounded-(--radius) border border-[hsl(var(--border))] hover:bg-[hsl(var(--muted))]"
              aria-label="Mois précédent"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <span className="min-w-40 text-center text-sm font-semibold">
              {NOMS_MOIS[mois - 1]} {annee}
            </span>
            <button
              type="button"
              onClick={() => {
                decalerMois(1)
              }}
              className="flex h-8 w-8 items-center justify-center rounded-(--radius) border border-[hsl(var(--border))] hover:bg-[hsl(var(--muted))]"
              aria-label="Mois suivant"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>

          <VenteDaysGrid annee={annee} mois={mois} filters={filters} onSelect={selectJour} />
        </div>
      )}

      {viewMode === 'jours' && jour !== null && (
        <div className="space-y-3">
          <button
            type="button"
            onClick={retourJours}
            className="flex items-center gap-1 text-sm font-medium text-[hsl(var(--primary))] hover:underline"
          >
            <ChevronLeft size={14} /> Retour aux journées de {NOMS_MOIS[mois - 1]}
          </button>
          <VentesTable filters={filtresTable} />
        </div>
      )}

      {viewMode === 'general' && <VentesTable filters={filters} />}
    </div>
  )
}
