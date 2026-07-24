export const AUDIT_QUERY_KEYS = {
  all: ['audit'] as const,
  lists: () => [...AUDIT_QUERY_KEYS.all, 'list'] as const,
  list: (params: any) => [...AUDIT_QUERY_KEYS.lists(), params] as const,
}

export const AUDIT_ACTION_LABELS: Record<string, string> = {
  CREATION: 'Création',
  MODIFICATION: 'Modification',
  VALIDATION: 'Validation',
  SUPPRESSION: 'Suppression',
  REINITIALISATION_MOT_DE_PASSE: 'Réinitialisation mot de passe',
  REJET: 'Rejet',
  CORRECTION: 'Correction',
  IMPORT: 'Import',
  CONNEXION: 'Connexion',
  DECONNEXION: 'Déconnexion',
  // Garder aussi les versions minuscules pour compatibilité si nécessaire
  creation: 'Création',
  modification: 'Modification',
  validation: 'Validation',
  suppression: 'Suppression',
  reinitialisation_mot_de_passe: 'Réinitialisation mot de passe',
  rejet: 'Rejet',
  correction: 'Correction',
  import: 'Import',
  connexion: 'Connexion',
  deconnexion: 'Déconnexion',
}

// Couleurs associées aux actions
export const AUDIT_ACTION_COLORS: Record<string, string> = {
  login: 'info',
  logout: 'neutral',
  create: 'success',
  update: 'warning',
  delete: 'danger',
  activate: 'success',
  deactivate: 'danger',
  CONNEXION: 'info',
  DECONNEXION: 'neutral',
  CREATION: 'success',
  MODIFICATION: 'warning',
  SUPPRESSION: 'danger',
  ACTIVATION: 'success',
  DESACTIVATION: 'danger',
}

// Options pour le filtre "Action" (utilisées dans AuditFilters)
export const AUDIT_ACTION_OPTIONS = [
  { value: 'CREATION', label: 'Création' },
  { value: 'MODIFICATION', label: 'Modification' },
  { value: 'VALIDATION', label: 'Validation' },
  { value: 'SUPPRESSION', label: 'Suppression' },
  { value: 'REINITIALISATION_MOT_DE_PASSE', label: 'Réinitialisation mot de passe' },
  { value: 'REJET', label: 'Rejet' },
  { value: 'CORRECTION', label: 'Correction' },
  { value: 'IMPORT', label: 'Import' },
  { value: 'CONNEXION', label: 'Connexion' },
  { value: 'DECONNEXION', label: 'Déconnexion' },
]

export const AUDIT_ENTITY_OPTIONS = [
  { value: 'User', label: 'Utilisateur' },
  { value: 'Role', label: 'Rôle' },
  { value: 'Permission', label: 'Permission' },
  { value: 'Agence', label: 'Agence' },
  { value: 'Vente', label: 'Vente' },
  { value: 'Audit', label: 'Audit' },
]

export const AUDIT_ENTITY_LABELS: Record<string, string> = {
  User: 'Utilisateur',
  Role: 'Rôle',
  Permission: 'Permission',
  Agence: 'Agence',
  Vente: 'Vente',
  Audit: 'Audit',
}
