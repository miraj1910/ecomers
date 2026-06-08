"use client"

import { cn } from "@/lib/utils"
import {
  flexRender,
  type Table as TanStackTable,
} from "@tanstack/react-table"
import { ChevronDown, ChevronUp, ChevronsUpDown } from "lucide-react"

interface DataTableProps<TData> {
  table: TanStackTable<TData>
  isLoading?: boolean
  emptyMessage?: string
}

export function DataTable<TData>({
  table,
  isLoading,
  emptyMessage = "No data found",
}: DataTableProps<TData>) {
  return (
    <div className="overflow-x-auto rounded-2xl border border-border">
      <table className="w-full">
        <thead>
          {table.getHeaderGroups().map((headerGroup) => (
            <tr key={headerGroup.id} className="border-b border-border bg-foreground/[0.05]">
              {headerGroup.headers.map((header) => (
                <th
                  key={header.id}
                  className={cn(
                    "px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-secondary",
                    header.column.getCanSort() && "cursor-pointer select-none"
                  )}
                  onClick={header.column.getToggleSortingHandler()}
                >
                  <div className="flex items-center gap-1">
                    {flexRender(
                      header.column.columnDef.header,
                      header.getContext()
                    )}
                    {{
                      asc: <ChevronUp className="h-3 w-3" />,
                      desc: <ChevronDown className="h-3 w-3" />,
                    }[header.column.getIsSorted() as string] ?? (
                      header.column.getCanSort() && (
                        <ChevronsUpDown className="h-3 w-3 text-muted" />
                      )
                    )}
                  </div>
                </th>
              ))}
            </tr>
          ))}
        </thead>
        <tbody className="divide-y divide-border">
          {isLoading ? (
            <tr>
              <td
                colSpan={table.getAllColumns().length}
                className="px-4 py-12 text-center text-sm text-secondary"
              >
                Loading...
              </td>
            </tr>
          ) : table.getRowModel().rows.length === 0 ? (
            <tr>
              <td
                colSpan={table.getAllColumns().length}
                className="px-4 py-12 text-center text-sm text-secondary"
              >
                {emptyMessage}
              </td>
            </tr>
          ) : (
            table.getRowModel().rows.map((row) => (
              <tr
                key={row.id}
                className="transition-colors hover:bg-foreground/[0.05]"
              >
                {row.getVisibleCells().map((cell) => (
                  <td key={cell.id} className="px-4 py-3 text-sm">
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  )
}

interface DataTablePaginationProps<TData> {
  table: TanStackTable<TData>
}

export function DataTablePagination<TData>({ table }: DataTablePaginationProps<TData>) {
  const pageIndex = table.getState().pagination.pageIndex
  const pageSize = table.getState().pagination.pageSize
  const totalRows = table.getFilteredRowModel().rows.length
  const totalPages = table.getPageCount()

  const from = pageIndex * pageSize + 1
  const to = Math.min((pageIndex + 1) * pageSize, totalRows)

  return (
    <div className="mt-4 flex items-center justify-between">
      <p className="text-sm text-secondary">
        {totalRows > 0
          ? `Showing ${from} - ${to} of ${totalRows}`
          : "No results"}
      </p>
      <div className="flex items-center gap-2">
        <button
          className="inline-flex h-9 items-center justify-center rounded-xl border border-border bg-transparent px-3 text-sm text-foreground transition-colors hover:bg-foreground/[0.06] disabled:pointer-events-none disabled:opacity-50"
          onClick={() => table.setPageIndex(0)}
          disabled={!table.getCanPreviousPage()}
        >
          First
        </button>
        <button
          className="inline-flex h-9 items-center justify-center rounded-xl border border-border bg-transparent px-3 text-sm text-foreground transition-colors hover:bg-foreground/[0.06] disabled:pointer-events-none disabled:opacity-50"
          onClick={() => table.previousPage()}
          disabled={!table.getCanPreviousPage()}
        >
          Previous
        </button>
        <span className="px-2 text-sm text-secondary">
          Page {pageIndex + 1} of {totalPages}
        </span>
        <button
          className="inline-flex h-9 items-center justify-center rounded-xl border border-border bg-transparent px-3 text-sm text-foreground transition-colors hover:bg-foreground/[0.06] disabled:pointer-events-none disabled:opacity-50"
          onClick={() => table.nextPage()}
          disabled={!table.getCanNextPage()}
        >
          Next
        </button>
        <button
          className="inline-flex h-9 items-center justify-center rounded-xl border border-border bg-transparent px-3 text-sm text-foreground transition-colors hover:bg-foreground/[0.06] disabled:pointer-events-none disabled:opacity-50"
          onClick={() => table.setPageIndex(totalPages - 1)}
          disabled={!table.getCanNextPage()}
        >
          Last
        </button>
      </div>
    </div>
  )
}
