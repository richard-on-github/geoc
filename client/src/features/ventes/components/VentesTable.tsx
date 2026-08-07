// import {
//   useReactTable,
//   getCoreRowModel,
//   flexRender,
//   type ColumnDef,
//   type SortingState,
//   type PaginationState,
// } from '@tanstack/react-table'
// import { useState, useMemo, useEffect } from 'react'
// import {
//   ArrowUpDown,
//   ArrowUp,
//   ArrowDown,
//   ChevronLeft,
//   ChevronRight,
//   Receipt,
//   Lock,
//   Unlock,
// } from 'lucide-react'
// import { useVentes } from '../hooks'
// import { EmptyState } from '@/shared/components/feedback/EmptyState'
// import { cn } from '@/shared/lib'
// import { formatCurrency } from '@/shared/utils'
// import type { Vente } from '../types'

// interface VentesTableProps {
//   filters: {
//     search: string
//     agenceId?: string
//     dateDebut?: string
//     dateFin?: string
//     clotureId?: string
//     nonClotureesOnly?: boolean
//   }
// }

// const PAGE_SIZES = [10, 20, 50]

// export function VentesTable({ filters }: VentesTableProps) {
//   const [sorting, setSorting] = useState<SortingState>([])
//   const [pagination, setPagination] = useState<PaginationState>({ pageIndex: 0, pageSize: 20 })

//   useEffect(() => {
//     setPagination((p) => ({ ...p, pageIndex: 0 }))
//   }, [
//     filters.search,
//     filters.agenceId,
//     filters.dateDebut,
//     filters.dateFin,
//     filters.clotureId,
//     filters.nonClotureesOnly,
//   ])

//   const toOptionalString = (value: string | null | undefined): string | undefined => {
//     if (value === null || value === undefined || value === '') {
//       return undefined
//     }
//     return value
//   }

//   const queryParams = useMemo(
//     () => ({
//       page: pagination.pageIndex + 1,
//       limit: pagination.pageSize,
//       search: toOptionalString(filters.search),
//       agenceId: toOptionalString(filters.agenceId),
//       dateDebut: toOptionalString(filters.dateDebut),
//       dateFin: toOptionalString(filters.dateFin),
//       clotureId: toOptionalString(filters.clotureId),
//       nonClotureesOnly: filters.nonClotureesOnly === true ? true : undefined,
//       sortBy: sorting[0]?.id as 'dateDebut' | 'totalVente' | 'createdAt' | undefined,
//       sortOrder:
//         sorting[0] !== undefined
//           ? sorting[0].desc
//             ? ('desc' as const)
//             : ('asc' as const)
//           : undefined,
//     }),
//     [pagination, sorting, filters],
//   )

//   const { data, isPending, isFetching } = useVentes(queryParams)
//   const isLoading = isPending && isFetching

//   const columns = useMemo<ColumnDef<Vente>[]>(
//     () => [
//       {
//         id: 'statut',
//         header: '',
//         accessorKey: 'clotureId',
//         enableSorting: false,
//         cell: ({ row }) => {
//           const clotureId = row.original.clotureId
//           const hasClotureId = typeof clotureId === 'string' && clotureId !== ''

//           return hasClotureId ? (
//             <span title="Clôturée" className="mx-auto flex justify-center">
//               <Lock size={16} className="text-[hsl(var(--destructive))]" />
//             </span>
//           ) : (
//             <span title="Non clôturée" className="mx-auto flex justify-center">
//               <Unlock size={16} className="text-green-500" />
//             </span>
//           )
//         },
//       },
//       {
//         id: 'agenceNom',
//         header: 'Agence',
//         accessorKey: 'agenceNom',
//         enableSorting: true,
//       },
//       {
//         id: 'kiosque',
//         header: 'Kiosque',
//         accessorKey: 'kiosque',
//         enableSorting: false,
//       },
//       {
//         id: 'agent',
//         header: 'Agent',
//         accessorKey: 'agent',
//         enableSorting: false,
//       },
//       {
//         id: 'numeroTS10',
//         header: 'N° TS10',
//         accessorKey: 'numeroTS10',
//         enableSorting: false,
//       },
//       {
//         id: 'totalVente',
//         header: 'Vente',
//         accessorKey: 'totalVente',
//         enableSorting: true,
//         cell: ({ row }) => (
//           <span className="font-medium">{formatCurrency(row.original.totalVente)}</span>
//         ),
//       },
//       {
//         id: 'totalPaye',
//         header: 'Payé',
//         accessorKey: 'totalPaye',
//         enableSorting: false,
//         cell: ({ row }) => formatCurrency(row.original.totalPaye),
//       },
//       {
//         id: 'totalSolde',
//         header: 'Solde',
//         accessorKey: 'totalSolde',
//         enableSorting: false,
//         cell: ({ row }) => (
//           <span className={cn(row.original.totalSolde > 0 && 'text-[hsl(var(--destructive))]')}>
//             {formatCurrency(row.original.totalSolde)}
//           </span>
//         ),
//       },
//       {
//         id: 'dateDebut',
//         header: 'Période',
//         accessorKey: 'dateDebut',
//         enableSorting: true,
//         cell: ({ row }) => (
//           <span className="text-sm text-[hsl(var(--muted-foreground))]">
//             {new Date(row.original.dateDebut).toLocaleDateString()} -{' '}
//             {new Date(row.original.dateFin).toLocaleDateString()}
//           </span>
//         ),
//       },
//     ],
//     [],
//   )

//   const table = useReactTable({
//     data: data?.items ?? [],
//     columns,
//     pageCount: data?.totalPages ?? -1,
//     state: { sorting, pagination },
//     onSortingChange: setSorting,
//     onPaginationChange: setPagination,
//     getCoreRowModel: getCoreRowModel(),
//     manualSorting: true,
//     manualPagination: true,
//   })

//   // Loader
//   if (isLoading) {
//     return (
//       <div className="overflow-hidden rounded-lg border border-[hsl(var(--border))]">
//         <table className="w-full text-sm">
//           <thead className="bg-[hsl(var(--muted))]">
//             <tr>
//               {[
//                 'Agence',
//                 'Kiosque',
//                 'Agent',
//                 'Banque',
//                 'N° TS10',
//                 'Total Vente',
//                 'Payé',
//                 'Solde',
//                 'Période',
//                 'Importé le',
//               ].map((h) => (
//                 <th
//                   key={h}
//                   className="px-4 py-3 text-left text-xs font-medium tracking-wider text-[hsl(var(--muted-foreground))] uppercase"
//                 >
//                   {h}
//                 </th>
//               ))}
//             </tr>
//           </thead>
//           <tbody className="divide-y divide-[hsl(var(--border))] bg-[hsl(var(--card))]">
//             {Array.from({ length: 8 }).map((_, i) => (
//               <tr key={i}>
//                 {Array.from({ length: 10 }).map((_, j) => (
//                   <td key={j} className="px-4 py-3">
//                     <div className="h-3.5 w-20 animate-pulse rounded bg-[hsl(var(--muted))]" />
//                   </td>
//                 ))}
//               </tr>
//             ))}
//           </tbody>
//         </table>
//       </div>
//     )
//   }

//   // Empty
//   const venteItems = data?.items ?? []
//   if (venteItems.length === 0) {
//     return (
//       <div className="rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--card))]">
//         <EmptyState
//           icon={Receipt}
//           title="Aucune vente"
//           description="Importez un fichier de ventes pour commencer."
//         />
//       </div>
//     )
//   }

//   const total = data?.total ?? 0
//   const from = total === 0 ? 0 : pagination.pageIndex * pagination.pageSize + 1
//   const to = Math.min((pagination.pageIndex + 1) * pagination.pageSize, total)

//   return (
//     <div className="space-y-4">
//       <div className="overflow-x-auto rounded-lg border border-[hsl(var(--border))] shadow-sm">
//         <table className="w-full text-sm" aria-label="Liste des ventes">
//           <thead className="bg-[hsl(var(--muted))]">
//             {table.getHeaderGroups().map((hg) => (
//               <tr key={hg.id}>
//                 {hg.headers.map((header) => (
//                   <th
//                     key={header.id}
//                     className="px-4 py-3 text-left text-xs font-medium tracking-wider text-[hsl(var(--muted-foreground))] uppercase"
//                   >
//                     {header.column.getCanSort() ? (
//                       <button
//                         type="button"
//                         onClick={header.column.getToggleSortingHandler()}
//                         className="flex items-center gap-1 transition-colors hover:text-[hsl(var(--foreground))]"
//                       >
//                         {flexRender(header.column.columnDef.header, header.getContext())}
//                         {header.column.getIsSorted() === 'asc' ? (
//                           <ArrowUp size={12} aria-hidden="true" />
//                         ) : header.column.getIsSorted() === 'desc' ? (
//                           <ArrowDown size={12} aria-hidden="true" />
//                         ) : (
//                           <ArrowUpDown size={12} className="opacity-40" aria-hidden="true" />
//                         )}
//                       </button>
//                     ) : (
//                       flexRender(header.column.columnDef.header, header.getContext())
//                     )}
//                   </th>
//                 ))}
//               </tr>
//             ))}
//           </thead>
//           <tbody className="divide-y divide-[hsl(var(--border))] bg-[hsl(var(--card))]">
//             {table.getRowModel().rows.map((row) => (
//               <tr key={row.id} className="transition-colors hover:bg-[hsl(var(--muted))]/50">
//                 {row.getVisibleCells().map((cell) => (
//                   <td key={cell.id} className="px-4 py-3">
//                     {flexRender(cell.column.columnDef.cell, cell.getContext())}
//                   </td>
//                 ))}
//               </tr>
//             ))}
//           </tbody>
//         </table>
//       </div>

//       {/* Pagination */}
//       {total > 0 && (
//         <div className="flex flex-col items-center justify-between gap-4 border-t border-[hsl(var(--border))] pt-3 text-sm sm:flex-row">
//           <p className="font-medium text-[hsl(var(--muted-foreground))]">
//             {from} à {to} sur {total} vente{total > 1 ? 's' : ''}
//           </p>

//           <div className="flex flex-wrap items-center gap-6">
//             <div className="flex items-center gap-2">
//               <span className="text-xs font-medium text-[hsl(var(--muted-foreground))]">
//                 Lignes :
//               </span>
//               <div className="flex items-center gap-1">
//                 {PAGE_SIZES.map((size) => (
//                   <button
//                     key={size}
//                     type="button"
//                     onClick={() => {
//                       setPagination({ pageIndex: 0, pageSize: size })
//                     }}
//                     className={cn(
//                       'h-7 min-w-7 rounded-sm border border-[hsl(var(--border))] px-1.5 text-xs font-medium transition-colors hover:bg-[hsl(var(--muted))]',
//                       pagination.pageSize === size
//                         ? 'border-[hsl(var(--primary))] bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))]'
//                         : 'bg-[hsl(var(--card))] text-[hsl(var(--foreground))]',
//                     )}
//                   >
//                     {size}
//                   </button>
//                 ))}
//               </div>
//             </div>

//             <div className="flex items-center gap-2">
//               <button
//                 type="button"
//                 disabled={!table.getCanPreviousPage()}
//                 onClick={() => {
//                   table.previousPage()
//                 }}
//                 className="flex h-7 w-7 items-center justify-center rounded-sm border border-[hsl(var(--border))] bg-[hsl(var(--card))] transition-colors hover:bg-[hsl(var(--muted))] disabled:cursor-not-allowed disabled:opacity-40"
//               >
//                 <ChevronLeft className="h-4 w-4" />
//               </button>
//               <span className="px-1 text-xs font-medium text-[hsl(var(--muted-foreground))]">
//                 {pagination.pageIndex + 1} / {data?.totalPages ?? 1}
//               </span>
//               <button
//                 type="button"
//                 disabled={!table.getCanNextPage()}
//                 onClick={() => {
//                   table.nextPage()
//                 }}
//                 className="flex h-7 w-7 items-center justify-center rounded-sm border border-[hsl(var(--border))] bg-[hsl(var(--card))] transition-colors hover:bg-[hsl(var(--muted))] disabled:cursor-not-allowed disabled:opacity-40"
//               >
//                 <ChevronRight className="h-4 w-4" />
//               </button>
//             </div>
//           </div>
//         </div>
//       )}
//     </div>
//   )
// }

import {
  useReactTable,
  getCoreRowModel,
  flexRender,
  type ColumnDef,
  type SortingState,
  type PaginationState,
} from '@tanstack/react-table'
import { useState, useMemo, useEffect } from 'react'
import {
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  ChevronLeft,
  ChevronRight,
  Receipt,
  Lock,
  Unlock,
} from 'lucide-react'
import { useVentes } from '../hooks'
import { EmptyState } from '@/shared/components/feedback/EmptyState'
import { cn } from '@/shared/lib'
import { formatCurrency } from '@/shared/utils'
import type { Vente, VenteFiltersState } from '../types'

interface VentesTableProps {
  filters: VenteFiltersState & {
    /** Jour de l'année (1-366), typiquement fourni par VentesBrowser lors d'un drill-down. */
    jour?: number | undefined
    mois?: number | undefined
    annee?: number | undefined
  }
}

const PAGE_SIZES = [10, 20, 50]

export function VentesTable({ filters }: VentesTableProps) {
  const [sorting, setSorting] = useState<SortingState>([])
  const [pagination, setPagination] = useState<PaginationState>({ pageIndex: 0, pageSize: 20 })

  useEffect(() => {
    setPagination((p) => ({ ...p, pageIndex: 0 }))
  }, [
    filters.search,
    filters.agenceId,
    filters.dateDebut,
    filters.dateFin,
    filters.clotureId,
    filters.nonClotureesOnly,
    filters.jour,
    filters.mois,
    filters.annee,
  ])

  const toOptionalString = (value: string | null | undefined): string | undefined => {
    if (value === null || value === undefined || value === '') {
      return undefined
    }
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
      clotureId: toOptionalString(filters.clotureId),
      nonClotureesOnly: filters.nonClotureesOnly === true ? true : undefined,
      jour: filters.jour,
      mois: filters.mois,
      annee: filters.annee,
      sortBy: sorting[0]?.id as 'agenceNom' | 'dateDebut' | 'totalVente' | 'createdAt' | undefined,
      sortOrder:
        sorting[0] !== undefined
          ? sorting[0].desc
            ? ('desc' as const)
            : ('asc' as const)
          : undefined,
    }),
    [pagination, sorting, filters],
  )

  const { data, isPending, isFetching } = useVentes(queryParams)
  const isLoading = isPending && isFetching

  const columns = useMemo<ColumnDef<Vente>[]>(
    () => [
      {
        id: 'statut',
        header: '',
        accessorKey: 'clotureId',
        enableSorting: false,
        cell: ({ row }) => {
          const clotureId = row.original.clotureId
          const hasClotureId = typeof clotureId === 'string' && clotureId !== ''

          return hasClotureId ? (
            <span title="Clôturée" className="mx-auto flex justify-center">
              <Lock size={16} className="text-[hsl(var(--destructive))]" />
            </span>
          ) : (
            <span title="Non clôturée" className="mx-auto flex justify-center">
              <Unlock size={16} className="text-green-500" />
            </span>
          )
        },
      },
      {
        id: 'agenceNom',
        header: 'Agence',
        accessorKey: 'agenceNom',
        enableSorting: true,
      },
      {
        id: 'kiosque',
        header: 'Kiosque',
        accessorKey: 'kiosque',
        enableSorting: false,
      },
      {
        id: 'agent',
        header: 'Agent',
        accessorKey: 'agent',
        enableSorting: false,
      },
      {
        id: 'numeroTS10',
        header: 'N° TS10',
        accessorKey: 'numeroTS10',
        enableSorting: false,
      },
      {
        id: 'totalVente',
        header: 'Vente',
        accessorKey: 'totalVente',
        enableSorting: true,
        cell: ({ row }) => (
          <span className="font-medium">{formatCurrency(row.original.totalVente)}</span>
        ),
      },
      {
        id: 'totalPaye',
        header: 'Payé',
        accessorKey: 'totalPaye',
        enableSorting: false,
        cell: ({ row }) => formatCurrency(row.original.totalPaye),
      },
      {
        id: 'totalSolde',
        header: 'Solde',
        accessorKey: 'totalSolde',
        enableSorting: false,
        cell: ({ row }) => (
          <span className={cn(row.original.totalSolde > 0 && 'text-[hsl(var(--destructive))]')}>
            {formatCurrency(row.original.totalSolde)}
          </span>
        ),
      },
      {
        id: 'dateDebut',
        header: 'Période',
        accessorKey: 'dateDebut',
        enableSorting: true,
        cell: ({ row }) => (
          <span className="text-sm text-[hsl(var(--muted-foreground))]">
            {new Date(row.original.dateDebut).toLocaleDateString()} -{' '}
            {new Date(row.original.dateFin).toLocaleDateString()}
          </span>
        ),
      },
    ],
    [],
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

  // Loader
  if (isLoading) {
    return (
      <div className="overflow-hidden rounded-lg border border-[hsl(var(--border))]">
        <table className="w-full text-sm">
          <thead className="bg-[hsl(var(--muted))]">
            <tr>
              {[
                'Agence',
                'Kiosque',
                'Agent',
                'Banque',
                'N° TS10',
                'Total Vente',
                'Payé',
                'Solde',
                'Période',
                'Importé le',
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

  // Empty
  const venteItems = data?.items ?? []
  if (venteItems.length === 0) {
    return (
      <div className="rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--card))]">
        <EmptyState
          icon={Receipt}
          title="Aucune vente"
          description="Importez un fichier de ventes pour commencer."
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
        <table className="w-full text-sm" aria-label="Liste des ventes">
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
                  <td key={cell.id} className="px-4 py-3">
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
            {from} à {to} sur {total} vente{total > 1 ? 's' : ''}
          </p>

          <div className="flex flex-wrap items-center gap-6">
            <div className="flex items-center gap-2">
              <span className="text-xs font-medium text-[hsl(var(--muted-foreground))]">
                Lignes :
              </span>
              <div className="flex items-center gap-1">
                {PAGE_SIZES.map((size) => (
                  <button
                    key={size}
                    type="button"
                    onClick={() => {
                      setPagination({ pageIndex: 0, pageSize: size })
                    }}
                    className={cn(
                      'h-7 min-w-7 rounded-sm border border-[hsl(var(--border))] px-1.5 text-xs font-medium transition-colors hover:bg-[hsl(var(--muted))]',
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
                className="flex h-7 w-7 items-center justify-center rounded-sm border border-[hsl(var(--border))] bg-[hsl(var(--card))] transition-colors hover:bg-[hsl(var(--muted))] disabled:cursor-not-allowed disabled:opacity-40"
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
                className="flex h-7 w-7 items-center justify-center rounded-sm border border-[hsl(var(--border))] bg-[hsl(var(--card))] transition-colors hover:bg-[hsl(var(--muted))] disabled:cursor-not-allowed disabled:opacity-40"
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
