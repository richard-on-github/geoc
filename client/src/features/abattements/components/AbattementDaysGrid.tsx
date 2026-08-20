import { cn } from '@/shared/lib'
import { useAbattementsAggregate } from '../hooks/useAbattementsAggregate'
import { computeJourAnnee, joursDansMois, premierJourSemaine } from '../../../shared/utils'
import type { AbattementFiltersState } from '../types'

interface AbattementDaysGridProps {
  annee: number
  mois: number // 1-12
  filters: AbattementFiltersState
  onSelect: (jour: number) => void
}

const JOURS_SEMAINE = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim']

export function AbattementDaysGrid({ annee, mois, filters, onSelect }: AbattementDaysGridProps) {
  const nbJours = joursDansMois(annee, mois)
  const decalage = premierJourSemaine(annee, mois)

  const { buckets, isLoading, estPartiel } = useAbattementsAggregate({
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
          const aDesProblemes = (bucket?.nombreProblemes ?? 0) > 0

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
                bucket && !aDesProblemes && 'border-green-500/40',
                aDesProblemes && 'border-[hsl(var(--destructive))]/50',
                estAujourdHui && 'ring-2 ring-[hsl(var(--primary))]',
              )}
            >
              <span className="font-semibold">{jourAnnee}</span>
              {!isLoading && aDesProblemes && (
                <span className="text-[10px] font-medium text-[hsl(var(--destructive))]">
                  {bucket?.nombreProblemes}
                </span>
              )}
            </button>
          )
        })}
      </div>

      {estPartiel && (
        <p className="text-xs text-[hsl(var(--muted-foreground))]">
          Ce mois compte plus de 1000 lignes : les compteurs affichés ci-dessus sont partiels.
        </p>
      )}
    </div>
  )
}
