"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Loader2, ArrowLeft, MapPin, Package, FolderKanban, RotateCcw, TrendingUp } from "lucide-react"
import VideoPlayerSection from "@/components/video-player-section"
import { SidebarNavigation } from "@/components/sidebar-navigation"
import { PageHeader } from "@/components/page-header"
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

        // If we have a videoId, redirect to the dynamic results page
        if (videoData.videoId) {
            router.replace(`/results/${videoData.videoId}`)
            return
        }

        setSession(storedSession)
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
            <div className="min-h-screen flex items-center justify-center">
                <div className="flex flex-col items-center gap-4 p-8 rounded-2xl bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl shadow-lg">
                    <Loader2 className="h-8 w-8 animate-spin text-indigo-500" />
                    <p className="text-gray-500">Loading detection results...</p>
                </div>
            </div>
        )
    }

    if (error) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="flex flex-col items-center gap-4 p-8 rounded-2xl bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl shadow-lg">
                    <p className="text-red-500">{error}</p>
                    <Button onClick={handleNewAnalysis} className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white">Start New Analysis</Button>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen text-gray-900 dark:text-gray-100">
            {/* Sidebar Navigation */}
            <SidebarNavigation />

            {/* Main Content */}
            <main className="ml-20 min-h-screen">
                <div className="container mx-auto px-6 py-8 max-w-full">
                    {/* Refined Header */}
                    <div className="mb-8">
                        <PageHeader
                            title={getTitle()}
                            description="View your AI-powered road analysis results"
                            icon={TrendingUp}
                        />
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
