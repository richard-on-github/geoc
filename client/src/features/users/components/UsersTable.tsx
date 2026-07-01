import {
  useReactTable,
  getCoreRowModel,
  flexRender,
  type ColumnDef,
  type SortingState,
  type PaginationState,
} from '@tanstack/react-table'
import { useState, useMemo } from 'react'
import { ArrowUpDown, ArrowUp, ArrowDown, MoreHorizontal, Users } from 'lucide-react'
import { useUsers } from '../hooks'
import { UserStatusBadge } from './UserStatusBadge'
import { EmptyState } from '@/shared/components/feedback/EmptyState'
import { cn } from '@/shared/lib'
import { formatDateTime, getInitials } from '@/shared/utils'
import type { User } from '../types'

interface UsersTableProps {
  search: string
  onEdit: (user: User) => void
  onDelete: (user: User) => void
  onToggleStatus: (user: User) => void
  onViewDetail: (userId: string) => void
}

const PAGE_SIZES = [10, 20, 50]

export function UsersTable({
  search,
  onEdit,
  onDelete,
  onToggleStatus,
  onViewDetail,
}: UsersTableProps) {
  const [sorting, setSorting] = useState<SortingState>([])
  const [pagination, setPagination] = useState<PaginationState>({ pageIndex: 0, pageSize: 10 })
  const [actionOpen, setActionOpen] = useState<string | null>(null)

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

  const { data, isLoading } = useUsers(queryParams)

  const columns = useMemo<ColumnDef<User>[]>(
    () => [
      {
        id: 'user',
        header: 'Utilisateur',
        accessorKey: 'fullName',
        enableSorting: true,
        cell: ({ row }) => {
          const user = row.original
          return (
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[hsl(var(--primary))] text-xs font-semibold text-white">
                {getInitials(user.fullName)}
              </div>
              <div className="min-w-0">
                <button
                  type="button"
                  onClick={() => {
                    onViewDetail(user.id)
                  }}
                  className="text-left text-sm font-medium text-[hsl(var(--foreground))] hover:text-[hsl(var(--primary))] hover:underline"
                >
                  {user.fullName}
                </button>
                <p className="truncate text-xs text-[hsl(var(--muted-foreground))]">{user.email}</p>
              </div>
            </div>
          )
        },
      },
      {
        id: 'role',
        header: 'Rôle',
        accessorKey: 'role.displayName',
        enableSorting: false,
        cell: ({ row }) => (
          <span className="inline-flex items-center rounded-md border border-[hsl(var(--border))] px-2 py-0.5 text-xs text-[hsl(var(--muted-foreground))]">
            {row.original.role.displayName}
          </span>
        ),
      },
      {
        id: 'status',
        header: 'Statut',
        accessorKey: 'isActive',
        enableSorting: true,
        cell: ({ row }) => <UserStatusBadge isActive={row.original.isActive} />,
      },
      {
        id: 'lastLogin',
        header: 'Dernière connexion',
        accessorKey: 'lastLoginAt',
        enableSorting: true,
        cell: ({ row }) =>
          row.original.lastLoginAt !== null ? (
            <span className="text-sm text-[hsl(var(--muted-foreground))]">
              {formatDateTime(row.original.lastLoginAt)}
            </span>
          ) : (
            <span className="text-sm text-[hsl(var(--muted-foreground))] opacity-50">Jamais</span>
          ),
      },
      {
        id: 'createdAt',
        header: 'Créé le',
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
        cell: ({ row }) => {
          const user = row.original
          const isOpen = actionOpen === user.id
          return (
            <div className="relative flex justify-end">
              <button
                type="button"
                aria-label="Actions"
                onClick={(e) => {
                  e.stopPropagation()
                  setActionOpen(isOpen ? null : user.id)
                }}
                className="rounded-md p-1.5 text-[hsl(var(--muted-foreground))] transition-colors hover:bg-[hsl(var(--muted))] hover:text-[hsl(var(--foreground))]"
              >
                <MoreHorizontal size={16} aria-hidden="true" />
              </button>
              {isOpen && (
                <div
                  className="absolute top-full right-0 z-20 mt-1 w-48 rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--card))] py-1 shadow-md"
                  role="menu"
                >
                  <button
                    type="button"
                    role="menuitem"
                    onClick={() => {
                      setActionOpen(null)
                      onViewDetail(user.id)
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
                      onEdit(user)
                    }}
                    className="flex w-full items-center px-3 py-2 text-sm transition-colors hover:bg-[hsl(var(--muted))]"
                  >
                    Modifier
                  </button>
                  <button
                    type="button"
                    role="menuitem"
                    onClick={() => {
                      setActionOpen(null)
                      onToggleStatus(user)
                    }}
                    className="flex w-full items-center px-3 py-2 text-sm transition-colors hover:bg-[hsl(var(--muted))]"
                  >
                    {user.isActive ? 'Désactiver' : 'Activer'}
                  </button>
                  <div className="my-1 border-t border-[hsl(var(--border))]" />
                  <button
                    type="button"
                    role="menuitem"
                    onClick={() => {
                      setActionOpen(null)
                      onDelete(user)
                    }}
                    className="flex w-full items-center px-3 py-2 text-sm text-[hsl(var(--destructive))] transition-colors hover:bg-[hsl(var(--destructive))]/10"
                  >
                    Supprimer
                  </button>
                </div>
              )}
            </div>
          )
        },
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

  /* ---- Skeleton ---- */
  if (isLoading) {
    return (
      <div className="overflow-hidden rounded-lg border border-[hsl(var(--border))]">
        <table className="w-full text-sm">
          <thead className="bg-[hsl(var(--muted))]">
            <tr>
              {['Utilisateur', 'Rôle', 'Statut', 'Dernière connexion', 'Créé le', ''].map((h) => (
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
                      <div className="h-3 w-44 animate-pulse rounded bg-[hsl(var(--muted))]" />
                    </div>
                  </div>
                </td>
                {Array.from({ length: 4 }).map((_, j) => (
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

  /* ---- Empty ---- */
  if (!isLoading && (!data?.items || data.items.length === 0)) {
    return (
      <div className="rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--card))]">
        <EmptyState
          icon={Users}
          title={search !== '' ? 'Aucun résultat pour cette recherche' : 'Aucun utilisateur'}
          description={
            search !== '' ? "Essayez avec d'autres termes." : 'Commencez par créer un utilisateur.'
          }
        />
      </div>
    )
  }

  /* ---- Table ---- */
  return (
    <div className="space-y-3">
      <div className="overflow-hidden rounded-lg border border-[hsl(var(--border))]">
        <table className="w-full text-sm" aria-label="Liste des utilisateurs">
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
                    className={cn('px-4 py-3', cell.column.id === 'actions' && 'w-12')}
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
      <div className="flex items-center justify-between text-sm">
        <p className="text-[hsl(var(--muted-foreground))]">
          {data !== undefined && (
            <>
              {pagination.pageIndex * pagination.pageSize + 1}–
              {Math.min((pagination.pageIndex + 1) * pagination.pageSize, data.total)} sur{' '}
              {data.total} utilisateur{data.total > 1 ? 's' : ''}
            </>
          )}
        </p>
        <div className="flex items-center gap-3">
          <select
            value={pagination.pageSize}
            onChange={(e) => {
              setPagination((p) => ({ ...p, pageIndex: 0, pageSize: Number(e.target.value) }))
            }}
            className="rounded-[var(--radius-sm)] border border-[hsl(var(--border))] bg-[hsl(var(--card))] px-2 py-1 text-xs"
            aria-label="Lignes par page"
          >
            {PAGE_SIZES.map((s) => (
              <option key={s} value={s}>
                {s} / page
              </option>
            ))}
          </select>
          <div className="flex items-center gap-1">
            <button
              type="button"
              disabled={!table.getCanPreviousPage()}
              onClick={() => {
                table.previousPage()
              }}
              className="rounded-[var(--radius-sm)] border border-[hsl(var(--border))] px-2 py-1 text-xs transition-colors hover:bg-[hsl(var(--muted))] disabled:cursor-not-allowed disabled:opacity-40"
            >
              Précédent
            </button>
            <span className="px-2 text-[hsl(var(--muted-foreground))]">
              Page {pagination.pageIndex + 1} / {data?.totalPages ?? 1}
            </span>
            <button
              type="button"
              disabled={!table.getCanNextPage()}
              onClick={() => {
                table.nextPage()
              }}
              className="rounded-[var(--radius-sm)] border border-[hsl(var(--border))] px-2 py-1 text-xs transition-colors hover:bg-[hsl(var(--muted))] disabled:cursor-not-allowed disabled:opacity-40"
            >
              Suivant
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
