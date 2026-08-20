import { useState } from 'react'
import { computeJourAnnee } from '../../../shared/utils'
import type { AbattementViewMode } from '../types'

export interface AbattementPeriodeFilters {
  jour?: number
  mois?: number
  annee?: number
}

export function useAbattementBrowserState() {
  const aujourdHui = new Date()

  const [viewMode, setViewModeState] = useState<AbattementViewMode>('jours')
  const [annee, setAnneeState] = useState(aujourdHui.getUTCFullYear())
  const [mois, setMoisState] = useState(aujourdHui.getUTCMonth() + 1)
  // Jour du mois (1-31) sélectionné dans la grille "Jours" ; null = pas de jour choisi.
  const [jour, setJourState] = useState<number | null>(null)

  const setViewMode = (nextVue: AbattementViewMode) => {
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
  const filtresPeriode: AbattementPeriodeFilters =
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

export type AbattementBrowserNav = ReturnType<typeof useAbattementBrowserState>
