"use client"

import { useEffect, useRef, useState, useCallback } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Badge } from "@/components/ui/badge"
import { Target, AlertTriangle, Film, Activity, Gauge, Monitor, SignpostBig } from "lucide-react"
import type { DetectionData, DetectionType } from "@/app/page"

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000/api/v1"

type VideoPlayerSectionProps = {
  data: DetectionData
  videoId: string
  detectionType: DetectionType
}

type DetectionLog = {
  frame: number
  detections: Array<{
    id: number
    type?: string // For signboards
    bbox: { x1: number; y1: number; x2: number; y2: number }
    confidence: number
  }>
  timestamp: string
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
      color: "text-cyan-500",
      bgColor: "bg-cyan-50 dark:bg-cyan-950/30",
    },
  ]

  return (
    <Card className="animate-in fade-in slide-in-from-bottom duration-500">
      <CardHeader>
        <CardTitle>Detection Summary</CardTitle>
        <CardDescription>
          Overview of {isPothole ? "pothole" : "signboard"} detection results
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {stats.map((stat, index) => {
            const Icon = stat.icon
            return (
              <div
                key={stat.label}
                className="flex flex-col items-center justify-center p-4 rounded-lg transition-all hover:scale-105 animate-in fade-in slide-in-from-bottom duration-500"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className={`${stat.bgColor} p-3 rounded-full mb-3 transition-all`}>
                  <Icon className={`h-5 w-5 ${stat.color}`} />
                </div>
                <div className={`text-3xl font-bold ${stat.color} mb-1`}>{stat.value}</div>
                <div className="text-xs text-muted-foreground text-center">{stat.label}</div>
              </div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}

export default function VideoPlayerSection({ data, videoId, detectionType }: VideoPlayerSectionProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const [currentFrame, setCurrentFrame] = useState(0)
  const [detectionsCount, setDetectionsCount] = useState(0)
  const [logs, setLogs] = useState<DetectionLog[]>([])
  const [showSummary, setShowSummary] = useState(false)
  const [hasPlayedOnce, setHasPlayedOnce] = useState(false)
  const [videoError, setVideoError] = useState<string | null>(null)
  const frameDetectionMap = useRef<Map<number, any[]>>(new Map())
  const lastProcessedFrame = useRef(-1)
  const loggedFrames = useRef<Set<number>>(new Set())
  const MAX_LOGS = 50

  const isPothole = detectionType === "pothole-detection"
  const isSignboard = detectionType === "sign-board-detection"

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

  // Load processed video from backend
  useEffect(() => {
    if (videoRef.current && videoId) {
      const videoUrl = `${API_URL}/video/${videoId}`
      console.log(`[VideoPlayer] Loading processed video from: ${videoUrl}`)
      
      videoRef.current.src = videoUrl
      
      // Handle video load errors
      const handleError = () => {
        console.error("[VideoPlayer] Failed to load processed video")
        setVideoError("Failed to load processed video. Please try refreshing the page.")
      }
      
      const handleLoaded = () => {
        console.log("[VideoPlayer] Processed video loaded successfully")
        setVideoError(null)
      }

      videoRef.current.addEventListener("error", handleError)
      videoRef.current.addEventListener("loadeddata", handleLoaded)

      return () => {
        if (videoRef.current) {
          videoRef.current.removeEventListener("error", handleError)
          videoRef.current.removeEventListener("loadeddata", handleLoaded)
        }
      }
    }
  }, [videoId])

  // Add detection log with deduplication and size limit
  const addDetectionLog = useCallback((frame: number, detections: any[]) => {
    if (loggedFrames.current.has(frame)) return
    
    loggedFrames.current.add(frame)
    
    setLogs((prev) => {
      const newLog: DetectionLog = {
        frame,
        detections: detections.map((det) => ({
          id: isPothole ? det.pothole_id : det.signboard_id,
          type: isSignboard ? det.type : undefined,
          bbox: det.bbox,
          confidence: det.confidence,
        })),
        timestamp: new Date().toLocaleTimeString(),
      }
      
      const updated = [newLog, ...prev].slice(0, MAX_LOGS)
      return updated
    })
  }, [isPothole, isSignboard])

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
      
      if (detections && detections.length > 0) {
        addDetectionLog(frame, detections)
      }
    }
  }, [data.video_info.fps, addDetectionLog])

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
    }

    const handleSeeked = () => {
      loggedFrames.current.clear()
      handleTimeUpdate()
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
  }, [data.video_info.fps])

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Video Playback with Detection</CardTitle>
          <CardDescription>
            Watch the processed video with {isPothole ? "pothole" : "signboard"} detections already drawn
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Video Player */}
            <div className="lg:col-span-2 space-y-4">
              {videoError && (
                <div className="bg-destructive/10 text-destructive p-4 rounded-lg mb-4">
                  {videoError}
                </div>
              )}
              
              <div className="relative bg-black rounded-lg overflow-hidden">
                <video
                  ref={videoRef}
                  controls
                  className="w-full h-auto"
                  style={{
                    aspectRatio: `${data.video_info.width} / ${data.video_info.height}`,
                  }}
                >
                  Your browser does not support the video tag.
                </video>
              </div>

              {/* Video Info */}
              <div className="flex flex-wrap gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <span className="text-muted-foreground">Current Frame:</span>
                  <Badge variant="secondary">{currentFrame}</Badge>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-muted-foreground">Detections:</span>
                  <Badge variant={detectionsCount > 0 ? (isPothole ? "destructive" : "default") : "secondary"}>
                    {detectionsCount}
                  </Badge>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-muted-foreground">Resolution:</span>
                  <Badge variant="outline">
                    {data.video_info.width}×{data.video_info.height}
                  </Badge>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-muted-foreground">FPS:</span>
                  <Badge variant="outline">{data.video_info.fps.toFixed(1)}</Badge>
                </div>
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
                        className={`text-xs p-3 bg-card rounded-md border-l-2 ${
                          isPothole ? "border-red-500" : "border-blue-500"
                        }`}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-semibold text-foreground">Frame: {log.frame}</span>
                          <span className="text-muted-foreground text-[10px]">{log.timestamp}</span>
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

      {/* Summary Section - Shows after first complete playback and persists */}
      <SummarySection data={data} show={showSummary} detectionType={detectionType} />
    </div>
  )
}