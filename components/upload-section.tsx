"use client"

import { useState, useRef } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Progress } from "@/components/ui/progress"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Upload, Loader2, AlertCircle } from "lucide-react"
import type { DetectionData, DetectionType } from "@/lib/types"

const API_URL = "http://127.0.0.1:8000/api/v1"
const WS_URL = "ws://127.0.0.1:8000/api/v1"


type UploadSectionProps = {
  onDetectionComplete: (data: DetectionData, videoId: string, file: File) => void
  onDetectionTypeChange: (type: DetectionType) => void
}

export function UploadSection({ onDetectionComplete, onDetectionTypeChange }: UploadSectionProps) {
  const [file, setFile] = useState<File | null>(null)
  const [jsonFile, setJsonFile] = useState<File | null>(null)
  const [speed, setSpeed] = useState(30)
  const [detectionType, setDetectionType] = useState<DetectionType>("pothole-detection")
  const [uploading, setUploading] = useState(false)
  const [progress, setProgress] = useState(0)
  const [statusMessage, setStatusMessage] = useState("")
  const [error, setError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const jsonFileInputRef = useRef<HTMLInputElement>(null)
  const wsRef = useRef<WebSocket | null>(null)

  const handleDetectionTypeChange = (value: DetectionType) => {
    setDetectionType(value)
    onDetectionTypeChange(value)
  }

  const connectWebSocket = (videoId: string) => {
    console.log("[Upload] Connecting WebSocket for video:", videoId)

    const ws = new WebSocket(`${WS_URL}/ws/${videoId}`)
    wsRef.current = ws

    ws.onopen = () => {
      console.log("[Upload] WebSocket connected")
      setError(null)
    }

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data)
      console.log("[Upload] WebSocket message:", data)

      if (data.type === "progress" || data.progress !== undefined) {
        const progressValue = data.progress || 0
        setProgress(progressValue)

        let message = data.message || "Processing..."

        // Handle both pothole and signboard progress messages
        if (data.unique_potholes !== undefined) {
          message += ` | Unique: ${data.unique_potholes} | Total: ${data.total_detections || 0}`
        } else if (data.unique_signboards !== undefined) {
          message += ` | Unique: ${data.unique_signboards} | Total: ${data.total_detections || 0}`
        }

        setStatusMessage(message)
      }

      if (data.type === "complete" || data.status === "completed") {
        setStatusMessage("Processing completed! Loading results...")
        ws.close()
        setTimeout(() => loadResults(videoId), 500)
      }

      if (data.type === "error") {
        setError("Error: " + data.message)
        setStatusMessage("")
        setUploading(false)
        ws.close()
      }
    }

    ws.onerror = (error) => {
      console.error("[Upload] WebSocket error:", error)
      setStatusMessage("Connection error. Retrying...")
    }

    ws.onclose = () => {
      console.log("[Upload] WebSocket closed")
    }
  }

  const loadResults = async (videoId: string) => {
    try {
      console.log("[Upload] Loading results for:", videoId)
      const response = await fetch(`${API_URL}/results/${videoId}`, {
        headers: {
          "ngrok-skip-browser-warning": "true"
        }
      })

      if (!response.ok) {
        throw new Error(`Failed to load results: ${response.status}`)
      }

      const detectionData: DetectionData = await response.json()
      console.log("[Upload] Results loaded:", detectionData)

      setUploading(false)
      setProgress(100)
      setStatusMessage("✓ Complete!")
      setError(null)

      // Pass detection data, video_id, and the original file
      if (file) {
        onDetectionComplete(detectionData, videoId, file)
      }
    } catch (error) {
      console.error("[Upload] Failed to load results:", error)
      setError("Failed to load results. Please try again.")
      setStatusMessage("")
      setUploading(false)
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

    // Add JSON file if provided
    if (jsonFile) {
      formData.append("json_file", jsonFile)
    }

    setUploading(true)
    setProgress(0)
    setStatusMessage("Uploading...")
    setError(null)

    try {
      console.log("[Upload] Uploading to:", `${API_URL}/upload`)
      console.log("[Upload] Detection type:", detectionType)
      console.log("[Upload] FormData contents:")
      console.log("  - file:", file.name)
      console.log("  - detection_type:", detectionType)
      console.log("  - speed_kmh:", speed)

      const response = await fetch(`${API_URL}/upload`, {
        method: "POST",
        headers: {
          "ngrok-skip-browser-warning": "true"
        },
        body: formData
      })

      console.log("[Upload] Upload response status:", response.status)

      if (!response.ok) {
        const errorText = await response.text()
        throw new Error(`Upload failed (${response.status}): ${errorText}`)
      }

      const result = await response.json()
      const videoId = result.video_id

      console.log("[Upload] Video uploaded successfully, ID:", videoId)
      console.log("[Upload] Response:", result)
      setStatusMessage("Uploaded! Starting processing...")
      setProgress(10)

      // Connect WebSocket for progress updates
      connectWebSocket(videoId)
    } catch (error) {
      console.error("[Upload] Upload error:", error)

      let errorMessage = "Upload failed"

      if (error instanceof TypeError && error.message === "Failed to fetch") {
        errorMessage = "Cannot connect to server. Please check:\n• Backend is running on " + API_URL + "\n• CORS is configured properly\n• No firewall blocking the connection"
      } else if (error instanceof Error) {
        errorMessage = error.message
      }

      setError(errorMessage)
      setStatusMessage("")
      setUploading(false)
      setProgress(0)
    }
  }

  return (
    <Card className="">
      <CardHeader>
        <CardTitle>Upload Video</CardTitle>
        <CardDescription>
          Select a video file, detection type, and vehicle speed to start AI-powered analysis
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* File Input */}
          <div className="space-y-2">
            <Label htmlFor="video-file">Video File</Label>
            <div className="flex gap-2">
              <Input
                ref={fileInputRef}
                id="video-file"
                type="file"
                accept="video/*"
                onChange={(e) => {
                  setFile(e.target.files?.[0] || null)
                  setError(null)
                }}
                disabled={uploading}
                className="flex-1"
              />
            </div>
            {file && (
              <p className="text-sm text-muted-foreground">
                Selected: {file.name} ({(file.size / 1024 / 1024).toFixed(2)} MB)
              </p>
            )}
          </div>

          {/* JSON File Input */}
          <div className="space-y-2">
            <Label htmlFor="json-file">GPS JSON File</Label>
            <div className="flex gap-2">
              <Input
                ref={jsonFileInputRef}
                id="json-file"
                type="file"
                accept=".json,application/json"
                onChange={(e) => {
                  setJsonFile(e.target.files?.[0] || null)
                  setError(null)
                }}
                disabled={uploading}
                className="flex-1"
              />
            </div>
            {jsonFile && (
              <p className="text-sm text-muted-foreground">
                Selected: {jsonFile.name} ({(jsonFile.size / 1024).toFixed(2)} KB)
              </p>
            )}
          </div>

          {/* Detection Type Selector */}
          <div className="space-y-2">
            <Label htmlFor="detection-type">Detection Type</Label>
            <Select
              value={detectionType}
              onValueChange={handleDetectionTypeChange}
              disabled={uploading}
            >
              <SelectTrigger id="detection-type">
                <SelectValue placeholder="Select detection type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="pothole-detection">
                  <div className="flex items-center gap-2">
                    <span>Pothole Detection</span>
                  </div>
                </SelectItem>
                <SelectItem value="sign-board-detection">
                  <div className="flex items-center gap-2">
                    <span>Signboard Detection</span>
                  </div>
                </SelectItem>
                <SelectItem value="pot-sign-detection">
                  <div className="flex items-center gap-2">
                    <span>Pothole & Signboard Detection</span>
                  </div>
                </SelectItem>
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
          className="w-full bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-500/25"

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
          <div className="space-y-3">
            <Progress value={progress} className="h-3" />
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">{statusMessage}</span>
              <span className="font-semibold">{progress}%</span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}