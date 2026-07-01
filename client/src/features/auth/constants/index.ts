export const AUTH_STORAGE_KEYS = {
  ACCESS_TOKEN:  'geoc_access_token',
  REFRESH_TOKEN: 'geoc_refresh_token',
  USER:          'geoc_user',
} as const

export const AUTH_ROUTES = {
  LOGIN:          '/login',
  RESET_PASSWORD: '/reset-password',
  DASHBOARD:      '/dashboard',
} as const

/**
 * Marge de sécurité avant expiration du token (30 secondes).
 * Le refresh est déclenché si le token expire dans moins de REFRESH_MARGIN ms.
 */
export const TOKEN_REFRESH_MARGIN_MS = 30_000

/**
 * Rôles système — ne peuvent jamais être supprimés.
 */
export const SYSTEM_ROLE_NAMES = [
  'Administrateur',
  'Direction',
  'Caissier',
  'Chef d\'Agence',
  'Contrôleur',
  'Auditeur',
  'Comptable',
] as const

export type SystemRoleName = (typeof SYSTEM_ROLE_NAMES)[number]
