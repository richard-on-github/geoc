import type { LucideIcon } from 'lucide-react'
import { cn } from '@/shared/lib'

interface EmptyStateProps {
  icon?: LucideIcon
  title: string
  description?: string
  action?: React.ReactNode
  className?: string
}

export function EmptyState({ icon: Icon, title, description, action, className }: EmptyStateProps) {
  return (
    <div className={cn('flex flex-col items-center justify-center py-16 text-center', className)}>
      {Icon !== undefined && (
        <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-[hsl(var(--muted))]">
          <Icon size={22} className="text-[hsl(var(--muted-foreground))]" aria-hidden="true" />
        </div>
      )}
      <p className="text-sm font-medium text-[hsl(var(--foreground))]">{title}</p>
      {description !== undefined && (
        <p className="mt-1 text-sm text-[hsl(var(--muted-foreground))] max-w-xs">{description}</p>
      )}
      {action !== undefined && <div className="mt-4">{action}</div>}
    </div>
  )
}
