import type { ReactNode } from 'react'
import { useCan } from '@/shared/hooks/useCan'

interface CanProps {
  /** Permission(s) requises — toutes doivent être satisfaites */
  permission?: string | string[]
  /** Au moins une des permissions doit être satisfaite */
  anyOf?: string[]
  /** Rôle(s) requis */
  role?: string | string[]
  /** Rendu si l'accès est refusé (optionnel) */
  fallback?: ReactNode
  children: ReactNode
}


export function Can({ permission, anyOf, role, fallback = null, children }: CanProps) {
  const { can, canAny, is } = useCan()

  const hasPermission = permission === undefined ? true : can(permission)
  const hasAnyPermission = anyOf === undefined ? true : canAny(anyOf)
  const hasRole = role === undefined ? true : is(role)

  if (!hasPermission || !hasAnyPermission || !hasRole) {
    return <>{fallback}</>
  }

  return <>{children}</>
}
