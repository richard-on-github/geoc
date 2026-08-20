import { useState } from 'react'
import { X, Loader2 } from 'lucide-react'
import { useEnregistrerVersement } from '../hooks/useAbattements'
import type { VenteAvecAbattement } from '../types'
import { formatCurrency } from '@/shared/utils'

interface VersementModalProps {
  vente: VenteAvecAbattement
  onClose: () => void
}

/** Convertit une Date en valeur compatible avec <input type="datetime-local"> (heure locale du navigateur). */
function toDatetimeLocalValue(date: Date): string {
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${String(date.getFullYear())}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`
}

export function VersementModal({ vente, onClose }: VersementModalProps) {
  const { mutate: enregistrer, isPending } = useEnregistrerVersement()

  const [montant, setMontant] = useState<string>(
    vente.abattementVersement ? String(vente.abattementVersement.montantVerse) : '',
  )
  const [dateHeure, setDateHeure] = useState<string>(
    vente.abattementVersement
      ? toDatetimeLocalValue(new Date(vente.abattementVersement.dateVersement))
      : toDatetimeLocalValue(new Date()),
  )

  const montantValide = montant !== '' && Number(montant) >= 0
  const dateValide = dateHeure !== ''

  const handleSubmit = () => {
    if (!montantValide || !dateValide) return

    enregistrer(
      {
        venteId: vente.id,
        montantVerse: Number(montant),
        // dateHeure est en heure locale du navigateur ; new Date(...) la
        // convertit correctement en instant absolu avant le .toISOString().
        dateVersement: new Date(dateHeure).toISOString(),
      },
      { onSuccess: onClose },
    )
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
          <h3 className="text-lg font-semibold">Enregistrer le versement</h3>
          <button
            type="button"
            onClick={onClose}
            className="text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))]"
          >
            <X size={18} />
          </button>
        </div>

        <div className="space-y-4 p-4">
          <div className="rounded-(--radius) bg-[hsl(var(--muted))] p-3 text-sm">
            <p>
              <span className="text-[hsl(var(--muted-foreground))]">N° OP :</span>{' '}
              <span className="font-medium">{vente.numeroTS10}</span>
            </p>
            <p>
              <span className="text-[hsl(var(--muted-foreground))]">Ventes attendues :</span>{' '}
              <span className="font-medium">{formatCurrency(vente.totalVente)}</span>
            </p>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium">Montant versé</label>
            <input
              type="number"
              min={0}
              step="1"
              value={montant}
              onChange={(e) => {
                setMontant(e.target.value)
              }}
              placeholder="Montant en FCFA"
              className="w-full rounded-(--radius) border border-[hsl(var(--input))] bg-[hsl(var(--background))] px-3 py-2 text-sm focus:ring-2 focus:ring-[hsl(var(--ring))] focus:outline-none"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium">Date et heure du versement</label>
            <input
              type="datetime-local"
              value={dateHeure}
              onChange={(e) => {
                setDateHeure(e.target.value)
              }}
              className="w-full rounded-(--radius) border border-[hsl(var(--input))] bg-[hsl(var(--background))] px-3 py-2 text-sm focus:ring-2 focus:ring-[hsl(var(--ring))] focus:outline-none"
            />
          </div>

          <button
            type="button"
            onClick={handleSubmit}
            disabled={isPending || !montantValide || !dateValide}
            className="flex w-full items-center justify-center gap-2 rounded-(--radius) bg-[hsl(var(--primary))] px-3 py-2 text-sm font-medium text-[hsl(var(--primary-foreground))] transition-opacity hover:opacity-90 disabled:opacity-50"
          >
            {isPending && <Loader2 size={16} className="animate-spin" />}
            Enregistrer
          </button>
        </div>
      </div>
    </div>
  )
}
