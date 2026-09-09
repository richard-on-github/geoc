import { cn } from '@/shared/lib'
import {
  STATUT_ANOMALIE_LABELS,
  STATUT_BROUILLARD_LABELS,
  type StatutAnomalieBrouillard,
  type StatutBrouillard,
} from '../types'

const ANOMALIE_STYLES: Record<StatutAnomalieBrouillard, string> = {
  OK: 'bg-green-100 text-green-700',
  MOINS_VERSE: 'bg-orange-100 text-orange-700',
  MOINS_VERSE_RETARD: 'bg-red-100 text-red-700',
  RETARD: 'bg-amber-100 text-amber-700',
  NON_VERSE: 'bg-red-200 text-red-800',
  TROP_VERSE: 'bg-blue-100 text-blue-700',
  ANOMALIE: 'bg-purple-100 text-purple-700',
}

const WORKFLOW_STYLES: Record<StatutBrouillard, string> = {
  OUVERT: 'bg-gray-100 text-gray-700',
  CLOTURE: 'bg-blue-100 text-blue-700',
  VALIDE: 'bg-green-100 text-green-700',
  REJETE: 'bg-red-100 text-red-700',
}

export function AnomalieBadge({ statut }: { statut: StatutAnomalieBrouillard }) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium',
        ANOMALIE_STYLES[statut],
      )}
    >
      {STATUT_ANOMALIE_LABELS[statut]}
    </span>
  )
}

export function WorkflowBadge({ statut }: { statut: StatutBrouillard }) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium',
        WORKFLOW_STYLES[statut],
      )}
    >
      {STATUT_BROUILLARD_LABELS[statut]}
    </span>
  )
}
