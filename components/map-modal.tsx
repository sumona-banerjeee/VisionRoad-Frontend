"use client"

import { useEffect } from "react"
import { MapContainer, TileLayer, Polyline, CircleMarker, Popup, useMap } from "react-leaflet"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { LatLngBounds, LatLng } from "leaflet"
import "leaflet/dist/leaflet.css"

type Detection = {
    id: number
    type: string
    class: string
    confidence: number
    latitude: number
    longitude: number
    frame_number: number
}

type MapModalProps = {
    open: boolean
    onClose: () => void
    detections: Detection[]
    detectionType: "pothole-detection" | "sign-board-detection" | "pot-sign-detection"
}

// Component to auto-fit map bounds to show all markers
function FitBounds({ bounds }: { bounds: LatLngBounds }) {
    const map = useMap()

    useEffect(() => {
        if (!map || !bounds.isValid()) return

        // Small delay to ensure the container dimensions are fully calculated (prevents _leaflet_pos error)
        const timer = setTimeout(() => {
            map.invalidateSize()
            map.fitBounds(bounds, {
                padding: [50, 50],
                maxZoom: 16,
                animate: true
            })
        }, 200)

        return () => clearTimeout(timer)
    }, [bounds, map])

    return null
}

export default function MapModal({ open, onClose, detections, detectionType }: MapModalProps) {
    // Filter detections with valid GPS coordinates
    const validDetections = detections.filter(d => d.latitude && d.longitude)

    if (validDetections.length === 0) {
        return (
            <Dialog open={open} onOpenChange={onClose}>
                <DialogContent className="max-w-4xl h-[600px]">
                    <DialogHeader>
                        <DialogTitle>Detection Map</DialogTitle>
                    </DialogHeader>
                    <div className="flex items-center justify-center h-full text-muted-foreground">
                        No GPS coordinates available for detections
                    </div>
                </DialogContent>
            </Dialog>
        )
    }

    // Extract route coordinates (start to end)
    const routeCoordinates: [number, number][] = validDetections.map(d => [d.latitude, d.longitude])

    // Calculate bounds to fit all markers
    const bounds = new LatLngBounds(
        new LatLng(routeCoordinates[0][0], routeCoordinates[0][1]),
        new LatLng(routeCoordinates[0][0], routeCoordinates[0][1])
    )
    routeCoordinates.forEach(coord => bounds.extend(new LatLng(coord[0], coord[1])))

    // Center point (middle of route)
    const center: [number, number] = [
        (bounds.getNorth() + bounds.getSouth()) / 2,
        (bounds.getEast() + bounds.getWest()) / 2
    ]

    const isCombined = detectionType === "pot-sign-detection"
    const isPothole = detectionType === "pothole-detection"

    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent className="max-w-6xl h-[80vh] p-0 flex flex-col overflow-hidden border-none shadow-2xl">
                <DialogHeader className="px-6 pt-6 pb-4 bg-white dark:bg-gray-900 border-b border-gray-100 dark:border-gray-800 shrink-0">
                    <DialogTitle className="text-xl font-bold">
                        {isCombined ? "Pothole & Signboard" : isPothole ? "Pothole" : "Signboard"} Detection Map
                    </DialogTitle>
                    <p className="text-sm text-muted-foreground">
                        {validDetections.length} detection{validDetections.length !== 1 ? "s" : ""} with GPS coordinates
                    </p>
                </DialogHeader>

                <div className="flex-1 w-full bg-gray-50 dark:bg-gray-950 relative">
                    <MapContainer
                        center={center}
                        zoom={13}
                        className="h-full w-full"
                        scrollWheelZoom={true}
                    >
                        <TileLayer
                            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                        />

                        {/* Route line */}
                        <Polyline
                            positions={routeCoordinates}
                            color="#3b82f6"
                            weight={3}
                            opacity={0.7}
                        />

                        {/* Detection markers */}
                        {validDetections.map((detection, idx) => {
                            const type = (detection.type || "").toLowerCase()
                            let markerColor = "#64748b" // Default Slate
                            let strokeColor = "#475569"

                            if (type === "pothole") {
                                markerColor = "#ef4444"
                                strokeColor = "#b91c1c"
                            } else if (type === "defected_sign_board") {
                                markerColor = "#3b82f6"
                                strokeColor = "#1d4ed8"
                            } else if (type === "road_crack") {
                                markerColor = "#f59e0b"
                                strokeColor = "#b45309"
                            } else if (type === "damaged_road_marking") {
                                markerColor = "#6366f1"
                                strokeColor = "#4338ca"
                            } else if (type === "good_sign_board") {
                                markerColor = "#10b981"
                                strokeColor = "#047857"
                            }

                            return (
                                <CircleMarker
                                    key={`${detection.id}-${idx}`}
                                    center={[detection.latitude, detection.longitude]}
                                    radius={8}
                                    fillColor={markerColor}
                                    color={strokeColor}
                                    weight={2}
                                    opacity={1}
                                    fillOpacity={0.8}
                                >
                                    <Popup>
                                        <div className="text-xs space-y-1">
                                            <div className="font-semibold capitalize">
                                                {(detection.type || "").replace(/_/g, " ")} #{detection.id}
                                            </div>
                                            <div>Frame: {detection.frame_number}</div>
                                            <div>Confidence: {(detection.confidence * 100).toFixed(1)}%</div>
                                            <div className="font-mono text-[10px]">
                                                {detection.latitude.toFixed(6)}, {detection.longitude.toFixed(6)}
                                            </div>
                                        </div>
                                    </Popup>
                                </CircleMarker>
                            )
                        })}

                        {/* Auto-fit bounds */}
                        <FitBounds bounds={bounds} />
                    </MapContainer>
                </div>
            </DialogContent>
        </Dialog>
    )
}
