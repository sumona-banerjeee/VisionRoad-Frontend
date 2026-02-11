"use client"

import { Plus } from "lucide-react"
import { Button } from "@/components/ui/button"

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
}

export function DataTable<T extends Record<string, any>>({
    title,
    data,
    columns,
    onAddNew,
    addButtonText,
    isLoading = false
}: DataTableProps<T>) {
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
                    className="bg-blue-600 hover:bg-blue-800 text-white shadow-md transition-all duration-300 hover:scale-105 active:scale-95 border-none h-8 px-4 text-xs font-semibold"
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
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100/30 dark:divide-gray-800/30">
                            {isLoading ? (
                                <tr>
                                    <td colSpan={columns.length} className="px-4 py-12 text-center">
                                        <div className="flex flex-col items-center justify-center gap-3">
                                            <div className="h-8 w-8 border-3 border-gray-200 border-t-blue-500 rounded-full animate-spin" />
                                            <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Loading records...</span>
                                        </div>
                                    </td>
                                </tr>
                            ) : data.length === 0 ? (
                                <tr>
                                    <td colSpan={columns.length} className="px-4 py-12 text-center">
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
