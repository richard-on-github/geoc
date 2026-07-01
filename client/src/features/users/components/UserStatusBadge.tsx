import { cn } from '@/shared/lib'

interface UserStatusBadgeProps {
  isActive: boolean
  className?: string
}

export function UserStatusBadge({ isActive, className }: UserStatusBadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium',
        isActive
          ? 'bg-[hsl(var(--color-success-50,_#f0fdf4))] text-[hsl(var(--color-success-700,_143_64%_24%))]'
          : 'bg-[hsl(var(--muted))] text-[hsl(var(--muted-foreground))]',
        className,
      )}
    >
      <span
        className={cn(
          'h-1.5 w-1.5 rounded-full',
          isActive ? 'bg-[hsl(142,_64%,_38%)]' : 'bg-[hsl(var(--muted-foreground))]',
        )}
        aria-hidden="true"
      />
      {isActive ? 'Actif' : 'Inactif'}
    </span>
  )
}
