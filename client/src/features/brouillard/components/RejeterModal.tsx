import { useState } from 'react'
import { X, Loader2 } from 'lucide-react'
import { useRejeterBrouillard } from '../hooks/useBrouillard'
import type { BrouillardItem } from '../types'

interface RejeterModalProps {
  brouillard: BrouillardItem
  onClose: () => void
}

export function RejeterModal({ brouillard, onClose }: RejeterModalProps) {
  const [raison, setRaison] = useState('')
  const { mutate: rejeter, isPending } = useRejeterBrouillard()

  const raisonValide = raison.trim() !== ''

  const handleSubmit = () => {
    if (!raisonValide) return
    rejeter({ id: brouillard.id, input: { raison: raison.trim() } }, { onSuccess: onClose })
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={onClose}>
      <div
        className="w-full max-w-md rounded-lg bg-[hsl(var(--card))] shadow-lg"
        onClick={(e) => {
          e.stopPropagation()
        }}
      >
        <div className="flex items-center justify-between border-b border-[hsl(var(--border))] p-4">
          <h3 className="text-lg font-semibold">Rejeter le brouillard</h3>
          <button
            type="button"
            onClick={onClose}
            className="text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))]"
          >
            <X size={18} />
          </button>
        </div>

        <div className="space-y-4 p-4">
          <p className="text-sm text-[hsl(var(--muted-foreground))]">
            N° TS10 <span className="font-medium">{brouillard.numeroTS10}</span> — journée du{' '}
            {new Date(brouillard.journee).toLocaleDateString()}.
          </p>

          <div>
            <label className="mb-1 block text-sm font-medium">Motif du rejet *</label>
            <textarea
              value={raison}
              onChange={(e) => {
                setRaison(e.target.value)
              }}
              rows={3}
              placeholder="Explique pourquoi ce brouillard est rejeté..."
              className="w-full rounded-(--radius) border border-[hsl(var(--input))] bg-[hsl(var(--background))] px-3 py-2 text-sm focus:ring-2 focus:ring-[hsl(var(--ring))] focus:outline-none"
            />
          </div>

          <button
            type="button"
            onClick={handleSubmit}
            disabled={isPending || !raisonValide}
            className="flex w-full items-center justify-center gap-2 rounded-(--radius) bg-[hsl(var(--destructive))] px-3 py-2 text-sm font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-50"
          >
            {isPending && <Loader2 size={16} className="animate-spin" />}
            Rejeter
          </button>
        </div>
      </div>
    </div>
  )
}
