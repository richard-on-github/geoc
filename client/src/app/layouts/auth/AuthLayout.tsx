import { Outlet } from 'react-router'

/**
 * Layout pour les pages publiques (login, reset-password).
 * Centrage vertical/horizontal sur fond neutre institutionnel.
 */
export function AuthLayout() {
  return (
    <div className="min-h-screen bg-[hsl(var(--muted))] flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo GEOC / LONATO */}
        <div className="mb-8 text-center">
          <div className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-[hsl(var(--primary))] mb-4">
            <span className="text-xl font-bold text-white">G</span>
          </div>
          <h1 className="text-2xl font-semibold text-[hsl(var(--foreground))]">GEOC</h1>
          <p className="text-sm text-[hsl(var(--muted-foreground))] mt-1">
            Gestion Électronique des Opérations de la Caisse
          </p>
        </div>

        {/* Contenu de la page (formulaire login, etc.) */}
        <div className="rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] shadow-sm p-8">
          <Outlet />
        </div>

        <p className="text-center text-xs text-[hsl(var(--muted-foreground))] mt-6">
          © {new Date().getFullYear()} LONATO Togo. Tous droits réservés.
        </p>
      </div>
    </div>
  )
}
