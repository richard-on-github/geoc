import { useAuthStore, selectUserPermissions, selectUserRole } from '@/features/auth'
import { hasPermission, hasAnyPermission, hasRole, type Permission } from '@/shared/lib/rbac'

/**
 * Hook RBAC principal.
 *
 * @example
 * const { can, canAny, is } = useCan()
 * can('user.create')           // permission unique
 * can(['user.create', 'user.update'])  // toutes les permissions requises
 * canAny(['user.create', 'role.read']) // au moins une permission
 * is('Administrateur')         // vérification de rôle
 */
export function useCan() {
  const permissions = useAuthStore(selectUserPermissions)
  const role = useAuthStore(selectUserRole)

  return {
    can: (permission: Permission | Permission[]) =>
      hasPermission(permissions, permission),

    canAny: (perms: Permission[]) =>
      hasAnyPermission(permissions, perms),

    is: (roleName: string | string[]) =>
      hasRole(role?.name, roleName),

    permissions,
    role,
  }
}
