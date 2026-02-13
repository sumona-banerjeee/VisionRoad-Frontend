"use client"

import { Card, CardContent } from "@/components/ui/card"
import { LucideIcon } from "lucide-react"

interface GradientStatsCardProps {
    title: string
    subtitle?: string
    value: number | string
    icon: LucideIcon
    gradient: "green" | "coral" | "blue" | "purple" | "orange" | "indigo" | "emerald"
    isLoading?: boolean
}

const gradientStyles = {
    green: {
        background: "bg-card",
        border: "border-l-4 border-l-[var(--border)]",
        iconBg: "bg-gradient-to-br from-blue-400 to-blue-600",
        iconShadow: "shadow-lg shadow-blue-500/20"
    },
    coral: {
        background: "bg-card",
        border: "border-l-4 border-l-[var(--border)]",
        iconBg: "bg-gradient-to-br from-blue-400 to-blue-600",
        iconShadow: "shadow-lg shadow-blue-500/20"
    },
    blue: {
        background: "bg-card",
        border: "border-l-4 border-l-[var(--border)]",
        iconBg: "bg-gradient-to-br from-blue-400 to-blue-600",
        iconShadow: "shadow-lg shadow-blue-500/20"
    },
    purple: {
        background: "bg-card",
        border: "border-l-4 border-l-[var(--border)]",
        iconBg: "bg-gradient-to-br from-blue-400 to-blue-600",
        iconShadow: "shadow-lg shadow-blue-500/20"
    },
    orange: {
        background: "bg-card",
        border: "border-l-4 border-l-[var(--border)]",
        iconBg: "bg-gradient-to-br from-blue-400 to-blue-600",
        iconShadow: "shadow-lg shadow-blue-500/20"
    },
    indigo: {
        background: "bg-card",
        border: "border-l-4 border-l-[var(--border)]",
        iconBg: "bg-gradient-to-br from-blue-400 to-blue-600",
        iconShadow: "shadow-lg shadow-blue-500/20"
    },
    emerald: {
        background: "bg-card",
        border: "border-l-4 border-l-[var(--border)]",
        iconBg: "bg-gradient-to-br from-blue-400 to-blue-600",
        iconShadow: "shadow-lg shadow-blue-500/20"
    }
}

export function GradientStatsCard({
    title,
    subtitle,
    value,
    icon: Icon,
    gradient,
    isLoading = false
}: GradientStatsCardProps) {
    const styles = gradientStyles[gradient]

    return (
        <Card className="bg-white dark:bg-gray-900 border-none shadow-xl shadow-blue-500/5 overflow-hidden py-8 px-6">
            <CardContent className="p-0 flex items-center justify-between gap-6">
                <div className="flex flex-col gap-1 min-w-0">
                    <h3 className="text-sm font-bold text-blue-600/70 dark:text-blue-400/70 uppercase tracking-widest">
                        {title}
                    </h3>
                    <div className="flex flex-col">
                        {isLoading ? (
                            <div className="h-14 w-24 bg-gray-100 dark:bg-gray-800 rounded-xl mt-2" />
                        ) : (
                            <>
                                <p className="text-3xl md:text-4xl font-black tracking-tighter leading-tight text-[#1e3a8a]">
                                    {value}
                                </p>
                                {subtitle && (
                                    <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mt-1 opacity-80 italic">
                                        {subtitle}
                                    </p>
                                )}
                            </>
                        )}
                    </div>
                </div>

                <div className={`
                    w-20 h-20 rounded-3xl flex items-center justify-center flex-shrink-0
                    ${styles.iconBg} shadow-[0_10px_30px_rgba(37,99,235,0.2)]
                `}>
                    <Icon className="h-10 w-10 text-white" />
                </div>
            </CardContent>
        </Card>
    )
}
