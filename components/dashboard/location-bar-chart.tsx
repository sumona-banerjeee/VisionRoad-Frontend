"use client"

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts"
import { Loader2 } from "lucide-react"

interface LocationData {
    name: string
    defected_sign_board: number
    pothole: number
    road_crack: number
    damaged_road_marking: number
    good_sign_board: number
    total: number
}

interface LocationBarChartProps {
    data: LocationData[]
    isLoading: boolean
}

const COLORS = {
    defected_sign_board: "#60a5fa", // Lighter Blue
    pothole: "#ff8a8a",           // Lighter Red
    road_crack: "#fbbf24",         // Lighter Orange
    damaged_road_marking: "#818cf8", // Lighter Indigo
    good_sign_board: "#34d399"      // Lighter Emerald
}

export function LocationBarChart({ data, isLoading }: LocationBarChartProps) {
    if (isLoading) {
        return (
            <div className="h-[300px] flex items-center justify-center">
                <Loader2 className="h-8 w-8 text-primary/50" />
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
                    barCategoryGap="10%"
                    barGap={2}
                >
                    <defs>
                        <linearGradient id="barPothole" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#ff8a8a" />
                            <stop offset="100%" stopColor="#ef4444" />
                        </linearGradient>
                        <linearGradient id="barDefectedSign" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#60a5fa" />
                            <stop offset="100%" stopColor="#3b82f6" />
                        </linearGradient>
                        <linearGradient id="barCrack" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#fbbf24" />
                            <stop offset="100%" stopColor="#f59e0b" />
                        </linearGradient>
                        <linearGradient id="barMarking" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#818cf8" />
                            <stop offset="100%" stopColor="#6366f1" />
                        </linearGradient>
                        <linearGradient id="barGoodSign" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#34d399" />
                            <stop offset="100%" stopColor="#10b981" />
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
                                                <span className="text-muted-foreground">{(entry.name as string).replace(/_/g, ' ')}:</span>
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
                            <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1 mb-2">
                                {payload?.map((entry, index) => (
                                    <div key={`legend-${index}`} className="flex items-center gap-1.5">
                                        <div
                                            className="w-2.5 h-2.5 rounded-sm"
                                            style={{ backgroundColor: entry.color }}
                                        />
                                        <span className="text-[9px] text-muted-foreground whitespace-nowrap">
                                            {(entry.value as string).replace(/_/g, ' ')}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        )}
                    />
                    <Bar
                        dataKey="pothole"
                        name="Pothole"
                        fill="url(#barPothole)"
                        radius={[4, 4, 0, 0]}
                        isAnimationActive={false}
                    />
                    <Bar
                        dataKey="defected_sign_board"
                        name="Defected Signboard"
                        fill="url(#barDefectedSign)"
                        radius={[4, 4, 0, 0]}
                        isAnimationActive={false}
                    />
                    <Bar
                        dataKey="road_crack"
                        name="Road Crack"
                        fill="url(#barCrack)"
                        radius={[4, 4, 0, 0]}
                        isAnimationActive={false}
                    />
                    <Bar
                        dataKey="damaged_road_marking"
                        name="Damaged Marking"
                        fill="url(#barMarking)"
                        radius={[4, 4, 0, 0]}
                        isAnimationActive={false}
                    />
                    <Bar
                        dataKey="good_sign_board"
                        name="Good Signboard"
                        fill="url(#barGoodSign)"
                        radius={[4, 4, 0, 0]}
                        isAnimationActive={false}
                    />
                </BarChart>
            </ResponsiveContainer>
        </div>
    )
}
