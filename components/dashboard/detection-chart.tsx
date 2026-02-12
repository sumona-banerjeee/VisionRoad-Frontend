"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface DetectionChartProps {
    potholes: number
    signboards: number
    isLoading?: boolean
}

export function DetectionChart({ potholes, signboards, isLoading }: DetectionChartProps) {
    const total = potholes + signboards
    const potholePercent = total > 0 ? (potholes / total) * 100 : 50
    const signboardPercent = total > 0 ? (signboards / total) * 100 : 50

    return (
        <Card className="overflow-hidden">
            <CardHeader className="pb-2">
                <CardTitle className="text-lg font-bold text-blue-600">Detection Distribution</CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
                {isLoading ? (
                    <div className="flex items-center justify-center h-48">
                        <div className="w-32 h-32 rounded-full bg-primary/10" />
                    </div>
                ) : total === 0 ? (
                    <div className="flex items-center justify-center h-48 text-muted-foreground">
                        No detections yet
                    </div>
                ) : (
                    <div className="flex items-center gap-6">
                        {/* Donut Chart */}
                        <div className="relative w-36 h-36 flex-shrink-0">
                            <svg viewBox="0 0 100 100" className="w-full h-full transform -rotate-90">
                                {/* Background circle */}
                                <circle
                                    cx="50"
                                    cy="50"
                                    r="40"
                                    fill="none"
                                    stroke="hsl(var(--muted))"
                                    strokeWidth="16"
                                    opacity="0.2"
                                />
                                {/* Potholes arc */}
                                <circle
                                    cx="50"
                                    cy="50"
                                    r="40"
                                    fill="none"
                                    stroke="url(#potholeGradient)"
                                    strokeWidth="16"
                                    strokeDasharray={`${potholePercent * 2.51} 251`}
                                    strokeLinecap="round"
                                    className=""
                                />
                                {/* Signboards arc */}
                                <circle
                                    cx="50"
                                    cy="50"
                                    r="40"
                                    fill="none"
                                    stroke="url(#signboardGradient)"
                                    strokeWidth="16"
                                    strokeDashoffset={`-${potholePercent * 2.51}`}
                                    strokeLinecap="round"
                                    className=""
                                />
                                <defs>
                                    <linearGradient id="potholeGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                                        <stop offset="0%" stopColor="#f97316" />
                                        <stop offset="100%" stopColor="#ea580c" />
                                    </linearGradient>
                                    <linearGradient id="signboardGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                                        <stop offset="0%" stopColor="#3b82f6" />
                                        <stop offset="100%" stopColor="#2563eb" />
                                    </linearGradient>
                                </defs>
                            </svg>
                            <div className="absolute inset-0 flex items-center justify-center">
                                <div className="text-center">
                                    <p className="text-2xl font-bold text-foreground">{total}</p>
                                    <p className="text-[10px] text-muted-foreground uppercase">Total</p>
                                </div>
                            </div>
                        </div>

                        {/* Legend */}
                        <div className="flex flex-col gap-3 flex-1">
                            <div className="flex items-center justify-between p-3 rounded-lg bg-orange-500/10 border border-orange-500/20">
                                <div className="flex items-center gap-2">
                                    <div className="w-3 h-3 rounded-full bg-gradient-to-r from-orange-500 to-orange-600" />
                                    <span className="text-sm font-medium">Potholes</span>
                                </div>
                                <div className="text-right">
                                    <p className="font-bold text-foreground">{potholes}</p>
                                    <p className="text-xs text-muted-foreground">{potholePercent.toFixed(0)}%</p>
                                </div>
                            </div>
                            <div className="flex items-center justify-between p-3 rounded-lg bg-blue-500/10 border border-blue-500/20">
                                <div className="flex items-center gap-2">
                                    <div className="w-3 h-3 rounded-full bg-gradient-to-r from-blue-500 to-blue-600" />
                                    <span className="text-sm font-medium">Signboards</span>
                                </div>
                                <div className="text-right">
                                    <p className="font-bold text-foreground">{signboards}</p>
                                    <p className="text-xs text-muted-foreground">{signboardPercent.toFixed(0)}%</p>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </CardContent>
        </Card>
    )
}
