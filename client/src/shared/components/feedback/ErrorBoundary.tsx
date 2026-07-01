import { Component, type ErrorInfo, type ReactNode } from 'react'
import { AlertTriangle } from 'lucide-react'

interface ErrorBoundaryProps {
  children: ReactNode
  fallback?: ReactNode
}

interface ErrorBoundaryState {
  hasError: boolean
  error: Error | null
}

/**
 * Error Boundary global — capture les erreurs de rendu React
 * non gérées par les états Loading/Error des pages individuelles.
 * À placer autour du routeur dans App.tsx.
 */
export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error }
  }

  override componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    // eslint-disable-next-line no-console
    console.error('Erreur applicative non gérée :', error, errorInfo)
  }

  private handleReload = (): void => {
    window.location.reload()
  }

  override render(): ReactNode {
    if (this.state.hasError) {
      if (this.props.fallback !== undefined) return this.props.fallback

      return (
        <div className="flex min-h-screen items-center justify-center bg-[hsl(var(--background))] p-4">
          <div className="flex max-w-sm flex-col items-center text-center gap-3">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[hsl(var(--destructive))]/10">
              <AlertTriangle size={26} className="text-[hsl(var(--destructive))]" aria-hidden="true" />
            </div>
            <div>
              <h1 className="text-lg font-semibold text-[hsl(var(--foreground))]">
                Une erreur inattendue est survenue
              </h1>
              <p className="mt-1.5 text-sm text-[hsl(var(--muted-foreground))]">
                L'application a rencontré un problème. Vous pouvez recharger la page
                ou contacter le support si le problème persiste.
              </p>
            </div>
            <button
              type="button"
              onClick={this.handleReload}
              className="mt-2 rounded-[var(--radius)] bg-[hsl(var(--primary))] px-4 py-2 text-sm font-medium text-[hsl(var(--primary-foreground))] hover:opacity-90 transition-opacity"
            >
              Recharger la page
            </button>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}
