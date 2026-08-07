import { cn } from '@/shared/lib'
import { formatCurrency } from '@/shared/utils'
import { useVentesAggregate } from '../hooks/useVentesAggregate'
import { NOMS_MOIS } from '../../../shared/utils'
import type { VenteFiltersState } from '../types'

interface VenteMonthsGridProps {
  annee: number
  selectedMois?: number
  filters: VenteFiltersState
  onSelect: (mois: number) => void
}

export function VenteMonthsGrid({ annee, selectedMois, filters, onSelect }: VenteMonthsGridProps) {
  const aujourdHui = new Date()
  const anneeActuelle = aujourdHui.getUTCFullYear()
  const moisActuel = aujourdHui.getUTCMonth() + 1

  const { buckets, isLoading, estPartiel } = useVentesAggregate({
    ...filters,
    annee,
    groupBy: 'mois',
  })

  return (
    <div className="space-y-2">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
        {NOMS_MOIS.map((nom, index) => {
          const mois = index + 1
          const bucket = buckets.get(mois)
          const estSelectionne = mois === selectedMois
          const estMoisActuel = annee === anneeActuelle && mois === moisActuel

          return (
            <button
              key={mois}
              type="button"
              onClick={() => {
                onSelect(mois)
              }}
              className={cn(
                'flex flex-col items-start gap-1 rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-4 text-left transition-colors hover:bg-[hsl(var(--muted))]',
                estSelectionne &&
                  'border-[hsl(var(--primary))] bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))]',
                estMoisActuel && !estSelectionne && 'border-[hsl(var(--primary))]',
              )}
            >
              <span className="text-sm font-semibold">{nom}</span>
              {!isLoading && (
                <span
                  className={cn(
                    'text-xs',
                    estSelectionne
                      ? 'text-[hsl(var(--primary-foreground))]/80'
                      : 'text-[hsl(var(--muted-foreground))]',
                  )}
                >
                  {bucket
                    ? `${String(bucket.nombreVentes)} vente${bucket.nombreVentes > 1 ? 's' : ''} · ${formatCurrency(bucket.totalVente)}`
                    : 'Aucune vente'}
                </span>
              )}
            </button>
          )
        })}
      </div>

      {estPartiel && (
        <p className="text-xs text-[hsl(var(--muted-foreground))]">
          Cette année compte plus de 1000 ventes : les totaux affichés ci-dessus sont partiels.
        </p>
      )}
    </div>
  )
}
