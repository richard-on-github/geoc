import { useEffect, useState } from 'react'
import { RotateCcw, Search } from 'lucide-react'
import { useAgences } from '@/features/agences/hooks'
import {
  STATUT_ANOMALIE_LABELS,
  STATUT_BROUILLARD_LABELS,
  type BrouillardFiltersState,
  type StatutAnomalieBrouillard,
  type StatutBrouillard,
} from '../types'

interface BrouillardFiltersProps {
  onFilterChange: (filters: BrouillardFiltersState) => void
}

const STATUTS_ANOMALIE: StatutAnomalieBrouillard[] = [
  'OK',
  'MOINS_VERSE',
  'MOINS_VERSE_RETARD',
  'RETARD',
  'NON_VERSE',
  'TROP_VERSE',
  'ANOMALIE',
]

const STATUTS_WORKFLOW: StatutBrouillard[] = ['OUVERT', 'CLOTURE', 'VALIDE', 'REJETE']

const DEBOUNCE_MS = 350

export function BrouillardFilters({ onFilterChange }: BrouillardFiltersProps) {
  const [numeroTS10, setNumeroTS10] = useState('')
  const [agenceId, setAgenceId] = useState('')
  const [dateDebut, setDateDebut] = useState('')
  const [dateFin, setDateFin] = useState('')
  const [statutAnomalie, setStatutAnomalie] = useState<StatutAnomalieBrouillard | ''>('')
  const [statut, setStatut] = useState<StatutBrouillard | ''>('')

  const { data: agencesData } = useAgences({ limit: 100 })
  const agences = agencesData?.items ?? []

  const hasActiveFilters =
    numeroTS10 !== '' ||
    agenceId !== '' ||
    dateDebut !== '' ||
    dateFin !== '' ||
    statutAnomalie !== '' ||
    statut !== ''

  useEffect(() => {
    const timeout = setTimeout(() => {
      onFilterChange({
        numeroTS10: numeroTS10 || undefined,
        agenceId: agenceId || undefined,
        dateDebut: dateDebut || undefined,
        dateFin: dateFin || undefined,
        statutAnomalie: statutAnomalie || undefined,
        statut: statut || undefined,
      })
    }, DEBOUNCE_MS)

    return () => {
      clearTimeout(timeout)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [numeroTS10, agenceId, dateDebut, dateFin, statutAnomalie, statut])

  const handleReset = () => {
    setNumeroTS10('')
    setAgenceId('')
    setDateDebut('')
    setDateFin('')
    setStatutAnomalie('')
    setStatut('')
    onFilterChange({})
  }

  return (
    <div className="flex flex-wrap items-center gap-2 py-4">
      <div className="relative">
        <Search
          size={16}
          className="pointer-events-none absolute top-1/2 left-2.5 -translate-y-1/2 text-[hsl(var(--muted-foreground))]"
        />
        <input
          type="text"
          placeholder="N° TS10"
          value={numeroTS10}
          onChange={(e) => {
            setNumeroTS10(e.target.value)
          }}
          className="w-40 rounded-(--radius) border border-[hsl(var(--input))] bg-[hsl(var(--background))] py-2 pr-3 pl-8 text-sm focus:ring-2 focus:ring-[hsl(var(--ring))] focus:outline-none"
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
        value={statutAnomalie}
        onChange={(e) => {
          setStatutAnomalie(e.target.value as StatutAnomalieBrouillard | '')
        }}
        className="rounded-(--radius) border border-[hsl(var(--input))] bg-[hsl(var(--background))] px-3 py-2 text-sm focus:ring-2 focus:ring-[hsl(var(--ring))] focus:outline-none"
      >
        <option value="">Toutes anomalies</option>
        {STATUTS_ANOMALIE.map((s) => (
          <option key={s} value={s}>
            {STATUT_ANOMALIE_LABELS[s]}
          </option>
        ))}
      </select>

      <select
        value={statut}
        onChange={(e) => {
          setStatut(e.target.value as StatutBrouillard | '')
        }}
        className="rounded-(--radius) border border-[hsl(var(--input))] bg-[hsl(var(--background))] px-3 py-2 text-sm focus:ring-2 focus:ring-[hsl(var(--ring))] focus:outline-none"
      >
        <option value="">Tous statuts</option>
        {STATUTS_WORKFLOW.map((s) => (
          <option key={s} value={s}>
            {STATUT_BROUILLARD_LABELS[s]}
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
  )
}
