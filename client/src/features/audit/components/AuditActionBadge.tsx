import { cn } from '@/shared/lib'
import { AUDIT_ACTION_LABELS, AUDIT_ACTION_COLORS } from '../constants'

const COLOR_CLASSES: Record<string, string> = {
  success: 'bg-[hsl(142,_64%,_96%)] text-[hsl(142,_64%,_28%)]',
  info: 'bg-[hsl(213,_94%,_96%)] text-[hsl(213,_94%,_35%)]',
  danger: 'bg-[hsl(0,_84%,_97%)] text-[hsl(var(--destructive))]',
  warning: 'bg-[hsl(38,_92%,_96%)] text-[hsl(38,_92%,_35%)]',
  neutral: 'bg-[hsl(var(--muted))] text-[hsl(var(--muted-foreground))]',
}

export function AuditActionBadge({ action }: { action: string }) {
  const color = AUDIT_ACTION_COLORS[action] ?? 'neutral'
  const label = AUDIT_ACTION_LABELS[action] ?? action

  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium',
        COLOR_CLASSES[color],
      )}
    >
      {label}
    </span>
  )
}
