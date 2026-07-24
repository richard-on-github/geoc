import {
  LayoutDashboard,
  Users,
  ShieldCheck,
  ClipboardList,
  Key,
  Building2, // Nouveau
  ShoppingCart, // Nouveau
  type LucideIcon,
} from 'lucide-react'

export interface NavItem {
  id: string
  label: string
  href?: string
  icon: LucideIcon
  permission?: string
  children?: NavChildItem[]
  badge?: string
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
  },
  {
    id: 'users',
    label: 'Utilisateurs',
    href: '/users',
    icon: Users,
    permission: 'user.read',
  },
  {
    id: 'agences',
    label: 'Agences',
    href: '/agences',
    icon: Building2,
    permission: 'agence.read',
  },
  {
    id: 'ventes',
    label: 'Ventes',
    href: '/ventes',
    icon: ShoppingCart,
    permission: 'vente.read',
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
    label: "Journal d'audit",
    href: '/audit',
    icon: ClipboardList,
    permission: 'audit.read',
  },
]

export const navigationBottomConfig: NavItem[] = [
  {
    id: 'my-permissions',
    label: 'Mes permissions',
    href: '/my-permissions',
    icon: Key,
  },
]
