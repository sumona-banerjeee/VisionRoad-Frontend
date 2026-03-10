"use client"

import { useRouter } from "next/navigation"
import { ProjectSelectionSection } from "@/components/project-selection-section"
import { SidebarNavigation } from "@/components/sidebar-navigation"
import { type SessionContext, saveSession } from "@/lib/api"
import { TrendingUp } from "lucide-react"
import { PageHeader } from "@/components/page-header"

export default function NewAnalysisPage() {
    const router = useRouter()

    const handleSelectionComplete = (session: SessionContext) => {
        // Save session to storage and navigate to upload page
        saveSession(session)
        router.push("/upload")
    }

    return (
        <div className="min-h-screen text-gray-900 dark:text-gray-100">
            {/* Sidebar Navigation */}
            <SidebarNavigation />

            {/* Main Content */}
            <main className="ml-20 min-h-screen relative overflow-hidden">

                <div className="container mx-auto px-6 py-10 max-w-340 relative z-10">
                    {/* Refined Left-Aligned Header */}
                    <div className="mb-8">
                        <PageHeader
                            title="VisionRoad Detection System"
                            description="Select project details to begin your AI-powered road infrastructure analysis"
                            icon={TrendingUp}
                        />
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
