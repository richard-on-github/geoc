import type { ReactNode } from 'react'
import { Navigate, useLocation } from 'react-router'
import { useAuthStore, selectIsAuthenticated, selectIsInitialized } from '@/features/auth'
import { PageLoader } from '@/shared/components/feedback/PageLoader'

interface ProtectedRouteProps {
  children: ReactNode
}

/**
 * Protège une route par authentification.
 * - Si non initialisé : affiche le loader (hydratation du store en cours)
 * - Si non authentifié : redirige vers /login en conservant la destination
 * - Si authentifié : rend les children
 */
export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const isAuthenticated = useAuthStore(selectIsAuthenticated)
  const isInitialized = useAuthStore(selectIsInitialized)
  const location = useLocation()

  if (!isInitialized) {
    return <PageLoader />
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  return <>{children}</>
}
