import { useAuthStore, selectUserPermissions, selectUserRole, selectUser } from '@/features/auth'
import { hasPermission, hasAnyPermission } from '@/shared/lib/rbac'

/**
 * Hook exposant le profil de permissions complet de l'utilisateur connecté.
 * Plus complet que useCan — utile pour les composants qui ont besoin
 * d'afficher des informations contextuelles sur les droits.
 */
export function usePermissions() {
  const user = useAuthStore(selectUser)
  const permissions = useAuthStore(selectUserPermissions)
  const role = useAuthStore(selectUserRole)

  return {
    user,
    role,
    permissions,
    hasPermission: (p: string | string[]) => hasPermission(permissions, p),
    hasAnyPermission: (p: string[]) => hasAnyPermission(permissions, p),
    isAdmin: role?.name === 'Administrateur',
    isSuperAdmin: permissions.includes('*'),
  }
}
