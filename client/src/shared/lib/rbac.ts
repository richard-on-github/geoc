/**
 * Logique RBAC pure — pas de dépendance React.
 * Utilisée par useCan, PermissionGate et les guards de routes.
 *
 * Un utilisateur peut agir si :
 *   1. Il a la permission explicite dans user.permissions
 *   2. Son rôle lui confère la permission (résolution côté backend,
 *      déjà incluse dans user.permissions à la connexion)
 *
 * Les permissions sont des chaînes au format "resource.action"
 * Ex: "user.create", "user.read", "role.delete", "audit.read"
 *
 * Wildcards supportés :
 *   "user.*"  → toutes les actions sur user
 *   "*"       → toutes les permissions (super admin)
 */

export type Permission = string

export function hasPermission(
  userPermissions: Permission[],
  required: Permission | Permission[],
): boolean {
  if (userPermissions.includes('*')) return true

  const requirements = Array.isArray(required) ? required : [required]

  return requirements.every((req) => {
    if (userPermissions.includes(req)) return true

    // Wildcard resource : "user.*" couvre "user.create", "user.read"…
    const [resource] = req.split('.')
    return userPermissions.includes(`${resource}.*`)
  })
}

export function hasAnyPermission(
  userPermissions: Permission[],
  permissions: Permission[],
): boolean {
  if (userPermissions.includes('*')) return true
  return permissions.some((p) => hasPermission(userPermissions, p))
}

export function hasRole(userRoleName: string | undefined, roles: string | string[]): boolean {
  if (userRoleName === undefined) return false
  const required = Array.isArray(roles) ? roles : [roles]
  return required.includes(userRoleName)
}
