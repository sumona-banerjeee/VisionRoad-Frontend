"use client"

import { useState, useEffect, useCallback } from "react"
import { useRouter, useParams } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Loader2, TrendingUp } from "lucide-react"
import { SidebarNavigation } from "@/components/sidebar-navigation"
import {
    type SessionContext,
    loadSession,
} from "@/lib/api"
import { getVideoFile } from "@/lib/video-storage"
import { storeVideoFile } from "@/lib/video-storage"

const API_URL = process.env.NEXT_PUBLIC_API_URL
const WS_URL = API_URL?.replace(/^https:\/\//, "wss://").replace(/^http:\/\//, "ws://")

export default function VideoProcessingPage() {
    const router = useRouter()
    const { videoId } = useParams() as { videoId: string }
    const [session, setSession] = useState<SessionContext | null>(null)
    const [isLoading, setIsLoading] = useState(true)

    // Processing states
    const [progress, setProgress] = useState(0)
    const [statusMessage, setStatusMessage] = useState("Initializing...")
    const [error, setError] = useState<string | null>(null)
    const [detectionType, setDetectionType] = useState<string>("pothole-detection")

    const connectWebSocket = useCallback((vid: string) => {
        const ws = new WebSocket(`${WS_URL}/ws/${vid}`)

        ws.onmessage = async (event) => {
            const data = JSON.parse(event.data)

            if (data.type === "progress" || data.progress !== undefined) {
                setProgress(data.progress || 0)
                let message = data.message || "Processing..."
                if (data.unique_potholes !== undefined) {
                    message += ` | Unique: ${data.unique_potholes} | Total: ${data.total_detections || 0}`
                } else if (data.unique_signboards !== undefined) {
                    message += ` | Unique: ${data.unique_signboards} | Total: ${data.total_detections || 0}`
                }
                setStatusMessage(message)
            }

            if (data.type === "complete" || data.status === "completed") {
                setStatusMessage("Processing completed! Finalizing...")
                ws.close()

                // Navigate to results
                setTimeout(() => router.push(`/results/${vid}`), 1000)
            }

            if (data.type === "error") {
                setError("Error: " + data.message)
                setStatusMessage("")
                ws.close()
            }
        }

        ws.onerror = () => {
            setStatusMessage("Connection lost. Reconnecting...")
            setTimeout(() => connectWebSocket(vid), 3000)
        }

        return ws
    }, [router])

    useEffect(() => {
        const storedSession = loadSession()
        setSession(storedSession)

        const checkStatus = async () => {
            try {
                const response = await fetch(`${API_URL}/status/${videoId}`, {
                    headers: { "ngrok-skip-browser-warning": "true" }
                })

                if (response.status === 404) {
                    router.replace("/upload")
                    return
                }

                if (!response.ok) {
                    throw new Error("Failed to fetch status")
                }

                const statusData = await response.json()

                if (statusData.status === "completed") {
                    router.replace(`/results/${videoId}`)
                    return
                }

                if (statusData.status === "error") {
                    setError(statusData.message || "An error occurred during processing.")
                    setIsLoading(false)
                    return
                }

                // If processing, start WebSocket
                setProgress(statusData.progress || 0)
                setStatusMessage(statusData.message || "Resuming processing...")
                connectWebSocket(videoId)
                setIsLoading(false)

            } catch (err) {
                console.error("Status check failed:", err)
                setError("Failed to connect to server.")
                setIsLoading(false)
            }
        }

        if (videoId) {
            checkStatus()
        }
    }, [videoId, router, connectWebSocket])

    if (isLoading) {
        return (
            <div className="min-h-screen bg-mesh-gradient flex items-center justify-center">
                <div className="p-8 rounded-2xl bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl shadow-lg">
                    <Loader2 className="h-8 w-8 animate-spin text-indigo-500" />
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-mesh-gradient text-gray-900 dark:text-gray-100">
            <SidebarNavigation />
            <main className="ml-16 min-h-screen relative overflow-hidden flex flex-col">
                <div className="flex-1 container mx-auto px-6 py-6 max-w-7xl relative z-10 flex flex-col">
                    <div className="mb-6 flex items-center gap-5">
                        <div className="p-3 rounded-2xl bg-gradient-to-br from-[#9bddeb] to-[#60a5fa] shadow-md flex items-center justify-center">
                            <TrendingUp className="h-8 w-8 text-white" />
                        </div>
                        <div>
                            <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-gray-900 via-indigo-800 to-indigo-600 dark:from-white dark:via-indigo-200 dark:to-indigo-400 bg-clip-text text-transparent leading-tight">
                                Processing Analysis
                            </h1>
                        </div>
                    </div>

                    {session && (
                        <div className="mb-4">
                            <div className="rounded-xl px-4 py-3 bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm border border-gray-200/50 dark:border-gray-700/50">
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

                    <Card className="rounded-2xl overflow-hidden bg-white/60 dark:bg-gray-900/60 backdrop-blur-xl border border-white/40 dark:border-gray-800/40 shadow-2xl flex flex-col items-center justify-center py-12 px-8 min-h-[450px]">
                        <div className="flex flex-col items-center justify-center w-full max-w-4xl space-y-8">
                            {/* Visual Spinner Area */}
                            <div className="relative">
                                <div className="h-24 w-24 rounded-full bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center border-4 border-blue-100 dark:border-blue-800/30">
                                    <Loader2 className="h-10 w-10 text-blue-500 animate-spin" />
                                </div>
                            </div>

                            <div className="text-center space-y-2">
                                <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight">
                                    Processing Video
                                </h2>
                                <p className="text-sm font-medium text-gray-400 dark:text-gray-500 font-mono tracking-wider">
                                    ID: {videoId}
                                </p>
                            </div>

                            <div className="w-full space-y-4">
                                <div className="flex items-center justify-between text-sm">
                                    <span className="font-bold text-gray-500 dark:text-gray-400 text-xs uppercase tracking-widest">Processing Progress</span>
                                    <span className="font-black text-blue-600 dark:text-blue-400 text-base">{progress}%</span>
                                </div>
                                <div className="h-3 rounded-full bg-blue-100 dark:bg-gray-800 overflow-hidden p-0.5 border border-blue-50 dark:border-gray-700">
                                    <div
                                        className="h-full bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full transition-all duration-1000 ease-in-out shadow-[0_0_15px_rgba(59,130,246,0.5)]"
                                        style={{ width: `${progress}%` }}
                                    />
                                </div>
                                <div className="text-center">
                                    <p className="text-sm font-bold text-gray-500 dark:text-gray-400 animate-pulse">
                                        {statusMessage}
                                    </p>
                                </div>
                            </div>

                            {error && (
                                <div className="w-full p-4 rounded-xl bg-red-50/50 dark:bg-red-950/20 border border-red-200/50 dark:border-red-800/50 text-center">
                                    <p className="text-red-600 dark:text-red-400 text-sm font-medium">{error}</p>
                                    <button
                                        onClick={() => window.location.reload()}
                                        className="mt-3 text-xs font-bold text-red-700 dark:text-red-300 underline underline-offset-4"
                                    >
                                        Retry Connection
                                    </button>
                                </div>
                            )}

                            <div className="pt-8 text-center">
                                {/* <p className="text-xs font-medium text-gray-400 dark:text-gray-500/60 max-w-sm mx-auto leading-relaxed">
                                    You can safely refresh this page — progress will resume automatically.
                                </p> */}
                            </div>
                        </div>
                    </Card>

                    <div className="mt-4 text-center">
                        <p className="text-xs text-gray-400 dark:text-gray-500">
                            Sentient Geeks Pvt. Ltd.
                        </p>
                    </div>
                </div>
            </main>
        </div>
    )
}
