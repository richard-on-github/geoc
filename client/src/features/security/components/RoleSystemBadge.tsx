import { ShieldCheck } from 'lucide-react'
import { cn } from '@/shared/lib'

interface RoleSystemBadgeProps {
  isSystem: boolean
  className?: string
}

export function RoleSystemBadge({ isSystem, className }: RoleSystemBadgeProps) {
  if (!isSystem) return null
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-full bg-[hsl(var(--primary))]/10 px-2 py-0.5 text-[10px] font-semibold text-[hsl(var(--primary))] uppercase tracking-wide',
        className,
      )}
    >
      <ShieldCheck size={10} aria-hidden="true" />
      Système
    </span>
  )
}
