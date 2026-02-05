"use client"

import { useRouter } from "next/navigation"
import { ProjectSelectionSection } from "@/components/project-selection-section"
import { type SessionContext, saveSession } from "@/lib/api"

export default function SelectionPage() {
  const router = useRouter()

  const handleSelectionComplete = (session: SessionContext) => {
    // Save session to storage and navigate to upload page
    saveSession(session)
    router.push("/upload")
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Header */}
        <div className="mb-8 animate-in fade-in slide-in-from-top duration-700">
          <h1 className="text-4xl font-bold mb-2 text-balance bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
            VisionRoad Detection System
          </h1>
          <p className="text-muted-foreground">
            Select your project location to begin AI-powered road analysis
          </p>
        </div>

        {/* Project Selection Section */}
        <div className="animate-in fade-in slide-in-from-bottom duration-700 delay-100">
          <ProjectSelectionSection onSelectionComplete={handleSelectionComplete} />
        </div>
      </div>
    </div>
  )
}
