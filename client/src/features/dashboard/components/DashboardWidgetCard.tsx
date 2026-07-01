import type { ReactNode } from 'react'
import { cn } from '@/shared/lib'

interface DashboardWidgetCardProps {
  title: string
  span?: 1 | 2 | 3
  action?: ReactNode
  children: ReactNode
}

const SPAN_CLASSES: Record<1 | 2 | 3, string> = {
  1: 'lg:col-span-1',
  2: 'lg:col-span-2',
  3: 'lg:col-span-3',
}

/**
 * Conteneur générique pour un widget de dashboard.
 * Les futurs modules métiers viendront brancher leur contenu ici
 * (graphiques, listes, mini-tableaux...) sans changer la structure.
 */
export function DashboardWidgetCard({ title, span = 1, action, children }: DashboardWidgetCardProps) {
  return (
    <div className={cn('rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--card))]', SPAN_CLASSES[span])}>
      <div className="flex items-center justify-between border-b border-[hsl(var(--border))] px-5 py-3">
        <h3 className="text-sm font-semibold text-[hsl(var(--foreground))]">{title}</h3>
        {action}
      </div>
      <div className="p-5">{children}</div>
    </div>
  )
}
