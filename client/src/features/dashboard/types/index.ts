import type { LucideIcon } from 'lucide-react'

/**
 * Structure générique pour une carte KPI.
 * Aucune donnée métier n'est définie ici — chaque futur module
 * (caisses, opérations, comptabilité...) alimentera ses propres KPIs.
 */
export interface KpiCardData {
  id: string
  label: string
  value: string | number
  icon: LucideIcon
  trend?: {
    value: number          // pourcentage, positif ou négatif
    label: string           // ex: "vs mois dernier"
  }
}

export interface DashboardWidget {
  id: string
  title: string
  span: 1 | 2 | 3          // largeur en colonnes de la grille
}
