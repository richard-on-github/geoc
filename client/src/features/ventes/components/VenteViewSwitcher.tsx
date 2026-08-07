import { cn } from '@/shared/lib'
import type { VenteViewMode } from '../types'

interface VenteViewSwitcherProps {
  value: VenteViewMode
  onChange: (mode: VenteViewMode) => void
}

const VUES: Array<{ id: VenteViewMode; label: string }> = [
  { id: 'jours', label: 'Jours' },
  { id: 'mois', label: 'Mois' },
  { id: 'annees', label: 'Années' },
  { id: 'general', label: 'Général' },
]

export function VenteViewSwitcher({ value, onChange }: VenteViewSwitcherProps) {
  return (
    <div
      role="tablist"
      aria-label="Vue de la liste des ventes"
      className="inline-flex items-center gap-1 rounded-(--radius) border border-[hsl(var(--border))] bg-[hsl(var(--muted))]/30 p-1"
    >
      {VUES.map((vue) => (
        <button
          key={vue.id}
          type="button"
          role="tab"
          aria-selected={value === vue.id}
          onClick={() => {
            onChange(vue.id)
          }}
          className={cn(
            'rounded-sm px-3 py-1.5 text-sm font-medium transition-colors',
            value === vue.id
              ? 'bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))]'
              : 'text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))]',
          )}
        >
          {vue.label}
        </button>
      ))}
    </div>
  )
}
