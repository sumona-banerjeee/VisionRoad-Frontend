"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Loader2, ArrowLeft, MapPin, Package, FolderKanban, RotateCcw } from "lucide-react"
import VideoPlayerSection from "@/components/video-player-section"
import { SidebarNavigation } from "@/components/sidebar-navigation"
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
            router.replace("/new-analysis")
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
        router.push("/new-analysis")
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
            <div className="min-h-screen bg-mesh-gradient flex items-center justify-center">
                <div className="flex flex-col items-center gap-4 p-8 rounded-2xl bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl shadow-lg">
                    <Loader2 className="h-8 w-8 animate-spin text-indigo-500" />
                    <p className="text-gray-500">Loading detection results...</p>
                </div>
            </div>
        )
    }

    if (error) {
        return (
            <div className="min-h-screen bg-mesh-gradient flex items-center justify-center">
                <div className="flex flex-col items-center gap-4 p-8 rounded-2xl bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl shadow-lg">
                    <p className="text-red-500">{error}</p>
                    <Button onClick={handleNewAnalysis} className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white">Start New Analysis</Button>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-mesh-gradient text-gray-900 dark:text-gray-100">
            {/* Sidebar Navigation */}
            <SidebarNavigation />

            {/* Main Content */}
            <main className="ml-16 min-h-screen">
                <div className="container mx-auto px-4 py-8 max-w-7xl">
                    {/* Header */}
                    <div className="mb-8 animate-in fade-in slide-in-from-top duration-700">
                        <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-gray-900 via-indigo-800 to-indigo-600 dark:from-white dark:via-indigo-200 dark:to-indigo-400 bg-clip-text text-transparent">
                            {getTitle()}
                        </h1>
                        <p className="text-gray-500 dark:text-gray-400">
                            View your AI-powered road analysis results
                        </p>
                    </div>

                    {/* Session Info Bar */}
                    {session && (
                        <div className="mb-6 animate-in fade-in slide-in-from-top duration-500">
                            <div className="flex items-center justify-between p-4 rounded-xl bg-card border border-[var(--border)] shadow-sm">
                                <div className="flex items-center gap-6 text-sm">
                                    <div className="flex items-center gap-2">
                                        <div className="p-1.5 rounded-lg bg-gradient-to-br from-indigo-400 to-purple-500 shadow-md shadow-indigo-500/30">
                                            <FolderKanban className="h-4 w-4 text-white" />
                                        </div>
                                        <span className="text-gray-500 dark:text-gray-400 text-xs uppercase font-semibold tracking-wide">Project:</span>
                                        <span className="font-bold text-gray-900 dark:text-white bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-400 dark:to-purple-400 bg-clip-text text-transparent">{session.projectName}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <div className="p-1.5 rounded-lg bg-gradient-to-br from-blue-400 to-indigo-500 shadow-md shadow-blue-500/30">
                                            <Package className="h-4 w-4 text-white" />
                                        </div>
                                        <span className="text-gray-500 dark:text-gray-400 text-xs uppercase font-semibold tracking-wide">Package:</span>
                                        <span className="font-bold text-gray-900 dark:text-white bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400 bg-clip-text text-transparent">{session.packageName}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <div className="p-1.5 rounded-lg bg-gradient-to-br from-purple-400 to-pink-500 shadow-md shadow-purple-500/30">
                                            <MapPin className="h-4 w-4 text-white" />
                                        </div>
                                        <span className="text-gray-500 dark:text-gray-400 text-xs uppercase font-semibold tracking-wide">Location:</span>
                                        <span className="font-bold text-gray-900 dark:text-white bg-gradient-to-r from-purple-600 to-pink-600 dark:from-purple-400 dark:to-pink-400 bg-clip-text text-transparent">{session.locationName}</span>
                                    </div>
                                </div>
                                <div className="flex gap-2">
                                    <Button variant="ghost" size="sm" onClick={handleBackToUpload} className="text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white">
                                        <ArrowLeft className="h-4 w-4 mr-2" />
                                        Back to Upload
                                    </Button>
                                    <Button variant="outline" size="sm" onClick={handleNewAnalysis} className="border-indigo-200 dark:border-indigo-800 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/50">
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
                                projectId={session?.projectId || undefined}
                            />
                        </div>
                    )}
                </div>
            </main>
        </div>
    )
}
