import { useState } from 'react'
import { computeJourAnnee } from '../../../shared/utils'
import type { VenteViewMode } from '../types'

export interface VentePeriodeFilters {
  jour?: number
  mois?: number
  annee?: number
}

/**
 * État de navigation Jours/Mois/Années/Général, partagé entre VenteFilters
 * (qui en a besoin pour l'export et pour savoir quand afficher/masquer certains
 * contrôles) et VentesBrowser (qui en a besoin pour afficher la bonne vue).
 * Sorti dans un hook dédié plutôt que gardé local à VentesBrowser, précisément
 * pour que les deux composants partagent la même source de vérité sans la
 * dupliquer ni la faire remonter via des callbacks épars.
 */
export function useVenteBrowserState() {
  const aujourdHui = new Date()

  const [viewMode, setViewModeState] = useState<VenteViewMode>('jours')
  const [annee, setAnneeState] = useState(aujourdHui.getUTCFullYear())
  const [mois, setMoisState] = useState(aujourdHui.getUTCMonth() + 1)
  // Jour du mois (1-31) sélectionné dans la grille "Jours" ; null = pas de jour choisi.
  const [jour, setJourState] = useState<number | null>(null)

  const setViewMode = (nextVue: VenteViewMode) => {
    setViewModeState(nextVue)
    if (nextVue !== 'jours') setJourState(null)
  }

  const setAnnee = (nextAnnee: number) => {
    setAnneeState(nextAnnee)
    setJourState(null)
  }

  const setMois = (nextMois: number) => {
    setMoisState(nextMois)
    setJourState(null)
  }

  const decalerMois = (delta: number) => {
    const total = mois - 1 + delta
    const nouvelleAnnee = annee + Math.floor(total / 12)
    const nouveauMois = ((total % 12) + 12) % 12
    setAnneeState(nouvelleAnnee)
    setMoisState(nouveauMois + 1)
    setJourState(null)
  }

  const selectJour = (nextJour: number) => {
    setJourState(nextJour)
  }

  const retourJours = () => {
    setJourState(null)
  }

  /**
   * Filtres jour/mois/année dérivés de la vue active. Utilisés à la fois pour
   * la table affichée et pour l'export : une seule source de vérité, donc pas
   * de risque que l'export diverge de ce qui est réellement affiché à l'écran.
   */
  const filtresPeriode: VentePeriodeFilters =
    viewMode === 'jours'
      ? jour !== null
        ? { jour: computeJourAnnee(annee, mois, jour), mois, annee }
        : { mois, annee }
      : viewMode === 'mois'
        ? { mois, annee }
        : viewMode === 'annees'
          ? { annee }
          : {}

  return {
    viewMode,
    annee,
    mois,
    jour,
    filtresPeriode,
    setViewMode,
    setAnnee,
    setMois,
    decalerMois,
    selectJour,
    retourJours,
  }
}

export type VenteBrowserNav = ReturnType<typeof useVenteBrowserState>
