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
                <Loader2 className="h-8 w-8 text-primary" />
            </div>
        )
    }
)

interface DashboardMapProps {
    className?: string
    selectedProjectId?: string | null
    selectedPackageId?: string | null
    selectedLocationId?: string | null
    projectSummary?: any
}

export function DashboardMap({
    className,
    selectedProjectId,
    selectedPackageId,
    selectedLocationId,
    projectSummary
}: DashboardMapProps) {
    const [detections, setDetections] = useState<Detection[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        if (!projectSummary) {
            setDetections([])
            setIsLoading(false)
            return
        }

        try {
            setIsLoading(true)
            setError(null)

            const filteredDetections: Detection[] = []

            const packagesToProcess = selectedPackageId && selectedPackageId !== "all"
                ? { [selectedPackageId]: projectSummary.packages[selectedPackageId] }
                : projectSummary.packages || {}

            for (const [pkgName, pkg] of Object.entries(packagesToProcess)) {
                const locationsToProcess = selectedLocationId && selectedLocationId !== "all"
                    ? { [selectedLocationId]: (pkg as any).locations[selectedLocationId] }
                    : (pkg as any).locations || {}

                for (const [locName, loc] of Object.entries(locationsToProcess)) {
                    if (!loc) continue
                    const locationDetections = (loc as any).detections || []
                    filteredDetections.push(...locationDetections)
                }
            }

            setDetections(filteredDetections)
        } catch (err) {
            console.error("Failed to extract detections:", err)
            setError("Failed to load detection data")
        } finally {
            setIsLoading(false)
        }
    }, [projectSummary, selectedPackageId, selectedLocationId])

    // Filter detections with valid GPS coordinates
    const validDetections = detections.filter(d => d.latitude && d.longitude)

    // Count detections by category
    const counts = {
        defected_sign_board: validDetections.filter(d => d.type?.toLowerCase() === "defected_sign_board").length,
        pothole: validDetections.filter(d => d.type?.toLowerCase() === "pothole").length,
        road_crack: validDetections.filter(d => d.type?.toLowerCase() === "road_crack").length,
        damaged_road_marking: validDetections.filter(d => d.type?.toLowerCase() === "damaged_road_marking").length,
        good_sign_board: validDetections.filter(d => d.type?.toLowerCase() === "good_sign_board").length
    }

    return (
        <Card className={`overflow-hidden ${className}`}>
            <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-white flex items-center justify-center shadow-lg border-2 border-[#1e40af]">
                            <MapPin className="h-5 w-5 text-[#2563eb]" />
                        </div>
                        <div>
                            <CardTitle className="text-base font-bold text-[#2563eb]">
                                Detection Map
                            </CardTitle>
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                                {isLoading ? "Loading..." : `${validDetections.length} detections with GPS coordinates`}
                            </p>
                        </div>
                    </div>

                    {/* Compact Color Legend */}
                    <div className="flex flex-wrap items-center justify-end gap-x-4 gap-y-1 text-[10px] max-w-[60%]">
                        <div className="flex items-center gap-1">
                            <div className="w-2.5 h-2.5 rounded-full bg-[#ef4444] shadow-sm shadow-[#ef4444]/30" />
                            <span className="text-gray-600 dark:text-gray-400 font-medium">Potholes ({counts.pothole})</span>
                        </div>
                        <div className="flex items-center gap-1">
                            <div className="w-2.5 h-2.5 rounded-full bg-[#3b82f6] shadow-sm shadow-[#3b82f6]/30" />
                            <span className="text-gray-600 dark:text-gray-400 font-medium">Defected Signs ({counts.defected_sign_board})</span>
                        </div>
                        <div className="flex items-center gap-1">
                            <div className="w-2.5 h-2.5 rounded-full bg-[#f59e0b] shadow-sm shadow-[#f59e0b]/30" />
                            <span className="text-gray-600 dark:text-gray-400 font-medium">Cracks ({counts.road_crack})</span>
                        </div>
                        <div className="flex items-center gap-1">
                            <div className="w-2.5 h-2.5 rounded-full bg-[#6366f1] shadow-sm shadow-[#6366f1]/30" />
                            <span className="text-gray-600 dark:text-gray-400 font-medium">Markings ({counts.damaged_road_marking})</span>
                        </div>
                        <div className="flex items-center gap-1">
                            <div className="w-2.5 h-2.5 rounded-full bg-[#10b981] shadow-sm shadow-[#10b981]/30" />
                            <span className="text-gray-600 dark:text-gray-400 font-medium">Good Signs ({counts.good_sign_board})</span>
                        </div>
                    </div>
                </div>
            </CardHeader>
            <CardContent className="p-0">
                <div className="h-[400px] w-full relative">
                    {isLoading ? (
                        <div className="h-full w-full flex items-center justify-center bg-gray-50 dark:bg-gray-900/50">
                            <Loader2 className="h-8 w-8 text-indigo-500" />
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
