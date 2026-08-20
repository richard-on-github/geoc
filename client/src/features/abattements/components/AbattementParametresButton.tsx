import { useEffect, useState } from 'react'
import { Settings, X, Loader2 } from 'lucide-react'
import { Can } from '@/shared/components/navigation/Can'
import {
  useAbattementParametres,
  useUpdateAbattementParametres,
} from '../hooks/useAbattements'

export function AbattementParametresButton() {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <Can permission="abattement.parametres.manage">
      <button
        type="button"
        onClick={() => {
          setIsOpen(true)
        }}
        className="flex items-center gap-2 rounded-(--radius) border border-[hsl(var(--border))] bg-[hsl(var(--card))] px-3 py-2 text-sm font-medium hover:bg-[hsl(var(--muted))]"
      >
        <Settings size={16} /> Paramètres
      </button>

      {isOpen && (
        <AbattementParametresDrawer
          onClose={() => {
            setIsOpen(false)
          }}
        />
      )}
    </Can>
  )
}

interface FormState {
  heureLimiteUTC: string
  tauxRetard: string
  tauxMoinsVerse: string
  tauxMoinsVerseAvecRetard: string
  tauxNonVerse: string
}

function AbattementParametresDrawer({ onClose }: { onClose: () => void }) {
  const { data: parametres, isPending } = useAbattementParametres()
  const { mutate: updateParametres, isPending: isSaving } = useUpdateAbattementParametres()

  const [form, setForm] = useState<FormState>({
    heureLimiteUTC: '',
    tauxRetard: '',
    tauxMoinsVerse: '',
    tauxMoinsVerseAvecRetard: '',
    tauxNonVerse: '',
  })

  useEffect(() => {
    if (parametres) {
      setForm({
        heureLimiteUTC: String(parametres.heureLimiteUTC),
        tauxRetard: String(parametres.tauxRetard),
        tauxMoinsVerse: String(parametres.tauxMoinsVerse),
        tauxMoinsVerseAvecRetard: String(parametres.tauxMoinsVerseAvecRetard),
        tauxNonVerse: String(parametres.tauxNonVerse),
      })
    }
  }, [parametres])

  const handleChange = (field: keyof FormState) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm((prev) => ({ ...prev, [field]: e.target.value }))
  }

  const handleSubmit = () => {
    updateParametres({
      heureLimiteUTC: Number(form.heureLimiteUTC),
      tauxRetard: Number(form.tauxRetard),
      tauxMoinsVerse: Number(form.tauxMoinsVerse),
      tauxMoinsVerseAvecRetard: Number(form.tauxMoinsVerseAvecRetard),
      tauxNonVerse: Number(form.tauxNonVerse),
    })
  }

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/50" onClick={onClose}>
      <div
        className="flex h-full w-full max-w-sm flex-col bg-[hsl(var(--card))] shadow-lg"
        onClick={(e) => {
          e.stopPropagation()
        }}
      >
        <div className="flex items-center justify-between border-b border-[hsl(var(--border))] p-4">
          <h3 className="text-lg font-semibold">Paramètres d'abattement</h3>
          <button
            type="button"
            onClick={onClose}
            className="text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))]"
          >
            <X size={18} />
          </button>
        </div>

        {isPending ? (
          <div className="flex flex-1 items-center justify-center">
            <Loader2 size={20} className="animate-spin text-[hsl(var(--muted-foreground))]" />
          </div>
        ) : (
          <div className="flex-1 space-y-5 overflow-y-auto p-4">
            <p className="text-xs text-[hsl(var(--muted-foreground))]">
              Ces paramètres déterminent l'heure limite de versement et les taux appliqués pour
              chaque cas de figure. Toute modification s'applique aux prochains calculs
              (les lignes déjà classées ne sont pas recalculées rétroactivement à l'affichage
              tant que la page n'est pas rechargée).
            </p>

            <div>
              <label className="mb-1 block text-sm font-medium">
                Heure limite de versement (UTC)
              </label>
              <input
                type="number"
                min={0}
                max={23}
                value={form.heureLimiteUTC}
                onChange={handleChange('heureLimiteUTC')}
                className="w-full rounded-(--radius) border border-[hsl(var(--input))] bg-[hsl(var(--background))] px-3 py-2 text-sm focus:ring-2 focus:ring-[hsl(var(--ring))] focus:outline-none"
              />
              <p className="mt-1 text-xs text-[hsl(var(--muted-foreground))]">
                L'opérateur a jusqu'à cette heure, le lendemain de la vente, pour verser.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="mb-1 block text-sm font-medium">Retard (%)</label>
                <input
                  type="number"
                  step="0.1"
                  min={0}
                  max={100}
                  value={form.tauxRetard}
                  onChange={handleChange('tauxRetard')}
                  className="w-full rounded-(--radius) border border-[hsl(var(--input))] bg-[hsl(var(--background))] px-3 py-2 text-sm focus:ring-2 focus:ring-[hsl(var(--ring))] focus:outline-none"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium">Moins versé (%)</label>
                <input
                  type="number"
                  step="0.1"
                  min={0}
                  max={100}
                  value={form.tauxMoinsVerse}
                  onChange={handleChange('tauxMoinsVerse')}
                  className="w-full rounded-(--radius) border border-[hsl(var(--input))] bg-[hsl(var(--background))] px-3 py-2 text-sm focus:ring-2 focus:ring-[hsl(var(--ring))] focus:outline-none"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium">
                  Moins versé + retard (%)
                </label>
                <input
                  type="number"
                  step="0.1"
                  min={0}
                  max={100}
                  value={form.tauxMoinsVerseAvecRetard}
                  onChange={handleChange('tauxMoinsVerseAvecRetard')}
                  className="w-full rounded-(--radius) border border-[hsl(var(--input))] bg-[hsl(var(--background))] px-3 py-2 text-sm focus:ring-2 focus:ring-[hsl(var(--ring))] focus:outline-none"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium">Non versé (%)</label>
                <input
                  type="number"
                  step="0.1"
                  min={0}
                  max={100}
                  value={form.tauxNonVerse}
                  onChange={handleChange('tauxNonVerse')}
                  className="w-full rounded-(--radius) border border-[hsl(var(--input))] bg-[hsl(var(--background))] px-3 py-2 text-sm focus:ring-2 focus:ring-[hsl(var(--ring))] focus:outline-none"
                />
              </div>
            </div>

            <button
              type="button"
              onClick={handleSubmit}
              disabled={isSaving}
              className="flex w-full items-center justify-center gap-2 rounded-(--radius) bg-[hsl(var(--primary))] px-3 py-2 text-sm font-medium text-[hsl(var(--primary-foreground))] transition-opacity hover:opacity-90 disabled:opacity-50"
            >
              {isSaving && <Loader2 size={16} className="animate-spin" />}
              Enregistrer
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
