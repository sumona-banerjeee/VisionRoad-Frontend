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

    },
    coral: {
        background: "bg-card",
        border: "border-l-4 border-l-[var(--border)]",
        iconBg: "bg-gradient-to-br from-blue-400 to-blue-600",
      
    },
    blue: {
        background: "bg-card",
        border: "border-l-4 border-l-[var(--border)]",
        iconBg: "bg-gradient-to-br from-blue-400 to-blue-600",
      
    },
    purple: {
        background: "bg-card",
        border: "border-l-4 border-l-[var(--border)]",
        iconBg: "bg-gradient-to-br from-blue-400 to-blue-600",
    
    },
    orange: {
        background: "bg-card",
        border: "border-l-4 border-l-[var(--border)]",
        iconBg: "bg-gradient-to-br from-blue-400 to-blue-600",
   
    },
    indigo: {
        background: "bg-card",
        border: "border-l-4 border-l-[var(--border)]",
        iconBg: "bg-gradient-to-br from-blue-400 to-blue-600",
        
    },
    emerald: {
        background: "bg-card",
        border: "border-l-4 border-l-[var(--border)]",
        iconBg: "bg-gradient-to-br from-blue-400 to-blue-600",
       
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
        <Card className="bg-white/60 backdrop-blur-lg border-none shadow-none hover:shadow-none  overflow-hidden py-8 px-6">
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
                                <p className="text-4xl font-bold heading-blue-gradient">
                                    {value}
                                </p>
                                {subtitle && (
                                    <p className="text-xs font-medium text-gray-500 mt-1">
                                        {subtitle}
                                    </p>
                                )}
                            </>
                        )}
                    </div>
                </div>

                <div
                style={{
                    background: "linear-gradient(180deg, #225999 0%, #56A5FF 100%)",
                }}
                className={`
                    w-16 h-16 self-start rounded-lg flex items-center justify-center
                `}>
                    <Icon className="h-10 w-10 text-white" />
                </div>
            </CardContent>
        </Card>
    )
}
