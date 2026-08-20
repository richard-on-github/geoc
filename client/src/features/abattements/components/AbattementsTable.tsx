import {
  useReactTable,
  getCoreRowModel,
  flexRender,
  type ColumnDef,
  type PaginationState,
} from '@tanstack/react-table'
import { useState, useMemo, useEffect } from 'react'
import { ChevronLeft, ChevronRight, ReceiptText, Wallet } from 'lucide-react'
import { useAbattements } from '../hooks/useAbattements'
import { EmptyState } from '@/shared/components/feedback/EmptyState'
import { Can } from '@/shared/components/navigation/Can'
import { formatCurrency } from '@/shared/utils'
import { AbattementStatutBadge } from './AbattementStatutBadge'
import { VersementModal } from './VersementModal'
import type { AbattementFiltersState, AbattementLigne, VenteAvecAbattement } from '../types'

interface AbattementsTableProps {
  filters: AbattementFiltersState & {
    jour?: number | undefined
    mois?: number | undefined
    annee?: number | undefined
  }
}

const PAGE_SIZES = [10, 20, 50]

export function AbattementsTable({ filters }: AbattementsTableProps) {
  const [pagination, setPagination] = useState<PaginationState>({ pageIndex: 0, pageSize: 20 })
  const [venteSelectionnee, setVenteSelectionnee] = useState<VenteAvecAbattement | null>(null)

  useEffect(() => {
    setPagination((p) => ({ ...p, pageIndex: 0 }))
  }, [filters.search, filters.agenceId, filters.dateDebut, filters.dateFin, filters.statut])

  const toOptionalString = (value: string | null | undefined): string | undefined => {
    if (value === null || value === undefined || value === '') return undefined
    return value
  }

  const queryParams = useMemo(
    () => ({
      page: pagination.pageIndex + 1,
      limit: pagination.pageSize,
      search: toOptionalString(filters.search),
      agenceId: toOptionalString(filters.agenceId),
      dateDebut: toOptionalString(filters.dateDebut),
      dateFin: toOptionalString(filters.dateFin),
      statut: filters.statut,
      jour: filters.jour,
      mois: filters.mois,
      annee: filters.annee,
    }),
    [pagination, filters],
  )

  const { data, isPending, isFetching } = useAbattements(queryParams)
  const isLoading = isPending && isFetching

  const columns = useMemo<ColumnDef<AbattementLigne>[]>(
    () => [
      {
        id: 'date',
        header: 'Date',
        cell: ({ row }) => new Date(row.original.vente.dateDebut).toLocaleDateString(),
      },
      {
        id: 'journee',
        header: 'Journée',
        cell: ({ row }) => row.original.vente.jourAnnee,
      },
      {
        id: 'numeroOP',
        header: 'N° OP',
        cell: ({ row }) => row.original.vente.numeroTS10,
      },
      {
        id: 'agence',
        header: 'Agence',
        cell: ({ row }) => row.original.vente.agenceNom,
      },
      {
        id: 'ventes',
        header: 'Ventes',
        cell: ({ row }) => (
          <span className="font-medium">{formatCurrency(row.original.vente.totalVente)}</span>
        ),
      },
      {
        id: 'paiement',
        header: 'Paiement',
        cell: ({ row }) => formatCurrency(row.original.vente.totalPaye),
      },
      {
        id: 'solde',
        header: 'Solde à verser',
        cell: ({ row }) => formatCurrency(row.original.vente.totalSolde),
      },
      {
        id: 'statut',
        header: 'Statut',
        cell: ({ row }) => <AbattementStatutBadge statut={row.original.abattement.statut} />,
      },
      {
        id: 'abattement',
        header: 'Abattement',
        cell: ({ row }) => {
          const montant = row.original.abattement.montantAbattement
          return montant > 0 ? (
            <span className="font-medium text-[hsl(var(--destructive))]">
              {formatCurrency(montant)}
            </span>
          ) : (
            <span className="text-[hsl(var(--muted-foreground))]">-</span>
          )
        },
      },
      {
        id: 'action',
        header: '',
        cell: ({ row }) => (
          <Can permission="abattement.versement.manage">
            <button
              type="button"
              onClick={() => {
                setVenteSelectionnee(row.original.vente)
              }}
              className="flex items-center gap-1 text-xs font-medium text-[hsl(var(--primary))] hover:underline"
            >
              <Wallet size={14} />
              {row.original.vente.abattementVersement ? 'Modifier' : 'Versement'}
            </button>
          </Can>
        ),
      },
    ],
    [],
  )

  const table = useReactTable({
    data: data?.lignes ?? [],
    columns,
    pageCount: data?.pagination.totalPages ?? -1,
    state: { pagination },
    onPaginationChange: setPagination,
    getCoreRowModel: getCoreRowModel(),
    manualPagination: true,
  })

  if (isLoading) {
    return (
      <div className="overflow-hidden rounded-lg border border-[hsl(var(--border))]">
        <table className="w-full text-sm">
          <thead className="bg-[hsl(var(--muted))]">
            <tr>
              {['Date', 'Journée', 'N° OP', 'Agence', 'Ventes', 'Paiement', 'Solde', 'Statut', 'Abattement', ''].map(
                (h) => (
                  <th
                    key={h}
                    className="px-4 py-3 text-left text-xs font-medium tracking-wider text-[hsl(var(--muted-foreground))] uppercase"
                  >
                    {h}
                  </th>
                ),
              )}
            </tr>
          </thead>
          <tbody className="divide-y divide-[hsl(var(--border))] bg-[hsl(var(--card))]">
            {Array.from({ length: 8 }).map((_, i) => (
              <tr key={i}>
                {Array.from({ length: 10 }).map((_, j) => (
                  <td key={j} className="px-4 py-3">
                    <div className="h-3.5 w-20 animate-pulse rounded bg-[hsl(var(--muted))]" />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    )
  }

  const lignes = data?.lignes ?? []
  if (lignes.length === 0) {
    return (
      <div className="rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--card))]">
        <EmptyState
          icon={ReceiptText}
          title="Aucun abattement"
          description="Aucune vente ne correspond à ces critères pour le moment."
        />
      </div>
    )
  }

  const total = data?.pagination.total ?? 0
  const from = total === 0 ? 0 : pagination.pageIndex * pagination.pageSize + 1
  const to = Math.min((pagination.pageIndex + 1) * pagination.pageSize, total)

  return (
    <div className="space-y-4">
      <div className="overflow-x-auto rounded-lg border border-[hsl(var(--border))] shadow-sm">
        <table className="w-full text-sm" aria-label="Liste des abattements">
          <thead className="bg-[hsl(var(--muted))]">
            {table.getHeaderGroups().map((hg) => (
              <tr key={hg.id}>
                {hg.headers.map((header) => (
                  <th
                    key={header.id}
                    className="px-4 py-3 text-left text-xs font-medium tracking-wider text-[hsl(var(--muted-foreground))] uppercase"
                  >
                    {flexRender(header.column.columnDef.header, header.getContext())}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody className="divide-y divide-[hsl(var(--border))] bg-[hsl(var(--card))]">
            {table.getRowModel().rows.map((row) => (
              <tr key={row.id} className="transition-colors hover:bg-[hsl(var(--muted))]/50">
                {row.getVisibleCells().map((cell) => (
                  <td key={cell.id} className="px-4 py-3">
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {total > 0 && (
        <div className="flex flex-col items-center justify-between gap-4 border-t border-[hsl(var(--border))] pt-3 text-sm sm:flex-row">
          <p className="font-medium text-[hsl(var(--muted-foreground))]">
            {from} à {to} sur {total} ligne{total > 1 ? 's' : ''}
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
                      setPagination({ pageIndex: 0, pageSize: size })
                    }}
                    className={
                      'h-7 min-w-7 rounded-sm border border-[hsl(var(--border))] px-1.5 text-xs font-medium transition-colors hover:bg-[hsl(var(--muted))] ' +
                      (pagination.pageSize === size
                        ? 'border-[hsl(var(--primary))] bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))]'
                        : 'bg-[hsl(var(--card))] text-[hsl(var(--foreground))]')
                    }
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                disabled={!table.getCanPreviousPage()}
                onClick={() => {
                  table.previousPage()
                }}
                className="flex h-7 w-7 items-center justify-center rounded-sm border border-[hsl(var(--border))] bg-[hsl(var(--card))] transition-colors hover:bg-[hsl(var(--muted))] disabled:cursor-not-allowed disabled:opacity-40"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <span className="px-1 text-xs font-medium text-[hsl(var(--muted-foreground))]">
                {pagination.pageIndex + 1} / {data?.pagination.totalPages ?? 1}
              </span>
              <button
                type="button"
                disabled={!table.getCanNextPage()}
                onClick={() => {
                  table.nextPage()
                }}
                className="flex h-7 w-7 items-center justify-center rounded-sm border border-[hsl(var(--border))] bg-[hsl(var(--card))] transition-colors hover:bg-[hsl(var(--muted))] disabled:cursor-not-allowed disabled:opacity-40"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {venteSelectionnee && (
        <VersementModal
          vente={venteSelectionnee}
          onClose={() => {
            setVenteSelectionnee(null)
          }}
        />
      )}
    </div>
  )
}
