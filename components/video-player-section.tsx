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

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000/api/v1"

type DetectionType = "pothole-detection" | "sign-board-detection"

type DetectionData = {
  video_id: string
  detection_type?: string
  output_video_path?: string
  video_info: {
    fps: number
    width: number
    height: number
    total_frames: number
  }
  summary: {
    unique_potholes?: number
    unique_signboards?: number
    total_detections: number
    total_frames: number
    detection_rate: number
  }
  pothole_list?: Array<{
    pothole_id: number
    first_detected_frame: number
    first_detected_time: number
    confidence: number
    lat?: number
    lng?: number
  }>
  signboard_list?: Array<{
    signboard_id: number
    type: string
    first_detected_frame: number
    first_detected_time: number
    confidence: number
    lat?: number
    lng?: number
  }>
  frames: Array<{
    frame_id: number
    potholes?: Array<{
      pothole_id: number
      bbox: {
        x1: number
        y1: number
        x2: number
        y2: number
      }
      confidence: number
    }>
    signboards?: Array<{
      signboard_id: number
      type: string
      bbox: {
        x1: number
        y1: number
        x2: number
        y2: number
      }
      confidence: number
    }>
  }>
}

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

  const isPothole = detectionType === "pothole-detection"

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
    <div className="space-y-4">
      {/* Location-based Summary */}
      <Card className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm border-0 shadow-lg shadow-gray-200/50 dark:shadow-gray-900/50 rounded-xl overflow-hidden">
        <CardHeader className="pb-3 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-gradient-to-br from-blue-400 to-indigo-500 shadow-md shadow-blue-500/30">
                <MapIcon className="h-4 w-4 text-white" />
              </div>
              <div>
                <CardTitle className="text-base font-bold">
                  <span className="bg-gradient-to-r from-blue-600 via-indigo-500 to-blue-600 dark:from-blue-400 dark:via-indigo-400 dark:to-blue-400 bg-clip-text text-transparent">
                    Detection Locations
                  </span>
                </CardTitle>
                <CardDescription className="text-xs">
                  {isPothole ? "Potholes" : "Signboards"} detected across project locations
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
        <CardContent>
          <div className="space-y-3">
            {/* Project Info */}
            <div className="text-xs space-y-1 pb-2 border-b">
              <div><span className="text-muted-foreground">Project:</span> <span className="font-medium">{summaryData.project.name}</span></div>
              {summaryData.project.corridor_name && (
                <div><span className="text-muted-foreground">Corridor:</span> {summaryData.project.corridor_name}</div>
              )}
            </div>

            {/* Packages and Locations */}
            {Object.entries(summaryData.packages).map(([packageName, packageData]) => (
              <div key={packageData.package_id} className="space-y-2">
                <div className="text-xs font-medium">{packageName}</div>
                <div className="pl-3 space-y-2">
                  {Object.entries(packageData.locations).map(([locationName, locationData]) => (
                    <div key={locationData.location_id} className="text-xs p-2 rounded bg-muted/30">
                      <div className="font-medium mb-1">{locationName}</div>
                      <div className="text-[10px] text-muted-foreground">
                        {locationData.detection_count} {isPothole ? "pothole" : "signboard"}{locationData.detection_count !== 1 ? "s" : ""} detected
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* All Detections List */}
      <Card className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm border-0 shadow-lg shadow-gray-200/50 dark:shadow-gray-900/50 rounded-xl overflow-hidden">
        <CardHeader className="pb-3 bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-950/30 dark:to-purple-950/30">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-gradient-to-br from-indigo-400 to-purple-500 shadow-md shadow-indigo-500/30">
              <Target className="h-4 w-4 text-white" />
            </div>
            <div>
              <CardTitle className="text-base font-bold">
                <span className="bg-gradient-to-r from-indigo-600 via-purple-500 to-indigo-600 dark:from-indigo-400 dark:via-purple-400 dark:to-indigo-400 bg-clip-text text-transparent">
                  All Detections
                </span>
              </CardTitle>
              <CardDescription className="text-xs">
                Complete list of {isPothole ? "potholes" : "signboards"} with GPS coordinates
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[300px] rounded-md border bg-muted/30 p-3">
            <div className="space-y-2">
              {allDetections.map(({ detection, locationName, packageName }, idx) => (
                <div
                  key={`${detection.id}-${idx}`}
                  className="text-xs p-2 bg-card rounded border-l-2 border-blue-500"
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-semibold">
                      {isPothole ? "Pothole" : detection.class.replace(/_/g, " ")} #{detection.id}
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

  const isPothole = detectionType === "pothole-detection"
  const isSignboard = detectionType === "sign-board-detection"

  const stats = [
    {
      label: isPothole ? "Unique Potholes" : "Unique Signboards",
      value: (isPothole ? data.summary.unique_potholes : data.summary.unique_signboards) || 0,
      icon: isPothole ? AlertTriangle : SignpostBig,
      color: isPothole ? "text-red-500" : "text-blue-500",
      bgColor: isPothole ? "bg-red-50 dark:bg-red-950/30" : "bg-blue-50 dark:bg-blue-950/30",
    },
    {
      label: "Total Detections",
      value: data.summary.total_detections || 0,
      icon: Target,
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
  ]

  return (
    <Card className="animate-in fade-in slide-in-from-bottom duration-500 bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm border-0 shadow-lg shadow-gray-200/50 dark:shadow-gray-900/50 rounded-xl overflow-hidden">
      <CardHeader className="pb-3 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-gradient-to-br from-blue-400 to-indigo-500 shadow-md shadow-blue-500/30">
            <Activity className="h-4 w-4 text-white" />
          </div>
          <div>
            <CardTitle className="text-base font-bold">
              <span className="bg-gradient-to-r from-blue-600 via-indigo-500 to-blue-600 dark:from-blue-400 dark:via-indigo-400 dark:to-blue-400 bg-clip-text text-transparent">
                Quick Stats
              </span>
            </CardTitle>
            <CardDescription className="text-xs">
              Overview of {isPothole ? "pothole" : "signboard"} detection results
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
          {stats.map((stat, index) => {
            const Icon = stat.icon
            return (
              <div
                key={stat.label}
                className="flex flex-col items-center justify-center p-3 rounded-xl transition-all hover:scale-105 animate-in fade-in slide-in-from-bottom duration-500 border border-gray-100 dark:border-gray-800 bg-gradient-to-br from-white to-gray-50 dark:from-gray-900 dark:to-gray-800 shadow-sm hover:shadow-md"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className={`${stat.bgColor} p-2 rounded-lg mb-2 transition-all shadow-inner`}>
                  <Icon className={`h-4 w-4 ${stat.color}`} />
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
  const frameDetectionMap = useRef<Map<number, any[]>>(new Map())
  const lastProcessedFrame = useRef(-1)
  const loggedFrames = useRef<Set<number>>(new Set())
  const MAX_LOGS = 50

  const isPothole = detectionType === "pothole-detection"
  const isSignboard = detectionType === "sign-board-detection"

  // Create GPS coordinate map from signboard_list or pothole_list
  const gpsMap = useRef<Map<number, { lat: number; lng: number }>>(new Map())

  // Build GPS map from signboard_list or pothole_list
  useEffect(() => {
    const map = new Map()

    if (isPothole && data.pothole_list) {
      data.pothole_list.forEach(item => {
        if (item.lat !== undefined && item.lng !== undefined) {
          map.set(item.pothole_id, { lat: item.lat, lng: item.lng })
        }
      })
    } else if (isSignboard && data.signboard_list) {
      data.signboard_list.forEach(item => {
        if (item.lat !== undefined && item.lng !== undefined) {
          map.set(item.signboard_id, { lat: item.lat, lng: item.lng })
        }
      })
    }

    gpsMap.current = map
    console.log(`[VideoPlayer] GPS map built with ${map.size} entries`)
  }, [data, isPothole, isSignboard])

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

        // Handle both pothole and signboard detections
        const detections = isPothole ? (frameData.potholes || []) : (frameData.signboards || [])

        if (detections.length > 0) {
          map.set(frameId, detections)
        }
      })
      console.log(`[VideoPlayer] Frame map built: ${map.size} frames with detections`)
    }

    frameDetectionMap.current = map
  }, [data, isPothole])

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

      // Set colors based on detection type
      const boxColor = isPothole ? '#ef4444' : '#3b82f6' // red for potholes, blue for signboards
      const textBgColor = isPothole ? 'rgba(239, 68, 68, 0.9)' : 'rgba(59, 130, 246, 0.9)'

      // Draw bounding box
      ctx.strokeStyle = boxColor
      ctx.lineWidth = 3
      ctx.strokeRect(x1, y1, width, height)

      // Draw semi-transparent fill
      ctx.fillStyle = isPothole ? 'rgba(239, 68, 68, 0.15)' : 'rgba(59, 130, 246, 0.15)'
      ctx.fillRect(x1, y1, width, height)

      // Prepare label text
      const id = isPothole ? detection.pothole_id : detection.signboard_id
      const confidence = (detection.confidence * 100).toFixed(1)
      let labelText = isPothole
        ? `Pothole #${id}`
        : `${detection.type || 'Sign'} #${id}`
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
  }, [data.video_info.width, data.video_info.height, isPothole])

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
      const detectionId = isPothole ? detections[0].pothole_id : detections[0].signboard_id
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
          const detectionId = isPothole ? det.pothole_id : det.signboard_id
          const gpsCoords = gpsMap.current.get(detectionId)

          return {
            id: detectionId,
            type: isSignboard ? det.type : undefined,
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

      // Update GPS coordinates immediately on seek
      if (detections && detections.length > 0) {
        const detectionId = isPothole ? detections[0].pothole_id : detections[0].signboard_id
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
      <Card className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm border-0 shadow-lg shadow-gray-200/50 dark:shadow-gray-900/50 rounded-xl overflow-hidden">
        <CardHeader className="bg-gradient-to-r from-gray-50 to-slate-100 dark:from-gray-900/50 dark:to-slate-900/50 border-b border-gray-100 dark:border-gray-800">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-gradient-to-br from-gray-900 to-slate-700 dark:from-white dark:to-gray-300 shadow-lg shadow-gray-500/20">
              <Film className="h-5 w-5 text-white dark:text-gray-900" />
            </div>
            <div>
              <CardTitle className="text-lg font-bold">
                <span className="bg-gradient-to-r from-gray-900 via-slate-700 to-gray-900 dark:from-white dark:via-gray-300 dark:to-white bg-clip-text text-transparent">
                  Video Playback with Detection
                </span>
              </CardTitle>
              <CardDescription>
                Watch the video with real-time {isPothole ? "pothole" : "signboard"} detection overlays
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

              {/* Video Info */}
              <div className="flex flex-wrap gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <span className="text-muted-foreground">Current Frame:</span>
                  <Badge variant="secondary">{currentFrame}</Badge>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-muted-foreground">FPS:</span>
                  <Badge variant="outline">{data.video_info.fps.toFixed(1)}</Badge>
                </div>
                {lastDetectedLat !== null && lastDetectedLng !== null && (
                  <>
                    <div className="flex items-center gap-1">
                      <span className="text-muted-foreground text-xs">Lat:</span>
                      <Badge variant="outline" className="font-mono text-xs px-1.5 py-0">
                        {lastDetectedLat}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-1">
                      <span className="text-muted-foreground text-xs">Lng:</span>
                      <Badge variant="outline" className="font-mono text-xs px-1.5 py-0">
                        {lastDetectedLng}
                      </Badge>
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Detection Logs */}
            <div className="space-y-4">
              <div>
                <h4 className="text-sm font-semibold mb-2">Detection Logs</h4>
                <p className="text-xs text-muted-foreground mb-3">
                  Real-time frame-by-frame {isPothole ? "pothole" : "signboard"} tracking (last {MAX_LOGS})
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
                        className={`text-xs p-3 bg-card rounded-md border-l-2 cursor-pointer hover:bg-accent/50 transition-colors ${isPothole ? "border-red-500" : "border-blue-500"
                          }`}
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
                                  {isPothole ? (
                                    <>Pothole ID: {det.id}</>
                                  ) : (
                                    <>{det.type || 'Signboard'} ID: {det.id}</>
                                  )}
                                  {" "}| Confidence: {(det.confidence * 100).toFixed(1)}%
                                </div>
                                <div className="text-muted-foreground font-mono text-[10px]">
                                  Coordinates: ({Math.round(det.bbox.x1)}, {Math.round(det.bbox.y1)}) → ({Math.round(det.bbox.x2)}, {Math.round(det.bbox.y2)})
                                </div>
                                {det.latitude !== undefined && det.longitude !== undefined && (
                                  <div className="text-muted-foreground font-mono text-[10px]">
                                    GPS: {det.latitude}, {det.longitude}
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