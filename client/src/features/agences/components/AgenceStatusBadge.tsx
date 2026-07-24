import { cn } from '@/shared/lib'

interface AgenceStatusBadgeProps {
  actif: boolean
}

export function AgenceStatusBadge({ actif }: AgenceStatusBadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium',
        actif
          ? 'bg-[hsl(var(--success))]/10 text-[hsl(var(--success))]'
          : 'bg-[hsl(var(--muted))] text-[hsl(var(--muted-foreground))]',
      )}
    >
      {actif ? 'Actif' : 'Inactif'}
    </span>
  )
}
