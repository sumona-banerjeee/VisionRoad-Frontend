"use client"

import { Card, CardContent } from "@/components/ui/card"
import { LucideIcon } from "lucide-react"

interface StatsCardProps {
    title: string
    value: string | number
    icon: LucideIcon
    gradient: string
    isLoading?: boolean
}

export function StatsCard({ title, value, icon: Icon, gradient, isLoading }: StatsCardProps) {
    return (
        <Card className="glass-card card-glow border-0 overflow-hidden group">
            <CardContent className="p-5">
                <div className="flex items-center justify-between">
                    <div className="space-y-1">
                        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                            {title}
                        </p>
                        {isLoading ? (
                            <div className="h-8 w-16 bg-primary/10 rounded" />
                        ) : (
                            <p className="text-3xl font-bold text-foreground">
                                {value}
                            </p>
                        )}
                    </div>
                    <div className={`p-3 rounded-xl ${gradient}`}>
                        <Icon className="h-6 w-6 text-white" />
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}
