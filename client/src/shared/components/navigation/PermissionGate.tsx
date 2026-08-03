import type { ReactNode } from 'react'
import { Navigate } from 'react-router'
import { useCan } from '@/shared/hooks/useCan'

interface PermissionGateProps {
  permission?: string | string[]
  anyOf?: string[]
  role?: string | string[]
  /** Redirection si accès refusé (défaut : /dashboard) */
  redirectTo?: string
  /** Affiche un fallback au lieu de rediriger */
  fallback?: ReactNode
  children: ReactNode
}

/**
 * Gate de protection — redirige ou affiche un fallback si l'accès est refusé.
 * Utilisé pour les routes et les sections de pages entières.
 *
 * @example
 * // Dans le routeur
 * <PermissionGate permission="user.read" redirectTo="/dashboard">
 *   <UsersListPage />
 * </PermissionGate>
 */
export function PermissionGate({
  permission,
  anyOf,
  role,
  redirectTo = '/dashboard',
  fallback,
  children,
}: PermissionGateProps) {
  const { can, canAny, is } = useCan()

  const hasPermission = permission === undefined ? true : can(permission)
  const hasAnyPermission = anyOf === undefined ? true : canAny(anyOf)
  const hasRole = role === undefined ? true : is(role)

  if (!hasPermission || !hasAnyPermission || !hasRole) {
    if (fallback !== undefined) return <>{fallback}</>
    return <Navigate to={redirectTo} replace />
  }

  return <>{children}</>
}
