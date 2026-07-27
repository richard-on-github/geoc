import { useState, useEffect, useRef } from 'react'
import {
  Search,
  Upload,
  FileSpreadsheet,
  FileText,
  File,
  Lock,
  Copy,
  Check,
  X,
  AlertCircle,
} from 'lucide-react'
import toast from 'react-hot-toast'
import { useAgences } from '@/features/agences/hooks'
import { useImportVentes } from '../hooks'
import { ventesApi } from '../api'
import { useDebounce } from '@/shared/hooks/useDebounce'
import { Can } from '@/shared/components/navigation/Can'
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

  // État pour la confirmation d'importation
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // État pour la modal de mot de passe d'exportation
  const [exportPassword, setExportPassword] = useState<string | null>(null)
  const [isExporting, setIsExporting] = useState(false)
  const [copied, setCopied] = useState(false)

  const search = useDebounce(searchInput, 350)
  const { data: agencesData } = useAgences({ limit: 100 })
  const agences = agencesData?.items ?? []

  const { mutate: importVentes, isPending: isImporting } = useImportVentes()

  useEffect(() => {
    onFilterChange({
      search,
      agenceId: agenceId || undefined,
      dateDebut: dateDebut || undefined,
      dateFin: dateFin || undefined,
    })
  }, [search, agenceId, dateDebut, dateFin, onFilterChange])

  // 1. Sélection du fichier (déclenche la modal au lieu d'importer directement)
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setSelectedFile(file)
    }
  }

  // 2. Confirmation de l'importation
  const handleConfirmImport = () => {
    if (!selectedFile) return
    importVentes(selectedFile, {
      onSuccess: () => {
        setSelectedFile(null)
        if (fileInputRef.current) fileInputRef.current.value = ''
      },
      onError: () => {
        if (fileInputRef.current) fileInputRef.current.value = ''
      },
    })
  }

  const handleCancelImport = () => {
    setSelectedFile(null)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  // 3. Gestionnaire d'exportation avec récupération du mot de passe
  const handleExport = async (format: 'csv' | 'excel' | 'pdf') => {
    try {
      setIsExporting(true)
      const params = {
        search: search || undefined,
        agenceId: agenceId || undefined,
        dateDebut: dateDebut || undefined,
        dateFin: dateFin || undefined,
      }
      const password = await ventesApi.exportVentes(params, format)
      if (password) {
        setExportPassword(password)
      } else {
        toast.success("L'exportation a été téléchargée avec succès.")
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Erreur lors de l'export.")
    } finally {
      setIsExporting(false)
    }
  }

  const handleCopyPassword = () => {
    if (exportPassword) {
      navigator.clipboard.writeText(exportPassword)
      setCopied(true)
      toast.success('Mot de passe copié !')
      setTimeout(() => { setCopied(false); }, 2000)
    }
  }

  const handleReset = () => {
    setSearchInput('')
    setAgenceId('')
    setDateDebut('')
    setDateFin('')
  }

  return (
    <div className="mb-4 space-y-4">
      {/* Barre de filtres */}
      <div className="flex flex-wrap items-center gap-4">
        <div className="relative max-w-sm min-w-[200px] flex-1">
          <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-[hsl(var(--muted-foreground))]" />
          <input
            type="search"
            placeholder="Rechercher (agent, kiosque, banque...)"
            value={searchInput}
            onChange={(e) => { setSearchInput(e.target.value); }}
            className="w-full rounded-[var(--radius)] border border-[hsl(var(--input))] bg-[hsl(var(--card))] py-2 pr-3 pl-9 text-sm focus:ring-2 focus:ring-[hsl(var(--ring))] focus:outline-none"
          />
        </div>

        <select
          value={agenceId}
          onChange={(e) => { setAgenceId(e.target.value); }}
          className="rounded-[var(--radius)] border border-[hsl(var(--input))] bg-[hsl(var(--card))] px-3 py-2 text-sm focus:ring-2 focus:ring-[hsl(var(--ring))] focus:outline-none"
        >
          <option value="">Toutes les agences</option>
          {agences.map((agence) => (
            <option key={agence.id} value={agence.id}>
              {agence.nom}
            </option>
          ))}
        </select>

        <input
          type="date"
          value={dateDebut}
          onChange={(e) => { setDateDebut(e.target.value); }}
          className="rounded-[var(--radius)] border border-[hsl(var(--input))] bg-[hsl(var(--card))] px-3 py-2 text-sm focus:ring-2 focus:ring-[hsl(var(--ring))] focus:outline-none"
        />

        <input
          type="date"
          value={dateFin}
          onChange={(e) => { setDateFin(e.target.value); }}
          className="rounded-[var(--radius)] border border-[hsl(var(--input))] bg-[hsl(var(--card))] px-3 py-2 text-sm focus:ring-2 focus:ring-[hsl(var(--ring))] focus:outline-none"
        />

        <button
          type="button"
          onClick={handleReset}
          className="text-sm text-[hsl(var(--muted-foreground))] transition-colors hover:text-[hsl(var(--foreground))]"
        >
          Réinitialiser
        </button>
      </div>

      {/* Barre d'actions (Import & Exports séparés par permission) */}
      <div className="flex flex-wrap items-center gap-2">
        {/* Importation */}
        <label
          className={cn(
            'inline-flex cursor-pointer items-center gap-2 rounded-[var(--radius)] bg-[hsl(var(--primary))] px-4 py-2 text-sm font-medium text-[hsl(var(--primary-foreground))] transition-opacity hover:opacity-90',
            (isImporting || isExporting) && 'pointer-events-none opacity-50',
          )}
        >
          <Upload size={16} />
          Importer un fichier
          <input
            ref={fileInputRef}
            type="file"
            accept=".xlsx,.xls,.csv"
            onChange={handleFileSelect}
            disabled={isImporting || isExporting}
            className="hidden"
          />
        </label>

        {/* Exports avec permissions distinctes */}
        <div className="flex items-center gap-1 border-l border-[hsl(var(--border))] pl-2">
          <span className="mr-1 text-xs font-medium text-[hsl(var(--muted-foreground))]">
            Exporter :
          </span>

          <Can permission="vente.export.csv">
            <button
              type="button"
              disabled={isExporting}
              onClick={() => handleExport('csv')}
              className="flex items-center gap-1 rounded-[var(--radius-sm)] border border-[hsl(var(--border))] px-2 py-1 text-xs transition-colors hover:bg-[hsl(var(--muted))] disabled:opacity-50"
            >
              <FileText size={14} />
              CSV
            </button>
          </Can>

          <Can permission="vente.export.excel">
            <button
              type="button"
              disabled={isExporting}
              onClick={() => handleExport('excel')}
              className="flex items-center gap-1 rounded-[var(--radius-sm)] border border-[hsl(var(--border))] px-2 py-1 text-xs transition-colors hover:bg-[hsl(var(--muted))] disabled:opacity-50"
            >
              <FileSpreadsheet size={14} />
              Excel
            </button>
          </Can>

          <Can permission="vente.export.pdf">
            <button
              type="button"
              disabled={isExporting}
              onClick={() => handleExport('pdf')}
              className="flex items-center gap-1 rounded-[var(--radius-sm)] border border-[hsl(var(--border))] px-2 py-1 text-xs transition-colors hover:bg-[hsl(var(--muted))] disabled:opacity-50"
            >
              <File size={14} />
              PDF
            </button>
          </Can>
        </div>
      </div>

      {/* --- MODAL 1 : Confirmation d'Importation --- */}
      {selectedFile && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-6 shadow-lg">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-2">
                <AlertCircle className="h-5 w-5 text-[hsl(var(--primary))]" />
                <h3 className="text-lg font-semibold">Confirmer l'importation</h3>
              </div>
              <button
                type="button"
                onClick={handleCancelImport}
                disabled={isImporting}
                className="text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))]"
              >
                <X size={18} />
              </button>
            </div>

            <div className="mt-4 space-y-2 text-sm">
              <p className="text-[hsl(var(--muted-foreground))]">
                Vous êtes sur le point d'importer le fichier suivant :
              </p>
              <div className="rounded-md border border-[hsl(var(--border))] bg-[hsl(var(--muted))] p-3">
                <p className="font-medium text-[hsl(var(--foreground))]">{selectedFile.name}</p>
                <p className="text-xs text-[hsl(var(--muted-foreground))]">
                  Taille : {(selectedFile.size / 1024).toFixed(2)} Ko
                </p>
              </div>
              <p className="text-xs text-[hsl(var(--muted-foreground))]">
                Cette action va insérer les données enregistrées dans la base de données.
              </p>
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={handleCancelImport}
                disabled={isImporting}
                className="rounded-md border border-[hsl(var(--border))] px-4 py-2 text-sm font-medium hover:bg-[hsl(var(--muted))]"
              >
                Annuler
              </button>
              <button
                type="button"
                onClick={handleConfirmImport}
                disabled={isImporting}
                className="rounded-md bg-[hsl(var(--primary))] px-4 py-2 text-sm font-medium text-[hsl(var(--primary-foreground))] hover:opacity-90 disabled:opacity-50"
              >
                {isImporting ? 'Importation en cours...' : "Confirmer l'import"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* --- MODAL 2 : Code de déchiffrement de l'archive ZIP --- */}
      {exportPassword && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-6 shadow-lg">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-2">
                <Lock className="h-5 w-5 text-green-600" />
                <h3 className="text-lg font-semibold">Exportation sécurisée</h3>
              </div>
              <button
                type="button"
                onClick={() => { setExportPassword(null); }}
                className="text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))]"
              >
                <X size={18} />
              </button>
            </div>

            <p className="mt-3 text-sm text-[hsl(var(--muted-foreground))]">
              Votre archive ZIP a été téléchargée. Utilisez le mot de passe ci-dessous pour
              décompresser le fichier :
            </p>

            <div className="mt-4 flex items-center justify-between rounded-md border border-[hsl(var(--border))] bg-[hsl(var(--muted))] p-3">
              <span className="font-mono text-base font-bold tracking-widest text-[hsl(var(--foreground))]">
                {exportPassword}
              </span>
              <button
                type="button"
                onClick={handleCopyPassword}
                className="flex items-center gap-1 rounded border border-[hsl(var(--border))] bg-[hsl(var(--card))] px-2.5 py-1.5 text-xs font-medium hover:bg-[hsl(var(--muted))]"
              >
                {copied ? <Check size={14} className="text-green-600" /> : <Copy size={14} />}
                {copied ? 'Copié' : 'Copier'}
              </button>
            </div>

            <div className="mt-6 flex justify-end">
              <button
                type="button"
                onClick={() => { setExportPassword(null); }}
                className="rounded-md bg-[hsl(var(--primary))] px-4 py-2 text-sm font-medium text-[hsl(var(--primary-foreground))] hover:opacity-90"
              >
                J'ai copié le mot de passe
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
