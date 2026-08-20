import { useEffect, useState } from 'react'
import { Copy, Check, Download, Loader2, Lock, RotateCcw, Search, X } from 'lucide-react'
import toast from 'react-hot-toast'
import { Can } from '@/shared/components/navigation/Can'
import { useDebounce } from '@/shared/hooks/useDebounce'
import { useAgences } from '@/features/agences/hooks'
import { abattementsApi } from '../api/abattements.api'
import { AbattementParametresButton } from './AbattementParametresButton'
import {
  STATUT_ABATTEMENT_LABELS,
  type AbattementFiltersState,
  type AbattementQueryParams,
  type AbattementViewMode,
  type StatutAbattement,
} from '../types'

interface AbattementFiltersProps {
  onFilterChange: (filters: AbattementFiltersState) => void
  /** Vue de navigation active (Jours/Mois/Années/Général), affichée à titre indicatif. */
  viewMode?: AbattementViewMode
  /**
   * Filtres jour/mois/année dérivés de la vue active (useAbattementBrowserState).
   * Fusionnés dans l'export pour qu'il corresponde exactement à ce qui est
   * affiché à l'écran.
   */
  periodeFilters?: { jour?: number; mois?: number; annee?: number }
}

const STATUTS: StatutAbattement[] = [
  'AUCUN',
  'RETARD',
  'MOINS_VERSE',
  'MOINS_VERSE_AVEC_RETARD',
  'NON_VERSE',
]

export function AbattementFilters({ onFilterChange, periodeFilters }: AbattementFiltersProps) {
  const [searchInput, setSearchInput] = useState('')
  const search = useDebounce(searchInput, 350)

  const [agenceId, setAgenceId] = useState('')
  const [dateDebut, setDateDebut] = useState('')
  const [dateFin, setDateFin] = useState('')
  const [statut, setStatut] = useState<StatutAbattement | ''>('')

  const [isExporting, setIsExporting] = useState(false)
  const [exportPassword, setExportPassword] = useState<string | null>(null)
  const [isCopied, setIsCopied] = useState(false)

  const { data: agencesData } = useAgences({ limit: 100 })
  const agences = agencesData?.items ?? []

  const hasActiveFilters =
    searchInput !== '' || agenceId !== '' || dateDebut !== '' || dateFin !== '' || statut !== ''

  // Recherche débouncée ; le reste (agence, dates, statut) s'applique
  // immédiatement, sans validation manuelle.
  useEffect(() => {
    onFilterChange({
      search,
      ...(agenceId !== '' ? { agenceId } : {}),
      ...(dateDebut !== '' ? { dateDebut } : {}),
      ...(dateFin !== '' ? { dateFin } : {}),
      ...(statut !== '' ? { statut } : {}),
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search, agenceId, dateDebut, dateFin, statut])

  const handleReset = () => {
    setSearchInput('')
    setAgenceId('')
    setDateDebut('')
    setDateFin('')
    setStatut('')
  }

  const handleExport = async (format: 'csv' | 'excel' | 'pdf') => {
    setIsExporting(true)
    try {
      const params: AbattementQueryParams = {
        ...(search !== '' ? { search } : {}),
        ...(agenceId !== '' ? { agenceId } : {}),
        ...(dateDebut !== '' ? { dateDebut } : {}),
        ...(dateFin !== '' ? { dateFin } : {}),
        ...(statut !== '' ? { statut } : {}),
        ...periodeFilters,
      }

      const password = await abattementsApi.exportAbattements(params, format)
      const hasPassword = typeof password === 'string' && password !== ''

      if (hasPassword) {
        setExportPassword(password)
      } else {
        toast.success("L'export a été téléchargé avec succès.")
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Erreur lors de l'export.")
    } finally {
      setIsExporting(false)
    }
  }

  const handleCopyPassword = () => {
    const hasPassword = typeof exportPassword === 'string' && exportPassword !== ''
    if (!hasPassword) return

    void navigator.clipboard.writeText(exportPassword).then(() => {
      setIsCopied(true)
      setTimeout(() => {
        setIsCopied(false)
      }, 2000)
    })
  }

  return (
    <>
      <div className="flex flex-wrap items-center justify-between gap-3 py-4">
        <div className="flex flex-wrap items-center gap-2">
          <div className="relative">
            <Search
              size={16}
              className="pointer-events-none absolute top-1/2 left-2.5 -translate-y-1/2 text-[hsl(var(--muted-foreground))]"
            />
            <input
              type="text"
              placeholder="Rechercher (N° OP, agence...)"
              value={searchInput}
              onChange={(e) => {
                setSearchInput(e.target.value)
              }}
              className="rounded-(--radius) border border-[hsl(var(--input))] bg-[hsl(var(--background))] py-2 pr-3 pl-8 text-sm focus:ring-2 focus:ring-[hsl(var(--ring))] focus:outline-none"
            />
          </div>

          <select
            value={agenceId}
            onChange={(e) => {
              setAgenceId(e.target.value)
            }}
            className="rounded-(--radius) border border-[hsl(var(--input))] bg-[hsl(var(--background))] px-3 py-2 text-sm focus:ring-2 focus:ring-[hsl(var(--ring))] focus:outline-none"
          >
            <option value="">Toutes agences</option>
            {agences.map((agence) => (
              <option key={agence.id} value={agence.id}>
                {agence.nom}
              </option>
            ))}
          </select>

          <input
            type="date"
            value={dateDebut}
            onChange={(e) => {
              setDateDebut(e.target.value)
            }}
            className="rounded-(--radius) border border-[hsl(var(--input))] bg-[hsl(var(--background))] px-3 py-2 text-sm focus:ring-2 focus:ring-[hsl(var(--ring))] focus:outline-none"
          />
          <input
            type="date"
            value={dateFin}
            onChange={(e) => {
              setDateFin(e.target.value)
            }}
            className="rounded-(--radius) border border-[hsl(var(--input))] bg-[hsl(var(--background))] px-3 py-2 text-sm focus:ring-2 focus:ring-[hsl(var(--ring))] focus:outline-none"
          />

          <select
            value={statut}
            onChange={(e) => {
              setStatut(e.target.value as StatutAbattement | '')
            }}
            className="rounded-(--radius) border border-[hsl(var(--input))] bg-[hsl(var(--background))] px-3 py-2 text-sm focus:ring-2 focus:ring-[hsl(var(--ring))] focus:outline-none"
          >
            <option value="">Tous statuts</option>
            {STATUTS.map((s) => (
              <option key={s} value={s}>
                {STATUT_ABATTEMENT_LABELS[s]}
              </option>
            ))}
          </select>

          {hasActiveFilters && (
            <button
              type="button"
              onClick={handleReset}
              className="flex items-center gap-1.5 rounded-(--radius) border border-[hsl(var(--border))] bg-[hsl(var(--card))] px-3 py-2 text-sm font-medium text-[hsl(var(--muted-foreground))] hover:bg-[hsl(var(--muted))] hover:text-[hsl(var(--foreground))]"
            >
              <RotateCcw size={14} />
              Réinitialiser
            </button>
          )}
        </div>

        <div className="flex items-center gap-2">
          <Can permission="abattement.export.csv">
            <button
              type="button"
              onClick={() => {
                void handleExport('csv')
              }}
              disabled={isExporting}
              className="flex items-center gap-1.5 rounded-(--radius) border border-[hsl(var(--border))] bg-[hsl(var(--card))] px-3 py-2 text-sm font-medium hover:bg-[hsl(var(--muted))] disabled:opacity-50"
            >
              {isExporting ? <Loader2 size={14} className="animate-spin" /> : <Download size={14} />}
              CSV
            </button>
          </Can>
          <Can permission="abattement.export.excel">
            <button
              type="button"
              onClick={() => {
                void handleExport('excel')
              }}
              disabled={isExporting}
              className="flex items-center gap-1.5 rounded-(--radius) border border-[hsl(var(--border))] bg-[hsl(var(--card))] px-3 py-2 text-sm font-medium hover:bg-[hsl(var(--muted))] disabled:opacity-50"
            >
              {isExporting ? <Loader2 size={14} className="animate-spin" /> : <Download size={14} />}
              Excel
            </button>
          </Can>
          <Can permission="abattement.export.pdf">
            <button
              type="button"
              onClick={() => {
                void handleExport('pdf')
              }}
              disabled={isExporting}
              className="flex items-center gap-1.5 rounded-(--radius) border border-[hsl(var(--border))] bg-[hsl(var(--card))] px-3 py-2 text-sm font-medium hover:bg-[hsl(var(--muted))] disabled:opacity-50"
            >
              {isExporting ? <Loader2 size={14} className="animate-spin" /> : <Download size={14} />}
              PDF
            </button>
          </Can>
          <AbattementParametresButton />
        </div>
      </div>

      {exportPassword !== null && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          onClick={() => {
            setExportPassword(null)
          }}
        >
          <div
            className="w-full max-w-sm rounded-lg bg-[hsl(var(--card))] shadow-lg"
            onClick={(e) => {
              e.stopPropagation()
            }}
          >
            <div className="flex items-center justify-between border-b border-[hsl(var(--border))] p-4">
              <h3 className="flex items-center gap-2 text-lg font-semibold">
                <Lock size={18} />
                Archive protégée
              </h3>
              <button
                type="button"
                onClick={() => {
                  setExportPassword(null)
                }}
                className="text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))]"
              >
                <X size={18} />
              </button>
            </div>

            <div className="space-y-3 p-4">
              <p className="text-sm text-[hsl(var(--muted-foreground))]">
                L'export a été téléchargé sous forme d'archive protégée. Voici le mot de passe pour
                l'ouvrir :
              </p>

              <div className="flex items-center gap-2 rounded-(--radius) border border-[hsl(var(--border))] bg-[hsl(var(--muted))] px-3 py-2">
                <code className="flex-1 font-mono text-sm font-semibold">{exportPassword}</code>
                <button
                  type="button"
                  onClick={handleCopyPassword}
                  className="flex items-center gap-1 rounded-sm px-2 py-1 text-xs font-medium text-[hsl(var(--primary))] hover:bg-[hsl(var(--card))]"
                >
                  {isCopied ? <Check size={14} /> : <Copy size={14} />}
                  {isCopied ? 'Copié' : 'Copier'}
                </button>
              </div>

              <p className="text-xs text-[hsl(var(--muted-foreground))]">
                Ce mot de passe ne sera plus affiché après la fermeture de cette fenêtre.
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
