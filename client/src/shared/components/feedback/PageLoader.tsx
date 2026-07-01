import { cn } from '@/shared/lib'

interface PageLoaderProps {
  className?: string
}

export function PageLoader({ className }: PageLoaderProps) {
  return (
    <div
      className={cn(
        'flex min-h-[400px] w-full items-center justify-center',
        className,
      )}
      role="status"
      aria-label="Chargement en cours"
    >
      <div className="flex flex-col items-center gap-3">
        <div
          className="h-8 w-8 animate-spin rounded-full border-2 border-neutral-200 border-t-[hsl(var(--primary))]"
          aria-hidden="true"
        />
        <p className="text-sm text-[hsl(var(--muted-foreground))]">Chargement...</p>
      </div>
    </div>
  )
}
