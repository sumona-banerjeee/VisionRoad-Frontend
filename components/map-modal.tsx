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
    detectionType: "pothole-detection" | "sign-board-detection"
}

// Component to auto-fit map bounds to show all markers
function FitBounds({ bounds }: { bounds: LatLngBounds }) {
    const map = useMap()

    useEffect(() => {
        if (bounds.isValid()) {
            map.fitBounds(bounds, { padding: [50, 50] })
        }
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

    const isPothole = detectionType === "pothole-detection"

    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent className="max-w-4xl h-[600px] p-0">
                <DialogHeader className="px-6 pt-6 pb-2">
                    <DialogTitle>
                        {isPothole ? "Pothole" : "Signboard"} Detection Map
                    </DialogTitle>
                    <p className="text-sm text-muted-foreground">
                        {validDetections.length} detection{validDetections.length !== 1 ? "s" : ""} with GPS coordinates
                    </p>
                </DialogHeader>

                <div className="h-[calc(100%-80px)] w-full">
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
                        {validDetections.map((detection, idx) => (
                            <CircleMarker
                                key={`${detection.id}-${idx}`}
                                center={[detection.latitude, detection.longitude]}
                                radius={8}
                                fillColor="#ef4444"
                                color="#dc2626"
                                weight={2}
                                opacity={1}
                                fillOpacity={0.8}
                            >
                                <Popup>
                                    <div className="text-xs space-y-1">
                                        <div className="font-semibold">
                                            {isPothole ? "Pothole" : detection.class.replace(/_/g, " ")} #{detection.id}
                                        </div>
                                        <div>Frame: {detection.frame_number}</div>
                                        <div>Confidence: {(detection.confidence * 100).toFixed(1)}%</div>
                                        <div className="font-mono text-[10px]">
                                            {detection.latitude.toFixed(6)}, {detection.longitude.toFixed(6)}
                                        </div>
                                    </div>
                                </Popup>
                            </CircleMarker>
                        ))}

                        {/* Auto-fit bounds */}
                        <FitBounds bounds={bounds} />
                    </MapContainer>
                </div>
            </DialogContent>
        </Dialog>
    )
}
