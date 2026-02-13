"use client"

import { useEffect } from "react"
import { MapContainer, TileLayer, CircleMarker, Popup, useMap } from "react-leaflet"
import { LatLngBounds, LatLng } from "leaflet"
import "leaflet/dist/leaflet.css"
import { type Detection } from "@/lib/api"

interface DashboardMapContentProps {
    detections: Detection[]
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

export default function DashboardMapContent({ detections }: DashboardMapContentProps) {
    if (detections.length === 0) {
        return (
            <div className="h-full w-full flex items-center justify-center bg-muted/20">
                <p className="text-muted-foreground">No detections to display</p>
            </div>
        )
    }

    // Calculate bounds to fit all markers
    const firstDetection = detections[0]
    const bounds = new LatLngBounds(
        new LatLng(firstDetection.latitude!, firstDetection.longitude!),
        new LatLng(firstDetection.latitude!, firstDetection.longitude!)
    )

    detections.forEach(d => {
        if (d.latitude && d.longitude) {
            bounds.extend(new LatLng(d.latitude, d.longitude))
        }
    })

    // Center point
    const center: [number, number] = [
        (bounds.getNorth() + bounds.getSouth()) / 2,
        (bounds.getEast() + bounds.getWest()) / 2
    ]

    // Get marker color based on detection type
    const getMarkerColor = (type: string) => {
        const t = type.toLowerCase()
        if (t === "pothole") {
            return { fill: "#ef4444", stroke: "#b91c1c" } // Red
        } else if (t === "defected_sign_board") {
            return { fill: "#3b82f6", stroke: "#1d4ed8" } // Blue
        } else if (t === "road_crack") {
            return { fill: "#f59e0b", stroke: "#b45309" } // Orange
        } else if (t === "damaged_road_marking") {
            return { fill: "#6366f1", stroke: "#4338ca" } // Indigo
        } else if (t === "good_sign_board") {
            return { fill: "#10b981", stroke: "#047857" } // Emerald
        }
        return { fill: "#64748b", stroke: "#475569" } // Default Slate
    }

    // Get display name for detection type
    const getTypeName = (type: string) => {
        return type.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')
    }

    return (
        <MapContainer
            center={center}
            zoom={13}
            className="h-full w-full"
            scrollWheelZoom={true}
            zoomAnimation={false}
        >
            <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />

            {/* Detection markers */}
            {detections.map((detection, idx) => {
                const colors = getMarkerColor(detection.type)
                const typeName = getTypeName(detection.type)

                return (
                    <CircleMarker
                        key={`${detection.id}-${idx}`}
                        center={[detection.latitude!, detection.longitude!]}
                        radius={10}
                        fillColor={colors.fill}
                        color={colors.stroke}
                        weight={2}
                        opacity={1}
                        fillOpacity={0.8}
                    >
                        <Popup>
                            <div className="text-sm space-y-2 min-w-[180px]">
                                <div className="font-bold text-base border-b pb-1">
                                    {typeName}
                                </div>
                                <div className="space-y-1">
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground">Class:</span>
                                        <span className="font-medium">{detection.class.replace(/_/g, " ")}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground">Confidence:</span>
                                        <span className="font-medium">{(detection.confidence * 100).toFixed(1)}%</span>
                                    </div>
                                </div>
                                <div className="pt-2 border-t">
                                    <div className="text-xs text-muted-foreground mb-1">Coordinates</div>
                                    <div className="font-mono text-xs bg-muted/30 p-2 rounded">
                                        <div>Lat: {detection.latitude!.toFixed(6)}</div>
                                        <div>Lng: {detection.longitude!.toFixed(6)}</div>
                                    </div>
                                </div>
                            </div>
                        </Popup>
                    </CircleMarker>
                )
            })}

            {/* Auto-fit bounds */}
            <FitBounds bounds={bounds} />
        </MapContainer>
    )
}
