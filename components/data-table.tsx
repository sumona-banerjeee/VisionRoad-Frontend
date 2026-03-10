"use client"

import { Plus, Edit2, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip"
import { Skeleton } from "@/components/ui/skeleton"

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
            <div className="flex justify-between items-center  p-3 ">
                <div className="flex items-center gap-3">
                    <h2 className="text-2xl font-bold tracking-tight heading-blue-gradient">{title}</h2>
                    <span className="badge-blue min-w-[28px] h-[28px] px-2">
                        {data.length}
                    </span>
                </div>
                <Button
                    onClick={onAddNew}
                    className="btn-blue-gradient rounded-full text-sm px-4 py-2.5 h-auto flex items-center gap-2"
                >
                    <Plus className="h-4 w-4" />
                    {addButtonText}
                </Button>
            </div>

            {/* Table */}
            <div className="rounded-lg overflow-hidden">
                <div className="overflow-auto max-h-[450px]">
                    <table className="min-w-full rounded-lg!">
                        <thead className="bg-white/40 backdrop-blur-md rounded-lg! sticky top-0 z-10">
                            <tr>
                                {columns.map((col) => (
                                    <th
                                        key={col.key}
                                        className="px-4 py-3 text-slate-500 text-left font-bold"
                                    >
                                        {col.header}
                                    </th>
                                ))}
                                {showActions && (
                                    <th className="px-4 py-3 text-slate-500 text-left font-bold">
                                        Actions
                                    </th>
                                )}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-300 backdrop-blur-lg bg-white/70">
                            {isLoading ? (
                                Array.from({ length: 5 }).map((_, idx) => (
                                    <tr key={idx} className="border-b border-gray-100 dark:border-gray-800">
                                        {columns.map((col) => (
                                            <td key={col.key} className="px-4 py-4">
                                                <Skeleton className="h-4 w-full max-w-[120px]" />
                                            </td>
                                        ))}
                                        {showActions && (
                                            <td className="px-4 py-4 text-right">
                                                <div className="flex justify-end gap-2">
                                                    <Skeleton className="h-8 w-8 rounded-sm" />
                                                    <Skeleton className="h-8 w-8 rounded-sm" />
                                                </div>
                                            </td>
                                        )}
                                    </tr>
                                ))
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
                                                                        className="h-8 w-8 rounded-sm bg-white text-blue-500 border-slate-200! border hover:bg-blue-500 hover:text-white"
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
                                                                        className="h-8 w-8 rounded-sm border border-slate-200! bg-white text-red-400 hover:bg-red-400 hover:text-white"
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
