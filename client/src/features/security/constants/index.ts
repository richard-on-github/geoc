export const SECURITY_QUERY_KEYS = {
  roles: {
    all: ['roles'] as const,
    lists: () => [...SECURITY_QUERY_KEYS.roles.all, 'list'] as const,
    detail: (id: string) => [...SECURITY_QUERY_KEYS.roles.all, 'detail', id] as const,
  },
  permissions: {
    all: ['permissions'] as const,
    lists: () => [...SECURITY_QUERY_KEYS.permissions.all, 'list'] as const,
  },
} as const

export const RESOURCE_LABELS: Record<string, string> = {
  user: 'Utilisateurs',
  role: 'Rôles',
  permission: 'Permissions',
  audit: 'Audit',
  dashboard: 'Tableau de bord',
  agence: 'Agences',
  cashier: 'Caisses',
  operation: 'Opérations',
  brouillard: 'Brouillard',
  caisse: 'Caisse',
  garantie: 'Garantie',
  ts10: 'TS10',
}
