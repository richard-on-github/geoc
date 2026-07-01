import { Loader2, AlertTriangle } from 'lucide-react'
import { useDeleteRole } from '../hooks'
import type { Role } from '../types'

interface DeleteRoleDialogProps {
  role: Role
  onClose: () => void
}

export function DeleteRoleDialog({ role, onClose }: DeleteRoleDialogProps) {
  const { mutate: deleteRole, isPending } = useDeleteRole()

  const handleConfirm = () => {
    deleteRole(role.id, { onSuccess: onClose })
  }

  return (
    <div role="alertdialog" aria-modal="true" aria-labelledby="delete-role-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative z-10 w-full max-w-sm rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] shadow-lg p-6">
        <div className="flex flex-col items-center text-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[hsl(var(--destructive))]/10">
            <AlertTriangle size={22} className="text-[hsl(var(--destructive))]" aria-hidden="true" />
          </div>
          <div>
            <h2 id="delete-role-title" className="text-base font-semibold">Supprimer le rôle</h2>
            <p className="mt-1.5 text-sm text-[hsl(var(--muted-foreground))]">
              Voulez-vous vraiment supprimer le rôle{' '}
              <span className="font-medium text-[hsl(var(--foreground))]">{role.displayName}</span> ?
              {role.userCount > 0 && (
                <span className="block mt-1.5 text-[hsl(var(--destructive))]">
                  {role.userCount} utilisateur{role.userCount > 1 ? 's' : ''} {role.userCount > 1 ? 'sont' : 'est'} actuellement assigné{role.userCount > 1 ? 's' : ''} à ce rôle.
                </span>
              )}
            </p>
          </div>
          <div className="flex w-full gap-3 pt-1">
            <button type="button" onClick={onClose} disabled={isPending}
              className="flex-1 rounded-[var(--radius)] border border-[hsl(var(--border))] px-4 py-2 text-sm font-medium hover:bg-[hsl(var(--muted))] transition-colors disabled:opacity-50">
              Annuler
            </button>
            <button type="button" onClick={handleConfirm} disabled={isPending}
              className="flex flex-1 items-center justify-center gap-2 rounded-[var(--radius)] bg-[hsl(var(--destructive))] px-4 py-2 text-sm font-medium text-white hover:opacity-90 transition-opacity disabled:opacity-60">
              {isPending && <Loader2 size={14} className="animate-spin" aria-hidden="true" />}
              {isPending ? 'Suppression...' : 'Supprimer'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
