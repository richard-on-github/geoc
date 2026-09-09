import { useState } from 'react'
import { X, Loader2 } from 'lucide-react'
import { useClotureBrouillard } from '../hooks/useBrouillard'
import type { BrouillardItem } from '../types'

interface ClotureModalProps {
  brouillard: BrouillardItem
  onClose: () => void
}

export function ClotureModal({ brouillard, onClose }: ClotureModalProps) {
  const [situation, setSituation] = useState('')
  const { mutate: cloturer, isPending } = useClotureBrouillard()

  const handleSubmit = () => {
    const situationSaisie = situation.trim()
    cloturer(
      {
        id: brouillard.id,
        input: situationSaisie !== '' ? { situation: situationSaisie } : {},
      },
      { onSuccess: onClose },
    )
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md rounded-lg bg-[hsl(var(--card))] shadow-lg"
        onClick={(e) => {
          e.stopPropagation()
        }}
      >
        <div className="flex items-center justify-between border-b border-[hsl(var(--border))] p-4">
          <h3 className="text-lg font-semibold">Clôturer le brouillard</h3>
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
            {new Date(brouillard.journee).toLocaleDateString()}. Une fois clôturé, les valeurs sont
            figées : les encaissements ultérieurs ne les modifieront plus.
          </p>

          <div>
            <label className="mb-1 block text-sm font-medium">Situation (facultatif)</label>
            <textarea
              value={situation}
              onChange={(e) => {
                setSituation(e.target.value)
              }}
              rows={3}
              placeholder="Note libre sur la journée..."
              className="w-full rounded-(--radius) border border-[hsl(var(--input))] bg-[hsl(var(--background))] px-3 py-2 text-sm focus:ring-2 focus:ring-[hsl(var(--ring))] focus:outline-none"
            />
          </div>

          <button
            type="button"
            onClick={handleSubmit}
            disabled={isPending}
            className="flex w-full items-center justify-center gap-2 rounded-(--radius) bg-[hsl(var(--primary))] px-3 py-2 text-sm font-medium text-[hsl(var(--primary-foreground))] transition-opacity hover:opacity-90 disabled:opacity-50"
          >
            {isPending && <Loader2 size={16} className="animate-spin" />}
            Clôturer
          </button>
        </div>
      </div>
    </div>
  )
}
