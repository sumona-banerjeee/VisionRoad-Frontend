"use client"

import { useEffect, useRef, useState, useCallback } from "react"
import dynamic from "next/dynamic"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Target, AlertTriangle, Film, Activity, Gauge, Monitor, SignpostBig, Map as MapIcon } from "lucide-react"

// Dynamically import MapModal with SSR disabled (Leaflet requires window object)
const MapModal = dynamic(() => import("@/components/map-modal"), { ssr: false })

import { DetectionData, DetectionType } from "@/lib/types"

const API_URL = "http://127.0.0.1:8000/api/v1"



type VideoPlayerSectionProps = {
  data: DetectionData
  videoId: string
  videoFile: File | null  // null when loading from server (results page)
  detectionType: DetectionType
  projectId?: string  // Optional project ID for fetching detailed summary
}

type DetectionLog = {
  frame: number
  detections: Array<{
    id: number
    type?: string // For signboards
    bbox: { x1: number; y1: number; x2: number; y2: number }
    confidence: number
    latitude?: number
    longitude?: number
  }>
  videoTime: string // Video timestamp (MM:SS)
}

type LocationSummaryData = {
  project: {
    id: string
    name: string
    corridor_name: string | null
    state: string | null
  }
  packages: {
    [packageName: string]: {
      package_id: string
      region: string | null
      locations: {
        [locationName: string]: {
          location_id: string
          chainage: string | null
          detection_count: number
          detections: Array<{
            id: number
            video_id: string
            type: string
            class: string
            confidence: number
            latitude: number
            longitude: number
            frame_number: number
            timestamp_ms: number
            bounding_box: {
              x1: number
              y1: number
              x2: number
              y2: number
            }
          }>
        }
      }
    }
  }
}

function DetailedSummarySection({
  projectId,
  videoId,
  show,
  detectionType
}: {
  projectId: string
  videoId: string
  show: boolean
  detectionType: DetectionType
}) {
  const [summaryData, setSummaryData] = useState<LocationSummaryData | null>(null)
  const [loading, setLoading] = useState(false)
  const [showMap, setShowMap] = useState(false)

  useEffect(() => {
    if (!show || !videoId || !projectId) return

    const fetchSummary = async () => {
      setLoading(true)
      try {
        const response = await fetch(`${API_URL}/summary/projects/${projectId}?video_id=${videoId}`, {
          headers: { "ngrok-skip-browser-warning": "true" }
        })
        if (response.ok) {
          const data = await response.json()
          setSummaryData(data)
        } else {
          console.error(`Failed to fetch summary: ${response.status}`)
        }
      } catch (err) {
        console.error("Failed to fetch summary:", err)
      } finally {
        setLoading(false)
      }
    }

    fetchSummary()
  }, [show, videoId, projectId])

  if (!show || loading || !summaryData) return null

  const isCombined = detectionType === "pot-sign-detection"
  const isPothole = detectionType === "pothole-detection" || isCombined

  // Flatten all detections for the scrollable list
  const allDetections: Array<{
    detection: any
    locationName: string
    packageName: string
  }> = []

  Object.entries(summaryData.packages).forEach(([packageName, packageData]) => {
    Object.entries(packageData.locations).forEach(([locationName, locationData]) => {
      locationData.detections.forEach(detection => {
        allDetections.push({ detection, locationName, packageName })
      })
    })
  })

  return (
    <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
      <Card className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 shadow-xl shadow-blue-500/5 rounded-xl overflow-hidden flex flex-col lg:col-span-2">
        <CardHeader className="pb-3 bg-white dark:bg-gray-900 border-b border-gray-100 dark:border-gray-800 shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-gradient-to-br from-[#9bddeb] to-[#60a5fa] shadow-md flex items-center justify-center relative overflow-hidden group">
                <div className="absolute inset-0 bg-white/20 opacity-50"></div>
                <div className="absolute inset-0 border-2 border-white/30 rounded-xl opacity-30"></div>
                <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white relative z-10">
                  <path d="M50 20L85 80H15L50 20Z" stroke="currentColor" strokeWidth="6" strokeLinejoin="round" />
                  <path d="M40 80L50 55L60 80" stroke="currentColor" strokeWidth="6" />
                </svg>
              </div>
              <div>
                <CardTitle className="text-base font-bold text-gray-900 dark:text-white">
                  Detection Locations
                </CardTitle>
                <CardDescription className="text-xs">
                  {isCombined ? "Potholes & Signboards" : isPothole ? "Potholes" : "Signboards"} detected across project locations
                </CardDescription>
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowMap(true)}
              className="gap-2 border-blue-200 dark:border-blue-800 hover:bg-blue-50 dark:hover:bg-blue-900/50"
            >
              <MapIcon className="h-4 w-4 text-blue-500" />
              Show Map
            </Button>
          </div>
        </CardHeader>
        <CardContent className="flex-1 p-0 overflow-hidden">
          <ScrollArea className="h-[300px] p-6 pt-3">
            <div className="space-y-3">
              {/* Project Info */}
              <div className="pb-3 border-b mb-3">
                <div className="flex flex-col mb-3">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-0.5">Project</span>
                  <span className="text-base font-bold text-gray-900 dark:text-white">
                    {summaryData.project.name}
                  </span>
                </div>
                {summaryData.project.corridor_name && (
                  <div className="flex flex-col">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-0.5">Corridor</span>
                    <span className="text-sm font-bold text-gray-700 dark:text-gray-300">
                      {summaryData.project.corridor_name}
                    </span>
                  </div>
                )}
              </div>

              {/* Packages and Locations */}
              {Object.entries(summaryData.packages).map(([packageName, packageData]) => (
                <div key={packageData.package_id} className="space-y-2">
                  <div className="text-xs font-medium">{packageName}</div>
                  <div className="pl-3 space-y-2">
                    {Object.entries(packageData.locations).map(([locationName, locationData]) => (
                      <div key={locationData.location_id} className="text-xs p-2 rounded bg-muted/30 flex items-center justify-between gap-4">
                        <div className="font-medium truncate">{locationName}</div>
                        <div className="text-[10px] text-muted-foreground whitespace-nowrap">
                          {locationData.detection_count} detection{locationData.detection_count !== 1 ? "s" : ""} found
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>

      <Card className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 shadow-xl shadow-blue-500/5 rounded-xl overflow-hidden flex flex-col lg:col-span-3">
        <CardHeader className="pb-3 bg-white dark:bg-gray-900 border-b border-gray-100 dark:border-gray-800 shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-gradient-to-br from-[#9bddeb] to-[#60a5fa] shadow-md flex items-center justify-center relative overflow-hidden group">
              <div className="absolute inset-0 bg-white/10 opacity-40"></div>
              <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white relative z-10">
                <path d="M3 17L9 11L13 15L21 7" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M15 7H21V13" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <div>
              <CardTitle className="text-base font-bold text-gray-900 dark:text-white">
                All Detections
              </CardTitle>
              <CardDescription className="text-xs">
                Complete list of {isCombined ? "potholes & signboards" : isPothole ? "potholes" : "signboards"} with GPS coordinates
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="flex-1 p-0 overflow-hidden">
          <ScrollArea className="h-[300px] p-4">
            <div className="space-y-2">
              {allDetections.map(({ detection, locationName, packageName }, idx) => (
                <div
                  key={`${detection.id}-${idx}`}
                  className="text-xs p-2 bg-white dark:bg-gray-900 rounded shadow-sm border border-gray-100 dark:border-gray-800"

                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-semibold">
                      {detection.type === "pothole" ? "Pothole" : (detection.class || detection.type || "").replace(/_/g, " ")} #{detection.id}
                    </span>
                    <span className="text-[10px] text-muted-foreground">
                      Frame {detection.frame_number}
                    </span>
                  </div>
                  <div className="space-y-0.5 text-[10px] text-muted-foreground">
                    <div>Location: {locationName}</div>
                    <div>Confidence: {(detection.confidence * 100).toFixed(1)}%</div>
                    <div className="font-mono">
                      GPS: {detection.latitude}, {detection.longitude}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>

      {/* Map Modal */}
      <MapModal
        open={showMap}
        onClose={() => setShowMap(false)}
        detections={allDetections.map(({ detection }) => detection)}
        detectionType={detectionType}
      />
    </div>
  )
}

function SummarySection({ data, show, detectionType }: { data: DetectionData; show: boolean; detectionType: DetectionType }) {
  if (!show) return null

  const isCombined = detectionType === "pot-sign-detection"
  const isPothole = detectionType === "pothole-detection" || isCombined
  const isSignboard = detectionType === "sign-board-detection" || isCombined

  const stats = [
    {
      label: "Total Road Damage",
      value: data.summary.total_road_damage || 0,
      icon: Target,
      color: "text-purple-500",
      bgColor: "bg-purple-50 dark:bg-purple-950/30",
    },
    {
      label: "Defected Signboards",
      value: data.summary.unique_defected_sign_board || 0,
      icon: SignpostBig,
      color: "text-blue-500",
      bgColor: "bg-blue-50 dark:bg-blue-950/30",
    },
    {
      label: "Unique Potholes",
      value: data.summary.unique_pothole || 0,
      icon: AlertTriangle,
      color: "text-red-500",
      bgColor: "bg-red-50 dark:bg-red-950/30",
    },
    {
      label: "Road Cracks",
      value: data.summary.unique_road_crack || 0,
      icon: AlertTriangle,
      color: "text-orange-500",
      bgColor: "bg-orange-50 dark:bg-orange-950/30",
    },
    {
      label: "Damaged Markings",
      value: data.summary.unique_damaged_road_marking || 0,
      icon: Activity,
      color: "text-indigo-500",
      bgColor: "bg-indigo-50 dark:bg-indigo-950/30",
    },
    {
      label: "Good Signboards",
      value: data.summary.unique_good_sign_board || 0,
      icon: SignpostBig,
      color: "text-emerald-500",
      bgColor: "bg-emerald-50 dark:bg-emerald-950/30",
    },
    {
      label: "Detection Rate",
      value: `${(data.summary.detection_rate || 0).toFixed(1)}%`,
      icon: Activity,
      color: "text-green-500",
      bgColor: "bg-green-50 dark:bg-green-950/30",
    },
    {
      label: "Video FPS",
      value: (data.video_info.fps || 0).toFixed(1),
      icon: Gauge,
      color: "text-orange-500",
      bgColor: "bg-orange-50 dark:bg-orange-950/30",
    },
    {
      label: "Resolution",
      value: `${data.video_info.width}×${data.video_info.height}`,
      icon: Monitor,
      color: "text-blue-500",
      bgColor: "bg-blue-50 dark:bg-blue-950/30",
    },
    {
      label: "Total Frames",
      value: data.summary.total_frames || data.video_info.total_frames,
      icon: Film,
      color: "text-purple-500",
      bgColor: "bg-purple-50 dark:bg-purple-950/30",
    },
  ]

  return (
    <Card className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 shadow-xl shadow-blue-500/5 rounded-xl overflow-hidden">
      <CardHeader className="pb-3 bg-white dark:bg-gray-900 border-b border-gray-100 dark:border-gray-800">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-gradient-to-br from-[#9bddeb] to-[#60a5fa] shadow-md flex items-center justify-center relative overflow-hidden group">
            <div className="absolute inset-0 bg-white/10 opacity-40"></div>
            <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white relative z-10">
              <path d="M3 17L9 11L13 15L21 7" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M15 7H21V13" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          <div>
            <CardTitle className="text-base font-bold text-gray-900 dark:text-white">
              Quick Stats
            </CardTitle>
            <CardDescription className="text-xs">
              Overview of {isCombined ? "pothole & signboard" : isPothole ? "pothole" : "signboard"} detection results
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          {stats.map((stat, index) => {
            const Icon = stat.icon
            return (
              <div
                key={stat.label}
                className="flex flex-col items-center justify-center p-3 rounded-xl border border-gray-100 dark:border-gray-800 bg-gradient-to-br from-white to-gray-50 dark:from-gray-900 dark:to-gray-800 shadow-sm hover:shadow-md"
              >
                <div className={`${stat.bgColor} p-3 rounded-lg mb-2 transition-all shadow-inner`}>
                  <Icon className={`h-6 w-6 ${stat.color}`} />
                </div>
                <div className={`text-xl font-bold ${stat.color} mb-1`}>{stat.value}</div>
                <div className="text-[10px] text-muted-foreground text-center leading-tight font-medium uppercase tracking-wide">{stat.label}</div>
              </div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}

export default function VideoPlayerSection({ data, videoId, videoFile, detectionType, projectId }: VideoPlayerSectionProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const [currentFrame, setCurrentFrame] = useState(0)
  const [detectionsCount, setDetectionsCount] = useState(0)
  const [logs, setLogs] = useState<DetectionLog[]>([])
  const [showSummary, setShowSummary] = useState(false)
  const [hasPlayedOnce, setHasPlayedOnce] = useState(false)
  const [videoError, setVideoError] = useState<string | null>(null)
  const [lastDetectedLat, setLastDetectedLat] = useState<number | null>(null)
  const [lastDetectedLng, setLastDetectedLng] = useState<number | null>(null)
  const [currentFrameCounts, setCurrentFrameCounts] = useState<Record<string, number>>({
    defected_sign_board: 0,
    pothole: 0,
    road_crack: 0,
    damaged_road_marking: 0,
    good_sign_board: 0
  })
  const frameDetectionMap = useRef<Map<number, any[]>>(new Map())
  const lastProcessedFrame = useRef(-1)
  const loggedFrames = useRef<Set<number>>(new Set())
  const cumulativeCountsMap = useRef<Map<number, Record<string, number>>>(new Map())
  const sortedFrameIndices = useRef<number[]>([])
  const MAX_LOGS = 50

  const isCombined = detectionType === "pot-sign-detection"
  const isPothole = detectionType === "pothole-detection" || isCombined
  const isSignboard = detectionType === "sign-board-detection" || isCombined

  // Create GPS coordinate map from signboard_list or pothole_list
  const gpsMap = useRef<Map<number, { lat: number; lng: number }>>(new Map())

  // Build GPS map from all available detection lists
  useEffect(() => {
    const map = new Map()

    const addItemsToMap = (list?: any[]) => {
      if (!list || !Array.isArray(list)) return
      list.forEach(item => {
        const id = (item as any).pothole_id ?? (item as any).signboard_id ?? (item as any).detection_id
        if (item.lat !== undefined && item.lng !== undefined && id !== undefined) {
          map.set(id, { lat: item.lat, lng: item.lng })
        }
      })
    }

    addItemsToMap(data.pothole_list)
    addItemsToMap(data.signboard_list)
    addItemsToMap(data.defected_sign_board_list)
    addItemsToMap(data.road_crack_list)
    addItemsToMap(data.damaged_road_marking_list)
    addItemsToMap(data.good_sign_board_list)

    gpsMap.current = map
    console.log(`[VideoPlayer] GPS map built with ${map.size} entries mapping to IDs`)
  }, [data])

  // Helper function to format video time from frame number
  const formatVideoTime = useCallback((frame: number, fps: number): string => {
    const seconds = frame / fps
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    const secs = Math.floor(seconds % 60)

    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
    }
    return `${minutes}:${secs.toString().padStart(2, '0')}`
  }, [])

  // Function to seek video to a specific frame
  const seekToFrame = useCallback((frame: number) => {
    const video = videoRef.current
    if (!video) return

    // Calculate time from frame number
    const time = frame / data.video_info.fps

    // Set video currentTime (this will trigger seeked event)
    video.currentTime = time

    console.log(`[SeekToFrame] Jumping to frame ${frame} at ${time.toFixed(2)}s`)
  }, [data.video_info.fps])

  // Build optimized frame detection map
  useEffect(() => {
    const map = new Map()

    if (data.frames && Array.isArray(data.frames)) {
      console.log(`[VideoPlayer] Building frame map from ${data.frames.length} frames`)
      data.frames.forEach((frameData) => {
        const frameId = frameData.frame_id

        // Handle flat detections array format (used by pot-sign-detection API)
        const flatDetections = (frameData as any).detections
        if (flatDetections && Array.isArray(flatDetections)) {
          const tagged = flatDetections.map((d: any) => ({
            ...d,
            _detType: d.type === 'pothole' ? 'pothole' : 'signboard',
            pothole_id: d.type === 'pothole' ? d.detection_id : undefined,
            signboard_id: d.type !== 'pothole' ? d.detection_id : undefined,
          }))
          if (tagged.length > 0) {
            map.set(frameId, tagged)
          }
        } else {
          // Handle separate potholes/signboards arrays format
          let detections: any[] = []
          if (isPothole && frameData.potholes) {
            detections = [...detections, ...frameData.potholes.map((p: any) => ({ ...p, _detType: 'pothole' }))]
          }
          if (isSignboard && frameData.signboards) {
            detections = [...detections, ...frameData.signboards.map((s: any) => ({ ...s, _detType: 'signboard' }))]
          }
          if (detections.length > 0) {
            map.set(frameId, detections)
          }
        }
      })
      console.log(`[VideoPlayer] Frame map built: ${map.size} frames with detections`)
    }

    frameDetectionMap.current = map
    console.log(`[VideoPlayer] Frame map built: ${map.size} frames with detections`)
  }, [data, isPothole, isSignboard])

  // Build cumulative counts map (Sticky Counts)
  useEffect(() => {
    const map = new Map<number, Record<string, number>>()
    let lastCounts = {
      defected_sign_board: 0,
      pothole: 0,
      road_crack: 0,
      damaged_road_marking: 0,
      good_sign_board: 0
    }

    if (data.frames && Array.isArray(data.frames)) {
      // Sort frames by ID to ensure we process them in order
      const sortedFrames = [...data.frames].sort((a, b) => (a.frame_id || 0) - (b.frame_id || 0))
      const indices: number[] = []

      sortedFrames.forEach((frameData) => {
        const frameId = frameData.frame_id
        indices.push(frameId)
        const detections = (frameData as any).detections

        if (detections && detections.length > 0) {
          const det0 = detections[0]
          let frameCounts: Record<string, number>

          if (det0.count) {
            frameCounts = { ...det0.count }
          } else {
            // Manual count if missing
            frameCounts = {
              defected_sign_board: 0,
              pothole: 0,
              road_crack: 0,
              damaged_road_marking: 0,
              good_sign_board: 0
            }
            detections.forEach((d: any) => {
              const type = (d.type || '').split(' ')[0].toLowerCase() // Handle potential spaces
              if (frameCounts.hasOwnProperty(type)) {
                frameCounts[type]++
              } else if (type === 'pothole') {
                frameCounts.pothole++
              } else if (type.includes('defected')) {
                frameCounts.defected_sign_board++
              }
            })
          }

          // Carry over and update max (Sticky logic)
          lastCounts = {
            defected_sign_board: Math.max(lastCounts.defected_sign_board, frameCounts.defected_sign_board || 0),
            pothole: Math.max(lastCounts.pothole, frameCounts.pothole || 0),
            road_crack: Math.max(lastCounts.road_crack, frameCounts.road_crack || 0),
            damaged_road_marking: Math.max(lastCounts.damaged_road_marking, frameCounts.damaged_road_marking || 0),
            good_sign_board: Math.max(lastCounts.good_sign_board, frameCounts.good_sign_board || 0),
          }
        }

        map.set(frameId, { ...lastCounts })
      })
      sortedFrameIndices.current = indices
    }

    cumulativeCountsMap.current = map
    console.log(`[VideoPlayer] Sticky cumulative counts map built for ${map.size} frames`)
  }, [data.frames])

  // Helper to get sticky counts for any frame
  const getStickyCounts = useCallback((frame: number) => {
    // Find the largest frame index in our map that is <= current frame
    const indices = sortedFrameIndices.current
    let targetIndex = -1

    // Quick binary search for the latest frame with detection data
    let low = 0, high = indices.length - 1
    while (low <= high) {
      let mid = Math.floor((low + high) / 2)
      if (indices[mid] <= frame) {
        targetIndex = indices[mid]
        low = mid + 1
      } else {
        high = mid - 1
      }
    }

    if (targetIndex !== -1) {
      return cumulativeCountsMap.current.get(targetIndex) || {
        defected_sign_board: 0,
        pothole: 0,
        road_crack: 0,
        damaged_road_marking: 0,
        good_sign_board: 0
      }
    }

    return {
      defected_sign_board: 0,
      pothole: 0,
      road_crack: 0,
      damaged_road_marking: 0,
      good_sign_board: 0
    }
  }, [])

  // Function to draw bounding boxes on canvas
  const drawBoundingBoxes = useCallback((detections: any[]) => {
    const canvas = canvasRef.current
    const video = videoRef.current

    if (!canvas || !video) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height)

    if (!detections || detections.length === 0) return

    // Calculate scale between video natural size and displayed size
    const scaleX = canvas.width / data.video_info.width
    const scaleY = canvas.height / data.video_info.height

    detections.forEach((detection) => {
      const bbox = detection.bbox
      if (!bbox) return

      // Scale coordinates to match displayed video size
      const x1 = bbox.x1 * scaleX
      const y1 = bbox.y1 * scaleY
      const x2 = bbox.x2 * scaleX
      const y2 = bbox.y2 * scaleY
      const width = x2 - x1
      const height = y2 - y1

      // Map individual detection types to colors
      const type = (detection.type || detection._detType || '').toLowerCase()
      const detectionColors: Record<string, string> = {
        'pothole': '#ef4444',
        'defected_sign_board': '#3b82f6',
        'road_crack': '#f59e0b',
        'damaged_road_marking': '#6366f1',
        'good_sign_board': '#10b981',
        'signboard': '#3b82f6' // fallback
      }

      const boxColor = detectionColors[type] || '#3b82f6'
      const textBgColor = boxColor + 'e6' // Adding alpha

      // Draw bounding box
      ctx.strokeStyle = boxColor
      ctx.lineWidth = 3
      ctx.strokeRect(x1, y1, width, height)

      // Draw semi-transparent fill
      ctx.fillStyle = type === 'pothole' ? 'rgba(239, 68, 68, 0.15)' : 'rgba(59, 130, 246, 0.15)'
      ctx.fillRect(x1, y1, width, height)

      // Prepare label text
      const id = detection.pothole_id ?? detection.signboard_id ?? detection.detection_id
      const confidence = (detection.confidence * 100).toFixed(1)
      let labelText = type === 'pothole'
        ? `Pothole #${id}`
        : `${(detection.type || 'Sign').replace(/_/g, ' ')} #${id}`
      labelText += ` ${confidence}%`

      // Draw label background
      ctx.font = 'bold 14px system-ui'
      const textMetrics = ctx.measureText(labelText)
      const textWidth = textMetrics.width + 16
      const textHeight = 26

      ctx.fillStyle = textBgColor
      ctx.fillRect(x1, y1 - textHeight - 2, textWidth, textHeight)

      // Draw label text
      ctx.fillStyle = '#ffffff'
      ctx.fillText(labelText, x1 + 8, y1 - 8)
    })
  }, [data.video_info.width, data.video_info.height])

  // Resize canvas to match video display size
  const resizeCanvas = useCallback(() => {
    const video = videoRef.current
    const canvas = canvasRef.current
    const container = containerRef.current

    if (!video || !canvas || !container) return

    // Get the displayed size of the video
    const rect = video.getBoundingClientRect()
    canvas.width = rect.width
    canvas.height = rect.height

    // Redraw current frame's detections
    const frame = Math.round(video.currentTime * data.video_info.fps)
    const detections = frameDetectionMap.current.get(frame)
    if (detections) {
      drawBoundingBoxes(detections)
    }
  }, [data.video_info.fps, drawBoundingBoxes])

  // Handle window resize
  useEffect(() => {
    window.addEventListener('resize', resizeCanvas)
    return () => window.removeEventListener('resize', resizeCanvas)
  }, [resizeCanvas])

  // Initialize canvas size when video loads
  useEffect(() => {
    const video = videoRef.current
    if (!video) return

    const handleLoadedMetadata = () => {
      resizeCanvas()
    }

    video.addEventListener('loadedmetadata', handleLoadedMetadata)
    return () => video.removeEventListener('loadedmetadata', handleLoadedMetadata)
  }, [resizeCanvas])

  // Load video from uploaded file or from server
  useEffect(() => {
    const video = videoRef.current
    if (!video) return

    let videoUrl: string

    if (videoFile) {
      // Load from local file (upload page)
      videoUrl = URL.createObjectURL(videoFile)
      console.log(`[VideoPlayer] Loading video from uploaded file`)
    } else if (videoId) {
      // Load from server (results page)
      videoUrl = `${API_URL}/video/${videoId}`
      console.log(`[VideoPlayer] Loading video from server: ${videoUrl}`)
    } else {
      return
    }

    video.src = videoUrl

    // Handle video load errors
    const handleError = () => {
      console.error("[VideoPlayer] Failed to load video")
      setVideoError("Failed to load video. Please try refreshing the page.")
    }

    const handleLoaded = () => {
      console.log("[VideoPlayer] Video loaded successfully")
      setVideoError(null)
      resizeCanvas()
    }

    video.addEventListener("error", handleError)
    video.addEventListener("loadeddata", handleLoaded)

    return () => {
      video.removeEventListener("error", handleError)
      video.removeEventListener("loadeddata", handleLoaded)
      // Revoke object URL only if it was created from a file
      if (videoFile) {
        URL.revokeObjectURL(videoUrl)
      }
    }
  }, [videoFile, videoId, resizeCanvas])

  // Add detection log with deduplication and size limit
  const addDetectionLog = useCallback((frame: number, detections: any[]) => {
    if (loggedFrames.current.has(frame)) return

    loggedFrames.current.add(frame)

    // Update last detected GPS coordinates if available
    if (detections.length > 0) {
      const det0 = detections[0]
      const isDetPothole = det0._detType === 'pothole' || det0.type === 'pothole' || (det0.pothole_id !== undefined && !det0.signboard_id)
      const detectionId = det0.pothole_id ?? det0.signboard_id ?? det0.detection_id
      const gpsCoords = gpsMap.current.get(detectionId)

      if (gpsCoords) {
        setLastDetectedLat(gpsCoords.lat)
        setLastDetectedLng(gpsCoords.lng)
      }
    }

    setLogs((prev) => {
      const newLog: DetectionLog = {
        frame,
        detections: detections.map((det) => {
          const isDetPothole = det._detType === 'pothole' || det.type === 'pothole' || (det.pothole_id !== undefined && !det.signboard_id)
          const detectionId = det.pothole_id ?? det.signboard_id ?? det.detection_id
          const gpsCoords = gpsMap.current.get(detectionId)

          return {
            id: detectionId,
            type: isDetPothole ? 'pothole' : (det.type || 'signboard'),
            bbox: det.bbox,
            confidence: det.confidence,
            latitude: gpsCoords?.lat,
            longitude: gpsCoords?.lng,
          }
        }),
        videoTime: formatVideoTime(frame, data.video_info.fps),
      }

      const updated = [newLog, ...prev].slice(0, MAX_LOGS)
      return updated
    })
  }, [isPothole, isSignboard, formatVideoTime, data.video_info.fps])

  // Track current frame and log detections
  const updateFrameInfo = useCallback(() => {
    const video = videoRef.current
    if (!video) return

    const frame = Math.round(video.currentTime * data.video_info.fps)

    if (!video.paused && !video.ended && frame !== lastProcessedFrame.current) {
      lastProcessedFrame.current = frame
      setCurrentFrame(frame)

      const detections = frameDetectionMap.current.get(frame)
      setDetectionsCount(detections?.length || 0)

      // Draw bounding boxes for current frame
      drawBoundingBoxes(detections || [])

      // Update counts using sticky logic
      setCurrentFrameCounts(getStickyCounts(frame))

      if (detections && detections.length > 0) {
        addDetectionLog(frame, detections)
      }
    }
  }, [data.video_info.fps, addDetectionLog, drawBoundingBoxes])

  // Video playback monitoring
  useEffect(() => {
    const video = videoRef.current
    if (!video) return

    let animationId: number

    const animate = () => {
      updateFrameInfo()
      animationId = requestAnimationFrame(animate)
    }

    animationId = requestAnimationFrame(animate)

    return () => {
      cancelAnimationFrame(animationId)
    }
  }, [updateFrameInfo])

  // Handle video end - show summary
  useEffect(() => {
    const video = videoRef.current
    if (!video) return

    const handleEnded = () => {
      if (!hasPlayedOnce) {
        setHasPlayedOnce(true)
        setShowSummary(true)
      }
    }

    video.addEventListener("ended", handleEnded)

    return () => {
      video.removeEventListener("ended", handleEnded)
    }
  }, [hasPlayedOnce])

  // Handle seeking and time updates
  useEffect(() => {
    const video = videoRef.current
    if (!video) return

    const handleTimeUpdate = () => {
      const frame = Math.round(video.currentTime * data.video_info.fps)
      setCurrentFrame(frame)

      const detections = frameDetectionMap.current.get(frame)
      setDetectionsCount(detections?.length || 0)

      // Draw bounding boxes for current frame
      drawBoundingBoxes(detections || [])
    }

    const handleSeeked = () => {
      // Clear logged frames to allow re-logging if seeking back
      loggedFrames.current.clear()

      // Immediately update frame info
      const frame = Math.round(video.currentTime * data.video_info.fps)
      setCurrentFrame(frame)

      const detections = frameDetectionMap.current.get(frame)
      setDetectionsCount(detections?.length || 0)

      // Update sticky counts immediately on seek
      setCurrentFrameCounts(getStickyCounts(frame))

      if (detections && detections.length > 0) {
        const det0 = detections[0]
        const isDetPothole = det0._detType === 'pothole' || det0.type === 'pothole' || (det0.pothole_id !== undefined && !det0.signboard_id)
        const detectionId = det0.pothole_id ?? det0.signboard_id ?? det0.detection_id
        const gpsCoords = gpsMap.current.get(detectionId)

        if (gpsCoords) {
          setLastDetectedLat(gpsCoords.lat)
          setLastDetectedLng(gpsCoords.lng)
          console.log(`[Seek] Updated GPS: ${gpsCoords.lat}, ${gpsCoords.lng} at frame ${frame}`)
        }

        // Add detection log for the seeked frame
        addDetectionLog(frame, detections)
      }

      // Draw bounding boxes for seeked frame
      drawBoundingBoxes(detections || [])
    }

    const handlePlay = () => {
      if (video.currentTime < 0.1) {
        setLogs([])
        loggedFrames.current.clear()
        lastProcessedFrame.current = -1
      }
    }

    video.addEventListener("timeupdate", handleTimeUpdate)
    video.addEventListener("seeked", handleSeeked)
    video.addEventListener("play", handlePlay)

    return () => {
      video.removeEventListener("timeupdate", handleTimeUpdate)
      video.removeEventListener("seeked", handleSeeked)
      video.removeEventListener("play", handlePlay)
    }
  }, [data.video_info.fps, drawBoundingBoxes, isPothole, addDetectionLog])

  return (
    <div className="space-y-6">
      <Card className="bg-white dark:bg-gray-950 border border-gray-100 dark:border-gray-800 shadow-xl shadow-blue-500/5 rounded-xl overflow-hidden">
        <CardHeader className="bg-white dark:bg-gray-900 border-b border-gray-100 dark:border-gray-800">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-gradient-to-br from-[#9bddeb] to-[#60a5fa] shadow-lg shadow-[#60a5fa]/20">
              <Film className="h-5 w-5 text-white" />
            </div>
            <div>
              <CardTitle className="text-lg font-bold text-gray-900 dark:text-white">
                Video Playback with Detection
              </CardTitle>
              <CardDescription>
                Watch the video with real-time {isCombined ? "pothole & signboard" : isPothole ? "pothole" : "signboard"} detection overlays
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Video Player with Canvas Overlay */}
            <div className="lg:col-span-2 space-y-4">
              {videoError && (
                <div className="bg-destructive/10 text-destructive p-4 rounded-lg mb-4">
                  {videoError}
                </div>
              )}

              <div
                ref={containerRef}
                className="relative bg-black rounded-lg overflow-hidden"
                style={{
                  aspectRatio: `${data.video_info.width} / ${data.video_info.height}`,
                }}
              >
                <video
                  ref={videoRef}
                  controls
                  className="w-full h-full"
                >
                  Your browser does not support the video tag.
                </video>

                {/* Canvas overlay for bounding boxes */}
                <canvas
                  ref={canvasRef}
                  className="absolute top-0 left-0 pointer-events-none"
                  style={{ width: '100%', height: '100%' }}
                />
              </div>

              <div className="flex items-center gap-x-4 gap-y-2 text-[10px] font-medium overflow-hidden">
                {/* Detection Counts - Single line Flexbox */}
                <div className="flex items-center gap-3 shrink-0">
                  <div className="flex items-center gap-1.5">
                    <span className="font-bold text-red-500 uppercase tracking-tight">Pothole:</span>
                    <Badge variant="secondary" className="text-[10px] h-5 px-1 bg-red-50 text-red-700 dark:bg-red-950/30 dark:text-red-400 border-none">{currentFrameCounts.pothole}</Badge>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="font-bold text-blue-500 uppercase tracking-tight whitespace-nowrap">Defect Sign Board:</span>
                    <Badge variant="secondary" className="text-[10px] h-5 px-1 bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300 border-none">{currentFrameCounts.defected_sign_board}</Badge>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="font-bold text-indigo-500 uppercase tracking-tight whitespace-nowrap">Damage Road Mark:</span>
                    <Badge variant="secondary" className="text-[10px] h-5 px-1 bg-indigo-50 text-indigo-700 dark:bg-indigo-950/30 dark:text-indigo-400 border-none">{currentFrameCounts.damaged_road_marking}</Badge>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="font-bold text-yellow-500 uppercase tracking-tight whitespace-nowrap">RoadCrack:</span>
                    <Badge variant="secondary" className="text-[10px] h-5 px-1 bg-orange-50 text-orange-700 dark:bg-orange-950/30 dark:text-orange-400 border-none">{currentFrameCounts.road_crack}</Badge>
                  </div>
                  {/* <div className="flex items-center gap-1.5">
                    <span className="font-bold text-emerald-500 uppercase tracking-tight whitespace-nowrap">Good Sign Board:</span>
                    <Badge variant="secondary" className="text-[10px] h-5 px-1 bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400 border-none">{currentFrameCounts.good_sign_board}</Badge>
                  </div> */}
                </div>

                <div className="h-4 w-px bg-gray-200 dark:bg-gray-800 shrink-0" />

                <div className="flex items-center gap-4 shrink-0">
                  <div className="flex items-center gap-1.5">
                    <span className="text-muted-foreground whitespace-nowrap">FRAME:</span>
                    <Badge variant="secondary" className="text-[10px] h-5 px-1.5 py-0">{currentFrame}</Badge>
                  </div>
                  {lastDetectedLat !== null && lastDetectedLng !== null && (
                    <>
                      <div className="flex items-center gap-1.5">
                        <span className="text-muted-foreground uppercase font-semibold">LAT:</span>
                        <Badge variant="outline" className="font-mono text-[10px] h-5 px-1.5 py-0 border-blue-200 dark:border-blue-800">
                          {lastDetectedLat}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-muted-foreground uppercase font-semibold">LNG:</span>
                        <Badge variant="outline" className="font-mono text-[10px] h-5 px-1.5 py-0 border-blue-200 dark:border-blue-800">
                          {lastDetectedLng}
                        </Badge>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Detection Logs */}
            <div className="space-y-4">
              <div>
                <h4 className="text-sm font-semibold mb-2">Detection Logs</h4>
                <p className="text-xs text-muted-foreground mb-3">
                  Real-time frame-by-frame {isCombined ? "pothole & signboard" : isPothole ? "pothole" : "signboard"} tracking (last {MAX_LOGS})
                </p>
              </div>
              <ScrollArea className="h-[400px] rounded-md border bg-muted/30 p-4">
                <div className="space-y-2">
                  {logs.length === 0 ? (
                    <p className="text-sm text-muted-foreground text-center py-8">
                      Play the video to see detection logs
                    </p>
                  ) : (
                    logs.map((log, index) => (
                      <div
                        key={`${log.frame}-${index}`}
                        onClick={() => seekToFrame(log.frame)}
                        className="text-xs p-3 bg-white dark:bg-gray-900 rounded-md cursor-pointer hover:bg-accent/50 transition-colors shadow-sm"

                      >
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-semibold text-foreground">Frame: {log.frame}</span>
                          <span className="text-muted-foreground text-[10px]">{log.videoTime}</span>
                        </div>

                        {log.detections.length === 0 ? (
                          <div className="text-muted-foreground">No detections</div>
                        ) : (
                          <div className="space-y-2">
                            {log.detections.map((det, idx) => (
                              <div key={idx} className="space-y-1">
                                <div className="font-medium text-foreground">
                                  {det.type === 'pothole' ? (
                                    <>Pothole ID: {det.id}</>
                                  ) : (
                                    <>{det.type || 'Signboard'} ID: {det.id}</>
                                  )}
                                  {" "}| Confidence: {(det.confidence * 100).toFixed(1)}%
                                </div>
                                <div className="text-muted-foreground font-mono text-[10px]">
                                  Coordinates: ({Math.round(det.bbox.x1)}, {Math.round(det.bbox.y1)}) → ({Math.round(det.bbox.x2)}, {Math.round(det.bbox.y2)})
                                </div>
                                {det.latitude !== undefined && det.longitude !== undefined ? (
                                  <div className="text-muted-foreground font-mono text-[10px]">
                                    GPS: {det.latitude}, {det.longitude}
                                  </div>
                                ) : (
                                  <div className="text-destructive/70 font-mono text-[10px]">
                                    GPS: Data Unavail.
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    ))
                  )}
                </div>
              </ScrollArea>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Summary Sections - Show after first complete playback and persist */}
      {showSummary && (
        <div className="space-y-4">
          <SummarySection data={data} show={showSummary} detectionType={detectionType} />
          <DetailedSummarySection projectId={projectId || ""} videoId={videoId} show={showSummary} detectionType={detectionType} />
        </div>
      )}
    </div>
  )
}