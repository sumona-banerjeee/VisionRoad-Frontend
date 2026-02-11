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
        background: "bg-card",
        border: "border-l-4 border-l-[var(--border)]",
        iconBg: "bg-[#60a5fa]",
        iconShadow: "shadow-lg shadow-[#60a5fa]/20",
        valueGradient: "text-gray-900 dark:text-white"
    },
    coral: {
        background: "bg-card",
        border: "border-l-4 border-l-[var(--border)]",
        iconBg: "bg-[#60a5fa]",
        iconShadow: "shadow-lg shadow-[#60a5fa]/20",
        valueGradient: "text-gray-900 dark:text-white"
    },
    blue: {
        background: "bg-card",
        border: "border-l-4 border-l-[var(--border)]",
        iconBg: "bg-[#60a5fa]",
        iconShadow: "shadow-lg shadow-[#60a5fa]/20",
        valueGradient: "text-gray-900 dark:text-white"
    },
    purple: {
        background: "bg-card",
        border: "border-l-4 border-l-[var(--border)]",
        iconBg: "bg-[#60a5fa]",
        iconShadow: "shadow-lg shadow-[#60a5fa]/20",
        valueGradient: "text-gray-900 dark:text-white"
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
        <Card className="bg-white dark:bg-gray-900 border-none shadow-xl shadow-blue-500/5 overflow-hidden py-8 px-6 transition-all duration-300 hover:shadow-2xl hover:shadow-blue-500/10 group">
            <CardContent className="p-0 flex items-center justify-between gap-6">
                <div className="flex flex-col gap-1 min-w-0">
                    <h3 className="text-sm font-bold text-blue-600/70 dark:text-blue-400/70 uppercase tracking-widest">
                        {title}
                    </h3>
                    <div className="flex flex-col">
                        {isLoading ? (
                            <div className="h-14 w-24 bg-gray-100 dark:bg-gray-800 rounded-xl animate-pulse mt-2" />
                        ) : (
                            <>
                                <p className="text-5xl md:text-6xl font-black tracking-tighter text-gray-900 dark:text-white leading-tight">
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
                    transition-all duration-500 group-hover:scale-110 group-hover:rotate-6
                `}>
                    <Icon className="h-10 w-10 text-white" />
                </div>
            </CardContent>
        </Card>
    )
}
