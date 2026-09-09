import { useState } from 'react'
import { ChevronLeft, ChevronRight, Lock, CheckCircle2, XCircle, ClipboardList } from 'lucide-react'
import { Can } from '@/shared/components/navigation/Can'
import { EmptyState } from '@/shared/components/feedback/EmptyState'
import { formatCurrency } from '@/shared/utils'
import { cn } from '@/shared/lib'
import { useBrouillards, useValiderBrouillard } from '../hooks/useBrouillard'
import { AnomalieBadge, WorkflowBadge } from './BrouillardBadges'
import { ClotureModal } from './ClotureModal'
import { RejeterModal } from './RejeterModal'
import type { BrouillardFiltersState, BrouillardItem } from '../types'

interface BrouillardTableProps {
  filters: BrouillardFiltersState
}

const PAGE_SIZES = [10, 20, 50]

export function BrouillardTable({ filters }: BrouillardTableProps) {
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(20)
  const [brouillardACloturer, setBrouillardACloturer] = useState<BrouillardItem | null>(null)
  const [brouillardARejeter, setBrouillardARejeter] = useState<BrouillardItem | null>(null)

  const { data, isPending, isFetching } = useBrouillards({ ...filters, page, limit: pageSize })
  const { mutate: valider, isPending: isValidating } = useValiderBrouillard()
  const isLoading = isPending && isFetching

  if (isLoading) {
    return (
      <div className="space-y-2">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="h-12 animate-pulse rounded-(--radius) bg-[hsl(var(--muted))]" />
        ))}
      </div>
    )
  }

  const items = data?.items ?? []
  if (items.length === 0) {
    return (
      <div className="rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--card))]">
        <EmptyState
          icon={ClipboardList}
          title="Aucun brouillard"
          description="Aucun brouillard ne correspond à ces critères pour le moment."
        />
      </div>
    )
  }

  const total = data?.pagination.total ?? 0
  const from = total === 0 ? 0 : (page - 1) * pageSize + 1
  const to = Math.min(page * pageSize, total)

  return (
    <div className="space-y-4">
      <div className="overflow-x-auto rounded-lg border border-[hsl(var(--border))] shadow-sm">
        <table className="w-full text-sm" aria-label="Liste des brouillards">
          <thead className="bg-[hsl(var(--muted))]">
            <tr>
              {[
                'Journée',
                'N° TS10',
                'Agence',
                'Ventes',
                'Solde attendu',
                'Versé',
                'Écart',
                'Pénalité',
                'Anomalie',
                'Statut',
                '',
              ].map((h) => (
                <th
                  key={h}
                  className="px-4 py-3 text-left text-xs font-medium tracking-wider text-[hsl(var(--muted-foreground))] uppercase"
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-[hsl(var(--border))] bg-[hsl(var(--card))]">
            {items.map((b) => (
              <tr key={b.id} className="transition-colors hover:bg-[hsl(var(--muted))]/50">
                <td className="px-4 py-3 whitespace-nowrap">
                  {new Date(b.journee).toLocaleDateString()}
                </td>
                <td className="px-4 py-3">{b.numeroTS10}</td>
                <td className="px-4 py-3">{b.vente?.agenceNom ?? '-'}</td>
                <td className="px-4 py-3 text-right font-medium">{formatCurrency(b.ventes)}</td>
                <td className="px-4 py-3 text-right">{formatCurrency(b.soldeAttendu)}</td>
                <td className="px-4 py-3 text-right text-green-600">
                  {formatCurrency(b.montantVerse)}
                </td>
                <td
                  className={cn(
                    'px-4 py-3 text-right font-medium',
                    b.ecart > 0 && 'text-[hsl(var(--destructive))]',
                    b.ecart <= 0 && 'text-green-600',
                  )}
                >
                  {formatCurrency(b.ecart)}
                </td>
                <td className="px-4 py-3 text-right">
                  {b.penalite > 0 ? (
                    <span className="font-medium text-[hsl(var(--destructive))]">
                      {formatCurrency(b.penalite)}
                    </span>
                  ) : (
                    <span className="text-[hsl(var(--muted-foreground))]">-</span>
                  )}
                </td>
                <td className="px-4 py-3">
                  <AnomalieBadge statut={b.statutAnomalie} />
                </td>
                <td className="px-4 py-3">
                  <WorkflowBadge statut={b.statut} />
                </td>
                <td className="px-4 py-3">
                  <Can permission="brouillard.manage">
                    <div className="flex items-center gap-2">
                      {b.statut === 'OUVERT' && (
                        <button
                          type="button"
                          onClick={() => {
                            setBrouillardACloturer(b)
                          }}
                          className="flex items-center gap-1 text-xs font-medium text-[hsl(var(--primary))] hover:underline"
                        >
                          <Lock size={12} />
                          Clôturer
                        </button>
                      )}
                      {b.statut === 'CLOTURE' && (
                        <>
                          <button
                            type="button"
                            onClick={() => {
                              valider(b.id)
                            }}
                            disabled={isValidating}
                            className="flex items-center gap-1 text-xs font-medium text-green-600 hover:underline disabled:opacity-50"
                          >
                            <CheckCircle2 size={12} />
                            Valider
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setBrouillardARejeter(b)
                            }}
                            className="flex items-center gap-1 text-xs font-medium text-[hsl(var(--destructive))] hover:underline"
                          >
                            <XCircle size={12} />
                            Rejeter
                          </button>
                        </>
                      )}
                    </div>
                  </Can>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {total > 0 && (
        <div className="flex flex-col items-center justify-between gap-4 border-t border-[hsl(var(--border))] pt-3 text-sm sm:flex-row">
          <p className="font-medium text-[hsl(var(--muted-foreground))]">
            {from} à {to} sur {total} brouillard{total > 1 ? 's' : ''}
          </p>

          <div className="flex flex-wrap items-center gap-6">
            <div className="flex items-center gap-2">
              <span className="text-xs font-medium text-[hsl(var(--muted-foreground))]">Lignes :</span>
              <div className="flex items-center gap-1">
                {PAGE_SIZES.map((size) => (
                  <button
                    key={size}
                    type="button"
                    onClick={() => {
                      setPage(1)
                      setPageSize(size)
                    }}
                    className={cn(
                      'h-7 min-w-7 rounded-sm border border-[hsl(var(--border))] px-1.5 text-xs font-medium transition-colors hover:bg-[hsl(var(--muted))]',
                      pageSize === size
                        ? 'border-[hsl(var(--primary))] bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))]'
                        : 'bg-[hsl(var(--card))] text-[hsl(var(--foreground))]',
                    )}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                disabled={page <= 1}
                onClick={() => {
                  setPage((p) => Math.max(1, p - 1))
                }}
                className="flex h-7 w-7 items-center justify-center rounded-sm border border-[hsl(var(--border))] bg-[hsl(var(--card))] transition-colors hover:bg-[hsl(var(--muted))] disabled:cursor-not-allowed disabled:opacity-40"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <span className="px-1 text-xs font-medium text-[hsl(var(--muted-foreground))]">
                {page} / {data?.pagination.totalPages ?? 1}
              </span>
              <button
                type="button"
                disabled={page >= (data?.pagination.totalPages ?? 1)}
                onClick={() => {
                  setPage((p) => p + 1)
                }}
                className="flex h-7 w-7 items-center justify-center rounded-sm border border-[hsl(var(--border))] bg-[hsl(var(--card))] transition-colors hover:bg-[hsl(var(--muted))] disabled:cursor-not-allowed disabled:opacity-40"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {brouillardACloturer && (
        <ClotureModal
          brouillard={brouillardACloturer}
          onClose={() => {
            setBrouillardACloturer(null)
          }}
        />
      )}
      {brouillardARejeter && (
        <RejeterModal
          brouillard={brouillardARejeter}
          onClose={() => {
            setBrouillardARejeter(null)
          }}
        />
      )}
    </div>
  )
}
