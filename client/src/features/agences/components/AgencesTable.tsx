import {
  useReactTable,
  getCoreRowModel,
  flexRender,
  type ColumnDef,
  type SortingState,
  type PaginationState,
  type Row,
  type Table,
} from '@tanstack/react-table'
import { useState, useMemo, useRef, useEffect } from 'react'
import {
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  MoreHorizontal,
  Building2,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react'
import { useAgences } from '../hooks'
import { AgenceStatusBadge } from './AgenceStatusBadge'
import { EmptyState } from '@/shared/components/feedback/EmptyState'
import { cn } from '@/shared/lib'
import { formatDateTime } from '@/shared/utils'
import type { Agence } from '../types'

interface AgencesTableProps {
  search: string
  onEdit: (agence: Agence) => void
  onDelete: (agence: Agence) => void
  onToggleStatus: (agence: Agence) => void
  onViewDetail: (id: string) => void
}

interface ActionsMenuProps {
  agence: Agence
  row: Row<Agence>
  table: Table<Agence>
  actionOpen: string | null
  setActionOpen: (id: string | null) => void
  onViewDetail: (id: string) => void
  onEdit: (agence: Agence) => void
  onToggleStatus: (agence: Agence) => void
  onDelete: (agence: Agence) => void
}

function ActionsMenu({
  agence,
  row,
  table,
  actionOpen,
  setActionOpen,
  onViewDetail,
  onToggleStatus,
  onDelete,
}: ActionsMenuProps) {
  const isOpen = actionOpen === agence.id
  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!isOpen) return

    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setActionOpen(null)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen, setActionOpen])

  const totalRows = table.getRowModel().rows.length
  const isNearBottom = row.index >= totalRows - 3 && totalRows > 3

  return (
    <div ref={menuRef} className="relative flex justify-end">
      <button
        type="button"
        aria-label="Actions"
        onClick={(e) => {
          e.stopPropagation()
          setActionOpen(isOpen ? null : agence.id)
        }}
        className="rounded-md p-1.5 text-[hsl(var(--muted-foreground))] transition-colors hover:bg-[hsl(var(--muted))] hover:text-[hsl(var(--foreground))]"
      >
        <MoreHorizontal size={16} aria-hidden="true" />
      </button>

      {isOpen && (
        <div
          className={cn(
            'absolute z-20 w-48 rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--card))] py-1 shadow-md',
            isNearBottom ? 'right-0 bottom-full mb-1' : 'top-full right-0 mt-1',
          )}
          role="menu"
        >
          <button
            type="button"
            role="menuitem"
            onClick={() => {
              setActionOpen(null)
              onViewDetail(agence.id)
            }}
            className="flex w-full items-center px-3 py-2 text-sm transition-colors hover:bg-[hsl(var(--muted))]"
          >
            Consulter
          </button>

          <button
            type="button"
            role="menuitem"
            onClick={() => {
              setActionOpen(null)
              onToggleStatus(agence)
            }}
            className="flex w-full items-center px-3 py-2 text-sm transition-colors hover:bg-[hsl(var(--muted))]"
          >
            {agence.actif ? 'Désactiver' : 'Activer'}
          </button>

          <div className="my-1 border-t border-[hsl(var(--border))]" />

          <button
            type="button"
            role="menuitem"
            onClick={() => {
              setActionOpen(null)
              onDelete(agence)
            }}
            className="flex w-full items-center px-3 py-2 text-sm text-[hsl(var(--destructive))] transition-colors hover:bg-[hsl(var(--destructive))]/10"
          >
            Supprimer
          </button>
        </div>
      )}
    </div>
  )
}

const PAGE_SIZES = [10, 20, 50]

export function AgencesTable({
  search,
  onEdit,
  onDelete,
  onToggleStatus,
  onViewDetail,
}: AgencesTableProps) {
  const [sorting, setSorting] = useState<SortingState>([])
  const [pagination, setPagination] = useState<PaginationState>({ pageIndex: 0, pageSize: 10 })
  const [actionOpen, setActionOpen] = useState<string | null>(null)

  // Réinitialiser la page à 0 quand la recherche change
  useEffect(() => {
    setPagination((p) => ({ ...p, pageIndex: 0 }))
  }, [search])

  const queryParams = useMemo(
    () => ({
      page: pagination.pageIndex + 1,
      limit: pagination.pageSize,
      search: search !== '' ? search : undefined,
      sortBy: sorting[0]?.id,
      sortOrder:
        sorting[0] !== undefined
          ? sorting[0].desc
            ? ('desc' as const)
            : ('asc' as const)
          : undefined,
    }),
    [pagination, sorting, search],
  )

  const { data, isLoading } = useAgences(queryParams)

  const columns = useMemo<ColumnDef<Agence>[]>(
    () => [
      {
        id: 'nom',
        header: 'Agence',
        accessorKey: 'nom',
        enableSorting: true,
        cell: ({ row }) => {
          const agence = row.original
          return (
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[hsl(var(--primary))] text-xs font-semibold text-white">
                {agence.nom.charAt(0).toUpperCase()}
              </div>
              <div className="min-w-0">
                <button
                  type="button"
                  onClick={() => {
                    onViewDetail(agence.id)
                  }}
                  className="text-left text-sm font-medium text-[hsl(var(--foreground))] hover:text-[hsl(var(--primary))] hover:underline"
                >
                  {agence.nom}
                </button>
                <p className="truncate text-xs text-[hsl(var(--muted-foreground))]">
                  {agence.code}
                </p>
              </div>
            </div>
          )
        },
      },
      {
        id: 'adresse',
        header: 'Adresse',
        accessorKey: 'adresse',
        enableSorting: false,
        cell: ({ row }) => (
          <span className="text-sm text-[hsl(var(--muted-foreground))]">
            {row.original.adresse || '—'}
          </span>
        ),
      },
      {
        id: 'telephone',
        header: 'Téléphone',
        accessorKey: 'telephone',
        enableSorting: false,
        cell: ({ row }) => (
          <span className="text-sm text-[hsl(var(--muted-foreground))]">
            {row.original.telephone || '—'}
          </span>
        ),
      },
      {
        id: 'email',
        header: 'Email',
        accessorKey: 'email',
        enableSorting: false,
        cell: ({ row }) => (
          <span className="text-sm text-[hsl(var(--muted-foreground))]">
            {row.original.email || '—'}
          </span>
        ),
      },
      {
        id: 'status',
        header: 'Statut',
        accessorKey: 'actif',
        enableSorting: true,
        cell: ({ row }) => <AgenceStatusBadge actif={row.original.actif} />,
      },
      {
        id: 'usersCount',
        header: 'Utilisateurs',
        accessorKey: '_count.users',
        enableSorting: false,
        cell: ({ row }) => (
          <span className="text-sm text-[hsl(var(--muted-foreground))]">
            {row.original._count?.users ?? 0}
          </span>
        ),
      },
      {
        id: 'createdAt',
        header: 'Créée le',
        accessorKey: 'createdAt',
        enableSorting: true,
        cell: ({ row }) => (
          <span className="text-sm text-[hsl(var(--muted-foreground))]">
            {formatDateTime(row.original.createdAt)}
          </span>
        ),
      },
      {
        id: 'actions',
        header: '',
        enableSorting: false,
        cell: ({ row, table }) => (
          <ActionsMenu
            agence={row.original}
            row={row}
            table={table}
            actionOpen={actionOpen}
            setActionOpen={setActionOpen}
            onViewDetail={onViewDetail}
            onEdit={onEdit}
            onToggleStatus={onToggleStatus}
            onDelete={onDelete}
          />
        ),
      },
    ],
    [actionOpen, onEdit, onDelete, onToggleStatus, onViewDetail],
  )

  const table = useReactTable({
    data: data?.items ?? [],
    columns,
    pageCount: data?.totalPages ?? -1,
    state: { sorting, pagination },
    onSortingChange: setSorting,
    onPaginationChange: setPagination,
    getCoreRowModel: getCoreRowModel(),
    manualSorting: true,
    manualPagination: true,
  })

  /* ---- Squelette de chargement ---- */
  if (isLoading) {
    return (
      <div className="overflow-hidden rounded-lg border border-[hsl(var(--border))]">
        <table className="w-full text-sm">
          <thead className="bg-[hsl(var(--muted))]">
            <tr>
              {[
                'Agence',
                'Adresse',
                'Téléphone',
                'Email',
                'Statut',
                'Utilisateurs',
                'Créée le',
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
            {Array.from({ length: 8 }).map((_, i) => (
              <tr key={i}>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 animate-pulse rounded-full bg-[hsl(var(--muted))]" />
                    <div className="space-y-1.5">
                      <div className="h-3.5 w-32 animate-pulse rounded bg-[hsl(var(--muted))]" />
                      <div className="h-3 w-20 animate-pulse rounded bg-[hsl(var(--muted))]" />
                    </div>
                  </div>
                </td>
                {Array.from({ length: 6 }).map((_, j) => (
                  <td key={j} className="px-4 py-3">
                    <div className="h-3.5 w-20 animate-pulse rounded bg-[hsl(var(--muted))]" />
                  </td>
                ))}
                <td className="px-4 py-3">
                  <div className="ml-auto h-6 w-6 animate-pulse rounded bg-[hsl(var(--muted))]" />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    )
  }

  /* ---- État vide ---- */
  if (!isLoading && (!data?.items || data.items.length === 0)) {
    return (
      <div className="rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--card))]">
        <EmptyState
          icon={Building2}
          title={search !== '' ? 'Aucun résultat pour cette recherche' : 'Aucune agence'}
          description={
            search !== '' ? "Essayez avec d'autres termes." : 'Commencez par créer une agence.'
          }
        />
      </div>
    )
  }

  const total = data?.total ?? 0
  const from = total === 0 ? 0 : pagination.pageIndex * pagination.pageSize + 1
  const to = Math.min((pagination.pageIndex + 1) * pagination.pageSize, total)

  return (
    <div className="space-y-4">
      <div className="overflow-x-auto rounded-lg border border-[hsl(var(--border))] shadow-sm">
        <table className="w-full text-sm" aria-label="Liste des agences">
          <thead className="bg-[hsl(var(--muted))]">
            {table.getHeaderGroups().map((hg) => (
              <tr key={hg.id}>
                {hg.headers.map((header) => (
                  <th
                    key={header.id}
                    className="px-4 py-3 text-left text-xs font-medium tracking-wider text-[hsl(var(--muted-foreground))] uppercase"
                  >
                    {header.column.getCanSort() ? (
                      <button
                        type="button"
                        onClick={header.column.getToggleSortingHandler()}
                        className="flex items-center gap-1 transition-colors hover:text-[hsl(var(--foreground))]"
                      >
                        {flexRender(header.column.columnDef.header, header.getContext())}
                        {header.column.getIsSorted() === 'asc' ? (
                          <ArrowUp size={12} aria-hidden="true" />
                        ) : header.column.getIsSorted() === 'desc' ? (
                          <ArrowDown size={12} aria-hidden="true" />
                        ) : (
                          <ArrowUpDown size={12} className="opacity-40" aria-hidden="true" />
                        )}
                      </button>
                    ) : (
                      flexRender(header.column.columnDef.header, header.getContext())
                    )}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody className="divide-y divide-[hsl(var(--border))] bg-[hsl(var(--card))]">
            {table.getRowModel().rows.map((row) => (
              <tr key={row.id} className="transition-colors hover:bg-[hsl(var(--muted))]/50">
                {row.getVisibleCells().map((cell) => (
                  <td
                    key={cell.id}
                    className={cn('px-4 py-3', cell.column.id === 'actions' && 'w-12 overflow-visible')}
                  >
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {total > 0 && (
        <div className="flex flex-col items-center justify-between gap-4 border-t border-[hsl(var(--border))] pt-3 text-sm sm:flex-row">
          <p className="font-medium text-[hsl(var(--muted-foreground))]">
            {from} à {to} sur {total} agence{total > 1 ? 's' : ''}
          </p>

          <div className="flex flex-wrap items-center gap-6">
            <div className="flex items-center gap-2">
              <span className="text-xs font-medium text-[hsl(var(--muted-foreground))]">
                Lignes par page :
              </span>
              <div className="flex items-center gap-1">
                {PAGE_SIZES.map((size) => (
                  <button
                    key={size}
                    type="button"
                    onClick={() => {
                      setPagination((p) => ({ ...p, pageIndex: 0, pageSize: size }))
                    }}
                    className={cn(
                      'h-7 min-w-[28px] rounded-[var(--radius-sm)] border border-[hsl(var(--border))] px-1.5 text-xs font-medium transition-colors hover:bg-[hsl(var(--muted))]',
                      pagination.pageSize === size
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
                disabled={!table.getCanPreviousPage()}
                onClick={() => {
                  table.previousPage()
                }}
                className="flex h-7 w-7 items-center justify-center rounded-[var(--radius-sm)] border border-[hsl(var(--border))] bg-[hsl(var(--card))] transition-colors hover:bg-[hsl(var(--muted))] disabled:cursor-not-allowed disabled:opacity-40"
                aria-label="Page précédente"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>

              <span className="px-1 text-xs font-medium text-[hsl(var(--muted-foreground))]">
                {pagination.pageIndex + 1} / {data?.totalPages ?? 1}
              </span>

              <button
                type="button"
                disabled={!table.getCanNextPage()}
                onClick={() => {
                  table.nextPage()
                }}
                className="flex h-7 w-7 items-center justify-center rounded-[var(--radius-sm)] border border-[hsl(var(--border))] bg-[hsl(var(--card))] transition-colors hover:bg-[hsl(var(--muted))] disabled:cursor-not-allowed disabled:opacity-40"
                aria-label="Page suivante"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
