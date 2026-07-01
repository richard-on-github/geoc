import { ChevronRight, Home } from 'lucide-react'
import { Link, useLocation } from 'react-router'

const ROUTE_LABELS: Record<string, string> = {
  dashboard: 'Tableau de bord',
  users: 'Utilisateurs',
  security: 'Sécurité',
  roles: 'Rôles',
  permissions: 'Permissions',
  audit: 'Journal d\'audit',
  'my-permissions': 'Mes permissions',
}

function buildCrumbs(pathname: string): { label: string; href: string }[] {
  const segments = pathname.split('/').filter(Boolean)

  return segments.map((segment, index) => {
    const href = '/' + segments.slice(0, index + 1).join('/')
    // Segments dynamiques (IDs) — affichage générique
    const isId = /^[0-9a-f-]{8,}$/i.test(segment)
    const label = isId ? 'Détail' : (ROUTE_LABELS[segment] ?? segment)
    return { label, href }
  })
}

export function Breadcrumb() {
  const { pathname } = useLocation()
  const crumbs = buildCrumbs(pathname)

  if (crumbs.length === 0) return null

  return (
    <nav aria-label="Fil d'Ariane" className="flex items-center gap-1 text-sm">
      <Link
        to="/dashboard"
        className="text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))] transition-colors"
        aria-label="Accueil"
      >
        <Home size={14} aria-hidden="true" />
      </Link>

      {crumbs.map((crumb, index) => {
        const isLast = index === crumbs.length - 1
        return (
          <span key={crumb.href} className="flex items-center gap-1">
            <ChevronRight size={13} className="text-[hsl(var(--muted-foreground))] opacity-50" aria-hidden="true" />
            {isLast ? (
              <span className="font-medium text-[hsl(var(--foreground))]" aria-current="page">
                {crumb.label}
              </span>
            ) : (
              <Link
                to={crumb.href}
                className="text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))] transition-colors"
              >
                {crumb.label}
              </Link>
            )}
          </span>
        )
      })}
    </nav>
  )
}
