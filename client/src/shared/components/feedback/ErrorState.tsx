import { AlertCircle } from 'lucide-react'
import { cn } from '@/shared/lib'

interface ErrorStateProps {
  title?: string
  message?: string
  onRetry?: () => void
  className?: string
}

export function ErrorState({
  title = 'Une erreur est survenue',
  message,
  onRetry,
  className,
}: ErrorStateProps) {
  return (
    <div className={cn('flex flex-col items-center justify-center py-16 text-center', className)}>
      <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-[hsl(var(--destructive))]/10">
        <AlertCircle size={22} className="text-[hsl(var(--destructive))]" aria-hidden="true" />
      </div>
      <p className="text-sm font-medium text-[hsl(var(--foreground))]">{title}</p>
      {message !== undefined && (
        <p className="mt-1 text-sm text-[hsl(var(--muted-foreground))] max-w-sm">{message}</p>
      )}
      {onRetry !== undefined && (
        <button
          type="button"
          onClick={onRetry}
          className="mt-4 rounded-[var(--radius)] border border-[hsl(var(--border))] px-4 py-2 text-sm font-medium hover:bg-[hsl(var(--muted))] transition-colors"
        >
          Réessayer
        </button>
      )}
    </div>
  )
}
