import { Outlet } from 'react-router'
import logoLonato from '@/assets/images/logo-lonato.png'

export function AuthLayout() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[hsl(var(--muted))] p-4">
      <div className="w-full max-w-md">
        {/* Logo LONATO */}
        <div className="mb-8 text-center">
          <div className="mb-4 inline-flex h-12 w-12 items-center justify-center overflow-hidden rounded-xl bg-[hsl(var(--primary))]">
            <img src={logoLonato} alt="Lonato" className="h-full w-full object-contain" />
          </div>
          <h1 className="text-2xl font-semibold text-[hsl(var(--foreground))]">GEOC</h1>
          <p className="mt-1 text-sm text-[hsl(var(--muted-foreground))]">
            Gestion Électronique des Opérations de la Caisse
          </p>
        </div>

        {/* Contenu de la page (formulaire login, etc.) */}
        <div className="rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-8 shadow-sm">
          <Outlet />
        </div>

        <p className="mt-6 text-center text-xs text-[hsl(var(--muted-foreground))]">
          © {new Date().getFullYear()} LONATO Togo. Tous droits réservés.
        </p>
      </div>
    </div>
  )
}
