"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Loader2, TrendingUp } from "lucide-react"
import { SidebarNavigation } from "@/components/sidebar-navigation"
import {
    type SessionContext,
    loadSession,
    isSessionValid,
    saveVideoData,
    clearSession
} from "@/lib/api"
import { storeVideoFile } from "@/lib/video-storage"

const API_URL = "http://127.0.0.1:8000/api/v1"
const WS_URL = "ws://127.0.0.1:8000/api/v1"

type DetectionType = "pothole-detection" | "sign-board-detection" | "pot-sign-detection"

export default function UploadPage() {
    const router = useRouter()
    const [session, setSession] = useState<SessionContext | null>(null)
    const [isLoading, setIsLoading] = useState(true)

    // Form states
    const [file, setFile] = useState<File | null>(null)
    const [jsonFile, setJsonFile] = useState<File | null>(null)
    const [speed, setSpeed] = useState(30)
    const [detectionType, setDetectionType] = useState<DetectionType>("pothole-detection")

    // Upload states
    const [uploading, setUploading] = useState(false)
    const [progress, setProgress] = useState(0)
    const [statusMessage, setStatusMessage] = useState("")
    const [error, setError] = useState<string | null>(null)

    // Load session on mount
    useEffect(() => {
        const storedSession = loadSession()
        if (!isSessionValid(storedSession)) {
            router.replace("/new-analysis")
            return
        }
        setSession(storedSession)
        setIsLoading(false)
    }, [router])

    const connectWebSocket = (videoId: string) => {
        const ws = new WebSocket(`${WS_URL}/ws/${videoId}`)

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
                setStatusMessage("Processing completed! Saving video...")
                ws.close()
                if (file) {
                    try {
                        await storeVideoFile(videoId, file)
                    } catch (err) {
                        console.error("Failed to store video file:", err)
                    }
                }
                saveVideoData({ videoId, detectionType })
                setStatusMessage("Redirecting to results...")
                setTimeout(() => router.push("/results"), 500)
            }

            if (data.type === "error") {
                setError("Error: " + data.message)
                setStatusMessage("")
                setUploading(false)
                ws.close()
            }
        }

        ws.onerror = () => {
            setStatusMessage("Connection error. Retrying...")
        }
    }

    const handleUpload = async () => {
        if (!file) {
            setError("Please select a video file")
            return
        }

        const formData = new FormData()
        formData.append("file", file)
        formData.append("detection_type", detectionType)
        formData.append("speed_kmh", speed.toString())
        if (jsonFile) {
            formData.append("json_file", jsonFile)
        }

        setUploading(true)
        setProgress(0)
        setStatusMessage("Uploading...")
        setError(null)

        try {
            const response = await fetch(`${API_URL}/upload`, {
                method: "POST",
                headers: { "ngrok-skip-browser-warning": "true" },
                body: formData
            })

            if (!response.ok) {
                const errorText = await response.text()
                throw new Error(`Upload failed (${response.status}): ${errorText}`)
            }

            const result = await response.json()
            setStatusMessage("Uploaded! Starting processing...")
            setProgress(10)
            connectWebSocket(result.video_id)
        } catch (err) {
            let errorMessage = "Upload failed"
            if (err instanceof TypeError && err.message === "Failed to fetch") {
                errorMessage = "Cannot connect to server. Please check if backend is running."
            } else if (err instanceof Error) {
                errorMessage = err.message
            }
            setError(errorMessage)
            setStatusMessage("")
            setUploading(false)
            setProgress(0)
        }
    }

    const handleBackToSelection = () => {
        clearSession()
        router.push("/new-analysis")
    }

    const getTitle = () => {
        if (detectionType === "pothole-detection") return "Pothole Detection"
        if (detectionType === "sign-board-detection") return "Signboard Detection"
        return "Pothole & Signboard Detection"
    }

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
            {/* Sidebar Navigation */}
            <SidebarNavigation />

            {/* Main Content */}
            <main className="ml-16 min-h-screen relative overflow-hidden flex flex-col">

                <div className="flex-1 container mx-auto px-6 py-6 max-w-7xl relative z-10 flex flex-col">
                    {/* Refined Header */}
                    <div className="mb-6 flex items-center gap-5">
                        <div className="p-3 rounded-2xl bg-gradient-to-br from-[#9bddeb] to-[#60a5fa] shadow-md flex items-center justify-center">
                            <TrendingUp className="h-8 w-8 text-white" />
                        </div>
                        <div>
                            <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-gray-900 via-indigo-800 to-indigo-600 dark:from-white dark:via-indigo-200 dark:to-indigo-400 bg-clip-text text-transparent leading-tight">
                                {getTitle()}
                            </h1>
                        </div>
                    </div>

                    {/* Compact Session Info Bar */}
                    {session && (
                        <div className="mb-4">
                            <div className="rounded-xl px-4 py-3 bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm border border-gray-200/50 dark:border-gray-700/50">
                                <div className="flex items-center justify-between gap-4">
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
                                    <Button
                                        size="sm"
                                        onClick={handleBackToSelection}
                                        className="bg-blue-600 hover:bg-blue-700 text-white text-xs"
                                    >
                                        Change Selection
                                    </Button>

                                </div>
                            </div>
                        </div>
                    )}

                    {/* Upload Card */}
                    <Card className="rounded-xl overflow-hidden flex-1">
                        <CardHeader className="pb-4 border-b border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-900">
                            <CardTitle className="text-xl font-bold">
                                <span className="bg-gradient-to-r from-blue-600 via-blue-500 to-blue-600 dark:from-blue-400 dark:via-blue-300 dark:to-blue-400  bg-clip-text text-transparent">
                                    Upload Video
                                </span>
                            </CardTitle>
                            <CardDescription className="text-sm">
                                Select video file, detection type, and vehicle speed for analysis
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="pt-4 space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {/* Video File Input */}
                                <div className="space-y-2">
                                    <Label htmlFor="video-file" className="text-sm font-semibold">
                                        Video File
                                    </Label>
                                    <Input
                                        id="video-file"
                                        type="file"
                                        accept="video/*"
                                        onChange={(e) => {
                                            setFile(e.target.files?.[0] || null)
                                            setError(null)
                                        }}
                                        disabled={uploading}
                                        className="h-10 bg-gray-50 dark:bg-gray-800 file:mr-3 file:py-1.5 file:px-3 file:rounded-md file:border-0 file:bg-blue-100 dark:file:bg-blue-900/50 file:text-blue-600 dark:file:text-blue-400 file:font-medium file:text-xs hover:file:bg-blue-200"
                                    />
                                </div>

                                {/* JSON File Input */}
                                <div className="space-y-2">
                                    <Label htmlFor="json-file" className="text-sm font-semibold">
                                        GPS JSON File <span className="text-gray-400 font-normal text-xs">(Optional)</span>
                                    </Label>
                                    <Input
                                        id="json-file"
                                        type="file"
                                        accept=".json,application/json"
                                        onChange={(e) => {
                                            setJsonFile(e.target.files?.[0] || null)
                                            setError(null)
                                        }}
                                        disabled={uploading}
                                        className="h-10 bg-gray-50 dark:bg-gray-800 file:mr-3 file:py-1.5 file:px-3 file:rounded-md file:border-0 file:bg-blue-100 dark:file:bg-blue-900/50 file:text-blue-600 dark:file:text-blue-400 file:font-medium file:text-xs hover:file:bg-blue-200"
                                    />
                                </div>

                                {/* Detection Type */}
                                <div className="space-y-2">
                                    <Label htmlFor="detection-type" className="text-sm font-semibold">
                                        Detection Type
                                    </Label>
                                    <Select
                                        value={detectionType}
                                        onValueChange={(v) => setDetectionType(v as DetectionType)}
                                        disabled={uploading}
                                    >
                                        <SelectTrigger id="detection-type" className="h-10 bg-gray-50 dark:bg-gray-800">
                                            <SelectValue placeholder="Select detection type" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="pothole-detection">
                                                <span className="font-medium">Pothole Detection</span>
                                            </SelectItem>
                                            <SelectItem value="sign-board-detection">
                                                <span className="font-medium">Signboard Detection</span>
                                            </SelectItem>
                                            <SelectItem value="pot-sign-detection">
                                                <span className="font-medium">Pothole & Signboard Detection</span>
                                            </SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                {/* Speed Input */}
                                <div className="space-y-2">
                                    <Label htmlFor="speed" className="text-sm font-semibold">
                                        Vehicle Speed (km/h)
                                    </Label>
                                    <Input
                                        id="speed"
                                        type="number"
                                        min={1}
                                        max={200}
                                        value={speed}
                                        onChange={(e) => setSpeed(Number(e.target.value))}
                                        disabled={uploading}
                                        className="h-10 bg-gray-50 dark:bg-gray-800"
                                    />
                                </div>
                            </div>

                            {/* Error Display */}
                            {error && (
                                <div className="flex items-start gap-2 p-3 rounded-lg bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800">
                                    <div className="w-4 h-4 rounded-full bg-red-100 dark:bg-red-900/50 flex items-center justify-center flex-shrink-0 mt-0.5">
                                        <span className="text-[10px] font-bold text-red-500">!</span>
                                    </div>
                                    <p className="text-xs text-red-600 dark:text-red-400 leading-relaxed whitespace-pre-line">{error}</p>
                                </div>
                            )}

                            {/* Upload Button */}
                            <Button
                                onClick={handleUpload}
                                disabled={!file || uploading}
                                className={`w-full h-12 text-sm font-semibold transition-all rounded-xl ${file && !uploading
                                    ? 'bg-gradient-to-r from-blue-500 to-blue-700 hover:from-blue-600 hover:to-blue-800 text-white shadow-lg shadow-blue-500/25'
                                    : ''
                                    }`}
                                size="lg"
                            >
                                {uploading ? (
                                    <span className="flex items-center gap-2">
                                        <Loader2 className="h-4 w-4 animate-spin" />
                                        Processing...
                                    </span>
                                ) : (
                                    "Upload and Process"
                                )}
                            </Button>

                            {/* Progress Section */}
                            {uploading && (
                                <div className="space-y-3 p-4 rounded-xl bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800">
                                    <div className="space-y-2">
                                        <div className="flex items-center justify-between text-sm">
                                            <span className="font-medium text-gray-700 dark:text-gray-300 text-xs">Processing Progress</span>
                                            <span className="font-bold text-blue-600 dark:text-blue-400 text-xs">{progress}%</span>
                                        </div>
                                        <div className="h-2 rounded-full bg-blue-100 dark:bg-blue-900/50 overflow-hidden">
                                            <div
                                                className="h-full bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full transition-all duration-300"
                                                style={{ width: `${progress}%` }}
                                            />
                                        </div>
                                    </div>
                                    {statusMessage && (
                                        <p className="text-xs text-gray-500">{statusMessage}</p>
                                    )}
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Footer */}
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
