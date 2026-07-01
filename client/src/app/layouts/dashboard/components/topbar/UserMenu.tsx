import { LogOut, User, KeyRound, ChevronDown } from 'lucide-react'
import { useAuthStore, selectUser, useLogout } from '@/features/auth'
import { getInitials } from '@/shared/utils'
import { cn } from '@/shared/lib'
import { useState, useRef, useEffect } from 'react'

export function UserMenu() {
  const user = useAuthStore(selectUser)
  const { mutate: logout, isPending } = useLogout()
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  // Fermeture au clic extérieur
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current !== null && !ref.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  if (user === null) return null

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="true"
        aria-expanded={open}
        className={cn(
          'flex items-center gap-2 rounded-lg px-2 py-1.5 text-sm transition-colors',
          'text-[hsl(var(--foreground))] hover:bg-[hsl(var(--muted))]',
        )}
      >
        {/* Avatar */}
        <div className="flex h-7 w-7 items-center justify-center rounded-full bg-[hsl(var(--primary))] text-xs font-semibold text-white shrink-0">
          {getInitials(user.fullName)}
        </div>
        <div className="hidden sm:block text-left min-w-0">
          <p className="text-sm font-medium truncate max-w-[140px]">{user.fullName}</p>
          <p className="text-xs text-[hsl(var(--muted-foreground))] truncate max-w-[140px]">
            {user.role.displayName}
          </p>
        </div>
        <ChevronDown
          size={14}
          className={cn('shrink-0 text-[hsl(var(--muted-foreground))] transition-transform', open && 'rotate-180')}
          aria-hidden="true"
        />
      </button>

      {/* Dropdown */}
      {open && (
        <div
          role="menu"
          className={cn(
            'absolute right-0 top-full z-50 mt-1 w-56 rounded-lg border border-[hsl(var(--border))]',
            'bg-[hsl(var(--card))] shadow-md py-1',
          )}
        >
          {/* Info utilisateur */}
          <div className="px-3 py-2 border-b border-[hsl(var(--border))]">
            <p className="text-sm font-medium">{user.fullName}</p>
            <p className="text-xs text-[hsl(var(--muted-foreground))] truncate">{user.email}</p>
          </div>

          {/* Actions */}
          <div className="py-1">
            <button
              type="button"
              role="menuitem"
              className="flex w-full items-center gap-2.5 px-3 py-2 text-sm text-[hsl(var(--foreground))] hover:bg-[hsl(var(--muted))] transition-colors"
              onClick={() => setOpen(false)}
            >
              <User size={15} className="text-[hsl(var(--muted-foreground))]" aria-hidden="true" />
              Mon profil
            </button>
            <button
              type="button"
              role="menuitem"
              className="flex w-full items-center gap-2.5 px-3 py-2 text-sm text-[hsl(var(--foreground))] hover:bg-[hsl(var(--muted))] transition-colors"
              onClick={() => setOpen(false)}
            >
              <KeyRound size={15} className="text-[hsl(var(--muted-foreground))]" aria-hidden="true" />
              Changer le mot de passe
            </button>
          </div>

          {/* Logout */}
          <div className="border-t border-[hsl(var(--border))] py-1">
            <button
              type="button"
              role="menuitem"
              disabled={isPending}
              onClick={() => { setOpen(false); logout() }}
              className="flex w-full items-center gap-2.5 px-3 py-2 text-sm text-[hsl(var(--destructive))] hover:bg-[hsl(var(--destructive))]/10 transition-colors disabled:opacity-50"
            >
              <LogOut size={15} aria-hidden="true" />
              {isPending ? 'Déconnexion...' : 'Se déconnecter'}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
