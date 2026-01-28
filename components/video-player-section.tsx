// "use client"

// import { useEffect, useRef, useState } from "react"
// import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
// import { ScrollArea } from "@/components/ui/scroll-area"
// import { Badge } from "@/components/ui/badge"
// import type { DetectionData } from "@/app/page"

// type VideoPlayerSectionProps = {
//   data: DetectionData
//   videoFile: File
// }

// type DetectionLog = {
//   frame: number
//   detections: Array<{
//     pothole_id: number
//     bbox: { x1: number; y1: number; x2: number; y2: number }
//     confidence: number
//   }>
//   timestamp: string
// }

// export function VideoPlayerSection({ data, videoFile }: VideoPlayerSectionProps) {
//   const videoRef = useRef<HTMLVideoElement>(null)
//   const canvasRef = useRef<HTMLCanvasElement>(null)
//   const containerRef = useRef<HTMLDivElement>(null)
//   const [currentFrame, setCurrentFrame] = useState(0)
//   const [detectionsCount, setDetectionsCount] = useState(0)
//   const [logs, setLogs] = useState<DetectionLog[]>([])
//   const frameDetectionMap = useRef<Map<number, any[]>>(new Map())
//   const lastDrawnFrame = useRef(-1)

//   // Build frame detection map
//   useEffect(() => {
//     const map = new Map()

//     if (data.frames && Array.isArray(data.frames)) {
//       data.frames.forEach((frameData) => {
//         const frameId = frameData.frame_id
//         const potholes = frameData.potholes || []

//         if (potholes.length > 0) {
//           map.set(frameId, potholes)
//         }
//       })
//     }

//     frameDetectionMap.current = map
//   }, [data])

//   // Load video file
//   useEffect(() => {
//     if (videoRef.current && videoFile) {
//       videoRef.current.src = URL.createObjectURL(videoFile)
//     }
//   }, [videoFile])

//   useEffect(() => {
//     const video = videoRef.current
//     const canvas = canvasRef.current

//     if (!video || !canvas) return

//     const setupResolution = () => {
//       // Set canvas to exact backend resolution
//       canvas.width = data.video_info.width
//       canvas.height = data.video_info.height

//       // Set display size to match video element
//       const rect = video.getBoundingClientRect()
//       canvas.style.width = `${rect.width}px`
//       canvas.style.height = `${rect.height}px`
//     }

//     video.addEventListener("loadedmetadata", setupResolution)
//     window.addEventListener("resize", setupResolution)

//     return () => {
//       video.removeEventListener("loadedmetadata", setupResolution)
//       window.removeEventListener("resize", setupResolution)
//     }
//   }, [data.video_info.width, data.video_info.height])

//   // Draw detections on video
//   useEffect(() => {
//     const video = videoRef.current
//     const canvas = canvasRef.current

//     if (!video || !canvas) return

//     const drawDetections = () => {
//       const ctx = canvas.getContext("2d")
//       if (!ctx) return

//       const frame = Math.floor(video.currentTime * data.video_info.fps)
//       setCurrentFrame(frame)

//       // Clear canvas
//       ctx.clearRect(0, 0, canvas.width, canvas.height)

//       // Get detections for current frame
//       const detections = frameDetectionMap.current.get(frame)
//       setDetectionsCount(detections?.length || 0)

//       if (detections && detections.length > 0) {
//         if (frame !== lastDrawnFrame.current) {
//           lastDrawnFrame.current = frame

//           // Add detailed log with coordinates and confidence
//           setLogs((prev) => {
//             const newLog: DetectionLog = {
//               frame,
//               detections: detections.map((det) => ({
//                 pothole_id: det.pothole_id,
//                 bbox: det.bbox,
//                 confidence: det.confidence,
//               })),
//               timestamp: new Date().toLocaleTimeString(),
//             }
//             return [newLog, ...prev].slice(0, 100)
//           })
//         }

//         detections.forEach((det) => {
//           const { x1, y1, x2, y2 } = det.bbox
//           const width = x2 - x1
//           const height = y2 - y1

//           // Draw red bounding box
//           ctx.strokeStyle = "#ef4444"
//           ctx.lineWidth = 3
//           ctx.strokeRect(x1, y1, width, height)

//           // Draw semi-transparent fill
//           ctx.fillStyle = "rgba(239, 68, 68, 0.15)"
//           ctx.fillRect(x1, y1, width, height)

//           // Draw label background
//           const label = `Pothole #${det.pothole_id} (${(det.confidence * 100).toFixed(0)}%)`
//           ctx.font = "14px Inter, sans-serif"
//           const textWidth = ctx.measureText(label).width
//           ctx.fillStyle = "rgba(239, 68, 68, 0.9)"
//           ctx.fillRect(x1, y1 - 24, textWidth + 12, 24)

//           // Draw label text
//           ctx.fillStyle = "#ffffff"
//           ctx.fillText(label, x1 + 6, y1 - 8)
//         })
//       }

//       requestAnimationFrame(drawDetections)
//     }

//     const animationId = requestAnimationFrame(drawDetections)

//     return () => {
//       cancelAnimationFrame(animationId)
//     }
//   }, [data])

//   return (
//     <Card>
//       <CardHeader>
//         <CardTitle>Video Playback with Detection</CardTitle>
//         <CardDescription>Watch the analyzed video with real-time bounding box overlays</CardDescription>
//       </CardHeader>
//       <CardContent>
//         <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
//           {/* Video Player */}
//           <div className="lg:col-span-2 space-y-4">
//             <div ref={containerRef} className="relative bg-black rounded-lg overflow-hidden">
//               <video
//                 ref={videoRef}
//                 controls
//                 className="w-full h-auto"
//                 style={{
//                   aspectRatio: `${data.video_info.width} / ${data.video_info.height}`,
//                 }}
//               />
//               <canvas ref={canvasRef} className="absolute inset-0 pointer-events-none" />
//             </div>

//             {/* Video Info */}
//             <div className="flex flex-wrap gap-4 text-sm">
//               <div className="flex items-center gap-2">
//                 <span className="text-muted-foreground">Current Frame:</span>
//                 <Badge variant="secondary">{currentFrame}</Badge>
//               </div>
//               <div className="flex items-center gap-2">
//                 <span className="text-muted-foreground">Detections:</span>
//                 <Badge variant={detectionsCount > 0 ? "destructive" : "secondary"}>{detectionsCount}</Badge>
//               </div>
//               <div className="flex items-center gap-2">
//                 <span className="text-muted-foreground">Resolution:</span>
//                 <Badge variant="outline">
//                   {data.video_info.width}×{data.video_info.height}
//                 </Badge>
//               </div>
//             </div>
//           </div>

//           {/* Detection Logs */}
//           <div className="space-y-4">
//             <div>
//               <h4 className="text-sm font-semibold mb-2">Detection Logs</h4>
//               <p className="text-xs text-muted-foreground mb-3">Real-time frame-by-frame detection tracking</p>
//             </div>
//             <ScrollArea className="h-[400px] rounded-md border bg-muted/30 p-4">
//               <div className="space-y-2">
//                 {logs.length === 0 ? (
//                   <p className="text-sm text-muted-foreground text-center py-8">Play the video to see detection logs</p>
//                 ) : (
//                   logs.map((log, index) => (
//                     <div
//                       key={`${log.frame}-${index}`}
//                       className="text-xs p-3 bg-card rounded-md border-l-2 border-red-500 animate-in fade-in slide-in-from-top duration-300"
//                     >
//                       <div className="flex items-center justify-between mb-2">
//                         <span className="font-semibold text-foreground">Frame {log.frame}</span>
//                         <span className="text-muted-foreground">{log.timestamp}</span>
//                       </div>

//                       {log.detections.length === 0 ? (
//                         <div className="text-muted-foreground">No detections</div>
//                       ) : (
//                         <div className="space-y-2">
//                           <div className="text-red-500 font-medium mb-1">
//                             {log.detections.length} pothole{log.detections.length > 1 ? "s" : ""} detected
//                           </div>
//                           {log.detections.map((det, idx) => (
//                             <div key={idx} className="pl-2 border-l border-muted space-y-1">
//                               <div className="font-medium">
//                                 Pothole #{det.pothole_id} • {(det.confidence * 100).toFixed(1)}%
//                               </div>
//                               <div className="text-muted-foreground font-mono text-[10px]">
//                                 [{det.bbox.x1}, {det.bbox.y1}] → [{det.bbox.x2}, {det.bbox.y2}]
//                               </div>
//                             </div>
//                           ))}
//                         </div>
//                       )}
//                     </div>
//                   ))
//                 )}
//               </div>
//             </ScrollArea>
//           </div>
//         </div>
//       </CardContent>
//     </Card>
//   )
// }








// "use client"

// import { useEffect, useRef, useState, useCallback } from "react"
// import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
// import { ScrollArea } from "@/components/ui/scroll-area"
// import { Badge } from "@/components/ui/badge"

// type DetectionData = {
//   frames: Array<{
//     frame_id: number
//     potholes: Array<{
//       pothole_id: number
//       bbox: { x1: number; y1: number; x2: number; y2: number }
//       confidence: number
//     }>
//   }>
//   video_info: {
//     width: number
//     height: number
//     fps: number
//     total_frames: number
//   }
//   summary: {
//     unique_potholes: number
//     total_detections: number
//     total_frames: number
//     detection_rate: number
//   }
// }

// type VideoPlayerSectionProps = {
//   data: DetectionData
//   videoFile: File
// }

// type DetectionLog = {
//   frame: number
//   detections: Array<{
//     pothole_id: number
//     bbox: { x1: number; y1: number; x2: number; y2: number }
//     confidence: number
//   }>
//   timestamp: string
// }

// export default function VideoPlayerSection({ data, videoFile }: VideoPlayerSectionProps) {
//   const videoRef = useRef<HTMLVideoElement>(null)
//   const canvasRef = useRef<HTMLCanvasElement>(null)
//   const containerRef = useRef<HTMLDivElement>(null)
//   const animationFrameRef = useRef<number | null>(null)
//   const [currentFrame, setCurrentFrame] = useState(0)
//   const [detectionsCount, setDetectionsCount] = useState(0)
//   const [logs, setLogs] = useState<DetectionLog[]>([])
//   const [showSummary, setShowSummary] = useState(false)
//   const frameDetectionMap = useRef<Map<number, any[]>>(new Map())
//   const lastProcessedFrame = useRef(-1)
//   const loggedFrames = useRef<Set<number>>(new Set())
//   const MAX_LOGS = 0 // Limit log entries to prevent memory issues

//   // Build optimized frame detection map
//   useEffect(() => {
//     const map = new Map()

//     if (data.frames && Array.isArray(data.frames)) {
//       console.log(`Building frame map from ${data.frames.length} frames`)
//       data.frames.forEach((frameData) => {
//         const frameId = frameData.frame_id
//         const potholes = frameData.potholes || []

//         if (potholes.length > 0) {
//           map.set(frameId, potholes)
//         }
//       })
//       console.log(`Frame map built: ${map.size} frames with detections`)
//     }

//     frameDetectionMap.current = map
//   }, [data])

//   // Load video file
//   useEffect(() => {
//     if (videoRef.current && videoFile) {
//       const url = URL.createObjectURL(videoFile)
//       videoRef.current.src = url

//       return () => {
//         URL.revokeObjectURL(url)
//       }
//     }
//   }, [videoFile])

//   // Setup canvas resolution
//   useEffect(() => {
//     const video = videoRef.current
//     const canvas = canvasRef.current

//     if (!video || !canvas) return

//     const setupResolution = () => {
//       // Set canvas internal resolution to match backend data
//       canvas.width = data.video_info.width
//       canvas.height = data.video_info.height

//       // Set display size to match video element
//       const rect = video.getBoundingClientRect()
//       canvas.style.width = `${rect.width}px`
//       canvas.style.height = `${rect.height}px`
//     }

//     video.addEventListener("loadedmetadata", setupResolution)
//     window.addEventListener("resize", setupResolution)

//     return () => {
//       video.removeEventListener("loadedmetadata", setupResolution)
//       window.removeEventListener("resize", setupResolution)
//     }
//   }, [data.video_info.width, data.video_info.height])

//   // Add detection log with deduplication and size limit
//   const addDetectionLog = useCallback((frame: number, detections: any[]) => {
//     // Skip if already logged this frame
//     if (loggedFrames.current.has(frame)) return
    
//     loggedFrames.current.add(frame)
    
//     setLogs((prev) => {
//       const newLog: DetectionLog = {
//         frame,
//         detections: detections.map((det) => ({
//           pothole_id: det.pothole_id,
//           bbox: det.bbox,
//           confidence: det.confidence,
//         })),
//         timestamp: new Date().toLocaleTimeString(),
//       }
      
//       // Keep only MAX_LOGS entries
//       const updated = [newLog, ...prev].slice(0, MAX_LOGS)
//       return updated
//     })
//   }, [])

//   // Optimized drawing function with batched state updates
//   const drawDetections = useCallback(() => {
//     const video = videoRef.current
//     const canvas = canvasRef.current

//     if (!video || !canvas) {
//       animationFrameRef.current = requestAnimationFrame(drawDetections)
//       return
//     }

//     // Skip drawing if video is paused or ended
//     if (video.paused || video.ended) {
//       animationFrameRef.current = requestAnimationFrame(drawDetections)
//       return
//     }

//     const ctx = canvas.getContext("2d", { alpha: true })
//     if (!ctx) return

//     // Calculate current frame
//     const frame = Math.floor(video.currentTime * data.video_info.fps)
    
//     // Only update if frame has changed
//     if (frame !== lastProcessedFrame.current) {
//       lastProcessedFrame.current = frame
      
//       // Get detections for current frame
//       const detections = frameDetectionMap.current.get(frame)
//       const detCount = detections?.length || 0
      
//       // Batch state updates to minimize re-renders
//       setCurrentFrame(frame)
//       setDetectionsCount(detCount)

//       // Clear canvas
//       ctx.clearRect(0, 0, canvas.width, canvas.height)

//       if (detections && detections.length > 0) {
//         // Add log entry (with deduplication)
//         addDetectionLog(frame, detections)

//         // Draw all detections
//         detections.forEach((det) => {
//           const { x1, y1, x2, y2 } = det.bbox
//           const width = x2 - x1
//           const height = y2 - y1

//           // Draw red bounding box
//           ctx.strokeStyle = "#ef4444"
//           ctx.lineWidth = 3
//           ctx.strokeRect(x1, y1, width, height)

//           // Draw semi-transparent fill
//           ctx.fillStyle = "rgba(239, 68, 68, 0.15)"
//           ctx.fillRect(x1, y1, width, height)

//           // Draw label background
//           const label = `Pothole #${det.pothole_id} (${(det.confidence * 100).toFixed(0)}%)`
//           ctx.font = "bold 14px system-ui"
//           const textWidth = ctx.measureText(label).width
          
//           ctx.fillStyle = "rgba(239, 68, 68, 0.95)"
//           ctx.fillRect(x1, y1 - 26, textWidth + 16, 26)

//           // Draw label text
//           ctx.fillStyle = "#ffffff"
//           ctx.fillText(label, x1 + 8, y1 - 8)
//         })
//       }
//     }

//     animationFrameRef.current = requestAnimationFrame(drawDetections)
//   }, [data.video_info.fps, addDetectionLog])

//   // Start/stop animation loop
//   useEffect(() => {
//     animationFrameRef.current = requestAnimationFrame(drawDetections)

//     return () => {
//       if (animationFrameRef.current) {
//         cancelAnimationFrame(animationFrameRef.current)
//       }
//     }
//   }, [drawDetections])

//   // Handle video end - show summary
//   useEffect(() => {
//     const video = videoRef.current
//     if (!video) return

//     const handleEnded = () => {
//       setShowSummary(true)
//       setTimeout(() => {
//         setLogs((prev) => {
//           const summaryLog: DetectionLog = {
//             frame: -1,
//             detections: [],
//             timestamp: new Date().toLocaleTimeString(),
//           }
//           return [summaryLog, ...prev].slice(0, MAX_LOGS)
//         })
//       }, 500)
//     }

//     video.addEventListener("ended", handleEnded)

//     return () => {
//       video.removeEventListener("ended", handleEnded)
//     }
//   }, [data])

//   // Reset logs when video is seeked or restarted
//   useEffect(() => {
//     const video = videoRef.current
//     if (!video) return

//     const handleSeeked = () => {
//       loggedFrames.current.clear()
//     }

//     const handlePlay = () => {
//       if (video.currentTime < 1) {
//         setLogs([])
//         loggedFrames.current.clear()
//         lastProcessedFrame.current = -1
//       }
//     }

//     video.addEventListener("seeked", handleSeeked)
//     video.addEventListener("play", handlePlay)

//     return () => {
//       video.removeEventListener("seeked", handleSeeked)
//       video.removeEventListener("play", handlePlay)
//     }
//   }, [])

//   return (
//     <Card>
//       <CardHeader>
//         <CardTitle>Video Playback with Detection</CardTitle>
//         <CardDescription>Watch the analyzed video with real-time bounding box overlays</CardDescription>
//       </CardHeader>
//       <CardContent>
//         <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
//           {/* Video Player */}
//           <div className="lg:col-span-2 space-y-4">
//             <div ref={containerRef} className="relative bg-black rounded-lg overflow-hidden">
//               <video
//                 ref={videoRef}
//                 controls
//                 className="w-full h-auto"
//                 style={{
//                   aspectRatio: `${data.video_info.width} / ${data.video_info.height}`,
//                 }}
//               />
//               <canvas 
//                 ref={canvasRef} 
//                 className="absolute inset-0 pointer-events-none"
//                 style={{ objectFit: 'contain' }}
//               />
//             </div>

//             {/* Video Info */}
//             <div className="flex flex-wrap gap-4 text-sm">
//               <div className="flex items-center gap-2">
//                 <span className="text-muted-foreground">Current Frame:</span>
//                 <Badge variant="secondary">{currentFrame}</Badge>
//               </div>
//               <div className="flex items-center gap-2">
//                 <span className="text-muted-foreground">Detections:</span>
//                 <Badge variant={detectionsCount > 0 ? "destructive" : "secondary"}>{detectionsCount}</Badge>
//               </div>
//               <div className="flex items-center gap-2">
//                 <span className="text-muted-foreground">Resolution:</span>
//                 <Badge variant="outline">
//                   {data.video_info.width}×{data.video_info.height}
//                 </Badge>
//               </div>
//               <div className="flex items-center gap-2">
//                 <span className="text-muted-foreground">FPS:</span>
//                 <Badge variant="outline">{data.video_info.fps.toFixed(1)}</Badge>
//               </div>
//             </div>
//           </div>

//           {/* Detection Logs */}
//           <div className="space-y-4">
//             <div>
//               <h4 className="text-sm font-semibold mb-2">Detection Logs</h4>
//               <p className="text-xs text-muted-foreground mb-3">Real-time frame-by-frame detection tracking (last {MAX_LOGS})</p>
//             </div>
//             <ScrollArea className="h-[400px] rounded-md border bg-muted/30 p-4">
//               <div className="space-y-2">
//                 {logs.length === 0 ? (
//                   <p className="text-sm text-muted-foreground text-center py-8">Play the video to see detection logs</p>
//                 ) : (
//                   logs.map((log, index) => (
//                     log.frame === -1 ? (
//                       // Summary entry
//                       <div
//                         key={`summary-${index}`}
//                         className="text-xs p-4 bg-green-50 dark:bg-green-950 rounded-md border-l-4 border-green-500"
//                       >
//                         <div className="font-bold text-green-700 dark:text-green-300 mb-3 text-sm">
//                           📊 DETECTION SUMMARY
//                         </div>
//                         <div className="space-y-1.5 text-foreground">
//                           <div className="flex justify-between">
//                             <span className="font-medium">Unique Potholes:</span>
//                             <span className="font-bold">{data.summary.unique_potholes}</span>
//                           </div>
//                           <div className="flex justify-between">
//                             <span className="font-medium">Total Detections:</span>
//                             <span className="font-bold">{data.summary.total_detections}</span>
//                           </div>
//                           <div className="flex justify-between">
//                             <span className="font-medium">Total Frames:</span>
//                             <span className="font-bold">{data.summary.total_frames}</span>
//                           </div>
//                           <div className="flex justify-between">
//                             <span className="font-medium">Detection Rate:</span>
//                             <span className="font-bold">{data.summary.detection_rate.toFixed(1)}%</span>
//                           </div>
//                           <div className="flex justify-between">
//                             <span className="font-medium">Video FPS:</span>
//                             <span className="font-bold">{data.video_info.fps.toFixed(1)}</span>
//                           </div>
//                           <div className="flex justify-between">
//                             <span className="font-medium">Resolution:</span>
//                             <span className="font-bold">{data.video_info.width}×{data.video_info.height}</span>
//                           </div>
//                         </div>
//                       </div>
//                     ) : (
//                       // Detection entry
//                       <div
//                         key={`${log.frame}-${index}`}
//                         className="text-xs p-3 bg-card rounded-md border-l-2 border-red-500"
//                       >
//                         <div className="flex items-center justify-between mb-2">
//                           <span className="font-semibold text-foreground">Frame: {log.frame}</span>
//                           <span className="text-muted-foreground text-[10px]">{log.timestamp}</span>
//                         </div>

//                         {log.detections.length === 0 ? (
//                           <div className="text-muted-foreground">No detections</div>
//                         ) : (
//                           <div className="space-y-2">
//                             {log.detections.map((det, idx) => (
//                               <div key={idx} className="space-y-1">
//                                 <div className="font-medium text-foreground">
//                                   Pothole ID: {det.pothole_id} | Confidence: {(det.confidence * 100).toFixed(1)}%
//                                 </div>
//                                 <div className="text-muted-foreground font-mono text-[10px]">
//                                   Coordinates: ({Math.round(det.bbox.x1)}, {Math.round(det.bbox.y1)}) → ({Math.round(det.bbox.x2)}, {Math.round(det.bbox.y2)})
//                                 </div>
//                               </div>
//                             ))}
//                           </div>
//                         )}
//                       </div>
//                     )
//                   ))
//                 )}
//               </div>
//             </ScrollArea>
//           </div>
//         </div>
//       </CardContent>
//     </Card>
//   )
// }





// "use client"

// import { useEffect, useRef, useState, useCallback } from "react"
// import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
// import { ScrollArea } from "@/components/ui/scroll-area"
// import { Badge } from "@/components/ui/badge"

// type DetectionData = {
//   frames: Array<{
//     frame_id: number
//     potholes: Array<{
//       pothole_id: number
//       bbox: { x1: number; y1: number; x2: number; y2: number }
//       confidence: number
//     }>
//   }>
//   video_info: {
//     width: number
//     height: number
//     fps: number
//     total_frames: number
//   }
//   summary: {
//     unique_potholes: number
//     total_detections: number
//     total_frames: number
//     detection_rate: number
//   }
// }

// type VideoPlayerSectionProps = {
//   data: DetectionData
//   videoFile: File
// }

// type DetectionLog = {
//   frame: number
//   detections: Array<{
//     pothole_id: number
//     bbox: { x1: number; y1: number; x2: number; y2: number }
//     confidence: number
//   }>
//   timestamp: string
// }

// export default function VideoPlayerSection({ data, videoFile }: VideoPlayerSectionProps) {
//   const videoRef = useRef<HTMLVideoElement>(null)
//   const canvasRef = useRef<HTMLCanvasElement>(null)
//   const containerRef = useRef<HTMLDivElement>(null)
//   const animationFrameRef = useRef<number | null>(null)
//   const [currentFrame, setCurrentFrame] = useState(0)
//   const [detectionsCount, setDetectionsCount] = useState(0)
//   const [logs, setLogs] = useState<DetectionLog[]>([])
//   const [showSummary, setShowSummary] = useState(false)
//   const frameDetectionMap = useRef<Map<number, any[]>>(new Map())
//   const lastProcessedFrame = useRef(-1)
//   const loggedFrames = useRef<Set<number>>(new Set())
//   const MAX_LOGS = 0 // Limit log entries to prevent memory issues

//   // Build optimized frame detection map
//   useEffect(() => {
//     const map = new Map()

//     if (data.frames && Array.isArray(data.frames)) {
//       console.log(`Building frame map from ${data.frames.length} frames`)
//       data.frames.forEach((frameData) => {
//         const frameId = frameData.frame_id
//         const potholes = frameData.potholes || []

//         if (potholes.length > 0) {
//           map.set(frameId, potholes)
//         }
//       })
//       console.log(`Frame map built: ${map.size} frames with detections`)
//     }

//     frameDetectionMap.current = map
//   }, [data])

//   // Load video file
//   useEffect(() => {
//     if (videoRef.current && videoFile) {
//       const url = URL.createObjectURL(videoFile)
//       videoRef.current.src = url

//       return () => {
//         URL.revokeObjectURL(url)
//       }
//     }
//   }, [videoFile])

//   // Setup canvas resolution
//   useEffect(() => {
//     const video = videoRef.current
//     const canvas = canvasRef.current

//     if (!video || !canvas) return

//     const setupResolution = () => {
//       // Set canvas internal resolution to match backend data
//       canvas.width = data.video_info.width
//       canvas.height = data.video_info.height

//       // Set display size to match video element
//       const rect = video.getBoundingClientRect()
//       canvas.style.width = `${rect.width}px`
//       canvas.style.height = `${rect.height}px`
//     }

//     video.addEventListener("loadedmetadata", setupResolution)
//     window.addEventListener("resize", setupResolution)

//     return () => {
//       video.removeEventListener("loadedmetadata", setupResolution)
//       window.removeEventListener("resize", setupResolution)
//     }
//   }, [data.video_info.width, data.video_info.height])

//   // Add detection log with deduplication and size limit
//   const addDetectionLog = useCallback((frame: number, detections: any[]) => {
//     // Skip if already logged this frame
//     if (loggedFrames.current.has(frame)) return
    
//     loggedFrames.current.add(frame)
    
//     setLogs((prev) => {
//       const newLog: DetectionLog = {
//         frame,
//         detections: detections.map((det) => ({
//           pothole_id: det.pothole_id,
//           bbox: det.bbox,
//           confidence: det.confidence,
//         })),
//         timestamp: new Date().toLocaleTimeString(),
//       }
      
//       // Keep only MAX_LOGS entries
//       const updated = [newLog, ...prev].slice(0, MAX_LOGS)
//       return updated
//     })
//   }, [])

//   // Core drawing logic extracted for reuse
//   const drawFrameDetections = useCallback((frame: number, shouldLog: boolean = true) => {
//     const canvas = canvasRef.current
//     if (!canvas) return

//     const ctx = canvas.getContext("2d", { alpha: true })
//     if (!ctx) return

//     // Get detections for current frame
//     const detections = frameDetectionMap.current.get(frame)
//     const detCount = detections?.length || 0
    
//     // Batch state updates to minimize re-renders
//     setCurrentFrame(frame)
//     setDetectionsCount(detCount)

//     // Clear canvas
//     ctx.clearRect(0, 0, canvas.width, canvas.height)

//     if (detections && detections.length > 0) {
//       // Add log entry (with deduplication) only during playback
//       if (shouldLog) {
//         addDetectionLog(frame, detections)
//       }

//       // Draw all detections
//       detections.forEach((det) => {
//         const { x1, y1, x2, y2 } = det.bbox
//         const width = x2 - x1
//         const height = y2 - y1

//         // Draw red bounding box
//         ctx.strokeStyle = "#ef4444"
//         ctx.lineWidth = 3
//         ctx.strokeRect(x1, y1, width, height)

//         // Draw semi-transparent fill
//         ctx.fillStyle = "rgba(239, 68, 68, 0.15)"
//         ctx.fillRect(x1, y1, width, height)

//         // Draw label background
//         const label = `Pothole #${det.pothole_id} (${(det.confidence * 100).toFixed(0)}%)`
//         ctx.font = "bold 14px system-ui"
//         const textWidth = ctx.measureText(label).width
        
//         ctx.fillStyle = "rgba(239, 68, 68, 0.95)"
//         ctx.fillRect(x1, y1 - 26, textWidth + 16, 26)

//         // Draw label text
//         ctx.fillStyle = "#ffffff"
//         ctx.fillText(label, x1 + 8, y1 - 8)
//       })
//     }
//   }, [addDetectionLog])

//   // Optimized drawing function with batched state updates
//   const drawDetections = useCallback(() => {
//     const video = videoRef.current
//     const canvas = canvasRef.current

//     if (!video || !canvas) {
//       animationFrameRef.current = requestAnimationFrame(drawDetections)
//       return
//     }

//     // Skip drawing if video is paused or ended
//     if (video.paused || video.ended) {
//       animationFrameRef.current = requestAnimationFrame(drawDetections)
//       return
//     }

//     // Calculate current frame
//     const frame = Math.floor(video.currentTime * data.video_info.fps)
    
//     // Only update if frame has changed
//     if (frame !== lastProcessedFrame.current) {
//       lastProcessedFrame.current = frame
//       drawFrameDetections(frame, true)
//     }

//     animationFrameRef.current = requestAnimationFrame(drawDetections)
//   }, [data.video_info.fps, drawFrameDetections])

//   // Start/stop animation loop
//   useEffect(() => {
//     animationFrameRef.current = requestAnimationFrame(drawDetections)

//     return () => {
//       if (animationFrameRef.current) {
//         cancelAnimationFrame(animationFrameRef.current)
//       }
//     }
//   }, [drawDetections])

//   // Handle video end - show summary
//   useEffect(() => {
//     const video = videoRef.current
//     if (!video) return

//     const handleEnded = () => {
//       setShowSummary(true)
//       setTimeout(() => {
//         setLogs((prev) => {
//           const summaryLog: DetectionLog = {
//             frame: -1,
//             detections: [],
//             timestamp: new Date().toLocaleTimeString(),
//           }
//           return [summaryLog, ...prev].slice(0, MAX_LOGS)
//         })
//       }, 500)
//     }

//     video.addEventListener("ended", handleEnded)

//     return () => {
//       video.removeEventListener("ended", handleEnded)
//     }
//   }, [data])

//   // Reset logs when video is seeked or restarted
//   useEffect(() => {
//     const video = videoRef.current
//     if (!video) return

//     const handleSeeked = () => {
//       loggedFrames.current.clear()
//       // Draw detections for the seeked frame immediately
//       const frame = Math.floor(video.currentTime * data.video_info.fps)
//       lastProcessedFrame.current = frame
//       drawFrameDetections(frame, false) // Don't log during seeking
//     }

//     const handlePlay = () => {
//       if (video.currentTime < 1) {
//         setLogs([])
//         loggedFrames.current.clear()
//         lastProcessedFrame.current = -1
//       }
//     }

//     video.addEventListener("seeked", handleSeeked)
//     video.addEventListener("play", handlePlay)

//     return () => {
//       video.removeEventListener("seeked", handleSeeked)
//       video.removeEventListener("play", handlePlay)
//     }
//   }, [data.video_info.fps, drawFrameDetections])

//   return (
//     <Card>
//       <CardHeader>
//         <CardTitle>Video Playback with Detection</CardTitle>
//         <CardDescription>Watch the analyzed video with real-time bounding box overlays</CardDescription>
//       </CardHeader>
//       <CardContent>
//         <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
//           {/* Video Player */}
//           <div className="lg:col-span-2 space-y-4">
//             <div ref={containerRef} className="relative bg-black rounded-lg overflow-hidden">
//               <video
//                 ref={videoRef}
//                 controls
//                 className="w-full h-auto"
//                 style={{
//                   aspectRatio: `${data.video_info.width} / ${data.video_info.height}`,
//                 }}
//               />
//               <canvas 
//                 ref={canvasRef} 
//                 className="absolute inset-0 pointer-events-none"
//                 style={{ objectFit: 'contain' }}
//               />
//             </div>

//             {/* Video Info */}
//             <div className="flex flex-wrap gap-4 text-sm">
//               <div className="flex items-center gap-2">
//                 <span className="text-muted-foreground">Current Frame:</span>
//                 <Badge variant="secondary">{currentFrame}</Badge>
//               </div>
//               <div className="flex items-center gap-2">
//                 <span className="text-muted-foreground">Detections:</span>
//                 <Badge variant={detectionsCount > 0 ? "destructive" : "secondary"}>{detectionsCount}</Badge>
//               </div>
//               <div className="flex items-center gap-2">
//                 <span className="text-muted-foreground">Resolution:</span>
//                 <Badge variant="outline">
//                   {data.video_info.width}×{data.video_info.height}
//                 </Badge>
//               </div>
//               <div className="flex items-center gap-2">
//                 <span className="text-muted-foreground">FPS:</span>
//                 <Badge variant="outline">{data.video_info.fps.toFixed(1)}</Badge>
//               </div>
//             </div>
//           </div>

//           {/* Detection Logs */}
//           <div className="space-y-4">
//             <div>
//               <h4 className="text-sm font-semibold mb-2">Detection Logs</h4>
//               <p className="text-xs text-muted-foreground mb-3">Real-time frame-by-frame detection tracking (last {MAX_LOGS})</p>
//             </div>
//             <ScrollArea className="h-[400px] rounded-md border bg-muted/30 p-4">
//               <div className="space-y-2">
//                 {logs.length === 0 ? (
//                   <p className="text-sm text-muted-foreground text-center py-8">Play the video to see detection logs</p>
//                 ) : (
//                   logs.map((log, index) => (
//                     log.frame === -1 ? (
//                       // Summary entry
//                       <div
//                         key={`summary-${index}`}
//                         className="text-xs p-4 bg-green-50 dark:bg-green-950 rounded-md border-l-4 border-green-500"
//                       >
//                         <div className="font-bold text-green-700 dark:text-green-300 mb-3 text-sm">
//                           📊 DETECTION SUMMARY
//                         </div>
//                         <div className="space-y-1.5 text-foreground">
//                           <div className="flex justify-between">
//                             <span className="font-medium">Unique Potholes:</span>
//                             <span className="font-bold">{data.summary.unique_potholes}</span>
//                           </div>
//                           <div className="flex justify-between">
//                             <span className="font-medium">Total Detections:</span>
//                             <span className="font-bold">{data.summary.total_detections}</span>
//                           </div>
//                           <div className="flex justify-between">
//                             <span className="font-medium">Total Frames:</span>
//                             <span className="font-bold">{data.summary.total_frames}</span>
//                           </div>
//                           <div className="flex justify-between">
//                             <span className="font-medium">Detection Rate:</span>
//                             <span className="font-bold">{data.summary.detection_rate.toFixed(1)}%</span>
//                           </div>
//                           <div className="flex justify-between">
//                             <span className="font-medium">Video FPS:</span>
//                             <span className="font-bold">{data.video_info.fps.toFixed(1)}</span>
//                           </div>
//                           <div className="flex justify-between">
//                             <span className="font-medium">Resolution:</span>
//                             <span className="font-bold">{data.video_info.width}×{data.video_info.height}</span>
//                           </div>
//                         </div>
//                       </div>
//                     ) : (
//                       // Detection entry
//                       <div
//                         key={`${log.frame}-${index}`}
//                         className="text-xs p-3 bg-card rounded-md border-l-2 border-red-500"
//                       >
//                         <div className="flex items-center justify-between mb-2">
//                           <span className="font-semibold text-foreground">Frame: {log.frame}</span>
//                           <span className="text-muted-foreground text-[10px]">{log.timestamp}</span>
//                         </div>

//                         {log.detections.length === 0 ? (
//                           <div className="text-muted-foreground">No detections</div>
//                         ) : (
//                           <div className="space-y-2">
//                             {log.detections.map((det, idx) => (
//                               <div key={idx} className="space-y-1">
//                                 <div className="font-medium text-foreground">
//                                   Pothole ID: {det.pothole_id} | Confidence: {(det.confidence * 100).toFixed(1)}%
//                                 </div>
//                                 <div className="text-muted-foreground font-mono text-[10px]">
//                                   Coordinates: ({Math.round(det.bbox.x1)}, {Math.round(det.bbox.y1)}) → ({Math.round(det.bbox.x2)}, {Math.round(det.bbox.y2)})
//                                 </div>
//                               </div>
//                             ))}
//                           </div>
//                         )}
//                       </div>
//                     )
//                   ))
//                 )}
//               </div>
//             </ScrollArea>
//           </div>
//         </div>
//       </CardContent>
//     </Card>
//   )
// }










//working version

// "use client"

// import { useEffect, useRef, useState, useCallback } from "react"
// import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
// import { ScrollArea } from "@/components/ui/scroll-area"
// import { Badge } from "@/components/ui/badge"

// type DetectionData = {
//   frames: Array<{
//     frame_id: number
//     potholes: Array<{
//       pothole_id: number
//       bbox: { x1: number; y1: number; x2: number; y2: number }
//       confidence: number
//     }>
//   }>
//   video_info: {
//     width: number
//     height: number
//     fps: number
//     total_frames: number
//   }
//   summary: {
//     unique_potholes: number
//     total_detections: number
//     total_frames: number
//     detection_rate: number
//   }
// }

// type VideoPlayerSectionProps = {
//   data: DetectionData
//   videoFile: File
// }

// type DetectionLog = {
//   frame: number
//   detections: Array<{
//     pothole_id: number
//     bbox: { x1: number; y1: number; x2: number; y2: number }
//     confidence: number
//   }>
//   timestamp: string
// }

// export default function VideoPlayerSection({ data, videoFile }: VideoPlayerSectionProps) {
//   const videoRef = useRef<HTMLVideoElement>(null)
//   const canvasRef = useRef<HTMLCanvasElement>(null)
//   const containerRef = useRef<HTMLDivElement>(null)
//   const animationFrameRef = useRef<number | null>(null)
//   const [currentFrame, setCurrentFrame] = useState(0)
//   const [detectionsCount, setDetectionsCount] = useState(0)
//   const [logs, setLogs] = useState<DetectionLog[]>([])
//   const [showSummary, setShowSummary] = useState(false)
//   const frameDetectionMap = useRef<Map<number, any[]>>(new Map())
//   const lastProcessedFrame = useRef(-1)
//   const loggedFrames = useRef<Set<number>>(new Set())
//   const MAX_LOGS = 0 // Limit log entries to prevent memory issues

//   // Build optimized frame detection map
//   useEffect(() => {
//     const map = new Map()

//     if (data.frames && Array.isArray(data.frames)) {
//       console.log(`Building frame map from ${data.frames.length} frames`)
//       data.frames.forEach((frameData) => {
//         const frameId = frameData.frame_id
//         const potholes = frameData.potholes || []

//         if (potholes.length > 0) {
//           map.set(frameId, potholes)
//         }
//       })
//       console.log(`Frame map built: ${map.size} frames with detections`)
//     }

//     frameDetectionMap.current = map
//   }, [data])

//   // Load video file
//   useEffect(() => {
//     if (videoRef.current && videoFile) {
//       const url = URL.createObjectURL(videoFile)
//       videoRef.current.src = url

//       return () => {
//         URL.revokeObjectURL(url)
//       }
//     }
//   }, [videoFile])

//   // Setup canvas resolution
//   useEffect(() => {
//     const video = videoRef.current
//     const canvas = canvasRef.current

//     if (!video || !canvas) return

//     const setupResolution = () => {
//       // Set canvas internal resolution to match backend data
//       canvas.width = data.video_info.width
//       canvas.height = data.video_info.height

//       // Set display size to match video element
//       const rect = video.getBoundingClientRect()
//       canvas.style.width = `${rect.width}px`
//       canvas.style.height = `${rect.height}px`
//     }

//     video.addEventListener("loadedmetadata", setupResolution)
//     window.addEventListener("resize", setupResolution)

//     return () => {
//       video.removeEventListener("loadedmetadata", setupResolution)
//       window.removeEventListener("resize", setupResolution)
//     }
//   }, [data.video_info.width, data.video_info.height])

//   // Add detection log with deduplication and size limit
//   const addDetectionLog = useCallback((frame: number, detections: any[]) => {
//     // Skip if already logged this frame
//     if (loggedFrames.current.has(frame)) return
    
//     loggedFrames.current.add(frame)
    
//     setLogs((prev) => {
//       const newLog: DetectionLog = {
//         frame,
//         detections: detections.map((det) => ({
//           pothole_id: det.pothole_id,
//           bbox: det.bbox,
//           confidence: det.confidence,
//         })),
//         timestamp: new Date().toLocaleTimeString(),
//       }
      
//       // Keep only MAX_LOGS entries
//       const updated = [newLog, ...prev].slice(0, MAX_LOGS)
//       return updated
//     })
//   }, [])

//   // Core drawing logic extracted for reuse
//   const drawFrameDetections = useCallback((frame: number, shouldLog: boolean = true) => {
//     const canvas = canvasRef.current
//     if (!canvas) return

//     const ctx = canvas.getContext("2d", { alpha: true })
//     if (!ctx) return

//     // Get detections for current frame
//     const detections = frameDetectionMap.current.get(frame)
//     const detCount = detections?.length || 0
    
//     // Batch state updates to minimize re-renders
//     setCurrentFrame(frame)
//     setDetectionsCount(detCount)

//     // Clear canvas
//     ctx.clearRect(0, 0, canvas.width, canvas.height)

//     if (detections && detections.length > 0) {
//       // Add log entry (with deduplication) only during playback
//       if (shouldLog) {
//         addDetectionLog(frame, detections)
//       }

//       // Draw all detections
//       detections.forEach((det) => {
//         const { x1, y1, x2, y2 } = det.bbox
//         const width = x2 - x1
//         const height = y2 - y1

//         // Draw red bounding box
//         ctx.strokeStyle = "#ef4444"
//         ctx.lineWidth = 3
//         ctx.strokeRect(x1, y1, width, height)

//         // Draw semi-transparent fill
//         ctx.fillStyle = "rgba(239, 68, 68, 0.15)"
//         ctx.fillRect(x1, y1, width, height)

//         // Draw label background
//         const label = `Pothole #${det.pothole_id} (${(det.confidence * 100).toFixed(0)}%)`
//         ctx.font = "bold 14px system-ui"
//         const textWidth = ctx.measureText(label).width
        
//         ctx.fillStyle = "rgba(239, 68, 68, 0.95)"
//         ctx.fillRect(x1, y1 - 26, textWidth + 16, 26)

//         // Draw label text
//         ctx.fillStyle = "#ffffff"
//         ctx.fillText(label, x1 + 8, y1 - 8)
//       })
//     }
//   }, [addDetectionLog])

//   // Optimized drawing function with batched state updates
//   const drawDetections = useCallback(() => {
//     const video = videoRef.current
//     const canvas = canvasRef.current

//     if (!video || !canvas) {
//       animationFrameRef.current = requestAnimationFrame(drawDetections)
//       return
//     }

//     // Skip drawing if video is paused or ended
//     if (video.paused || video.ended) {
//       animationFrameRef.current = requestAnimationFrame(drawDetections)
//       return
//     }

//     // Calculate current frame
//     const frame = Math.floor(video.currentTime * data.video_info.fps)
    
//     // Only update if frame has changed
//     if (frame !== lastProcessedFrame.current) {
//       lastProcessedFrame.current = frame
//       drawFrameDetections(frame, true)
//     }

//     animationFrameRef.current = requestAnimationFrame(drawDetections)
//   }, [data.video_info.fps, drawFrameDetections])

//   // Start/stop animation loop
//   useEffect(() => {
//     animationFrameRef.current = requestAnimationFrame(drawDetections)

//     return () => {
//       if (animationFrameRef.current) {
//         cancelAnimationFrame(animationFrameRef.current)
//       }
//     }
//   }, [drawDetections])

//   // Handle video end - show summary
//   useEffect(() => {
//     const video = videoRef.current
//     if (!video) return

//     const handleEnded = () => {
//       setShowSummary(true)
//       setTimeout(() => {
//         setLogs((prev) => {
//           const summaryLog: DetectionLog = {
//             frame: -1,
//             detections: [],
//             timestamp: new Date().toLocaleTimeString(),
//           }
//           return [summaryLog, ...prev].slice(0, MAX_LOGS)
//         })
//       }, 500)
//     }

//     video.addEventListener("ended", handleEnded)

//     return () => {
//       video.removeEventListener("ended", handleEnded)
//     }
//   }, [data])

//   // Handle seeking with optimized video frame sync
//   useEffect(() => {
//     const video = videoRef.current
//     if (!video) return

//     let rafId: number | null = null

//     const updateFrame = () => {
//       const frame = Math.floor(video.currentTime * data.video_info.fps)
//       if (frame !== lastProcessedFrame.current) {
//         lastProcessedFrame.current = frame
//         drawFrameDetections(frame, false)
//       }
//     }

//     const handleSeeking = () => {
//       // Cancel any pending updates
//       if (rafId) cancelAnimationFrame(rafId)
//       // Update immediately on seeking start
//       updateFrame()
//     }

//     const handleSeeked = () => {
//       loggedFrames.current.clear()
//       // Final update when seeking completes
//       if (rafId) cancelAnimationFrame(rafId)
//       rafId = requestAnimationFrame(updateFrame)
//     }

//     const handleTimeUpdate = () => {
//       // Throttled updates during scrubbing when paused
//       if (video.paused && !rafId) {
//         rafId = requestAnimationFrame(() => {
//           updateFrame()
//           rafId = null
//         })
//       }
//     }

//     const handlePlay = () => {
//       if (video.currentTime < 1) {
//         setLogs([])
//         loggedFrames.current.clear()
//         lastProcessedFrame.current = -1
//       }
//     }

//     video.addEventListener("seeking", handleSeeking)
//     video.addEventListener("seeked", handleSeeked)
//     video.addEventListener("timeupdate", handleTimeUpdate)
//     video.addEventListener("play", handlePlay)

//     return () => {
//       if (rafId) cancelAnimationFrame(rafId)
//       video.removeEventListener("seeking", handleSeeking)
//       video.removeEventListener("seeked", handleSeeked)
//       video.removeEventListener("timeupdate", handleTimeUpdate)
//       video.removeEventListener("play", handlePlay)
//     }
//   }, [data.video_info.fps, drawFrameDetections])

//   return (
//     <Card>
//       <CardHeader>
//         <CardTitle>Video Playback with Detection</CardTitle>
//         <CardDescription>Watch the analyzed video with real-time bounding box overlays</CardDescription>
//       </CardHeader>
//       <CardContent>
//         <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
//           {/* Video Player */}
//           <div className="lg:col-span-2 space-y-4">
//             <div ref={containerRef} className="relative bg-black rounded-lg overflow-hidden">
//               <video
//                 ref={videoRef}
//                 controls
//                 className="w-full h-auto"
//                 style={{
//                   aspectRatio: `${data.video_info.width} / ${data.video_info.height}`,
//                 }}
//               />
//               <canvas 
//                 ref={canvasRef} 
//                 className="absolute inset-0 pointer-events-none"
//                 style={{ objectFit: 'contain' }}
//               />
//             </div>

//             {/* Video Info */}
//             <div className="flex flex-wrap gap-4 text-sm">
//               <div className="flex items-center gap-2">
//                 <span className="text-muted-foreground">Current Frame:</span>
//                 <Badge variant="secondary">{currentFrame}</Badge>
//               </div>
//               <div className="flex items-center gap-2">
//                 <span className="text-muted-foreground">Detections:</span>
//                 <Badge variant={detectionsCount > 0 ? "destructive" : "secondary"}>{detectionsCount}</Badge>
//               </div>
//               <div className="flex items-center gap-2">
//                 <span className="text-muted-foreground">Resolution:</span>
//                 <Badge variant="outline">
//                   {data.video_info.width}×{data.video_info.height}
//                 </Badge>
//               </div>
//               <div className="flex items-center gap-2">
//                 <span className="text-muted-foreground">FPS:</span>
//                 <Badge variant="outline">{data.video_info.fps.toFixed(1)}</Badge>
//               </div>
//             </div>
//           </div>

//           {/* Detection Logs */}
//           <div className="space-y-4">
//             <div>
//               <h4 className="text-sm font-semibold mb-2">Detection Logs</h4>
//               <p className="text-xs text-muted-foreground mb-3">Real-time frame-by-frame detection tracking (last {MAX_LOGS})</p>
//             </div>
//             <ScrollArea className="h-[400px] rounded-md border bg-muted/30 p-4">
//               <div className="space-y-2">
//                 {logs.length === 0 ? (
//                   <p className="text-sm text-muted-foreground text-center py-8">Play the video to see detection logs</p>
//                 ) : (
//                   logs.map((log, index) => (
//                     log.frame === -1 ? (
//                       // Summary entry
//                       <div
//                         key={`summary-${index}`}
//                         className="text-xs p-4 bg-green-50 dark:bg-green-950 rounded-md border-l-4 border-green-500"
//                       >
//                         <div className="font-bold text-green-700 dark:text-green-300 mb-3 text-sm">
//                           📊 DETECTION SUMMARY
//                         </div>
//                         <div className="space-y-1.5 text-foreground">
//                           <div className="flex justify-between">
//                             <span className="font-medium">Unique Potholes:</span>
//                             <span className="font-bold">{data.summary.unique_potholes}</span>
//                           </div>
//                           <div className="flex justify-between">
//                             <span className="font-medium">Total Detections:</span>
//                             <span className="font-bold">{data.summary.total_detections}</span>
//                           </div>
//                           <div className="flex justify-between">
//                             <span className="font-medium">Total Frames:</span>
//                             <span className="font-bold">{data.summary.total_frames}</span>
//                           </div>
//                           <div className="flex justify-between">
//                             <span className="font-medium">Detection Rate:</span>
//                             <span className="font-bold">{data.summary.detection_rate.toFixed(1)}%</span>
//                           </div>
//                           <div className="flex justify-between">
//                             <span className="font-medium">Video FPS:</span>
//                             <span className="font-bold">{data.video_info.fps.toFixed(1)}</span>
//                           </div>
//                           <div className="flex justify-between">
//                             <span className="font-medium">Resolution:</span>
//                             <span className="font-bold">{data.video_info.width}×{data.video_info.height}</span>
//                           </div>
//                         </div>
//                       </div>
//                     ) : (
//                       // Detection entry
//                       <div
//                         key={`${log.frame}-${index}`}
//                         className="text-xs p-3 bg-card rounded-md border-l-2 border-red-500"
//                       >
//                         <div className="flex items-center justify-between mb-2">
//                           <span className="font-semibold text-foreground">Frame: {log.frame}</span>
//                           <span className="text-muted-foreground text-[10px]">{log.timestamp}</span>
//                         </div>

//                         {log.detections.length === 0 ? (
//                           <div className="text-muted-foreground">No detections</div>
//                         ) : (
//                           <div className="space-y-2">
//                             {log.detections.map((det, idx) => (
//                               <div key={idx} className="space-y-1">
//                                 <div className="font-medium text-foreground">
//                                   Pothole ID: {det.pothole_id} | Confidence: {(det.confidence * 100).toFixed(1)}%
//                                 </div>
//                                 <div className="text-muted-foreground font-mono text-[10px]">
//                                   Coordinates: ({Math.round(det.bbox.x1)}, {Math.round(det.bbox.y1)}) → ({Math.round(det.bbox.x2)}, {Math.round(det.bbox.y2)})
//                                 </div>
//                               </div>
//                             ))}
//                           </div>
//                         )}
//                       </div>
//                     )
//                   ))
//                 )}
//               </div>
//             </ScrollArea>
//           </div>
//         </div>
//       </CardContent>
//     </Card>
//   )
// }





// "use client"

// import { useEffect, useRef, useState, useCallback } from "react"
// import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
// import { ScrollArea } from "@/components/ui/scroll-area"
// import { Badge } from "@/components/ui/badge"

// type DetectionData = {
//   frames: Array<{
//     frame_id: number
//     potholes: Array<{
//       pothole_id: number
//       bbox: { x1: number; y1: number; x2: number; y2: number }
//       confidence: number
//     }>
//   }>
//   video_info: {
//     width: number
//     height: number
//     fps: number
//     total_frames: number
//   }
//   summary: {
//     unique_potholes: number
//     total_detections: number
//     total_frames: number
//     detection_rate: number
//   }
// }

// type VideoPlayerSectionProps = {
//   data: DetectionData
//   videoFile: File
// }

// type DetectionLog = {
//   frame: number
//   detections: Array<{
//     pothole_id: number
//     bbox: { x1: number; y1: number; x2: number; y2: number }
//     confidence: number
//   }>
//   timestamp: string
// }

// export default function VideoPlayerSection({ data, videoFile }: VideoPlayerSectionProps) {
//   const videoRef = useRef<HTMLVideoElement>(null)
//   const canvasRef = useRef<HTMLCanvasElement>(null)
//   const containerRef = useRef<HTMLDivElement>(null)
//   const animationFrameRef = useRef<number | null>(null)
//   const [currentFrame, setCurrentFrame] = useState(0)
//   const [detectionsCount, setDetectionsCount] = useState(0)
//   const [logs, setLogs] = useState<DetectionLog[]>([])
//   const [showSummary, setShowSummary] = useState(false)
//   const frameDetectionMap = useRef<Map<number, any[]>>(new Map())
//   const lastProcessedFrame = useRef(-1)
//   const loggedFrames = useRef<Set<number>>(new Set())
//   const MAX_LOGS = 0 // Limit log entries to prevent memory issues

//   // Build optimized frame detection map
//   useEffect(() => {
//     const map = new Map()

//     if (data.frames && Array.isArray(data.frames)) {
//       console.log(`Building frame map from ${data.frames.length} frames`)
//       data.frames.forEach((frameData) => {
//         const frameId = frameData.frame_id
//         const potholes = frameData.potholes || []

//         if (potholes.length > 0) {
//           map.set(frameId, potholes)
//         }
//       })
//       console.log(`Frame map built: ${map.size} frames with detections`)
//     }

//     frameDetectionMap.current = map
//   }, [data])

//   // Load video file
//   useEffect(() => {
//     if (videoRef.current && videoFile) {
//       const url = URL.createObjectURL(videoFile)
//       videoRef.current.src = url

//       return () => {
//         URL.revokeObjectURL(url)
//       }
//     }
//   }, [videoFile])

//   // Setup canvas resolution with performance optimizations
//   useEffect(() => {
//     const video = videoRef.current
//     const canvas = canvasRef.current

//     if (!video || !canvas) return

//     const setupResolution = () => {
//       // Set canvas internal resolution to match backend data
//       canvas.width = data.video_info.width
//       canvas.height = data.video_info.height

//       // Set display size to match video element
//       const rect = video.getBoundingClientRect()
//       canvas.style.width = `${rect.width}px`
//       canvas.style.height = `${rect.height}px`
      
//       // Enable GPU acceleration
//       canvas.style.willChange = 'transform'
//     }

//     video.addEventListener("loadedmetadata", setupResolution)
//     window.addEventListener("resize", setupResolution)

//     return () => {
//       video.removeEventListener("loadedmetadata", setupResolution)
//       window.removeEventListener("resize", setupResolution)
//     }
//   }, [data.video_info.width, data.video_info.height])

//   // Add detection log with deduplication and size limit
//   const addDetectionLog = useCallback((frame: number, detections: any[]) => {
//     // Skip if already logged this frame
//     if (loggedFrames.current.has(frame)) return
    
//     loggedFrames.current.add(frame)
    
//     setLogs((prev) => {
//       const newLog: DetectionLog = {
//         frame,
//         detections: detections.map((det) => ({
//           pothole_id: det.pothole_id,
//           bbox: det.bbox,
//           confidence: det.confidence,
//         })),
//         timestamp: new Date().toLocaleTimeString(),
//       }
      
//       // Keep only MAX_LOGS entries
//       const updated = [newLog, ...prev].slice(0, MAX_LOGS)
//       return updated
//     })
//   }, [])

//   // Core drawing logic extracted for reuse (optimized for performance)
//   const drawFrameDetections = useCallback((frame: number, shouldLog: boolean = true) => {
//     const canvas = canvasRef.current
//     if (!canvas) return

//     const ctx = canvas.getContext("2d", { alpha: false, desynchronized: true })
//     if (!ctx) return

//     // Get detections for current frame
//     const detections = frameDetectionMap.current.get(frame)
//     const detCount = detections?.length || 0
    
//     // Batch state updates to minimize re-renders
//     setCurrentFrame(frame)
//     setDetectionsCount(detCount)

//     // Clear canvas (fast method)
//     canvas.width = canvas.width

//     if (detections && detections.length > 0) {
//       // Add log entry (with deduplication) only during playback
//       if (shouldLog) {
//         addDetectionLog(frame, detections)
//       }

//       // Batch all drawing operations
//       ctx.save()
//       ctx.lineWidth = 3
//       ctx.font = "bold 14px system-ui"

//       // Draw all detections in one pass
//       detections.forEach((det) => {
//         const { x1, y1, x2, y2 } = det.bbox
//         const width = x2 - x1
//         const height = y2 - y1

//         // Draw bounding box
//         ctx.strokeStyle = "#ef4444"
//         ctx.strokeRect(x1, y1, width, height)

//         // Draw semi-transparent fill
//         ctx.fillStyle = "rgba(239, 68, 68, 0.15)"
//         ctx.fillRect(x1, y1, width, height)

//         // Draw label
//         const label = `Pothole #${det.pothole_id} (${(det.confidence * 100).toFixed(0)}%)`
//         const textWidth = ctx.measureText(label).width
        
//         ctx.fillStyle = "rgba(239, 68, 68, 0.95)"
//         ctx.fillRect(x1, y1 - 26, textWidth + 16, 26)

//         ctx.fillStyle = "#ffffff"
//         ctx.fillText(label, x1 + 8, y1 - 8)
//       })

//       ctx.restore()
//     }
//   }, [addDetectionLog])

//   // Optimized drawing function with batched state updates
//   const drawDetections = useCallback(() => {
//     const video = videoRef.current
//     const canvas = canvasRef.current

//     if (!video || !canvas) {
//       animationFrameRef.current = requestAnimationFrame(drawDetections)
//       return
//     }

//     // Skip drawing if video is paused or ended
//     if (video.paused || video.ended) {
//       animationFrameRef.current = requestAnimationFrame(drawDetections)
//       return
//     }

//     // Calculate current frame
//     const frame = Math.floor(video.currentTime * data.video_info.fps)
    
//     // Only update if frame has changed
//     if (frame !== lastProcessedFrame.current) {
//       lastProcessedFrame.current = frame
//       drawFrameDetections(frame, true)
//     }

//     animationFrameRef.current = requestAnimationFrame(drawDetections)
//   }, [data.video_info.fps, drawFrameDetections])

//   // Start/stop animation loop
//   useEffect(() => {
//     animationFrameRef.current = requestAnimationFrame(drawDetections)

//     return () => {
//       if (animationFrameRef.current) {
//         cancelAnimationFrame(animationFrameRef.current)
//       }
//     }
//   }, [drawDetections])

//   // Handle video end - show summary
//   useEffect(() => {
//     const video = videoRef.current
//     if (!video) return

//     const handleEnded = () => {
//       setShowSummary(true)
//       setTimeout(() => {
//         setLogs((prev) => {
//           const summaryLog: DetectionLog = {
//             frame: -1,
//             detections: [],
//             timestamp: new Date().toLocaleTimeString(),
//           }
//           return [summaryLog, ...prev].slice(0, MAX_LOGS)
//         })
//       }, 500)
//     }

//     video.addEventListener("ended", handleEnded)

//     return () => {
//       video.removeEventListener("ended", handleEnded)
//     }
//   }, [data])

//   // Handle seeking with high-performance sync matching video FPS
//   useEffect(() => {
//     const video = videoRef.current
//     if (!video) return

//     let isSeeking = false
//     let seekingRaf: number | null = null

//     const updateFrame = () => {
//       const frame = Math.floor(video.currentTime * data.video_info.fps)
//       if (frame !== lastProcessedFrame.current) {
//         lastProcessedFrame.current = frame
//         drawFrameDetections(frame, false)
//       }
//     }

//     const syncLoop = () => {
//       if (isSeeking) {
//         updateFrame()
//         seekingRaf = requestAnimationFrame(syncLoop)
//       }
//     }

//     const handleSeeking = () => {
//       // Start continuous sync loop during scrubbing
//       if (!isSeeking) {
//         isSeeking = true
//         syncLoop()
//       }
//     }

//     const handleSeeked = () => {
//       // Stop sync loop when scrubbing ends
//       isSeeking = false
//       if (seekingRaf) {
//         cancelAnimationFrame(seekingRaf)
//         seekingRaf = null
//       }
//       loggedFrames.current.clear()
//       updateFrame()
//     }

//     const handleTimeUpdate = () => {
//       // Update when paused but not seeking
//       if (video.paused && !isSeeking) {
//         updateFrame()
//       }
//     }

//     const handleLoadedData = () => {
//       // Draw initial frame when video loads
//       updateFrame()
//     }

//     const handlePlay = () => {
//       if (video.currentTime < 1) {
//         setLogs([])
//         loggedFrames.current.clear()
//         lastProcessedFrame.current = -1
//       }
//     }

//     video.addEventListener("seeking", handleSeeking)
//     video.addEventListener("seeked", handleSeeked)
//     video.addEventListener("timeupdate", handleTimeUpdate)
//     video.addEventListener("loadeddata", handleLoadedData)
//     video.addEventListener("play", handlePlay)

//     return () => {
//       isSeeking = false
//       if (seekingRaf) cancelAnimationFrame(seekingRaf)
//       video.removeEventListener("seeking", handleSeeking)
//       video.removeEventListener("seeked", handleSeeked)
//       video.removeEventListener("timeupdate", handleTimeUpdate)
//       video.removeEventListener("loadeddata", handleLoadedData)
//       video.removeEventListener("play", handlePlay)
//     }
//   }, [data.video_info.fps, drawFrameDetections])

//   return (
//     <Card>
//       <CardHeader>
//         <CardTitle>Video Playback with Detection</CardTitle>
//         <CardDescription>Watch the analyzed video with real-time bounding box overlays</CardDescription>
//       </CardHeader>
//       <CardContent>
//         <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
//           {/* Video Player */}
//           <div className="lg:col-span-2 space-y-4">
//             <div ref={containerRef} className="relative bg-black rounded-lg overflow-hidden">
//               <video
//                 ref={videoRef}
//                 controls
//                 className="w-full h-auto"
//                 style={{
//                   aspectRatio: `${data.video_info.width} / ${data.video_info.height}`,
//                 }}
//               />
//               <canvas 
//                 ref={canvasRef} 
//                 className="absolute inset-0 pointer-events-none"
//                 style={{ objectFit: 'contain' }}
//               />
//             </div>

//             {/* Video Info */}
//             <div className="flex flex-wrap gap-4 text-sm">
//               <div className="flex items-center gap-2">
//                 <span className="text-muted-foreground">Current Frame:</span>
//                 <Badge variant="secondary">{currentFrame}</Badge>
//               </div>
//               <div className="flex items-center gap-2">
//                 <span className="text-muted-foreground">Detections:</span>
//                 <Badge variant={detectionsCount > 0 ? "destructive" : "secondary"}>{detectionsCount}</Badge>
//               </div>
//               <div className="flex items-center gap-2">
//                 <span className="text-muted-foreground">Resolution:</span>
//                 <Badge variant="outline">
//                   {data.video_info.width}×{data.video_info.height}
//                 </Badge>
//               </div>
//               <div className="flex items-center gap-2">
//                 <span className="text-muted-foreground">FPS:</span>
//                 <Badge variant="outline">{data.video_info.fps.toFixed(1)}</Badge>
//               </div>
//             </div>
//           </div>

//           {/* Detection Logs */}
//           <div className="space-y-4">
//             <div>
//               <h4 className="text-sm font-semibold mb-2">Detection Logs</h4>
//               <p className="text-xs text-muted-foreground mb-3">Real-time frame-by-frame detection tracking (last {MAX_LOGS})</p>
//             </div>
//             <ScrollArea className="h-[400px] rounded-md border bg-muted/30 p-4">
//               <div className="space-y-2">
//                 {logs.length === 0 ? (
//                   <p className="text-sm text-muted-foreground text-center py-8">Play the video to see detection logs</p>
//                 ) : (
//                   logs.map((log, index) => (
//                     log.frame === -1 ? (
//                       // Summary entry
//                       <div
//                         key={`summary-${index}`}
//                         className="text-xs p-4 bg-green-50 dark:bg-green-950 rounded-md border-l-4 border-green-500"
//                       >
//                         <div className="font-bold text-green-700 dark:text-green-300 mb-3 text-sm">
//                           📊 DETECTION SUMMARY
//                         </div>
//                         <div className="space-y-1.5 text-foreground">
//                           <div className="flex justify-between">
//                             <span className="font-medium">Unique Potholes:</span>
//                             <span className="font-bold">{data.summary.unique_potholes}</span>
//                           </div>
//                           <div className="flex justify-between">
//                             <span className="font-medium">Total Detections:</span>
//                             <span className="font-bold">{data.summary.total_detections}</span>
//                           </div>
//                           <div className="flex justify-between">
//                             <span className="font-medium">Total Frames:</span>
//                             <span className="font-bold">{data.summary.total_frames}</span>
//                           </div>
//                           <div className="flex justify-between">
//                             <span className="font-medium">Detection Rate:</span>
//                             <span className="font-bold">{data.summary.detection_rate.toFixed(1)}%</span>
//                           </div>
//                           <div className="flex justify-between">
//                             <span className="font-medium">Video FPS:</span>
//                             <span className="font-bold">{data.video_info.fps.toFixed(1)}</span>
//                           </div>
//                           <div className="flex justify-between">
//                             <span className="font-medium">Resolution:</span>
//                             <span className="font-bold">{data.video_info.width}×{data.video_info.height}</span>
//                           </div>
//                         </div>
//                       </div>
//                     ) : (
//                       // Detection entry
//                       <div
//                         key={`${log.frame}-${index}`}
//                         className="text-xs p-3 bg-card rounded-md border-l-2 border-red-500"
//                       >
//                         <div className="flex items-center justify-between mb-2">
//                           <span className="font-semibold text-foreground">Frame: {log.frame}</span>
//                           <span className="text-muted-foreground text-[10px]">{log.timestamp}</span>
//                         </div>

//                         {log.detections.length === 0 ? (
//                           <div className="text-muted-foreground">No detections</div>
//                         ) : (
//                           <div className="space-y-2">
//                             {log.detections.map((det, idx) => (
//                               <div key={idx} className="space-y-1">
//                                 <div className="font-medium text-foreground">
//                                   Pothole ID: {det.pothole_id} | Confidence: {(det.confidence * 100).toFixed(1)}%
//                                 </div>
//                                 <div className="text-muted-foreground font-mono text-[10px]">
//                                   Coordinates: ({Math.round(det.bbox.x1)}, {Math.round(det.bbox.y1)}) → ({Math.round(det.bbox.x2)}, {Math.round(det.bbox.y2)})
//                                 </div>
//                               </div>
//                             ))}
//                           </div>
//                         )}
//                       </div>
//                     )
//                   ))
//                 )}
//               </div>
//             </ScrollArea>
//           </div>
//         </div>
//       </CardContent>
//     </Card>
//   )
// }





//************************************Perfect working ********************************************8

// "use client"

// import { useEffect, useRef, useState, useCallback } from "react"
// import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
// import { ScrollArea } from "@/components/ui/scroll-area"
// import { Badge } from "@/components/ui/badge"

// type DetectionData = {
//   frames: Array<{
//     frame_id: number
//     potholes: Array<{
//       pothole_id: number
//       bbox: { x1: number; y1: number; x2: number; y2: number }
//       confidence: number
//     }>
//   }>
//   video_info: {
//     width: number
//     height: number
//     fps: number
//     total_frames: number
//   }
//   summary: {
//     unique_potholes: number
//     total_detections: number
//     total_frames: number
//     detection_rate: number
//   }
// }

// type VideoPlayerSectionProps = {
//   data: DetectionData
//   videoFile: File
// }

// type DetectionLog = {
//   frame: number
//   detections: Array<{
//     pothole_id: number
//     bbox: { x1: number; y1: number; x2: number; y2: number }
//     confidence: number
//   }>
//   timestamp: string
// }

// export default function VideoPlayerSection({ data, videoFile }: VideoPlayerSectionProps) {
//   const videoRef = useRef<HTMLVideoElement>(null)
//   const canvasRef = useRef<HTMLCanvasElement>(null)
//   const containerRef = useRef<HTMLDivElement>(null)
//   const animationFrameRef = useRef<number | null>(null)
//   const [currentFrame, setCurrentFrame] = useState(0)
//   const [detectionsCount, setDetectionsCount] = useState(0)
//   const [logs, setLogs] = useState<DetectionLog[]>([])
//   const [showSummary, setShowSummary] = useState(false)
//   const frameDetectionMap = useRef<Map<number, any[]>>(new Map())
//   const lastProcessedFrame = useRef(-1)
//   const loggedFrames = useRef<Set<number>>(new Set())
//   const MAX_LOGS = 0 // Limit log entries to prevent memory issues

//   // Build optimized frame detection map
//   useEffect(() => {
//     const map = new Map()

//     if (data.frames && Array.isArray(data.frames)) {
//       console.log(`Building frame map from ${data.frames.length} frames`)
//       data.frames.forEach((frameData) => {
//         const frameId = frameData.frame_id
//         const potholes = frameData.potholes || []

//         if (potholes.length > 0) {
//           map.set(frameId, potholes)
//         }
//       })
//       console.log(`Frame map built: ${map.size} frames with detections`)
//     }

//     frameDetectionMap.current = map
//   }, [data])

//   // Load video file
//   useEffect(() => {
//     if (videoRef.current && videoFile) {
//       const url = URL.createObjectURL(videoFile)
//       videoRef.current.src = url

//       return () => {
//         URL.revokeObjectURL(url)
//       }
//     }
//   }, [videoFile])

//   // Setup canvas resolution with performance optimizations
//   useEffect(() => {
//     const video = videoRef.current
//     const canvas = canvasRef.current

//     if (!video || !canvas) return

//     const setupResolution = () => {
//       // Set canvas internal resolution to match backend data
//       canvas.width = data.video_info.width
//       canvas.height = data.video_info.height

//       // Set display size to match video element
//       const rect = video.getBoundingClientRect()
//       canvas.style.width = `${rect.width}px`
//       canvas.style.height = `${rect.height}px`
      
//       // Enable GPU acceleration
//       canvas.style.willChange = 'transform'
      
//       // Ensure canvas is transparent
//       const ctx = canvas.getContext("2d", { alpha: true })
//       if (ctx) {
//         ctx.clearRect(0, 0, canvas.width, canvas.height)
//       }
//     }

//     video.addEventListener("loadedmetadata", setupResolution)
//     window.addEventListener("resize", setupResolution)

//     return () => {
//       video.removeEventListener("loadedmetadata", setupResolution)
//       window.removeEventListener("resize", setupResolution)
//     }
//   }, [data.video_info.width, data.video_info.height])

//   // Add detection log with deduplication and size limit
//   const addDetectionLog = useCallback((frame: number, detections: any[]) => {
//     // Skip if already logged this frame
//     if (loggedFrames.current.has(frame)) return
    
//     loggedFrames.current.add(frame)
    
//     setLogs((prev) => {
//       const newLog: DetectionLog = {
//         frame,
//         detections: detections.map((det) => ({
//           pothole_id: det.pothole_id,
//           bbox: det.bbox,
//           confidence: det.confidence,
//         })),
//         timestamp: new Date().toLocaleTimeString(),
//       }
      
//       // Keep only MAX_LOGS entries
//       const updated = [newLog, ...prev].slice(0, MAX_LOGS)
//       return updated
//     })
//   }, [])

//   // Core drawing logic extracted for reuse (heavily optimized for performance)
//   const drawFrameDetections = useCallback((frame: number, shouldLog: boolean = true) => {
//     const canvas = canvasRef.current
//     if (!canvas) return

//     const ctx = canvas.getContext("2d", { 
//       alpha: true, 
//       desynchronized: true,
//       willReadFrequently: false 
//     })
//     if (!ctx) return

//     // Get detections for current frame
//     const detections = frameDetectionMap.current.get(frame)
//     const detCount = detections?.length || 0
    
//     // Clear canvas first for instant visual update
//     ctx.clearRect(0, 0, canvas.width, canvas.height)

//     // Batch state updates AFTER clearing to minimize re-renders blocking draw
//     requestAnimationFrame(() => {
//       setCurrentFrame(frame)
//       setDetectionsCount(detCount)
//     })

//     if (detections && detections.length > 0) {
//       // Add log entry (with deduplication) only during playback
//       if (shouldLog) {
//         requestAnimationFrame(() => addDetectionLog(frame, detections))
//       }

//       // Optimized drawing with minimal state changes
//       ctx.lineWidth = 3
//       ctx.font = "bold 14px system-ui"

//       // Draw all boxes first (single pass)
//       ctx.strokeStyle = "#ef4444"
//       ctx.fillStyle = "rgba(239, 68, 68, 0.15)"
//       detections.forEach((det) => {
//         const { x1, y1, x2, y2 } = det.bbox
//         const w = x2 - x1
//         const h = y2 - y1
//         ctx.strokeRect(x1, y1, w, h)
//         ctx.fillRect(x1, y1, w, h)
//       })

//       // Draw all labels second (single pass)
//       ctx.fillStyle = "rgba(239, 68, 68, 0.95)"
//       detections.forEach((det) => {
//         const { x1, y1 } = det.bbox
//         const label = `Pothole #${det.pothole_id} (${(det.confidence * 100).toFixed(0)}%)`
//         const textWidth = ctx.measureText(label).width
//         ctx.fillRect(x1, y1 - 26, textWidth + 16, 26)
//       })

//       // Draw all text third (single pass)
//       ctx.fillStyle = "#ffffff"
//       detections.forEach((det) => {
//         const { x1, y1 } = det.bbox
//         const label = `Pothole #${det.pothole_id} (${(det.confidence * 100).toFixed(0)}%)`
//         ctx.fillText(label, x1 + 8, y1 - 8)
//       })
//     }
//   }, [addDetectionLog])

//   // Optimized drawing function with batched state updates
//   const drawDetections = useCallback(() => {
//     const video = videoRef.current
//     const canvas = canvasRef.current

//     if (!video || !canvas) {
//       animationFrameRef.current = requestAnimationFrame(drawDetections)
//       return
//     }

//     // Calculate current frame with proper rounding for accuracy
//     // Add small epsilon to handle floating point precision
//     const frame = Math.round(video.currentTime * data.video_info.fps)
    
//     // Update on every frame during playback for smooth tracking
//     if (!video.paused && !video.ended && frame !== lastProcessedFrame.current) {
//       lastProcessedFrame.current = frame
//       drawFrameDetections(frame, true)
//     }

//     animationFrameRef.current = requestAnimationFrame(drawDetections)
//   }, [data.video_info.fps, drawFrameDetections])

//   // Start/stop animation loop
//   useEffect(() => {
//     animationFrameRef.current = requestAnimationFrame(drawDetections)

//     return () => {
//       if (animationFrameRef.current) {
//         cancelAnimationFrame(animationFrameRef.current)
//       }
//     }
//   }, [drawDetections])

//   // Handle video end - show summary
//   useEffect(() => {
//     const video = videoRef.current
//     if (!video) return

//     const handleEnded = () => {
//       setShowSummary(true)
//       // Add summary log immediately
//       const summaryLog: DetectionLog = {
//         frame: -1,
//         detections: [],
//         timestamp: new Date().toLocaleTimeString(),
//       }
//       setLogs((prev) => [summaryLog, ...prev].slice(0, MAX_LOGS))
//     }

//     video.addEventListener("ended", handleEnded)

//     return () => {
//       video.removeEventListener("ended", handleEnded)
//     }
//   }, [data])

//   // Handle seeking with ultra-smooth scrubbing and instant bbox sync
//   useEffect(() => {
//     const video = videoRef.current
//     if (!video) return

//     let isSeeking = false
//     let seekingRaf: number | null = null

//     const updateFrame = () => {
//       // Use Math.round for more accurate frame calculation
//       const frame = Math.round(video.currentTime * data.video_info.fps)
//       if (frame !== lastProcessedFrame.current) {
//         lastProcessedFrame.current = frame
//         drawFrameDetections(frame, false)
//       }
//     }

//     // Ultra high-frequency update loop during scrubbing for instant feedback
//     const syncLoop = () => {
//       if (isSeeking) {
//         updateFrame() // Update on every animation frame for instant response
//         seekingRaf = requestAnimationFrame(syncLoop)
//       }
//     }

//     const handleSeeking = () => {
//       // Start instant sync loop during scrubbing
//       if (!isSeeking) {
//         isSeeking = true
//         updateFrame() // Immediate first update
//         syncLoop()
//       }
//     }

//     const handleSeeked = () => {
//       // Stop sync loop and do final update when scrubbing ends
//       isSeeking = false
//       if (seekingRaf) {
//         cancelAnimationFrame(seekingRaf)
//         seekingRaf = null
//       }
//       loggedFrames.current.clear()
//       updateFrame() // Immediate final update
//     }

//     const handleTimeUpdate = () => {
//       // Instant update when paused for frame-by-frame navigation
//       if (video.paused && !isSeeking) {
//         updateFrame()
//       }
//     }

//     const handleLoadedData = () => {
//       // Draw initial frame immediately when video loads
//       updateFrame()
//     }

//     const handlePlay = () => {
//       // Reset logs when starting from beginning
//       if (video.currentTime < 0.1) {
//         setLogs([])
//         loggedFrames.current.clear()
//         lastProcessedFrame.current = -1
//       }
//     }

//     const handlePause = () => {
//       // Instant update when pausing
//       updateFrame()
//     }

//     video.addEventListener("seeking", handleSeeking)
//     video.addEventListener("seeked", handleSeeked)
//     video.addEventListener("timeupdate", handleTimeUpdate)
//     video.addEventListener("loadeddata", handleLoadedData)
//     video.addEventListener("play", handlePlay)
//     video.addEventListener("pause", handlePause)

//     return () => {
//       isSeeking = false
//       if (seekingRaf) cancelAnimationFrame(seekingRaf)
//       video.removeEventListener("seeking", handleSeeking)
//       video.removeEventListener("seeked", handleSeeked)
//       video.removeEventListener("timeupdate", handleTimeUpdate)
//       video.removeEventListener("loadeddata", handleLoadedData)
//       video.removeEventListener("play", handlePlay)
//       video.removeEventListener("pause", handlePause)
//     }
//   }, [data.video_info.fps, drawFrameDetections])

//   return (
//     <Card>
//       <CardHeader>
//         <CardTitle>Video Playback with Detection</CardTitle>
//         <CardDescription>Watch the analyzed video with real-time bounding box overlays</CardDescription>
//       </CardHeader>
//       <CardContent>
//         <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
//           {/* Video Player */}
//           <div className="lg:col-span-2 space-y-4">
//             <div ref={containerRef} className="relative bg-black rounded-lg overflow-hidden">
//               <video
//                 ref={videoRef}
//                 controls
//                 className="w-full h-auto"
//                 style={{
//                   aspectRatio: `${data.video_info.width} / ${data.video_info.height}`,
//                 }}
//               />
//               <canvas 
//                 ref={canvasRef} 
//                 className="absolute inset-0 pointer-events-none"
//                 style={{ objectFit: 'contain' }}
//               />
//             </div>

//             {/* Video Info */}
//             <div className="flex flex-wrap gap-4 text-sm">
//               <div className="flex items-center gap-2">
//                 <span className="text-muted-foreground">Current Frame:</span>
//                 <Badge variant="secondary">{currentFrame}</Badge>
//               </div>
//               <div className="flex items-center gap-2">
//                 <span className="text-muted-foreground">Detections:</span>
//                 <Badge variant={detectionsCount > 0 ? "destructive" : "secondary"}>{detectionsCount}</Badge>
//               </div>
//               <div className="flex items-center gap-2">
//                 <span className="text-muted-foreground">Resolution:</span>
//                 <Badge variant="outline">
//                   {data.video_info.width}×{data.video_info.height}
//                 </Badge>
//               </div>
//               <div className="flex items-center gap-2">
//                 <span className="text-muted-foreground">FPS:</span>
//                 <Badge variant="outline">{data.video_info.fps.toFixed(1)}</Badge>
//               </div>
//             </div>
//           </div>

//           {/* Detection Logs */}
//           <div className="space-y-4">
//             <div>
//               <h4 className="text-sm font-semibold mb-2">Detection Logs</h4>
//               <p className="text-xs text-muted-foreground mb-3">Real-time frame-by-frame detection tracking (last {MAX_LOGS})</p>
//             </div>
//             <ScrollArea className="h-[400px] rounded-md border bg-muted/30 p-4">
//               <div className="space-y-2">
//                 {logs.length === 0 ? (
//                   <p className="text-sm text-muted-foreground text-center py-8">Play the video to see detection logs</p>
//                 ) : (
//                   logs.map((log, index) => (
//                     log.frame === -1 ? (
//                       // Summary entry
//                       <div
//                         key={`summary-${index}`}
//                         className="text-xs p-4 bg-green-50 dark:bg-green-950 rounded-md border-l-4 border-green-500"
//                       >
//                         <div className="font-bold text-green-700 dark:text-green-300 mb-3 text-sm">
//                           DETECTION SUMMARY
//                         </div>
//                         <div className="space-y-1.5 text-foreground">
//                           {/* <div className="flex justify-between">
//                             <span className="font-medium">Unique Potholes:</span>
//                             <span className="font-bold">{data.summary.unique_potholes}</span>
//                           </div> */}
//                           <div className="flex justify-between">
//                             <span className="font-medium">Total Detections:</span>
//                             <span className="font-bold">{data.summary.total_detections}</span>
//                           </div>
//                           <div className="flex justify-between">
//                             <span className="font-medium">Total Frames:</span>
//                             <span className="font-bold">{data.summary.total_frames}</span>
//                           </div>
//                           <div className="flex justify-between">
//                             <span className="font-medium">Detection Rate:</span>
//                             <span className="font-bold">{data.summary.detection_rate.toFixed(1)}%</span>
//                           </div>
//                           <div className="flex justify-between">
//                             <span className="font-medium">Video FPS:</span>
//                             <span className="font-bold">{data.video_info.fps.toFixed(1)}</span>
//                           </div>
//                           <div className="flex justify-between">
//                             <span className="font-medium">Resolution:</span>
//                             <span className="font-bold">{data.video_info.width}×{data.video_info.height}</span>
//                           </div>
//                         </div>
//                       </div>
//                     ) : (
//                       // Detection entry
//                       <div
//                         key={`${log.frame}-${index}`}
//                         className="text-xs p-3 bg-card rounded-md border-l-2 border-red-500"
//                       >
//                         <div className="flex items-center justify-between mb-2">
//                           <span className="font-semibold text-foreground">Frame: {log.frame}</span>
//                           <span className="text-muted-foreground text-[10px]">{log.timestamp}</span>
//                         </div>

//                         {log.detections.length === 0 ? (
//                           <div className="text-muted-foreground">No detections</div>
//                         ) : (
//                           <div className="space-y-2">
//                             {log.detections.map((det, idx) => (
//                               <div key={idx} className="space-y-1">
//                                 <div className="font-medium text-foreground">
//                                   Pothole ID: {det.pothole_id} | Confidence: {(det.confidence * 100).toFixed(1)}%
//                                 </div>
//                                 <div className="text-muted-foreground font-mono text-[10px]">
//                                   Coordinates: ({Math.round(det.bbox.x1)}, {Math.round(det.bbox.y1)}) → ({Math.round(det.bbox.x2)}, {Math.round(det.bbox.y2)})
//                                 </div>
//                               </div>
//                             ))}
//                           </div>
//                         )}
//                       </div>
//                     )
//                   ))
//                 )}
//               </div>
//             </ScrollArea>
//           </div>
//         </div>
//       </CardContent>
//     </Card>
//   )
// }




import { useEffect, useRef, useState, useCallback } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Badge } from "@/components/ui/badge"
import { Target, AlertTriangle, Film, Activity, Gauge, Monitor } from "lucide-react"

type DetectionData = {
  frames: Array<{
    frame_id: number
    potholes: Array<{
      pothole_id: number
      bbox: { x1: number; y1: number; x2: number; y2: number }
      confidence: number
    }>
  }>
  video_info: {
    width: number
    height: number
    fps: number
    total_frames: number
  }
  summary: {
    unique_potholes: number
    total_detections: number
    total_frames: number
    detection_rate: number
  }
}

type VideoPlayerSectionProps = {
  data: DetectionData
  videoFile: File
}

type DetectionLog = {
  frame: number
  detections: Array<{
    pothole_id: number
    bbox: { x1: number; y1: number; x2: number; y2: number }
    confidence: number
  }>
  timestamp: string
}

function SummarySection({ data, show }: { data: DetectionData; show: boolean }) {
  if (!show) return null

  const stats = [
    {
      label: "Unique Potholes",
      value: data.summary.unique_potholes || 0,
      icon: AlertTriangle,
      color: "text-red-500",
      bgColor: "bg-red-50 dark:bg-red-950/30",
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
        <CardDescription>Overview of pothole detection results</CardDescription>
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

export default function VideoPlayerSection({ data, videoFile }: VideoPlayerSectionProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const animationFrameRef = useRef<number | null>(null)
  const [currentFrame, setCurrentFrame] = useState(0)
  const [detectionsCount, setDetectionsCount] = useState(0)
  const [logs, setLogs] = useState<DetectionLog[]>([])
  const [showSummary, setShowSummary] = useState(false)
  const [hasPlayedOnce, setHasPlayedOnce] = useState(false)
  const frameDetectionMap = useRef<Map<number, any[]>>(new Map())
  const lastProcessedFrame = useRef(-1)
  const loggedFrames = useRef<Set<number>>(new Set())
  const MAX_LOGS = 50 // Changed from 0 to 50

  // Build optimized frame detection map
  useEffect(() => {
    const map = new Map()

    if (data.frames && Array.isArray(data.frames)) {
      console.log(`Building frame map from ${data.frames.length} frames`)
      data.frames.forEach((frameData) => {
        const frameId = frameData.frame_id
        const potholes = frameData.potholes || []

        if (potholes.length > 0) {
          map.set(frameId, potholes)
        }
      })
      console.log(`Frame map built: ${map.size} frames with detections`)
    }

    frameDetectionMap.current = map
  }, [data])

  // Load video file
  useEffect(() => {
    if (videoRef.current && videoFile) {
      const url = URL.createObjectURL(videoFile)
      videoRef.current.src = url

      return () => {
        URL.revokeObjectURL(url)
      }
    }
  }, [videoFile])

  // Setup canvas resolution with performance optimizations
  useEffect(() => {
    const video = videoRef.current
    const canvas = canvasRef.current

    if (!video || !canvas) return

    const setupResolution = () => {
      canvas.width = data.video_info.width
      canvas.height = data.video_info.height

      const rect = video.getBoundingClientRect()
      canvas.style.width = `${rect.width}px`
      canvas.style.height = `${rect.height}px`
      
      canvas.style.willChange = 'transform'
      
      const ctx = canvas.getContext("2d", { alpha: true })
      if (ctx) {
        ctx.clearRect(0, 0, canvas.width, canvas.height)
      }
    }

    video.addEventListener("loadedmetadata", setupResolution)
    window.addEventListener("resize", setupResolution)

    return () => {
      video.removeEventListener("loadedmetadata", setupResolution)
      window.removeEventListener("resize", setupResolution)
    }
  }, [data.video_info.width, data.video_info.height])

  // Add detection log with deduplication and size limit
  const addDetectionLog = useCallback((frame: number, detections: any[]) => {
    if (loggedFrames.current.has(frame)) return
    
    loggedFrames.current.add(frame)
    
    setLogs((prev) => {
      const newLog: DetectionLog = {
        frame,
        detections: detections.map((det) => ({
          pothole_id: det.pothole_id,
          bbox: det.bbox,
          confidence: det.confidence,
        })),
        timestamp: new Date().toLocaleTimeString(),
      }
      
      const updated = [newLog, ...prev].slice(0, MAX_LOGS)
      return updated
    })
  }, [])

  // Core drawing logic extracted for reuse
  const drawFrameDetections = useCallback((frame: number, shouldLog: boolean = true) => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d", { 
      alpha: true, 
      desynchronized: true,
      willReadFrequently: false 
    })
    if (!ctx) return

    const detections = frameDetectionMap.current.get(frame)
    const detCount = detections?.length || 0
    
    ctx.clearRect(0, 0, canvas.width, canvas.height)

    requestAnimationFrame(() => {
      setCurrentFrame(frame)
      setDetectionsCount(detCount)
    })

    if (detections && detections.length > 0) {
      if (shouldLog) {
        requestAnimationFrame(() => addDetectionLog(frame, detections))
      }

      ctx.lineWidth = 3
      ctx.font = "bold 14px system-ui"

      ctx.strokeStyle = "#ef4444"
      ctx.fillStyle = "rgba(239, 68, 68, 0.15)"
      detections.forEach((det) => {
        const { x1, y1, x2, y2 } = det.bbox
        const w = x2 - x1
        const h = y2 - y1
        ctx.strokeRect(x1, y1, w, h)
        ctx.fillRect(x1, y1, w, h)
      })

      ctx.fillStyle = "rgba(239, 68, 68, 0.95)"
      detections.forEach((det) => {
        const { x1, y1 } = det.bbox
        const label = `Pothole #${det.pothole_id} (${(det.confidence * 100).toFixed(0)}%)`
        const textWidth = ctx.measureText(label).width
        ctx.fillRect(x1, y1 - 26, textWidth + 16, 26)
      })

      ctx.fillStyle = "#ffffff"
      detections.forEach((det) => {
        const { x1, y1 } = det.bbox
        const label = `Pothole #${det.pothole_id} (${(det.confidence * 100).toFixed(0)}%)`
        ctx.fillText(label, x1 + 8, y1 - 8)
      })
    }
  }, [addDetectionLog])

  // Optimized drawing function
  const drawDetections = useCallback(() => {
    const video = videoRef.current
    const canvas = canvasRef.current

    if (!video || !canvas) {
      animationFrameRef.current = requestAnimationFrame(drawDetections)
      return
    }

    const frame = Math.round(video.currentTime * data.video_info.fps)
    
    if (!video.paused && !video.ended && frame !== lastProcessedFrame.current) {
      lastProcessedFrame.current = frame
      drawFrameDetections(frame, true)
    }

    animationFrameRef.current = requestAnimationFrame(drawDetections)
  }, [data.video_info.fps, drawFrameDetections])

  // Start/stop animation loop
  useEffect(() => {
    animationFrameRef.current = requestAnimationFrame(drawDetections)

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current)
      }
    }
  }, [drawDetections])

  // Handle video end - show summary and mark as played once
  useEffect(() => {
    const video = videoRef.current
    if (!video) return

    const handleEnded = () => {
      // Only show summary and mark as played once on first complete playback
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

  // Handle seeking
  useEffect(() => {
    const video = videoRef.current
    if (!video) return

    let isSeeking = false
    let seekingRaf: number | null = null

    const updateFrame = () => {
      const frame = Math.round(video.currentTime * data.video_info.fps)
      if (frame !== lastProcessedFrame.current) {
        lastProcessedFrame.current = frame
        drawFrameDetections(frame, false)
      }
    }

    const syncLoop = () => {
      if (isSeeking) {
        updateFrame()
        seekingRaf = requestAnimationFrame(syncLoop)
      }
    }

    const handleSeeking = () => {
      if (!isSeeking) {
        isSeeking = true
        updateFrame()
        syncLoop()
      }
    }

    const handleSeeked = () => {
      isSeeking = false
      if (seekingRaf) {
        cancelAnimationFrame(seekingRaf)
        seekingRaf = null
      }
      loggedFrames.current.clear()
      updateFrame()
    }

    const handleTimeUpdate = () => {
      if (video.paused && !isSeeking) {
        updateFrame()
      }
    }

    const handleLoadedData = () => {
      updateFrame()
    }

    const handlePlay = () => {
      if (video.currentTime < 0.1) {
        setLogs([])
        loggedFrames.current.clear()
        lastProcessedFrame.current = -1
      }
    }

    const handlePause = () => {
      updateFrame()
    }

    video.addEventListener("seeking", handleSeeking)
    video.addEventListener("seeked", handleSeeked)
    video.addEventListener("timeupdate", handleTimeUpdate)
    video.addEventListener("loadeddata", handleLoadedData)
    video.addEventListener("play", handlePlay)
    video.addEventListener("pause", handlePause)

    return () => {
      isSeeking = false
      if (seekingRaf) cancelAnimationFrame(seekingRaf)
      video.removeEventListener("seeking", handleSeeking)
      video.removeEventListener("seeked", handleSeeked)
      video.removeEventListener("timeupdate", handleTimeUpdate)
      video.removeEventListener("loadeddata", handleLoadedData)
      video.removeEventListener("play", handlePlay)
      video.removeEventListener("pause", handlePause)
    }
  }, [data.video_info.fps, drawFrameDetections])

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Video Playback with Detection</CardTitle>
          <CardDescription>Watch the analyzed video with real-time bounding box overlays</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Video Player */}
            <div className="lg:col-span-2 space-y-4">
              <div ref={containerRef} className="relative bg-black rounded-lg overflow-hidden">
                <video
                  ref={videoRef}
                  controls
                  className="w-full h-auto"
                  style={{
                    aspectRatio: `${data.video_info.width} / ${data.video_info.height}`,
                  }}
                />
                <canvas 
                  ref={canvasRef} 
                  className="absolute inset-0 pointer-events-none"
                  style={{ objectFit: 'contain' }}
                />
              </div>

              {/* Video Info */}
              <div className="flex flex-wrap gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <span className="text-muted-foreground">Current Frame:</span>
                  <Badge variant="secondary">{currentFrame}</Badge>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-muted-foreground">Detections:</span>
                  <Badge variant={detectionsCount > 0 ? "destructive" : "secondary"}>{detectionsCount}</Badge>
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
                <p className="text-xs text-muted-foreground mb-3">Real-time frame-by-frame detection tracking (last {MAX_LOGS})</p>
              </div>
              <ScrollArea className="h-[400px] rounded-md border bg-muted/30 p-4">
                <div className="space-y-2">
                  {logs.length === 0 ? (
                    <p className="text-sm text-muted-foreground text-center py-8">Play the video to see detection logs</p>
                  ) : (
                    logs.map((log, index) => (
                      <div
                        key={`${log.frame}-${index}`}
                        className="text-xs p-3 bg-card rounded-md border-l-2 border-red-500"
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
                                  Pothole ID: {det.pothole_id} | Confidence: {(det.confidence * 100).toFixed(1)}%
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
      <SummarySection data={data} show={showSummary} />
    </div>
  )
}