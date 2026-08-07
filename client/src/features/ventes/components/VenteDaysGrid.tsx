import { cn } from '@/shared/lib'
import { useVentesAggregate } from '../hooks/useVentesAggregate'
import { computeJourAnnee, joursDansMois, premierJourSemaine } from '../../../shared/utils'
import type { VenteFiltersState } from '../types'

interface VenteDaysGridProps {
  annee: number
  mois: number // 1-12
  filters: VenteFiltersState
  onSelect: (jour: number) => void
}

const JOURS_SEMAINE = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim']

/**
 * Grille des journées d'un mois. Chaque cellule affiche la "journée de
 * l'année" (jourAnnee, 1-366) plutôt que le simple quantième du mois (1-31) :
 * ex. le 3 février affiche "34", puisque c'est le 34e jour de l'année. La
 * disposition en semaines (avec décalage du 1er jour du mois) reste calquée
 * sur le mois affiché.
 */
export function VenteDaysGrid({ annee, mois, filters, onSelect }: VenteDaysGridProps) {
  const nbJours = joursDansMois(annee, mois)
  const decalage = premierJourSemaine(annee, mois)

  const { buckets, isLoading, estPartiel } = useVentesAggregate({
    ...filters,
    annee,
    mois,
    groupBy: 'jour',
  })

  const aujourdHui = new Date()
  const estMoisCourant =
    aujourdHui.getUTCFullYear() === annee && aujourdHui.getUTCMonth() + 1 === mois

  const cellules: Array<number | null> = [
    ...Array.from({ length: decalage }, () => null),
    ...Array.from({ length: nbJours }, (_, i) => i + 1),
  ]

  return (
    <div className="space-y-2">
      <div className="grid grid-cols-7 gap-2">
        {JOURS_SEMAINE.map((j) => (
          <div
            key={j}
            className="text-center text-xs font-medium text-[hsl(var(--muted-foreground))]"
          >
            {j}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-2">
        {cellules.map((jourDuMois, index) => {
          if (jourDuMois === null) {
            return <div key={`vide-${String(index)}`} />
          }

          const jourAnnee = computeJourAnnee(annee, mois, jourDuMois)
          const bucket = buckets.get(jourDuMois)
          const estAujourdHui = estMoisCourant && jourDuMois === aujourdHui.getUTCDate()

          return (
            <button
              key={jourDuMois}
              type="button"
              onClick={() => {
                onSelect(jourDuMois)
              }}
              title={`Journée ${String(jourAnnee)} de l'année`}
              className={cn(
                'flex aspect-square flex-col items-center justify-center gap-0.5 rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--card))] text-sm transition-colors hover:bg-[hsl(var(--muted))]',
                bucket && 'border-[hsl(var(--primary))]/40',
                estAujourdHui && 'ring-2 ring-[hsl(var(--primary))]',
              )}
            >
              <span className="font-semibold">{jourAnnee}</span>
              {!isLoading && bucket && (
                <span className="text-[10px] text-[hsl(var(--primary))]">
                  {bucket.nombreVentes}
                </span>
              )}
            </button>
          )
        })}
      </div>

      {estPartiel && (
        <p className="text-xs text-[hsl(var(--muted-foreground))]">
          Ce mois compte plus de 1000 ventes : les compteurs affichés ci-dessus sont partiels.
        </p>
      )}
    </div>
  )
}
