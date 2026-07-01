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

  let allowed = true

  if (permission !== undefined) allowed = allowed && can(permission)
  if (anyOf !== undefined) allowed = allowed && canAny(anyOf)
  if (role !== undefined) allowed = allowed && is(role)

  if (!allowed) {
    if (fallback !== undefined) return <>{fallback}</>
    return <Navigate to={redirectTo} replace />
  }

  return <>{children}</>
}
