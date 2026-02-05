"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Loader2, ArrowLeft, MapPin, Package, FolderKanban, RotateCcw } from "lucide-react"
import VideoPlayerSection from "@/components/video-player-section"
import {
    type SessionContext,
    loadSession,
    loadVideoData,
    isSessionValid,
    clearSession
} from "@/lib/api"
import { getVideoFile, clearVideoFile } from "@/lib/video-storage"

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

export default function ResultsPage() {
    const router = useRouter()
    const [session, setSession] = useState<SessionContext | null>(null)
    const [detectionData, setDetectionData] = useState<DetectionData | null>(null)
    const [detectionType, setDetectionType] = useState<DetectionType>("pothole-detection")
    const [videoId, setVideoId] = useState<string | null>(null)
    const [videoFile, setVideoFile] = useState<File | null>(null)
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    // Load session and video data on mount
    useEffect(() => {
        const storedSession = loadSession()
        const videoData = loadVideoData()

        if (!isSessionValid(storedSession) || !videoData) {
            router.replace("/")
            return
        }

        setSession(storedSession)
        setVideoId(videoData.videoId)
        setDetectionType(videoData.detectionType as DetectionType)

        // Fetch detection results and video file
        const fetchResults = async () => {
            try {
                // Fetch detection data
                const response = await fetch(`${API_URL}/results/${videoData.videoId}`, {
                    headers: { "ngrok-skip-browser-warning": "true" }
                })

                if (!response.ok) {
                    throw new Error(`Failed to load results: ${response.status}`)
                }

                const data = await response.json()
                setDetectionData(data)

                // Retrieve video file from IndexedDB
                const storedVideoFile = await getVideoFile(videoData.videoId)
                if (storedVideoFile) {
                    setVideoFile(storedVideoFile)
                }
            } catch (err) {
                setError(err instanceof Error ? err.message : "Failed to load results")
            } finally {
                setIsLoading(false)
            }
        }

        fetchResults()
    }, [router])

    const handleNewAnalysis = async () => {
        // Clear video from IndexedDB
        if (videoId) {
            try {
                await clearVideoFile(videoId)
            } catch (err) {
                console.error("Failed to clear video file:", err)
            }
        }
        clearSession()
        router.push("/")
    }

    const handleBackToUpload = () => {
        router.push("/upload")
    }

    const getTitle = () => {
        return detectionType === "pothole-detection"
            ? "Pothole Detection Results"
            : "Signboard Detection Results"
    }

    if (isLoading) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center gap-4">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <p className="text-muted-foreground">Loading detection results...</p>
            </div>
        )
    }

    if (error) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center gap-4">
                <p className="text-destructive">{error}</p>
                <Button onClick={handleNewAnalysis}>Start New Analysis</Button>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
            <div className="container mx-auto px-4 py-8 max-w-7xl">
                {/* Header */}
                <div className="mb-8 animate-in fade-in slide-in-from-top duration-700">
                    <h1 className="text-4xl font-bold mb-2 text-balance bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
                        {getTitle()}
                    </h1>
                    <p className="text-muted-foreground">
                        View your AI-powered road analysis results
                    </p>
                </div>

                {/* Session Info Bar */}
                {session && (
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
                            <div className="flex gap-2">
                                <Button variant="ghost" size="sm" onClick={handleBackToUpload}>
                                    <ArrowLeft className="h-4 w-4 mr-2" />
                                    Back to Upload
                                </Button>
                                <Button variant="outline" size="sm" onClick={handleNewAnalysis}>
                                    <RotateCcw className="h-4 w-4 mr-2" />
                                    New Analysis
                                </Button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Video Player Section */}
                {detectionData && videoId && (
                    <div className="animate-in fade-in slide-in-from-bottom duration-700">
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
