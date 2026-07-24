import { useDeleteAgence } from '../hooks'
import { type Agence } from '../types'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/shared/components/ui/dialog'

interface DeleteAgenceDialogProps {
  agence: Agence
  onClose: () => void
}

export function DeleteAgenceDialog({ agence, onClose }: DeleteAgenceDialogProps) {
  const { mutate: deleteAgence, isPending } = useDeleteAgence()

  const handleDelete = () => {
    deleteAgence(agence.id, {
      onSuccess: () => {
        onClose()
      },
    })
  }

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Supprimer l'agence</DialogTitle>
          <DialogDescription>
            Êtes-vous sûr de vouloir supprimer l'agence <strong>{agence.nom}</strong> ? Cette action
            est irréversible.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <button
            type="button"
            onClick={onClose}
            disabled={isPending}
            className="rounded-[var(--radius)] border border-[hsl(var(--border))] px-4 py-2 text-sm font-medium transition-colors hover:bg-[hsl(var(--muted))]"
          >
            Annuler
          </button>
          <button
            type="button"
            onClick={handleDelete}
            disabled={isPending}
            className="rounded-[var(--radius)] bg-[hsl(var(--destructive))] px-4 py-2 text-sm font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-50"
          >
            {isPending ? 'Suppression...' : 'Supprimer'}
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
