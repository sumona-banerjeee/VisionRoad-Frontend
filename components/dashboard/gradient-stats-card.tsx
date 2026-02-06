"use client"

import { Card, CardContent } from "@/components/ui/card"
import { LucideIcon } from "lucide-react"

interface GradientStatsCardProps {
    title: string
    subtitle?: string
    value: number | string
    icon: LucideIcon
    gradient: "green" | "coral" | "blue" | "purple"
    isLoading?: boolean
}

const gradientStyles = {
    green: {
        background: "bg-gradient-to-br from-emerald-50 via-emerald-50 to-teal-100 dark:from-emerald-950/40 dark:via-emerald-950/30 dark:to-teal-950/40",
        border: "border-l-4 border-l-emerald-500",
        iconBg: "bg-gradient-to-br from-emerald-400 to-teal-500",
        iconShadow: "shadow-lg shadow-emerald-500/30",
        valueGradient: "bg-gradient-to-r from-emerald-600 via-teal-500 to-emerald-600 dark:from-emerald-400 dark:via-teal-400 dark:to-emerald-400"
    },
    coral: {
        background: "bg-gradient-to-br from-red-50 via-red-50 to-orange-100 dark:from-red-950/40 dark:via-red-950/30 dark:to-orange-950/40",
        border: "border-l-4 border-l-red-500",
        iconBg: "bg-gradient-to-br from-red-400 to-orange-500",
        iconShadow: "shadow-lg shadow-red-500/30",
        valueGradient: "bg-gradient-to-r from-red-600 via-orange-500 to-red-600 dark:from-red-400 dark:via-orange-400 dark:to-red-400"
    },
    blue: {
        background: "bg-gradient-to-br from-blue-50 via-blue-50 to-indigo-100 dark:from-blue-950/40 dark:via-blue-950/30 dark:to-indigo-950/40",
        border: "border-l-4 border-l-blue-500",
        iconBg: "bg-gradient-to-br from-blue-400 to-indigo-500",
        iconShadow: "shadow-lg shadow-blue-500/30",
        valueGradient: "bg-gradient-to-r from-blue-600 via-indigo-500 to-blue-600 dark:from-blue-400 dark:via-indigo-400 dark:to-blue-400"
    },
    purple: {
        background: "bg-gradient-to-br from-purple-50 via-purple-50 to-pink-100 dark:from-purple-950/40 dark:via-purple-950/30 dark:to-pink-950/40",
        border: "border-l-4 border-l-purple-500",
        iconBg: "bg-gradient-to-br from-purple-400 to-pink-500",
        iconShadow: "shadow-lg shadow-purple-500/30",
        valueGradient: "bg-gradient-to-r from-purple-600 via-pink-500 to-purple-600 dark:from-purple-400 dark:via-pink-400 dark:to-purple-400"
    }
}

export function GradientStatsCard({
    title,
    subtitle = "Work level distribution",
    value,
    icon: Icon,
    gradient,
    isLoading = false
}: GradientStatsCardProps) {
    const styles = gradientStyles[gradient]

    return (
        <Card className={`
            ${styles.background} ${styles.border}
            border-0 rounded-xl overflow-hidden
            shadow-md hover:shadow-lg
            transition-all duration-300 ease-out
            hover:-translate-y-1 hover:scale-[1.02]
        `}>
            <CardContent className="p-4">
                <div className="flex items-center gap-4">
                    {/* Large gradient icon */}
                    <div className={`
                        w-14 h-14 rounded-xl flex items-center justify-center
                        ${styles.iconBg} ${styles.iconShadow}
                    `}>
                        <Icon className="h-7 w-7 text-white" />
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                        <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 truncate">
                            {title}
                        </h3>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 truncate">
                            {subtitle}
                        </p>

                        {isLoading ? (
                            <div className="h-9 w-20 bg-gray-200 dark:bg-gray-700 rounded mt-1 animate-pulse" />
                        ) : (
                            <p className={`text-3xl font-extrabold mt-1 ${styles.valueGradient} bg-clip-text text-transparent`}>
                                {value}
                            </p>
                        )}
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}
