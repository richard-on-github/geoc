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

/**
 * Composant RBAC déclaratif.
 *
 * @example
 * <Can permission="user.create">
 *   <CreateUserButton />
 * </Can>
 *
 * <Can anyOf={["user.create", "user.update"]} fallback={<ReadOnlyBadge />}>
 *   <EditButton />
 * </Can>
 *
 * <Can role="Administrateur">
 *   <AdminPanel />
 * </Can>
 */
export function Can({ permission, anyOf, role, fallback = null, children }: CanProps) {
  const { can, canAny, is } = useCan()

  let allowed = true

  if (permission !== undefined) {
    allowed = allowed && can(permission)
  }

  if (anyOf !== undefined) {
    allowed = allowed && canAny(anyOf)
  }

  if (role !== undefined) {
    allowed = allowed && is(role)
  }

  if (!allowed) return <>{fallback}</>

  return <>{children}</>
}
