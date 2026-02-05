"use client"

import { useState } from "react"
import { UploadSection } from "@/components/upload-section"
import VideoPlayerSection from "@/components/video-player-section"
import { ProjectSelectionSection } from "@/components/project-selection-section"
import { type SessionContext, emptySessionContext } from "@/lib/api"
import { Button } from "@/components/ui/button"
import { ArrowLeft, MapPin, Package, FolderKanban } from "lucide-react"

export type DetectionType = "pothole-detection" | "sign-board-detection"

export type DetectionData = {
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

export default function DetectionPage() {
  const [session, setSession] = useState<SessionContext>(emptySessionContext)
  const [detectionData, setDetectionData] = useState<DetectionData | null>(null)
  const [videoId, setVideoId] = useState<string | null>(null)
  const [videoFile, setVideoFile] = useState<File | null>(null)
  const [detectionType, setDetectionType] = useState<DetectionType>("pothole-detection")

  const isSessionComplete = session.projectId && session.packageId && session.locationId

  const getTitle = () => {
    return detectionType === "pothole-detection"
      ? "Pothole Detection System"
      : "Signboard Detection System"
  }

  const getDescription = () => {
    return detectionType === "pothole-detection"
      ? "Upload a video to detect and track potholes with AI-powered analysis"
      : "Upload a video to detect and identify signboards with AI-powered analysis"
  }

  const handleSelectionComplete = (newSession: SessionContext) => {
    setSession(newSession)
  }

  const handleBackToSelection = () => {
    setSession(emptySessionContext)
    setDetectionData(null)
    setVideoId(null)
    setVideoFile(null)
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Header */}
        <div className="mb-8 animate-in fade-in slide-in-from-top duration-700">
          <h1 className="text-4xl font-bold mb-2 text-balance bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
            {isSessionComplete ? getTitle() : "VisionRoad Detection System"}
          </h1>
          <p className="text-muted-foreground">
            {isSessionComplete ? getDescription() : "Select your project location to begin AI-powered road analysis"}
          </p>
        </div>

        {/* Session Info Bar */}
        {isSessionComplete && (
          <div className="mb-6 animate-in fade-in slide-in-from-top duration-500">
            <div className="flex items-center justify-between p-4 rounded-lg bg-gradient-to-r from-primary/10 via-primary/5 to-transparent border border-primary/20">
              <div className="flex items-center gap-6 text-sm">
                <div className="flex items-center gap-2">
                  <FolderKanban className="h-4 w-4 text-primary" />
                  <span className="text-muted-foreground">Project:</span>
                  <span className="font-medium">{session.projectName}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Package className="h-4 w-4 text-primary" />
                  <span className="text-muted-foreground">Package:</span>
                  <span className="font-medium">{session.packageName}</span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-primary" />
                  <span className="text-muted-foreground">Location:</span>
                  <span className="font-medium">{session.locationName}</span>
                </div>
              </div>
              <Button variant="ghost" size="sm" onClick={handleBackToSelection}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Change Selection
              </Button>
            </div>
          </div>
        )}

        {/* Project Selection Section - Show when session is not complete */}
        {!isSessionComplete && (
          <div className="animate-in fade-in slide-in-from-bottom duration-700 delay-100">
            <ProjectSelectionSection onSelectionComplete={handleSelectionComplete} />
          </div>
        )}

        {/* Upload Section - Show after session is complete */}
        {isSessionComplete && (
          <div className="animate-in fade-in slide-in-from-bottom duration-700 delay-100">
            <UploadSection
              onDetectionComplete={(data, vId, file) => {
                setDetectionData(data)
                setVideoId(vId)
                setVideoFile(file)
              }}
              onDetectionTypeChange={setDetectionType}
            />
          </div>
        )}

        {/* Video Player Section */}
        {detectionData && videoId && videoFile && (
          <div className="mt-6 animate-in fade-in slide-in-from-bottom duration-700 delay-200">
            <VideoPlayerSection
              data={detectionData}
              videoId={videoId}
              videoFile={videoFile}
              detectionType={detectionType}
            />
          </div>
        )}
      </div>
    </div>
  )
}
