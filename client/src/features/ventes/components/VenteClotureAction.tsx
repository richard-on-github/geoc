import { useState } from 'react'
import { ShieldAlert, Undo2, X } from 'lucide-react'
import { useClotures, useCloturerMois, useAnnulerCloture } from '../hooks'
import { Can } from '@/shared/components/navigation/Can'
import { cn } from '@/shared/lib'
import { NOMS_MOIS } from '../../../shared/utils'

interface VenteClotureActionProps {
  annee: number
  mois: number
}

/**
 * Affiche "Clôturer {mois}" si la période (annee-mois) n'a pas encore de
 * clôture, ou "Annuler la clôture de {mois}" si elle en a déjà une. N'est
 * rendu que dans la vue "Mois" (voir VentesBrowser), par construction.
 */
export function VenteClotureAction({ annee, mois }: VenteClotureActionProps) {
  const periode = `${String(annee)}-${String(mois).padStart(2, '0')}`

  const { data: clotures } = useClotures()
  const clotureExistante = clotures?.find((c) => c.periode === periode)

  const { mutate: cloturerMois, isPending: isCloturing } = useCloturerMois()
  const { mutate: annulerCloture, isPending: isAnnulation } = useAnnulerCloture()

  const [isConfirmOpen, setIsConfirmOpen] = useState(false)
  const isPending = isCloturing || isAnnulation

  const handleConfirmer = () => {
    if (clotureExistante) {
      annulerCloture(periode, {
        onSuccess: () => {
          setIsConfirmOpen(false)
        },
      })
    } else {
      cloturerMois(periode, {
        onSuccess: () => {
          setIsConfirmOpen(false)
        },
      })
    }
  }

  return (
    <Can permission="vente.cloture">
      <button
        type="button"
        onClick={() => {
          setIsConfirmOpen(true)
        }}
        className={cn(
          'inline-flex items-center gap-2 rounded-(--radius) px-4 py-2 text-sm font-medium transition-opacity hover:opacity-90',
          clotureExistante
            ? 'border border-[hsl(var(--border))] bg-[hsl(var(--card))] text-[hsl(var(--foreground))] hover:bg-[hsl(var(--muted))]'
            : 'bg-[hsl(var(--destructive))] text-[hsl(var(--destructive-foreground))]',
        )}
      >
        {clotureExistante ? <Undo2 size={16} /> : <ShieldAlert size={16} />}
        {clotureExistante
          ? `Annuler la clôture de ${String(NOMS_MOIS[mois - 1])}`
          : `Clôturer ${String(NOMS_MOIS[mois - 1])}`}
      </button>

      {isConfirmOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-6 shadow-lg">
            <div className="flex items-start justify-between">
              <h3 className="text-lg font-semibold">
                {clotureExistante ? 'Annuler la clôture' : 'Clôturer le mois'}
              </h3>
              <button
                type="button"
                onClick={() => {
                  setIsConfirmOpen(false)
                }}
              >
                <X size={18} />
              </button>
            </div>

            <p className="mt-4 text-sm text-[hsl(var(--muted-foreground))]">
              {clotureExistante
                ? `Voulez-vous rouvrir la période ${periode} ? Cela n'est possible que si aucune vente n'existe encore pour le mois suivant.`
                : `Voulez-vous clôturer la période ${periode} ? Toutes les ventes non clôturées de ce mois seront verrouillées.`}
            </p>

            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => {
                  setIsConfirmOpen(false)
                }}
                disabled={isPending}
                className="rounded-md border border-[hsl(var(--border))] px-4 py-2 text-sm hover:bg-[hsl(var(--muted))]"
              >
                Annuler
              </button>
              <button
                type="button"
                onClick={handleConfirmer}
                disabled={isPending}
                className="rounded-md bg-[hsl(var(--destructive))] px-4 py-2 text-sm font-medium text-[hsl(var(--destructive-foreground))] hover:opacity-90 disabled:opacity-50"
              >
                {isPending ? 'Traitement...' : 'Confirmer'}
              </button>
            </div>
          </div>
        </div>
      )}
    </Can>
  )
}
