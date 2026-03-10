"use client"

import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Loader2, TrendingUp } from "lucide-react"
import VideoPlayerSection from "@/components/video-player-section"
import { SidebarNavigation } from "@/components/sidebar-navigation"
import { PageHeader } from "@/components/page-header"
import { PoweredBy } from "@/components/powered-by"
import {
    type SessionContext,
    loadSession,
    clearSession
} from "@/lib/api"
import { getVideoFile, clearVideoFile } from "@/lib/video-storage"
import { DetectionData, DetectionType } from "@/lib/types"

const API_URL = process.env.NEXT_PUBLIC_API_URL

export default function VideoResultsPage() {
    const router = useRouter()
    const { videoId } = useParams() as { videoId: string }
    const [session, setSession] = useState<SessionContext | null>(null)
    const [detectionData, setDetectionData] = useState<DetectionData | null>(null)
    const [detectionType, setDetectionType] = useState<DetectionType>("pothole-detection")
    const [videoFile, setVideoFile] = useState<File | null>(null)
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        const storedSession = loadSession()
        setSession(storedSession)

        const fetchResults = async () => {
            try {
                // Fetch detection data from backend
                const response = await fetch(`${API_URL}/results/${videoId}`, {
                    headers: { "ngrok-skip-browser-warning": "true" }
                })

                if (!response.ok) {
                    if (response.status === 404) {
                        throw new Error("Results not found for this video.")
                    }
                    throw new Error(`Failed to load results: ${response.status}`)
                }

                const data = await response.json()
                setDetectionData(data as any)

                // Try to infer detection type from results if possible
                if (data.summary?.unique_signboards !== undefined && data.summary?.unique_signboards > 0) {
                    setDetectionType("sign-board-detection")
                } else if (data.summary?.unique_potholes !== undefined && data.summary?.unique_potholes > 0) {
                    setDetectionType("pothole-detection")
                }

                // Retrieve video file from IndexedDB
                const storedVideoFile = await getVideoFile(videoId)
                if (storedVideoFile) {
                    setVideoFile(storedVideoFile)
                }
            } catch (err) {
                setError(err instanceof Error ? err.message : "Failed to load results")
            } finally {
                setIsLoading(false)
            }
        }

        if (videoId) {
            fetchResults()
        }
    }, [videoId])

    const handleNewAnalysis = async () => {
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
                <div className="flex flex-col items-center gap-4 p-8 rounded-2xl bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl shadow-lg text-center">
                    <p className="text-red-500 font-medium">{error}</p>
                    <div className="flex gap-4 mt-4">
                        <Button onClick={() => router.push("/upload")} variant="outline">Back to Upload</Button>
                        <Button onClick={handleNewAnalysis} className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white">New Analysis</Button>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen max-w-340 mx-auto text-gray-900 dark:text-gray-100">
            <SidebarNavigation />
            <main className="ml-20 min-h-screen">
                <div className="container mx-auto px-6 py-8 max-w-full">
                    <div className="mb-8">
                        <PageHeader
                            title={getTitle()}
                            description={`Video ID: ${videoId}`}
                            icon={TrendingUp}
                        />
                    </div>

                    {session && (
                        <div className="mb-6">
                            <div className="flex items-center justify-between  rounded-md px-4 py-3 bg-white/60 backdrop-blur-sm">
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
                                <Button onClick={handleNewAnalysis} variant="outline" size="sm" className="btn-blue-gradient">
                                    Start New
                                </Button>
                            </div>
                        </div>
                    )}

                    {detectionData && (
                        <VideoPlayerSection
                            data={detectionData}
                            videoId={videoId}
                            videoFile={videoFile}
                            detectionType={detectionType}
                            projectId={session?.projectId || undefined}
                        />
                    )}
                    <PoweredBy />
                </div>
            </main>
        </div>
    )
}
