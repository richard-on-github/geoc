import { TrendingUp, TrendingDown } from 'lucide-react'
import { cn } from '@/shared/lib'
import type { KpiCardData } from '../types'

interface KpiCardProps {
  data: KpiCardData
}

export function KpiCard({ data }: KpiCardProps) {
  const Icon = data.icon
  const isPositive = data.trend !== undefined && data.trend.value >= 0

  return (
    <div className="rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-5">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-medium text-[hsl(var(--muted-foreground))] uppercase tracking-wider">
            {data.label}
          </p>
          <p className="mt-2 text-2xl font-semibold text-[hsl(var(--foreground))]">
            {data.value}
          </p>
        </div>
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[hsl(var(--primary))]/10">
          <Icon size={18} className="text-[hsl(var(--primary))]" aria-hidden="true" />
        </div>
      </div>

      {data.trend !== undefined && (
        <div className="mt-3 flex items-center gap-1.5 text-xs">
          {isPositive ? (
            <TrendingUp size={13} className="text-[hsl(142,_64%,_38%)]" aria-hidden="true" />
          ) : (
            <TrendingDown size={13} className="text-[hsl(var(--destructive))]" aria-hidden="true" />
          )}
          <span className={cn('font-medium', isPositive ? 'text-[hsl(142,_64%,_38%)]' : 'text-[hsl(var(--destructive))]')}>
            {isPositive ? '+' : ''}{data.trend.value}%
          </span>
          <span className="text-[hsl(var(--muted-foreground))]">{data.trend.label}</span>
        </div>
      )}
    </div>
  )
}
