"use client"

import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts"
import { Loader2 } from "lucide-react"

interface DetectionDonutChartProps {
    defectedSignboard: number
    pothole: number
    roadCrack: number
    damagedRoadMarking: number
    goodSignboard: number
    isLoading: boolean
}

const COLORS = {
    defectedSignboard: "#3b82f6", // Blue
    pothole: "#ef4444",           // Red
    roadCrack: "#f59e0b",         // Amber/Orange
    damagedRoadMarking: "#6366f1", // Indigo
    goodSignboard: "#10b981"      // Emerald
}

export function DetectionDonutChart({
    defectedSignboard,
    pothole,
    roadCrack,
    damagedRoadMarking,
    goodSignboard,
    isLoading
}: DetectionDonutChartProps) {
    if (isLoading) {
        return (
            <div className="h-[250px] flex items-center justify-center">
                <Loader2 className="h-8 w-8 text-primary/50" />
            </div>
        )
    }

    const total = defectedSignboard + pothole + roadCrack + damagedRoadMarking + goodSignboard

    if (total === 0) {
        return (
            <div className="h-[250px] flex flex-col items-center justify-center text-muted-foreground">
                <p className="text-sm">No detections found</p>
                <p className="text-xs mt-1">Process videos to see data</p>
            </div>
        )
    }

    const data = [
        { name: "Defected Signboards", value: defectedSignboard, color: COLORS.defectedSignboard },
        { name: "Potholes", value: pothole, color: COLORS.pothole },
        { name: "Road Cracks", value: roadCrack, color: COLORS.roadCrack },
        { name: "Damaged Markings", value: damagedRoadMarking, color: COLORS.damagedRoadMarking },
        { name: "Good Signboards", value: goodSignboard, color: COLORS.goodSignboard }
    ].filter(item => item.value > 0)

    return (
        <div className="h-[220px] relative">
            <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                    <defs>
                        <linearGradient id="gradPothole" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#ff8a8a" />
                            <stop offset="100%" stopColor="#ef4444" />
                        </linearGradient>
                        <linearGradient id="gradDefectedSign" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#60a5fa" />
                            <stop offset="100%" stopColor="#3b82f6" />
                        </linearGradient>
                        <linearGradient id="gradCrack" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#fbbf24" />
                            <stop offset="100%" stopColor="#f59e0b" />
                        </linearGradient>
                        <linearGradient id="gradMarking" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#818cf8" />
                            <stop offset="100%" stopColor="#6366f1" />
                        </linearGradient>
                        <linearGradient id="gradGoodSign" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#34d399" />
                            <stop offset="100%" stopColor="#10b981" />
                        </linearGradient>
                    </defs>
                    <Pie
                        data={data}
                        cx="50%"
                        cy="45%"
                        innerRadius={50}
                        outerRadius={70}
                        paddingAngle={5}
                        dataKey="value"
                        strokeWidth={0}
                        isAnimationActive={false}
                    >
                        {data.map((entry, index) => {
                            const gradId = entry.name === "Potholes" ? "gradPothole" :
                                entry.name === "Defected Signboards" ? "gradDefectedSign" :
                                    entry.name === "Road Cracks" ? "gradCrack" :
                                        entry.name === "Damaged Markings" ? "gradMarking" : "gradGoodSign"
                            return (
                                <Cell
                                    key={`cell-${index}`}
                                    fill={`url(#${gradId})`}
                                    fillOpacity={1}
                                    className="hover:fill-opacity-80"
                                />
                            )
                        })}
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
                        height={40}
                        content={({ payload }) => (
                            <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1 mt-2">
                                {payload?.map((entry, index) => (
                                    <div key={`legend-${index}`} className="flex items-center gap-1.5">
                                        <div
                                            className="w-2.5 h-2.5 rounded-full"
                                            style={{ backgroundColor: entry.color }}
                                        />
                                        <span className="text-[9px] text-muted-foreground whitespace-nowrap">
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
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none" style={{ marginTop: '-55px' }}>
                <div className="text-center">
                    <p className="text-xl font-extrabold text-[#2563eb]">{total}</p>
                    <p className="text-[9px] uppercase tracking-wider text-muted-foreground">Total</p>
                </div>
            </div>
        </div>
    )
}
