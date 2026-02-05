"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Progress } from "@/components/ui/progress"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Upload, Loader2, AlertCircle, ArrowLeft, MapPin, Package, FolderKanban } from "lucide-react"
import {
    type SessionContext,
    loadSession,
    isSessionValid,
    saveVideoData,
    clearSession
} from "@/lib/api"
import { storeVideoFile } from "@/lib/video-storage"

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000/api/v1"
const WS_URL = process.env.NEXT_PUBLIC_WS_URL || "ws://127.0.0.1:8000/api/v1"

type DetectionType = "pothole-detection" | "sign-board-detection"

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
            router.replace("/")
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
                // Store video file in IndexedDB for results page
                if (file) {
                    try {
                        await storeVideoFile(videoId, file)
                    } catch (err) {
                        console.error("Failed to store video file:", err)
                    }
                }
                // Save video data and navigate to results
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
        router.push("/")
    }

    const getTitle = () => {
        return detectionType === "pothole-detection"
            ? "Pothole Detection System"
            : "Signboard Detection System"
    }

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
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
                        Upload a video to detect and analyze with AI-powered processing
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
                            <Button variant="ghost" size="sm" onClick={handleBackToSelection}>
                                <ArrowLeft className="h-4 w-4 mr-2" />
                                Change Selection
                            </Button>
                        </div>
                    </div>
                )}

                {/* Upload Card */}
                <Card className="transition-all hover:shadow-lg animate-in fade-in slide-in-from-bottom duration-700">
                    <CardHeader>
                        <CardTitle>Upload Video</CardTitle>
                        <CardDescription>
                            Select a video file, detection type, and vehicle speed to start AI-powered analysis
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {/* Video File Input */}
                            <div className="space-y-2">
                                <Label htmlFor="video-file">Video File</Label>
                                <Input
                                    id="video-file"
                                    type="file"
                                    accept="video/*"
                                    onChange={(e) => {
                                        setFile(e.target.files?.[0] || null)
                                        setError(null)
                                    }}
                                    disabled={uploading}
                                />
                                {file && (
                                    <p className="text-sm text-muted-foreground">
                                        Selected: {file.name} ({(file.size / 1024 / 1024).toFixed(2)} MB)
                                    </p>
                                )}
                            </div>

                            {/* JSON File Input */}
                            <div className="space-y-2">
                                <Label htmlFor="json-file">GPS JSON File</Label>
                                <Input
                                    id="json-file"
                                    type="file"
                                    accept=".json,application/json"
                                    onChange={(e) => {
                                        setJsonFile(e.target.files?.[0] || null)
                                        setError(null)
                                    }}
                                    disabled={uploading}
                                />
                                {jsonFile && (
                                    <p className="text-sm text-muted-foreground">
                                        Selected: {jsonFile.name} ({(jsonFile.size / 1024).toFixed(2)} KB)
                                    </p>
                                )}
                            </div>

                            {/* Detection Type */}
                            <div className="space-y-2">
                                <Label htmlFor="detection-type">Detection Type</Label>
                                <Select
                                    value={detectionType}
                                    onValueChange={(v) => setDetectionType(v as DetectionType)}
                                    disabled={uploading}
                                >
                                    <SelectTrigger id="detection-type">
                                        <SelectValue placeholder="Select detection type" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="pothole-detection">Pothole Detection</SelectItem>
                                        <SelectItem value="sign-board-detection">Signboard Detection</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            {/* Speed Input */}
                            <div className="space-y-2">
                                <Label htmlFor="speed">Speed (km/h)</Label>
                                <Input
                                    id="speed"
                                    type="number"
                                    min={1}
                                    max={200}
                                    value={speed}
                                    onChange={(e) => setSpeed(Number(e.target.value))}
                                    disabled={uploading}
                                />
                            </div>
                        </div>

                        {/* Error Display */}
                        {error && (
                            <div className="flex items-start gap-2 p-3 rounded-lg bg-destructive/10 text-destructive">
                                <AlertCircle className="h-5 w-5 mt-0.5 flex-shrink-0" />
                                <p className="text-sm whitespace-pre-line">{error}</p>
                            </div>
                        )}

                        {/* Upload Button */}
                        <Button
                            onClick={handleUpload}
                            disabled={!file || uploading}
                            className="w-full"
                            size="lg"
                        >
                            {uploading ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Processing...
                                </>
                            ) : (
                                <>
                                    <Upload className="mr-2 h-4 w-4" />
                                    Upload & Process
                                </>
                            )}
                        </Button>

                        {/* Progress Section */}
                        {uploading && (
                            <div className="space-y-3 animate-in fade-in slide-in-from-top duration-500">
                                <Progress value={progress} className="h-3" />
                                <div className="flex items-center justify-between text-sm">
                                    <span className="text-muted-foreground">{statusMessage}</span>
                                    <span className="font-semibold">{progress}%</span>
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
