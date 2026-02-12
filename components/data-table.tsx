"use client"

import { Plus, Edit2, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip"

interface Column<T> {
    key: string
    header: string
    render?: (item: T) => React.ReactNode
}

interface DataTableProps<T> {
    title: string
    data: T[]
    columns: Column<T>[]
    onAddNew: () => void
    addButtonText: string
    isLoading?: boolean
    onEdit?: (item: T) => void
    onDelete?: (item: T) => void
}

export function DataTable<T extends Record<string, any>>({
    title,
    data,
    columns,
    onAddNew,
    addButtonText,
    isLoading = false,
    onEdit,
    onDelete
}: DataTableProps<T>) {
    const showActions = !!onEdit || !!onDelete;
    const totalCols = columns.length + (showActions ? 1 : 0);

    return (
        <div>
            {/* Header with Title and Add Button */}
            <div className="mb-4 flex justify-between items-center bg-card p-3 rounded-xl border border-[var(--border)] shadow-sm">
                <div>
                    <h2 className="text-lg font-bold tracking-tight text-blue-600">{title}</h2>
                    <p className="text-[10px] text-gray-500 dark:text-gray-400 uppercase font-medium">Total items: {data.length}</p>
                </div>
                <Button
                    onClick={onAddNew}
                    className="bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-500/25 transition-all duration-300 hover:scale-105 active:scale-95 border-none h-8 px-4 text-xs font-semibold"
                >
                    <Plus className="h-3.5 w-3.5 mr-1.5 stroke-[3px]" />
                    {addButtonText}
                </Button>
            </div>

            {/* Table */}
            <div className="rounded-2xl border border-[var(--border)] bg-card shadow-2xl shadow-black/5 overflow-hidden">
                <div className="overflow-auto max-h-[400px]">
                    <table className="min-w-full divide-y divide-gray-200/50 dark:divide-gray-700/50 border-collapse">
                        <thead className="bg-[#f8fafc] dark:bg-gray-900/50 sticky top-0 z-10">
                            <tr>
                                {columns.map((col) => (
                                    <th
                                        key={col.key}
                                        className="px-4 py-3 text-left text-[10px] font-black text-gray-500 dark:text-gray-400 uppercase tracking-[0.1em] border-b border-[var(--border)] bg-[#f8fafc] dark:bg-gray-900 shadow-[0_1px_0_0_rgba(0,0,0,0.05)]"
                                    >
                                        {col.header}
                                    </th>
                                ))}
                                {showActions && (
                                    <th className="px-4 py-3 text-right text-[10px] font-black text-gray-500 dark:text-gray-400 uppercase tracking-[0.1em] border-b border-[var(--border)] bg-[#f8fafc] dark:bg-gray-900 shadow-[0_1px_0_0_rgba(0,0,0,0.05)]">
                                        Actions
                                    </th>
                                )}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100/30 dark:divide-gray-800/30">
                            {isLoading ? (
                                <tr>
                                    <td colSpan={totalCols} className="px-4 py-12 text-center">
                                        <div className="flex flex-col items-center justify-center gap-3">
                                            <div className="h-8 w-8 border-3 border-gray-200 border-t-blue-500 rounded-full animate-spin" />
                                            <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Loading records...</span>
                                        </div>
                                    </td>
                                </tr>
                            ) : data.length === 0 ? (
                                <tr>
                                    <td colSpan={totalCols} className="px-4 py-12 text-center">
                                        <div className="flex flex-col items-center justify-center gap-2">
                                            <div className="w-12 h-12 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mb-2">
                                                <Plus className="w-6 h-6 text-gray-400" />
                                            </div>
                                            <p className="text-gray-500 dark:text-gray-400 font-medium">No data available</p>
                                            <p className="text-xs text-gray-400 dark:text-gray-500">Click "{addButtonText}" to get started</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                data.map((item, idx) => (
                                    <tr
                                        key={idx}
                                        className="hover:bg-blue-50/30 dark:hover:bg-blue-900/10 transition-colors duration-200"
                                    >
                                        {columns.map((col) => (
                                            <td key={col.key} className="px-4 py-3 text-[13px] text-gray-700 dark:text-gray-300 font-medium">
                                                {col.render ? col.render(item) : (item[col.key as keyof T] !== null && item[col.key as keyof T] !== undefined ? String(item[col.key as keyof T]) : "—")}
                                            </td>
                                        ))}
                                        {showActions && (
                                            <td className="px-4 py-3 text-right">
                                                <div className="flex justify-end gap-2">
                                                    <TooltipProvider>
                                                        {onEdit && (
                                                            <Tooltip>
                                                                <TooltipTrigger asChild>
                                                                    <Button
                                                                        variant="ghost"
                                                                        size="icon"
                                                                        onClick={() => onEdit(item)}
                                                                        className="h-8 w-8 rounded-full bg-amber-100 text-amber-600 hover:bg-amber-600 hover:text-white dark:bg-amber-900/40 dark:text-amber-400 dark:hover:bg-amber-700"
                                                                    >
                                                                        <Edit2 className="h-4 w-4" />
                                                                    </Button>
                                                                </TooltipTrigger>
                                                                <TooltipContent side="top">
                                                                    <p>Edit</p>
                                                                </TooltipContent>
                                                            </Tooltip>
                                                        )}
                                                        {onDelete && (
                                                            <Tooltip>
                                                                <TooltipTrigger asChild>
                                                                    <Button
                                                                        variant="ghost"
                                                                        size="icon"
                                                                        onClick={() => onDelete(item)}
                                                                        className="h-8 w-8 rounded-full bg-rose-100 text-rose-600 hover:bg-rose-600 hover:text-white dark:bg-rose-900/40 dark:text-rose-400 dark:hover:bg-rose-700"
                                                                    >
                                                                        <Trash2 className="h-4 w-4" />
                                                                    </Button>
                                                                </TooltipTrigger>
                                                                <TooltipContent side="top">
                                                                    <p>Delete</p>
                                                                </TooltipContent>
                                                            </Tooltip>
                                                        )}
                                                    </TooltipProvider>
                                                </div>
                                            </td>
                                        )}
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    )
}
