"use client"

import { useState } from "react"
import { UploadSection } from "@/components/upload-section"
import VideoPlayerSection from "@/components/video-player-section"

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
  }>
  signboard_list?: Array<{
    signboard_id: number
    type: string
    first_detected_frame: number
    first_detected_time: number
    confidence: number
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
  const [detectionData, setDetectionData] = useState<DetectionData | null>(null)
  const [videoId, setVideoId] = useState<string | null>(null)
  const [videoFile, setVideoFile] = useState<File | null>(null)
  const [detectionType, setDetectionType] = useState<DetectionType>("pothole-detection")

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

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Header */}
        <div className="mb-8 animate-in fade-in slide-in-from-top duration-700">
          <h1 className="text-4xl font-bold mb-2 text-balance bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
            {getTitle()}
          </h1>
          <p className="text-muted-foreground">{getDescription()}</p>
        </div>

        {/* Upload Section */}
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