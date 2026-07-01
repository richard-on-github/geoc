import type { ReactNode } from 'react'
import { cn } from '@/shared/lib'

interface PageHeaderProps {
  title: string
  description?: string
  actions?: ReactNode
  className?: string
}

export function PageHeader({ title, description, actions, className }: PageHeaderProps) {
  return (
    <div className={cn('flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between mb-6', className)}>
      <div className="min-w-0">
        <h1 className="text-xl font-semibold text-[hsl(var(--foreground))] truncate">{title}</h1>
        {description !== undefined && (
          <p className="mt-0.5 text-sm text-[hsl(var(--muted-foreground))]">{description}</p>
        )}
      </div>
      {actions !== undefined && (
        <div className="flex items-center gap-2 shrink-0">{actions}</div>
      )}
    </div>
  )
}
