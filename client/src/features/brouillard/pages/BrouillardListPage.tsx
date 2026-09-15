import { useState, useCallback } from 'react'
import { AlertCircle } from 'lucide-react'
import { PageHeader } from '@/shared/components/layout/PageHeader'
import { BrouillardFilters } from '../components/BrouillardFilters'
import { BrouillardTable } from '../components/BrouillardTable'
import { useBrouillard } from '../hooks/useBrouillard'
import type { BrouillardQueryParams } from '../types'

export function BrouillardListPage() {
  const [params, setParams] = useState<BrouillardQueryParams>({})

  const handleFilterChange = useCallback((newParams: BrouillardQueryParams) => {
    setParams(newParams)
  }, [])

  const { data, isPending, isError, error } = useBrouillard(params)

  return (
    <div>
      <PageHeader
        title="Brouillard"
        description="Registre chronologique de tous les encaissements, avec solde cumulé"
      />
      <BrouillardFilters onFilterChange={handleFilterChange} />

      {isPending && (
        <div className="space-y-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-10 animate-pulse rounded-(--radius) bg-[hsl(var(--muted))]" />
          ))}
        </div>
      )}

      {isError && (
        <div className="flex flex-col items-center justify-center gap-2 rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--card))] py-16 text-center">
          <AlertCircle size={28} className="text-[hsl(var(--destructive))]" />
          <p className="text-sm text-[hsl(var(--muted-foreground))]">
            {error instanceof Error ? error.message : 'Aucun encaissement trouvé.'}
          </p>
        </div>
      )}

      {data && <BrouillardTable brouillard={data} />}
    </div>
  )
}
