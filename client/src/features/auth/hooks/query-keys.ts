/**
 * Factory de query keys pour le domaine auth.
 * Centralise les clés pour éviter les collisions et faciliter les invalidations.
 */
export const authQueryKeys = {
  all: ['auth'] as const,
  me: () => [...authQueryKeys.all, 'me'] as const,
}
