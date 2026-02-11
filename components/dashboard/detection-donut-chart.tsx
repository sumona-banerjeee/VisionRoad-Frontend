"use client"

import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts"
import { Loader2 } from "lucide-react"

interface DetectionDonutChartProps {
    potholes: number
    signboards: number
    isLoading: boolean
}

const COLORS = {
    pothole: "#10b981",
    signboard: "#3b82f6"
}

export function DetectionDonutChart({ potholes, signboards, isLoading }: DetectionDonutChartProps) {
    if (isLoading) {
        return (
            <div className="h-[250px] flex items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary/50" />
            </div>
        )
    }

    const total = potholes + signboards

    if (total === 0) {
        return (
            <div className="h-[250px] flex flex-col items-center justify-center text-muted-foreground">
                <p className="text-sm">No detections found</p>
                <p className="text-xs mt-1">Process videos to see data</p>
            </div>
        )
    }

    const data = [
        { name: "Potholes", value: potholes, color: COLORS.pothole },
        { name: "Signboards", value: signboards, color: COLORS.signboard }
    ]

    return (
        <div className="h-[200px] relative">
            <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                    <Pie
                        data={data}
                        cx="50%"
                        cy="50%"
                        innerRadius={50}
                        outerRadius={70}
                        paddingAngle={5}
                        dataKey="value"
                        strokeWidth={0}
                    >
                        {data.map((entry, index) => (
                            <Cell
                                key={`cell-${index}`}
                                fill={entry.color}
                                fillOpacity={0.8}
                                className="transition-all duration-300 hover:fill-opacity-100"
                            />
                        ))}
                    </Pie>
                    <Tooltip
                        content={({ active, payload }) => {
                            if (active && payload && payload.length) {
                                const data = payload[0]
                                return (
                                    <div className="bg-background/95 backdrop-blur-sm border border-border rounded-lg px-3 py-2 shadow-lg">
                                        <p className="font-medium text-sm">{data.name}</p>
                                        <p className="text-sm text-muted-foreground">
                                            Count: <span className="font-semibold text-foreground">{data.value}</span>
                                        </p>
                                        <p className="text-xs text-muted-foreground">
                                            {((Number(data.value) / total) * 100).toFixed(1)}% of total
                                        </p>
                                    </div>
                                )
                            }
                            return null
                        }}
                    />
                    <Legend
                        verticalAlign="bottom"
                        height={36}
                        content={({ payload }) => (
                            <div className="flex items-center justify-center gap-6 mt-2">
                                {payload?.map((entry, index) => (
                                    <div key={`legend-${index}`} className="flex items-center gap-2">
                                        <div
                                            className="w-3 h-3 rounded-full"
                                            style={{ backgroundColor: entry.color }}
                                        />
                                        <span className="text-[10px] text-muted-foreground">
                                            {entry.value}: {data[index].value}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        )}
                    />
                </PieChart>
            </ResponsiveContainer>
            {/* Center label */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none" style={{ marginTop: '-40px' }}>
                <div className="text-center">
                    <p className="text-xl font-extrabold text-[#2563eb]">{total}</p>
                    <p className="text-[9px] uppercase tracking-wider text-muted-foreground">Total</p>
                </div>
            </div>
        </div>
    )
}
