import { createPortal } from 'react-dom'
import { useEffect, useMemo, useState } from 'react'
import { MoreHorizontal } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'

export type MenuRow = {
  id: string
  name: string
  parent: string
  level: string
  order: number
}

type DataTableProps = {
  rows: MenuRow[]
  loading?: boolean
  error?: string | null
  onAdd?: () => void
  onEdit?: (id: string) => void
  onDelete?: (id: string) => void
}

function DataTable({ rows, loading, error, onAdd, onEdit, onDelete }: DataTableProps) {
  const [query, setQuery] = useState('')
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(5)
  const [openRow, setOpenRow] = useState<string | null>(null)
  const [menuPosition, setMenuPosition] = useState<{ x: number; y: number } | null>(null)
  const [rowPendingDelete, setRowPendingDelete] = useState<MenuRow | null>(null)

  useEffect(() => {
    const handler = () => {
      setOpenRow(null)
      setMenuPosition(null)
    }
    document.addEventListener('click', handler)
    return () => document.removeEventListener('click', handler)
  }, [])

  useEffect(() => {
    setPage(1)
  }, [rows])

  const filtered = useMemo(() => {
    const normalized = query.toLowerCase()
    if (!normalized) return rows
    return rows.filter(
      (row) =>
        row.name.toLowerCase().includes(normalized) ||
        row.parent.toLowerCase().includes(normalized) ||
        row.level.toLowerCase().includes(normalized)
    )
  }, [query, rows])

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize))
  const startIndex = (page - 1) * pageSize
  const visibleRows = filtered.slice(startIndex, startIndex + pageSize)
  const showingStart = filtered.length ? startIndex + 1 : 0
  const showingEnd = Math.min(startIndex + visibleRows.length, filtered.length)

  return (
    <>
      <Card className="border border-slate-200 bg-white/90 shadow-lg">
        <CardHeader className="border-b border-slate-100 px-4 pb-6 md:px-6">
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2 text-sm text-slate-500">
              <select
                value={pageSize}
                onChange={(event) => {
                  setPageSize(Number(event.target.value))
                  setPage(1)
                }}
                className="rounded-lg border border-slate-200 px-2 py-1 text-sm"
              >
                {[5, 10, 25].map((size) => (
                  <option key={size} value={size}>
                    {size}
                  </option>
                ))}
              </select>
              <span>entries per page</span>
            </div>
            <Input
              placeholder="Search menu..."
              value={query}
              onChange={(event) => {
                setPage(1)
                setQuery(event.target.value)
              }}
              className="min-w-[200px] flex-1 sm:w-64"
            />
            <Button className="whitespace-nowrap" onClick={onAdd}>
              Add
            </Button>
          </div>
        </CardHeader>
        <CardContent className="overflow-x-auto p-0">
          <div className="min-w-[640px]">
            <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-12" />
              <TableHead>Menu Name</TableHead>
              <TableHead>Menu Parent</TableHead>
              <TableHead>Menu Level</TableHead>
              <TableHead>Menu Order</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={5} className="p-6 text-center text-slate-500">
                  Loading data...
                </TableCell>
              </TableRow>
            ) : error ? (
              <TableRow>
                <TableCell colSpan={5} className="p-6 text-center text-red-500">
                  {error}
                </TableCell>
              </TableRow>
            ) : (
              <>
                {visibleRows.map((row) => (
                  <TableRow key={row.id}>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={(event) => {
                          event.stopPropagation()
                          const rect = event.currentTarget.getBoundingClientRect()
                          setOpenRow((prev) => (prev === row.id ? null : row.id))
                          setMenuPosition({ x: rect.left, y: rect.bottom + window.scrollY })
                        }}
                      >
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                      {openRow === row.id && menuPosition &&
                        createPortal(
                          <div
                            className="z-30 w-32 rounded-lg border border-slate-200 bg-white p-2 text-sm shadow-lg"
                            style={{ position: 'absolute', top: menuPosition.y + 4, left: menuPosition.x }}
                          >
                            <button
                              className="w-full rounded-md px-2 py-1 text-left hover:bg-slate-100"
                              onClick={() => {
                                setOpenRow(null)
                                setMenuPosition(null)
                                onEdit?.(row.id)
                              }}
                            >
                              Edit
                            </button>
                            <button
                              className="w-full rounded-md px-2 py-1 text-left text-red-600 hover:bg-red-50"
                              onClick={() => {
                                setOpenRow(null)
                                setMenuPosition(null)
                                setRowPendingDelete(row)
                              }}
                            >
                              Delete
                            </button>
                          </div>,
                          document.body
                        )}
                    </TableCell>
                    <TableCell className="font-medium text-slate-900">{row.name}</TableCell>
                    <TableCell className="text-slate-500">{row.parent}</TableCell>
                    <TableCell>{row.level}</TableCell>
                    <TableCell>{row.order}</TableCell>
                  </TableRow>
                ))}
                {!visibleRows.length && (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center text-slate-500">
                      No matching data.
                    </TableCell>
                  </TableRow>
                )}
              </>
            )}
          </TableBody>
            </Table>
          </div>
        </CardContent>
        <CardFooter className="flex flex-col gap-3 border-t border-slate-100 px-4 py-4 text-sm text-slate-500 sm:flex-row sm:items-center sm:justify-between md:px-6">
          <span>
            Showing {showingStart}-{showingEnd} of {filtered.length} entries
          </span>
          <div className="flex items-center gap-2">
            <Button variant="secondary" size="sm" onClick={() => setPage((prev) => Math.max(1, prev - 1))} disabled={page === 1}>
              Previous
            </Button>
            <span className="text-slate-700">
              {page} / {totalPages}
            </span>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setPage((prev) => Math.min(totalPages, prev + 1))}
              disabled={page === totalPages}
            >
              Next
            </Button>
          </div>
        </CardFooter>
      </Card>
      {rowPendingDelete &&
        createPortal(
          <ConfirmDeleteDialog
            row={rowPendingDelete}
            onCancel={() => setRowPendingDelete(null)}
            onConfirm={() => {
              if (rowPendingDelete) {
                onDelete?.(rowPendingDelete.id)
                setRowPendingDelete(null)
              }
            }}
          />,
          document.body,
        )}
    </>
  )
}

export default DataTable

type ConfirmDeleteDialogProps = {
  row: MenuRow
  onConfirm: () => void
  onCancel: () => void
}

function ConfirmDeleteDialog({ row, onConfirm, onCancel }: ConfirmDeleteDialogProps) {
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onCancel()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [onCancel])

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 px-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="confirm-delete-title"
      aria-describedby="confirm-delete-description"
      onClick={onCancel}
    >
      <div
        className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="mb-4">
          <h3 id="confirm-delete-title" className="text-lg font-semibold text-slate-900">
            Delete this menu?
          </h3>
          <p id="confirm-delete-description" className="mt-1 text-sm text-slate-600">
            Menu <span className="font-semibold">{row.name}</span> and all sub-menus will be deleted permanently.
            This action cannot be undone.
          </p>
        </div>
        <div className="flex justify-end gap-3">
          <Button variant="secondary" onClick={onCancel}>
            Cancel
          </Button>
          <Button variant="destructive" onClick={onConfirm}>
            Yes, delete
          </Button>
        </div>
      </div>
    </div>
  )
}
