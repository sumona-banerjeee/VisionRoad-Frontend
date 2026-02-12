"use client"

import { useRouter } from "next/navigation"
import { ProjectSelectionSection } from "@/components/project-selection-section"
import { SidebarNavigation } from "@/components/sidebar-navigation"
import { type SessionContext, saveSession } from "@/lib/api"
import { TrendingUp } from "lucide-react"

export default function NewAnalysisPage() {
    const router = useRouter()

    const handleSelectionComplete = (session: SessionContext) => {
        // Save session to storage and navigate to upload page
        saveSession(session)
        router.push("/upload")
    }

    return (
        <div className="min-h-screen bg-mesh-gradient text-gray-900 dark:text-gray-100">
            {/* Sidebar Navigation */}
            <SidebarNavigation />

            {/* Main Content */}
            <main className="ml-16 min-h-screen relative overflow-hidden">

                <div className="container mx-auto px-6 py-10 max-w-7xl relative z-10">
                    {/* Refined Left-Aligned Header */}
                    <div className="mb-8 flex items-center gap-5">
                        <div className="p-3 rounded-2xl bg-gradient-to-br from-[#9bddeb] to-[#60a5fa] shadow-md flex items-center justify-center">
                            <TrendingUp className="h-8 w-8 text-white" />
                        </div>
                        <div>
                            <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-gray-900 via-indigo-800 to-indigo-600 dark:from-white dark:via-indigo-200 dark:to-indigo-400 bg-clip-text text-transparent leading-tight">
                                VisionRoad Detection System
                            </h1>
                        </div>
                    </div>

                    {/* Project Selection Section */}
                    <div>
                        <ProjectSelectionSection onSelectionComplete={handleSelectionComplete} />
                    </div>

                    {/* Footer */}
                    <div className="mt-12 text-center">
                        <p className="text-sm text-gray-400 dark:text-gray-500">
                            Sentient Geeks Pvt. Ltd.
                        </p>
                    </div>
                </div>
            </main>
        </div>
    )
}
