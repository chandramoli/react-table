import React from 'react'
import { DotsThreeVertical } from 'phosphor-react'
import { MenuButton, MenuDivider } from '@szhsin/react-menu'
import { Header } from '@tanstack/react-table'
import { useTableState } from './context/tableContext'
import { actionType, sortDirection } from './context/reducer/columnSort'
import { actionType as requestActionType } from './context/reducer/request'
import { Menu, MenuItem } from './Menu'

function ColumnOptionsDropdown<T>({ unsortable, header, name }: { unsortable: boolean; header: Header<T, unknown>; name: string }) {
    const { columnSort, request } = useTableState()
    const columns = columnSort.state.column
    const canPin = !header.isPlaceholder && header.column.getCanPin()

    const handlePinRight = () => {
        if (header.column.getIsPinned() === 'right') return

        header.column.pin('right')
    }

    const handlePinLeft = () => {
        if (header.column.getIsPinned() === 'left') return

        header.column.pin('left')
    }

    const handleUnpin = () => {
        header.column.pin(false)
    }

    const sortAsc = () => {
        columnSort.dispatch({ type: actionType.MUTATE, payload: { column: name, direction: sortDirection.ASC } })
    }
    const sortDesc = () => {
        columnSort.dispatch({ type: actionType.MUTATE, payload: { column: name, direction: sortDirection.DESC } })
    }
    const unsort = () => {
        columnSort.dispatch({ type: actionType.REMOVE, payload: name })
    }

    const startColumnRepositioning = () => {
        request.dispatch({ type: requestActionType.COLUMN_RE_POSITIONING, payload: true })
    }

    const hide = (e: React.MouseEvent<HTMLInputElement>) => {
        header.column.toggleVisibility(false)
    }

    return (
        <Menu
            transition={true}
            direction={'bottom'}
            align={'end'}
            viewScroll={'auto'}
            overflow={'auto'}
            position={'auto'}
            menuButton={
                <MenuButton className="flex items-center rounded-full group hover:bg-gray-200/80 ml-2 p-1 text-gray-400 hover:text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-gray-100">
                    <DotsThreeVertical weight="regular" className="w-5 h-5 hover:text-gray-700" aria-hidden="true" />
                </MenuButton>
            }>
            {unsortable || (
                <>
                    <MenuItem disabled={!columns[name]} onClick={unsort}>
                        Unsort
                    </MenuItem>
                    <MenuItem disabled={columns[name] === sortDirection.ASC} onClick={sortAsc}>
                        Sort by ASC
                    </MenuItem>
                    <MenuItem disabled={columns[name] === sortDirection.DESC} onClick={sortDesc}>
                        Sort by DESC
                    </MenuItem>{' '}
                    <MenuDivider className="h-px bg-gray-200 mx-2.5 my-1.5" />
                </>
            )}
            {canPin && (
                <>
                    <MenuItem disabled={header.column.getIsPinned() === 'right'} onClick={handlePinRight}>
                        Pin to right
                    </MenuItem>
                    <MenuItem disabled={header.column.getIsPinned() === 'left'} onClick={handlePinLeft}>
                        Pin to left
                    </MenuItem>
                    <MenuItem disabled={!header.column.getIsPinned()} onClick={handleUnpin}>
                        Unpin
                    </MenuItem>{' '}
                    <MenuDivider className="h-px bg-gray-200 mx-2.5 my-1.5" />
                </>
            )}

            <MenuItem disabled={request.state.columnRePositioning} onClick={startColumnRepositioning}>
                Reposition
            </MenuItem>
            <MenuItem type="checkbox" checked={header.column.getIsVisible()} onClick={hide}>
                Hide
            </MenuItem>
        </Menu>
    )
}

export default ColumnOptionsDropdown
