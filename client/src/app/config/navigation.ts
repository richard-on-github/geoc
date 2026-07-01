import {
  LayoutDashboard,
  Users,
  ShieldCheck,
  ClipboardList,
  Key,
  type LucideIcon,
} from 'lucide-react'

/**
 * Définition déclarative de la navigation GEOC.
 * Chaque entrée déclare sa permission requise.
 * La sidebar filtre dynamiquement selon les permissions de l'utilisateur.
 *
 * Structure extensible : ajouter un module = ajouter un NavItem ici.
 */

export interface NavItem {
  id: string
  label: string
  href?: string
  icon: LucideIcon
  permission?: string           // permission requise pour voir cette entrée
  children?: NavChildItem[]
  badge?: string                // badge optionnel (ex: "Nouveau")
}

export interface NavChildItem {
  id: string
  label: string
  href: string
  permission?: string
}

export const navigationConfig: NavItem[] = [
  {
    id: 'dashboard',
    label: 'Tableau de bord',
    href: '/dashboard',
    icon: LayoutDashboard,
    // Accessible à tous les utilisateurs authentifiés
  },
  {
    id: 'users',
    label: 'Utilisateurs',
    href: '/users',
    icon: Users,
    permission: 'user.read',
  },
  {
    id: 'security',
    label: 'Sécurité',
    icon: ShieldCheck,
    permission: 'role.read',
    children: [
      {
        id: 'security-roles',
        label: 'Rôles',
        href: '/security/roles',
        permission: 'role.read',
      },
      {
        id: 'security-permissions',
        label: 'Permissions',
        href: '/security/permissions',
        permission: 'permission.read',
      },
    ],
  },
  {
    id: 'audit',
    label: 'Journal d\'audit',
    href: '/audit',
    icon: ClipboardList,
    permission: 'audit.read',
  },
]

/**
 * Entrées réservées au bas de la sidebar (settings, etc.)
 */
export const navigationBottomConfig: NavItem[] = [
  {
    id: 'my-permissions',
    label: 'Mes permissions',
    href: '/my-permissions',
    icon: Key,
  },
]
