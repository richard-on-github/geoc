import { useState, useMemo, useEffect } from 'react'
import { Search, Upload, Download, FileSpreadsheet, FileText, File } from 'lucide-react'
import { useAgences } from '@/features/agences/hooks'
import { useImportVentes } from '../hooks'
import { ventesApi } from '../api'
import { useDebounce } from '@/shared/hooks/useDebounce'
import { cn } from '@/shared/lib'

interface VenteFiltersProps {
  onFilterChange: (filters: {
    search: string
    agenceId?: string
    dateDebut?: string
    dateFin?: string
  }) => void
}

export function VenteFilters({ onFilterChange }: VenteFiltersProps) {
  const [searchInput, setSearchInput] = useState('')
  const [agenceId, setAgenceId] = useState('')
  const [dateDebut, setDateDebut] = useState('')
  const [dateFin, setDateFin] = useState('')

  // Debounce sur la recherche
  const search = useDebounce(searchInput, 350)

  const { data: agencesData } = useAgences({ limit: 100 })
  const agences = agencesData?.items ?? []

  const { mutate: importVentes, isPending: isImporting } = useImportVentes()

  // Appliquer les filtres dès qu'un paramètre change
  useEffect(() => {
    onFilterChange({
      search,
      agenceId: agenceId || undefined,
      dateDebut: dateDebut || undefined,
      dateFin: dateFin || undefined,
    })
  }, [search, agenceId, dateDebut, dateFin, onFilterChange])

  // Gestionnaire d'import
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      importVentes(file, {
        onSuccess: () => {
          e.target.value = ''
        },
        onError: () => {
          e.target.value = ''
        },
      })
    }
  }

  // Gestionnaire d'export
  const handleExport = async (format: 'csv' | 'excel' | 'pdf') => {
    try {
      const params = {
        search: search || undefined,
        agenceId: agenceId || undefined,
        dateDebut: dateDebut || undefined,
        dateFin: dateFin || undefined,
      }
      await ventesApi.exportVentes(params, format)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Erreur lors de l'export.")
    }
  }

  // Réinitialisation
  const handleReset = () => {
    setSearchInput('')
    setAgenceId('')
    setDateDebut('')
    setDateFin('')
  }

  return (
    <div className="mb-4 space-y-4">
      <div className="flex flex-wrap items-center gap-4">
        {/* Recherche */}
        <div className="relative max-w-sm min-w-[200px] flex-1">
          <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-[hsl(var(--muted-foreground))]" />
          <input
            type="search"
            placeholder="Rechercher (agent, kiosque, banque...)"
            value={searchInput}
            onChange={(e) => {
              setSearchInput(e.target.value)
            }}
            className="w-full rounded-[var(--radius)] border border-[hsl(var(--input))] bg-[hsl(var(--card))] py-2 pr-3 pl-9 text-sm focus:ring-2 focus:ring-[hsl(var(--ring))] focus:outline-none"
          />
        </div>

        {/* Filtre Agence */}
        <select
          value={agenceId}
          onChange={(e) => {
            setAgenceId(e.target.value)
          }}
          className="rounded-[var(--radius)] border border-[hsl(var(--input))] bg-[hsl(var(--card))] px-3 py-2 text-sm focus:ring-2 focus:ring-[hsl(var(--ring))] focus:outline-none"
        >
          <option value="">Toutes les agences</option>
          {agences.map((agence) => (
            <option key={agence.id} value={agence.id}>
              {agence.nom}
            </option>
          ))}
        </select>

        {/* Date Début */}
        <input
          type="date"
          value={dateDebut}
          onChange={(e) => {
            setDateDebut(e.target.value)
          }}
          className="rounded-[var(--radius)] border border-[hsl(var(--input))] bg-[hsl(var(--card))] px-3 py-2 text-sm focus:ring-2 focus:ring-[hsl(var(--ring))] focus:outline-none"
        />

        {/* Date Fin */}
        <input
          type="date"
          value={dateFin}
          onChange={(e) => {
            setDateFin(e.target.value)
          }}
          className="rounded-[var(--radius)] border border-[hsl(var(--input))] bg-[hsl(var(--card))] px-3 py-2 text-sm focus:ring-2 focus:ring-[hsl(var(--ring))] focus:outline-none"
        />

        {/* Bouton Réinitialiser */}
        <button
          type="button"
          onClick={handleReset}
          className="text-sm text-[hsl(var(--muted-foreground))] transition-colors hover:text-[hsl(var(--foreground))]"
        >
          Réinitialiser
        </button>
      </div>

      {/* Actions (Import / Export) */}
      <div className="flex flex-wrap items-center gap-2">
        <label
          className={cn(
            'inline-flex cursor-pointer items-center gap-2 rounded-[var(--radius)] bg-[hsl(var(--primary))] px-4 py-2 text-sm font-medium text-[hsl(var(--primary-foreground))] transition-opacity hover:opacity-90',
            isImporting && 'pointer-events-none opacity-50',
          )}
        >
          <Upload size={16} />
          {isImporting ? 'Import en cours...' : 'Importer un fichier'}
          <input
            type="file"
            accept=".xlsx,.xls,.csv"
            onChange={handleFileChange}
            disabled={isImporting}
            className="hidden"
          />
        </label>

        <div className="flex items-center gap-1 border-l border-[hsl(var(--border))] pl-2">
          <span className="mr-1 text-xs font-medium text-[hsl(var(--muted-foreground))]">
            Exporter :
          </span>
          <button
            type="button"
            onClick={() => {
              handleExport('csv')
            }}
            className="flex items-center gap-1 rounded-[var(--radius-sm)] border border-[hsl(var(--border))] px-2 py-1 text-xs transition-colors hover:bg-[hsl(var(--muted))]"
          >
            <FileText size={14} />
            CSV
          </button>
          <button
            type="button"
            onClick={() => {
              handleExport('excel')
            }}
            className="flex items-center gap-1 rounded-[var(--radius-sm)] border border-[hsl(var(--border))] px-2 py-1 text-xs transition-colors hover:bg-[hsl(var(--muted))]"
          >
            <FileSpreadsheet size={14} />
            Excel
          </button>
          <button
            type="button"
            onClick={() => {
              handleExport('pdf')
            }}
            className="flex items-center gap-1 rounded-[var(--radius-sm)] border border-[hsl(var(--border))] px-2 py-1 text-xs transition-colors hover:bg-[hsl(var(--muted))]"
          >
            <File size={14} />
            PDF
          </button>
        </div>
      </div>
    </div>
  )
}
