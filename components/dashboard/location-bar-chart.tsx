"use client"

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts"
import { Loader2 } from "lucide-react"

interface LocationData {
    name: string
    potholes: number
    signboards: number
    total: number
}

interface LocationBarChartProps {
    data: LocationData[]
    isLoading: boolean
}

const COLORS = {
    pothole: "#ef4444",
    signboard: "#3b82f6"
}

export function LocationBarChart({ data, isLoading }: LocationBarChartProps) {
    if (isLoading) {
        return (
            <div className="h-[300px] flex items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary/50" />
            </div>
        )
    }

    if (data.length === 0) {
        return (
            <div className="h-[300px] flex flex-col items-center justify-center text-muted-foreground">
                <p className="text-sm">No location data available</p>
                <p className="text-xs mt-1">Process videos to see detections by location</p>
            </div>
        )
    }

    return (
        <div className="h-[200px]">
            <ResponsiveContainer width="100%" height="100%">
                <BarChart
                    data={data}
                    margin={{ top: 10, right: 10, left: 0, bottom: 20 }}
                    barCategoryGap="25%"
                >
                    <defs>
                        <linearGradient id="barGradientPothole" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#ef4444" stopOpacity={0.8} />
                            <stop offset="100%" stopColor="#ef4444" stopOpacity={0.4} />
                        </linearGradient>
                        <linearGradient id="barGradientSignboard" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#3b82f6" stopOpacity={0.8} />
                            <stop offset="100%" stopColor="#3b82f6" stopOpacity={0.4} />
                        </linearGradient>
                    </defs>
                    <CartesianGrid
                        strokeDasharray="3 3"
                        vertical={false}
                        stroke="hsl(var(--muted-foreground) / 0.1)"
                    />
                    <XAxis
                        dataKey="name"
                        tick={{ fontSize: 9, fill: 'hsl(var(--muted-foreground))' }}
                        tickLine={false}
                        axisLine={false}
                        angle={-45}
                        textAnchor="end"
                        height={50}
                        interval={0}
                    />
                    <YAxis
                        tick={{ fontSize: 9, fill: 'hsl(var(--muted-foreground))' }}
                        tickLine={false}
                        axisLine={false}
                        width={25}
                    />
                    <Tooltip
                        content={({ active, payload, label }) => {
                            if (active && payload && payload.length) {
                                return (
                                    <div className="bg-background/95 backdrop-blur-sm border border-border rounded-lg px-3 py-2 shadow-lg">
                                        <p className="font-medium text-xs mb-1">{label}</p>
                                        {payload.map((entry, index) => (
                                            <div key={index} className="flex items-center gap-2 text-xs">
                                                <div
                                                    className="w-2 h-2 rounded-full"
                                                    style={{ backgroundColor: entry.color }}
                                                />
                                                <span className="text-muted-foreground">{entry.name}:</span>
                                                <span className="font-semibold">{entry.value}</span>
                                            </div>
                                        ))}
                                    </div>
                                )
                            }
                            return null
                        }}
                    />
                    <Legend
                        verticalAlign="top"
                        height={30}
                        content={({ payload }) => (
                            <div className="flex items-center justify-center gap-6 mb-2">
                                {payload?.map((entry, index) => (
                                    <div key={`legend-${index}`} className="flex items-center gap-2">
                                        <div
                                            className="w-3 h-3 rounded-sm"
                                            style={{ backgroundColor: entry.color }}
                                        />
                                        <span className="text-[10px] text-muted-foreground">
                                            {entry.value}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        )}
                    />
                    <Bar
                        dataKey="potholes"
                        name="Potholes"
                        fill="url(#barGradientPothole)"
                        radius={[4, 4, 0, 0]}
                    />
                    <Bar
                        dataKey="signboards"
                        name="Signboards"
                        fill="url(#barGradientSignboard)"
                        radius={[4, 4, 0, 0]}
                    />
                </BarChart>
            </ResponsiveContainer>
        </div>
    )
}
