"use client"

import { LucideIcon } from "lucide-react"

interface PageHeaderProps {
    title: string
    description: string
    icon?: LucideIcon
    children?: React.ReactNode
}

export function PageHeader({ title, description, icon: Icon, children }: PageHeaderProps) {
    return (
        <div className="flex items-center gap-5">
            <div className="p-3 rounded-lg bg-blue-gradient flex items-center justify-center relative overflow-hidden">

                {Icon && <Icon className="h-8 w-8 text-white relative z-10" />}
                {children}
            </div>
            <div className="flex flex-col">
                <h1 className="text-3xl font-bold heading-blue-gradient">
                    {title}
                </h1>
                <p className="text-gray-500 dark:text-gray-400 mt-1 text-sm font-medium">
                    {description}
                </p>
            </div>
        </div>
    )
}
