"use client"

import { useEffect, useState } from "react"
import dynamic from "next/dynamic"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Loader2, MapPin, AlertTriangle, RectangleHorizontal } from "lucide-react"
import { fetchAllDetections, type Detection } from "@/lib/api"

// Dynamically import the map to avoid SSR issues with Leaflet
const DashboardMapContent = dynamic(
    () => import("./dashboard-map-content"),
    {
        ssr: false,
        loading: () => (
            <div className="h-full w-full flex items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        )
    }
)

interface DashboardMapProps {
    className?: string
}

export function DashboardMap({ className }: DashboardMapProps) {
    const [detections, setDetections] = useState<Detection[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        const loadDetections = async () => {
            try {
                setIsLoading(true)
                setError(null)
                const data = await fetchAllDetections()
                setDetections(data)
            } catch (err) {
                console.error("Failed to load detections:", err)
                setError("Failed to load detection data")
            } finally {
                setIsLoading(false)
            }
        }

        loadDetections()
    }, [])

    // Filter detections with valid GPS coordinates
    const validDetections = detections.filter(d => d.latitude && d.longitude)

    // Count potholes and signboards
    const potholeCount = validDetections.filter(d =>
        d.type?.toLowerCase().includes("pothole") ||
        d.class?.toLowerCase().includes("pothole")
    ).length
    const signboardCount = validDetections.length - potholeCount

    return (
        <Card className={`bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm border-0 shadow-lg shadow-gray-200/50 dark:shadow-gray-900/50 rounded-xl overflow-hidden ${className}`}>
            <CardHeader className="pb-2 bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-950/30 dark:to-purple-950/30">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <div className="p-1.5 rounded-lg bg-gradient-to-br from-indigo-400 to-purple-500 shadow-md shadow-indigo-500/30">
                            <MapPin className="h-4 w-4 text-white" />
                        </div>
                        <div>
                            <CardTitle className="text-base font-bold">
                                <span className="bg-gradient-to-r from-indigo-600 via-purple-500 to-indigo-600 dark:from-indigo-400 dark:via-purple-400 dark:to-indigo-400 bg-clip-text text-transparent">
                                    Detection Map
                                </span>
                            </CardTitle>
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                                {isLoading ? "Loading..." : `${validDetections.length} detections with GPS coordinates`}
                            </p>
                        </div>
                    </div>

                    {/* Compact Color Legend */}
                    <div className="flex items-center gap-4 text-xs">
                        <div className="flex items-center gap-1.5">
                            <div className="w-3 h-3 rounded-full bg-red-500 shadow-sm shadow-red-500/50" />
                            <span className="text-gray-600 dark:text-gray-400 font-medium">Potholes ({potholeCount})</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                            <div className="w-3 h-3 rounded-full bg-blue-500 shadow-sm shadow-blue-500/50" />
                            <span className="text-gray-600 dark:text-gray-400 font-medium">Signboards ({signboardCount})</span>
                        </div>
                    </div>
                </div>
            </CardHeader>
            <CardContent className="p-0">
                <div className="h-[400px] w-full relative">
                    {isLoading ? (
                        <div className="h-full w-full flex items-center justify-center bg-gray-50 dark:bg-gray-900/50">
                            <Loader2 className="h-8 w-8 animate-spin text-indigo-500" />
                        </div>
                    ) : error ? (
                        <div className="h-full w-full flex items-center justify-center bg-gray-50 dark:bg-gray-900/50">
                            <p className="text-gray-500">{error}</p>
                        </div>
                    ) : validDetections.length === 0 ? (
                        <div className="h-full w-full flex items-center justify-center bg-gray-50 dark:bg-gray-900/50">
                            <div className="text-center">
                                <p className="text-gray-500">No detections with GPS coordinates found</p>
                                <p className="text-sm text-gray-400 mt-1">Process some videos to see detections on the map</p>
                            </div>
                        </div>
                    ) : (
                        <DashboardMapContent detections={validDetections} />
                    )}
                </div>
            </CardContent>
        </Card>
    )
}
