import React from 'react'
import clsx from 'clsx'
import { useTableState } from './context/tableContext'
import { actionType, sortDirection } from './context/reducer/columnSort'
import { Column, ColumnOrderState, Header, Table } from '@tanstack/react-table'
import { useDrag, useDrop } from 'react-dnd'
import ColumnOptionsMenu from './ColumnOptionsMenu'
import { DotsNine } from 'phosphor-react'
import IndeterminateCheckbox from './IndeterminateCheckbox'
import useTableHandlers from './hooks/useTableHandlers'
import RowSelectorMenu from './RowSelectorMenu'

type Props<T> = {
    table: Table<T>
    header: Header<T, unknown>
    name: string
    unsortable: boolean
    rowSelector?: boolean
    rowSelectionCount: number
    children: React.ReactNode
    position?: 'left' | 'center' | 'right'
    up?: JSX.Element
    down?: JSX.Element
    className?: string
}

const reorderColumn = (draggedColumnId: string, targetColumnId: string, columnOrder: string[]): ColumnOrderState => {
    columnOrder.splice(columnOrder.indexOf(targetColumnId), 0, columnOrder.splice(columnOrder.indexOf(draggedColumnId), 1)[0] as string)
    return [...columnOrder]
}

function ColumnHeader<T>({
    table,
    position,
    header,
    name,
    unsortable,
    rowSelector,
    rowSelectionCount,
    children,
    className,
    up = <span>^</span>,
    down = <div className="transform rotate-180">^</div>,
}: Props<T>) {
    const { columnSort, request, rowSelection } = useTableState()
    const { resetRowSelection, handleSelectAllCurrentPage } = useTableHandlers()
    const dispatch = columnSort.dispatch
    const columns = columnSort.state.column
    const { all: allRowSelected, except } = rowSelection.state
    const pagination = table.getState().pagination

    const { getState, setColumnOrder } = table
    const { columnOrder } = getState()
    const { column } = header

    const [{ isOver, canDrop }, dropRef] = useDrop({
        accept: 'column',
        canDrop: () => !rowSelector,
        drop: (draggedColumn: Column<T>) => {
            const newColumnOrder = reorderColumn(draggedColumn.id, column.id, columnOrder)
            setColumnOrder(newColumnOrder)
        },
        collect: monitor => ({
            isOver: !!monitor.isOver(),
            canDrop: !!monitor.canDrop(),
        }),
    })

    const [{ isDragging }, dragRef, previewRef] = useDrag({
        collect: monitor => ({
            isDragging: monitor.isDragging(),
        }),
        item: () => column,
        type: 'column',
    })

    const handleSort = () => {
        if (!columns[name]) {
            dispatch({ type: actionType.MUTATE, payload: { column: name, direction: sortDirection.ASC } })
            return
        }

        if (columns[name] === sortDirection.ASC) {
            dispatch({ type: actionType.MUTATE, payload: { column: name, direction: sortDirection.DESC } })
            return
        }

        dispatch({ type: actionType.REMOVE, payload: name })
    }

    const isRowSelectionIndeterminate = React.useMemo(
        () =>
            (!allRowSelected && rowSelectionCount > 0 && pagination.pageIndex === 0 && rowSelectionCount < pagination.pageSize) ||
            (!allRowSelected && rowSelectionCount > 0 && pagination.pageIndex > 0) ||
            (allRowSelected && Object.keys(except).length > 0),
        [allRowSelected, rowSelectionCount, pagination]
    )

    const handleBulkRowSelectionChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        resetRowSelection()
        if (isRowSelectionIndeterminate || e.target.checked) {
            handleSelectAllCurrentPage()
            return
        }
    }

    return (
        <th
            ref={dropRef}
            colSpan={header.colSpan}
            className={clsx(
                'relative whitespace-nowrap px-2 py-3 text-left text-sm font-semibold ',
                isDragging && 'opacity-[0.8] bg-cyan-50 text-cyan-700'
            )}>
            {isOver && !isDragging && (
                <div
                    className={clsx(
                        canDrop ? 'border-sky-200 border-x-sky-500' : 'text-red-700 border-red-200 border-y-red-500',
                        'border-2 absolute inset-0'
                    )}
                />
            )}
            <div ref={previewRef} className="flex items-center justify-between">
                <button
                    onClick={handleSort}
                    disabled={unsortable || request.state.columnRePositioning}
                    type="button"
                    className={clsx('flex justify-between items-center', className)}>
                    <span>
                        {rowSelector ? (
                            <IndeterminateCheckbox
                                {...{
                                    checked: rowSelectionCount > 0 && !isRowSelectionIndeterminate,
                                    className: 'ml-4',
                                    indeterminate: isRowSelectionIndeterminate,
                                    onChange: handleBulkRowSelectionChange,
                                    disabled: request.state.loading,
                                }}
                            />
                        ) : (
                            children
                        )}
                    </span>
                    {columns[name] && <span className="px-2 ml-1 text-base sm:text-sm">{columns[name] === sortDirection.DESC ? up : down}</span>}
                </button>

                {request.state.columnRePositioning ? (
                    rowSelector || (position && ['left', 'right'].includes(position)) ? null : (
                        <button ref={dragRef} title="re-position" type="button" className="cursor-grabbing hover:bg-gray-200/80 p-1">
                            <DotsNine weight="regular" className="w-5 h-5 text-gray-600 hover:text-gray-800 ml-2" aria-hidden="true" />
                        </button>
                    )
                ) : (
                    <>
                        {rowSelector && <RowSelectorMenu rowSelectionCount={rowSelectionCount} />}
                        {rowSelector || <ColumnOptionsMenu<T> unsortable={unsortable} name={name} header={header} />}
                    </>
                )}
            </div>
        </th>
    )
}

export default ColumnHeader
