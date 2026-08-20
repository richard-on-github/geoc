import { cn } from '@/shared/lib'
import { STATUT_ABATTEMENT_LABELS, type StatutAbattement } from '../types'

const STATUT_STYLES: Record<StatutAbattement, string> = {
  AUCUN: 'bg-green-100 text-green-700',
  RETARD: 'bg-amber-100 text-amber-700',
  MOINS_VERSE: 'bg-orange-100 text-orange-700',
  MOINS_VERSE_AVEC_RETARD: 'bg-red-100 text-red-700',
  NON_VERSE: 'bg-red-200 text-red-800',
}

interface AbattementStatutBadgeProps {
  statut: StatutAbattement
}

export function AbattementStatutBadge({ statut }: AbattementStatutBadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium',
        STATUT_STYLES[statut],
      )}
    >
      {STATUT_ABATTEMENT_LABELS[statut]}
    </span>
  )
}
