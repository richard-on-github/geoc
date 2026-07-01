export const AUDIT_QUERY_KEYS = {
  all: ['audit'] as const,
  lists: () => [...AUDIT_QUERY_KEYS.all, 'list'] as const,
  list: (params: any) => [...AUDIT_QUERY_KEYS.lists(), params] as const,
}

export const AUDIT_ACTION_OPTIONS = [
  { value: 'CREATION', label: 'Création' },
  { value: 'MODIFICATION', label: 'Modification' },
  { value: 'SUPPRESSION', label: 'Suppression' },
  { value: 'VALIDATION', label: 'Validation' },
  { value: 'REJET', label: 'Rejet' },
  { value: 'CONNEXION', label: 'Connexion' },
  { value: 'DECONNEXION', label: 'Déconnexion' },
  { value: 'REINITIALISATION_MOT_DE_PASSE', label: 'Réinitialisation mot de passe' },
  { value: 'CORRECTION', label: 'Correction' },
  { value: 'IMPORT', label: 'Import' },
] as const

export const AUDIT_ACTION_LABELS = Object.fromEntries(
  AUDIT_ACTION_OPTIONS.map(({ value, label }) => [value, label]),
)

export const AUDIT_ACTION_COLORS: Record<string, string> = {
  CREATION: 'success',
  MODIFICATION: 'info',
  SUPPRESSION: 'danger',
  VALIDATION: 'success',
  REJET: 'danger',
  CONNEXION: 'info',
  DECONNEXION: 'neutral',
  REINITIALISATION_MOT_DE_PASSE: 'warning',
  CORRECTION: 'warning',
  IMPORT: 'info',
}

export const AUDIT_ENTITY_OPTIONS = [
  { value: 'User', label: 'Utilisateur' },
  { value: 'Role', label: 'Rôle' },
  { value: 'Permission', label: 'Permission' },
  { value: 'Agency', label: 'Agence' },
  { value: 'Cashier', label: 'Caisse' },
] as const

export const AUDIT_ENTITY_LABELS = Object.fromEntries(
  AUDIT_ENTITY_OPTIONS.map(({ value, label }) => [value, label]),
)
