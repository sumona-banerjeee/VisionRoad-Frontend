"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Loader2, ArrowLeft, MapPin, Package, FolderKanban, RotateCcw, TrendingUp } from "lucide-react"
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
import { DetectionData, DetectionType } from "@/lib/types"

const API_URL = process.env.NEXT_PUBLIC_API_URL


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
                setDetectionData(data as any)

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
        if (detectionType === "pothole-detection") return "Pothole Detection Results"
        if (detectionType === "sign-board-detection") return "Signboard Detection Results"
        return "Pothole & Signboard Detection Results"
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
                <div className="container mx-auto px-6 py-8 max-w-full">
                    {/* Refined Header */}
                    <div className="mb-8 flex items-center gap-5">
                        <div className="p-3 rounded-2xl bg-gradient-to-br from-[#9bddeb] to-[#60a5fa] shadow-md flex items-center justify-center">
                            <TrendingUp className="h-8 w-8 text-white" />
                        </div>
                        <div>
                            <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-gray-900 via-indigo-800 to-indigo-600 dark:from-white dark:via-indigo-200 dark:to-indigo-400 bg-clip-text text-transparent leading-tight">
                                {getTitle()}
                            </h1>
                            <p className="text-gray-500 dark:text-gray-400 mt-1 text-sm font-medium">
                                View your AI-powered road analysis results
                            </p>
                        </div>
                    </div>

                    {/* Session Info Bar */}
                    {session && (
                        <div className="mb-6">
                            <div className="flex items-center justify-between p-4 rounded-xl bg-card border border-[var(--border)] shadow-sm">
                                <div className="flex items-center gap-12">
                                    <div className="flex flex-col">
                                        <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground leading-none mb-1.5">Project</span>
                                        <span className="text-base font-bold text-gray-900 dark:text-white leading-tight">
                                            {session.projectName}
                                        </span>
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground leading-none mb-1.5">Package</span>
                                        <span className="text-sm font-bold text-gray-700 dark:text-gray-300 leading-tight">
                                            {session.packageName}
                                        </span>
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground leading-none mb-1.5">Location</span>
                                        <span className="text-sm font-bold text-gray-700 dark:text-gray-300 leading-tight">
                                            {session.locationName}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Video Player Section */}
                    {detectionData && videoId && (
                        <div>
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
