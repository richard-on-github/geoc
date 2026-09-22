import { useEffect, useState } from 'react'
import { Download, Loader2, RotateCcw } from 'lucide-react'
import toast from 'react-hot-toast'
import { Can } from '@/shared/components/navigation/Can'
import { useAgences } from '@/features/agences/hooks'
import { brouillardApi } from '../api/brouillard.api'
import type { BrouillardQueryParams } from '../types'

interface BrouillardFiltersProps {
  onFilterChange: (params: BrouillardQueryParams) => void
}

const DEBOUNCE_MS = 350

export function BrouillardFilters({ onFilterChange }: BrouillardFiltersProps) {
  const [agenceId, setAgenceId] = useState('')
  const [dateDebut, setDateDebut] = useState('')
  const [dateFin, setDateFin] = useState('')

  const [isExporting, setIsExporting] = useState(false)

  const { data: agencesData } = useAgences({ limit: 100 })
  const agences = agencesData?.items ?? []

  const hasActiveFilters = agenceId !== '' || dateDebut !== '' || dateFin !== ''

  const buildParams = (): BrouillardQueryParams => ({
    agenceId: agenceId || undefined,
    dateDebut: dateDebut ? new Date(dateDebut).toISOString() : undefined,
    dateFin: dateFin ? new Date(dateFin).toISOString() : undefined,
  })

  useEffect(() => {
    const timeout = setTimeout(() => {
      onFilterChange(buildParams())
    }, DEBOUNCE_MS)
    return () => {
      clearTimeout(timeout)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [agenceId, dateDebut, dateFin])

  const handleReset = () => {
    setAgenceId('')
    setDateDebut('')
    setDateFin('')
    onFilterChange({})
  }

  const handleExport = async (format: 'csv' | 'excel' | 'pdf') => {
    setIsExporting(true)
    try {
      await brouillardApi.exportBrouillard(buildParams(), format)
      toast.success("L'export a été téléchargé avec succès.")
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Erreur lors de l'export.")
    } finally {
      setIsExporting(false)
    }
  }

  return (
    <div className="flex flex-wrap items-end justify-between gap-3 py-4">
      <div className="flex flex-wrap items-end gap-2">
        <div>
          <label className="mb-1 block text-xs font-medium text-[hsl(var(--muted-foreground))]">
            Agence
          </label>
          <select
            value={agenceId}
            onChange={(e) => {
              setAgenceId(e.target.value)
            }}
            className="w-48 rounded-(--radius) border border-[hsl(var(--input))] bg-[hsl(var(--background))] px-3 py-2 text-sm focus:ring-2 focus:ring-[hsl(var(--ring))] focus:outline-none"
          >
            <option value="">Toutes agences</option>
            {agences.map((agence) => (
              <option key={agence.id} value={agence.id}>
                {agence.nom}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="mb-1 block text-xs font-medium text-[hsl(var(--muted-foreground))]">
            Entre le
          </label>
          <input
            type="date"
            value={dateDebut}
            onChange={(e) => {
              setDateDebut(e.target.value)
            }}
            className="rounded-(--radius) border border-[hsl(var(--input))] bg-[hsl(var(--background))] px-3 py-2 text-sm focus:ring-2 focus:ring-[hsl(var(--ring))] focus:outline-none"
          />
        </div>

        <div>
          <label className="mb-1 block text-xs font-medium text-[hsl(var(--muted-foreground))]">
            Et le
          </label>
          <input
            type="date"
            value={dateFin}
            onChange={(e) => {
              setDateFin(e.target.value)
            }}
            className="rounded-(--radius) border border-[hsl(var(--input))] bg-[hsl(var(--background))] px-3 py-2 text-sm focus:ring-2 focus:ring-[hsl(var(--ring))] focus:outline-none"
          />
        </div>

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
        <Can permission="brouillard.export.csv">
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
        <Can permission="brouillard.export.excel">
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
        <Can permission="brouillard.export.pdf">
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
      </div>
    </div>
  )
}
