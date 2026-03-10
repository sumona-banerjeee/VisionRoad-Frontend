"use client"

import { useRouter } from "next/navigation"
import dynamic from "next/dynamic"
import { SidebarNavigation } from "@/components/sidebar-navigation"
import { type SessionContext, saveSession } from "@/lib/api"
import { TrendingUp } from "lucide-react"
import { PageHeader } from "@/components/page-header"
import { PoweredBy } from "@/components/powered-by"

const ProjectSelectionSection = dynamic(
    () => import("@/components/project-selection-section").then(mod => mod.ProjectSelectionSection),
    { ssr: false }
)

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

                    <PoweredBy />
                </div>
            </main>
        </div>
    )
}
