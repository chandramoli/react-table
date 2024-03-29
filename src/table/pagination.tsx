import { Table } from '@tanstack/react-table'
import React from 'react'
import Select from '../components/Select'
import { Person } from '../data/fetchData'

function Pagination({ table, loading }: { table: Table<Person>; loading: boolean }) {
    return (
        <div className="flex items-center gap-2 text-sm">
            <button className="border rounded p-1" onClick={() => table.setPageIndex(0)} disabled={!table.getCanPreviousPage() || loading}>
                {'<<'}
            </button>
            <button className="border rounded p-1" onClick={() => table.previousPage()} disabled={!table.getCanPreviousPage() || loading}>
                {'<'}
            </button>
            <button className="border rounded p-1" onClick={() => table.nextPage()} disabled={!table.getCanNextPage() || loading}>
                {'>'}
            </button>
            <button
                className="border rounded p-1"
                onClick={() => table.setPageIndex(table.getPageCount() - 1)}
                disabled={!table.getCanNextPage() || loading}>
                {'>>'}
            </button>
            <span className="flex items-center gap-1">
                <div>Page</div>
                <strong>
                    {table.getState().pagination.pageIndex + 1} of {table.getPageCount()}
                </strong>
            </span>
            <span className="flex items-center gap-1">
                | Go to page:
                <input
                    type="number"
                    defaultValue={table.getState().pagination.pageIndex + 1}
                    onChange={e => {
                        const page = e.target.value ? Number(e.target.value) - 1 : 0
                        table.setPageIndex(page)
                    }}
                    className="border border-gray-300 p-1 rounded w-10 text-sm py-0.5"
                    disabled={loading}
                />
            </span>
            <Select
                className="!w-24 pr-6"
                value={table.getState().pagination.pageSize}
                disabled={loading}
                onChange={e => {
                    table.setPageSize(Number(e.target.value))
                }}>
                {[10, 20, 30, 40, 50].map(pageSize => (
                    <option key={pageSize} value={pageSize}>
                        Show {pageSize}
                    </option>
                ))}
            </Select>
        </div>
    )
}

export default Pagination
