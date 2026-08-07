import { useState } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { cn } from '@/shared/lib'

interface VenteYearsGridProps {
  selectedAnnee: number
  onSelect: (annee: number) => void
}

const ANNEES_PAR_PAGE = 8

export function VenteYearsGrid({ selectedAnnee, onSelect }: VenteYearsGridProps) {
  const anneeActuelle = new Date().getUTCFullYear()
  const [anneeDebut, setAnneeDebut] = useState(
    () => selectedAnnee - Math.floor(ANNEES_PAR_PAGE / 2),
  )

  const annees = Array.from({ length: ANNEES_PAR_PAGE }, (_, i) => anneeDebut + i)

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-center gap-3">
        <button
          type="button"
          onClick={() => {
            setAnneeDebut((a) => a - ANNEES_PAR_PAGE)
          }}
          className="flex h-8 w-8 items-center justify-center rounded-(--radius) border border-[hsl(var(--border))] hover:bg-[hsl(var(--muted))]"
          aria-label="Années précédentes"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>
        <span className="text-sm font-medium text-[hsl(var(--muted-foreground))]">
          {annees[0]} - {annees[annees.length - 1]}
        </span>
        <button
          type="button"
          onClick={() => {
            setAnneeDebut((a) => a + ANNEES_PAR_PAGE)
          }}
          className="flex h-8 w-8 items-center justify-center rounded-(--radius) border border-[hsl(var(--border))] hover:bg-[hsl(var(--muted))]"
          aria-label="Années suivantes"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {annees.map((annee) => (
          <button
            key={annee}
            type="button"
            onClick={() => {
              onSelect(annee)
            }}
            className={cn(
              'rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--card))] py-6 text-lg font-semibold transition-colors hover:bg-[hsl(var(--muted))]',
              annee === selectedAnnee &&
                'border-[hsl(var(--primary))] bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))]',
              annee === anneeActuelle &&
                annee !== selectedAnnee &&
                'border-[hsl(var(--primary))]',
            )}
          >
            {annee}
          </button>
        ))}
      </div>
    </div>
  )
}
