import { useState } from 'react'
import { X, Loader2, History, AlertTriangle, Download, CheckCircle2 } from 'lucide-react'
import toast from 'react-hot-toast'
import { useHistoriqueEncaissements, useEnregistrerEncaissement } from '../hooks/useEncaissement'
import { STATUT_ENCAISSEMENT_LABELS } from '../types'
import type { Vente } from '../types'
import { formatCurrency } from '@/shared/utils'
import { ventesApi } from '../api'

interface EncaissementModalProps {
  vente: Vente
  onClose: () => void
}

/** Convertit une Date en valeur compatible avec <input type="datetime-local"> (heure locale du navigateur). */
function toDatetimeLocalValue(date: Date): string {
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${String(date.getFullYear())}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`
}

export function EncaissementModal({ vente, onClose }: EncaissementModalProps) {
  const { data: historique, isPending: isLoadingHistorique } = useHistoriqueEncaissements(vente.id)
  const { mutate: enregistrer, isPending: isSaving } = useEnregistrerEncaissement()

  const [montant, setMontant] = useState('')
  const [dateHeure, setDateHeure] = useState(toDatetimeLocalValue(new Date()))
  const [confirmationPartielleVisible, setConfirmationPartielleVisible] = useState(false)
  const [dernierRecuId, setDernierRecuId] = useState<string | null>(null)
  const [telechargementEnCours, setTelechargementEnCours] = useState<string | null>(null)

  const montantValide = montant !== '' && Number(montant) > 0
  const dateValide = dateHeure !== ''

  const totalSolde = historique?.totalSolde ?? vente.totalSolde
  const montantEncaisseCumule = historique?.montantEncaisseCumule ?? 0
  const resteAEncaisser = Math.max(totalSolde - montantEncaisseCumule, 0)
  const statutEncaissement = historique?.statutEncaissement ?? vente.statutEncaissement

  const seraitPartiel = montantValide && Number(montant) < resteAEncaisser

  const soumettre = () => {
    if (!montantValide || !dateValide) return

    enregistrer(
      {
        venteId: vente.id,
        montant: Number(montant),
        dateEncaissement: new Date(dateHeure).toISOString(),
      },
      {
        onSuccess: (result) => {
          setMontant('')
          setDateHeure(toDatetimeLocalValue(new Date()))
          setConfirmationPartielleVisible(false)
          setDernierRecuId(result.encaissement.id)
        },
        onError: () => {
          setConfirmationPartielleVisible(false)
        },
      },
    )
  }

  const handleSubmit = () => {
    if (!montantValide || !dateValide) return

    // Versement partiel détecté : on demande confirmation avant d'enregistrer,
    // plutôt que de soumettre directement.
    if (seraitPartiel) {
      setConfirmationPartielleVisible(true)
      return
    }

    soumettre()
  }

  const handleTelechargerRecu = async (encaissementId: string) => {
    setTelechargementEnCours(encaissementId)
    try {
      await ventesApi.telechargerRecu(encaissementId)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Erreur lors du téléchargement du reçu.')
    } finally {
      setTelechargementEnCours(null)
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      onClick={onClose}
    >
      <div
        className="flex max-h-[85vh] w-full max-w-lg flex-col rounded-lg bg-[hsl(var(--card))] shadow-lg"
        onClick={(e) => {
          e.stopPropagation()
        }}
      >
        <div className="flex items-center justify-between border-b border-[hsl(var(--border))] p-4">
          <h3 className="text-lg font-semibold">Encaissement</h3>
          <button
            type="button"
            onClick={onClose}
            className="text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))]"
          >
            <X size={18} />
          </button>
        </div>

        <div className="flex-1 space-y-4 overflow-y-auto p-4">
          <div className="rounded-(--radius) bg-[hsl(var(--muted))] p-3 text-sm">
            <div className="flex items-center justify-between">
              <span className="text-[hsl(var(--muted-foreground))]">N° OP</span>
              <span className="font-medium">{vente.numeroTS10}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-[hsl(var(--muted-foreground))]">Total à solder</span>
              <span className="font-medium">{formatCurrency(totalSolde)}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-[hsl(var(--muted-foreground))]">Déjà encaissé</span>
              <span className="font-medium text-green-600">
                {formatCurrency(montantEncaisseCumule)}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-[hsl(var(--muted-foreground))]">Reste à encaisser</span>
              <span className="font-medium text-[hsl(var(--destructive))]">
                {formatCurrency(resteAEncaisser)}
              </span>
            </div>
            <div className="mt-1 flex items-center justify-between border-t border-[hsl(var(--border))] pt-1">
              <span className="text-[hsl(var(--muted-foreground))]">Statut</span>
              <span className="font-medium">{STATUT_ENCAISSEMENT_LABELS[statutEncaissement]}</span>
            </div>
          </div>

          {statutEncaissement === 'SOLDE' ? (
            <div className="flex items-center gap-2 rounded-(--radius) border border-green-300 bg-green-50 p-3 text-sm text-green-800">
              <CheckCircle2 size={18} className="shrink-0" />
              Cette vente est déjà intégralement soldée. Aucun nouvel encaissement n'est nécessaire.
            </div>
          ) : !confirmationPartielleVisible ? (
            <div className="space-y-3">
              <div>
                <label className="mb-1 block text-sm font-medium">Montant encaissé</label>
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
                <label className="mb-1 block text-sm font-medium">
                  Date et heure de l'encaissement
                </label>
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
                disabled={isSaving || !montantValide || !dateValide}
                className="flex w-full items-center justify-center gap-2 rounded-(--radius) bg-[hsl(var(--primary))] px-3 py-2 text-sm font-medium text-[hsl(var(--primary-foreground))] transition-opacity hover:opacity-90 disabled:opacity-50"
              >
                {isSaving && <Loader2 size={16} className="animate-spin" />}
                Enregistrer l'encaissement
              </button>
            </div>
          ) : (
            <div className="space-y-3 rounded-(--radius) border border-amber-300 bg-amber-50 p-4">
              <div className="flex items-start gap-2">
                <AlertTriangle size={18} className="mt-0.5 shrink-0 text-amber-600" />
                <div>
                  <p className="text-sm font-semibold text-amber-900">Versement partiel</p>
                  <p className="mt-1 text-sm text-amber-800">
                    Le montant saisi ({formatCurrency(Number(montant))}) ne couvre pas la totalité
                    du reste à encaisser ({formatCurrency(resteAEncaisser)}). Confirmes-tu qu'il
                    s'agit bien d'un versement partiel ?
                  </p>
                </div>
              </div>
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setConfirmationPartielleVisible(false)
                  }}
                  disabled={isSaving}
                  className="rounded-(--radius) border border-[hsl(var(--border))] px-3 py-2 text-sm font-medium hover:bg-[hsl(var(--muted))] disabled:opacity-50"
                >
                  Annuler
                </button>
                <button
                  type="button"
                  onClick={soumettre}
                  disabled={isSaving}
                  className="flex items-center gap-2 rounded-(--radius) bg-amber-600 px-3 py-2 text-sm font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-50"
                >
                  {isSaving && <Loader2 size={16} className="animate-spin" />}
                  Confirmer le versement partiel
                </button>
              </div>
            </div>
          )}

          {dernierRecuId && (
            <button
              type="button"
              onClick={() => {
                void handleTelechargerRecu(dernierRecuId)
              }}
              disabled={telechargementEnCours === dernierRecuId}
              className="flex w-full items-center justify-center gap-2 rounded-(--radius) border border-green-300 bg-green-50 px-3 py-2 text-sm font-medium text-green-700 hover:bg-green-100 disabled:opacity-50"
            >
              {telechargementEnCours === dernierRecuId ? (
                <Loader2 size={16} className="animate-spin" />
              ) : (
                <Download size={16} />
              )}
              Télécharger le reçu de cet encaissement
            </button>
          )}

          <div>
            <div className="mb-2 flex items-center gap-1.5 text-sm font-medium">
              <History size={14} />
              Historique
            </div>

            {isLoadingHistorique ? (
              <p className="text-sm text-[hsl(var(--muted-foreground))]">Chargement...</p>
            ) : historique && historique.encaissements.length > 0 ? (
              <ul className="space-y-1.5">
                {historique.encaissements.map((e) => (
                  <li
                    key={e.id}
                    className="flex items-center justify-between rounded-(--radius) border border-[hsl(var(--border))] px-3 py-2 text-sm"
                  >
                    <div>
                      <p className="font-medium">{formatCurrency(e.montant)}</p>
                      <p className="text-xs text-[hsl(var(--muted-foreground))]">
                        {new Date(e.dateEncaissement).toLocaleString()}
                        {e.enregistrePar
                          ? ` · ${e.enregistrePar.prenom} ${e.enregistrePar.nom}`
                          : ''}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        void handleTelechargerRecu(e.id)
                      }}
                      disabled={telechargementEnCours === e.id}
                      title="Télécharger le reçu"
                      className="flex items-center gap-1 text-xs font-medium text-[hsl(var(--primary))] hover:underline disabled:opacity-50"
                    >
                      {telechargementEnCours === e.id ? (
                        <Loader2 size={12} className="animate-spin" />
                      ) : (
                        <Download size={12} />
                      )}
                      Reçu
                    </button>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-[hsl(var(--muted-foreground))]">
                Aucun encaissement enregistré pour l'instant.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
