"use client"

import { useRouter } from "next/navigation"
import { ProjectSelectionSection } from "@/components/project-selection-section"
import { SidebarNavigation } from "@/components/sidebar-navigation"
import { type SessionContext, saveSession } from "@/lib/api"
import { TrendingUp } from "lucide-react"
import Image from "next/image"

export default function NewAnalysisPage() {
    const router = useRouter()

    const handleSelectionComplete = (session: SessionContext) => {
        // Save session to storage and navigate to upload page
        saveSession(session)
        router.push("/upload")
    }

    return (
        <div className="h-screen text-gray-900 dark:text-gray-100 relative overflow-hidden">
            {/* Full-bleed Background Image */}
            <div className="fixed inset-0 z-0">
                <Image
                    src="/image/background.png"
                    alt=""
                    fill
                    priority
                    className="object-cover"
                    quality={90}
                />
            </div>

            {/* Sidebar Navigation */}
            <SidebarNavigation />

            {/* Main Content */}
            <main className="ml-16 h-screen relative z-10 flex flex-col">
                <div className="container mx-auto px-6 py-4 max-w-6xl flex flex-col flex-1">
                    {/* Header: Logo + Title + Hero Image */}
                    <div className="mb-4 flex items-center justify-between gap-6">
                        {/* Left: Logo icon + Title + Subtitle */}
                        <div className="flex items-center gap-5">
                            <div className="p-3 rounded-2xl bg-gradient-to-br from-[#9bddeb] to-[#60a5fa] shadow-lg flex items-center justify-center">
                                <TrendingUp className="h-9 w-9 text-white" />
                            </div>
                            <div>
                                <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-gray-900 via-indigo-800 to-indigo-600 dark:from-white dark:via-indigo-200 dark:to-indigo-400 bg-clip-text text-transparent leading-tight">
                                    <span className="italic">VisionRoad</span> Detection System
                                </h1>
                                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                                    Smart AI powered road condition monitoring
                                </p>
                            </div>
                        </div>

                        {/* Right: Hero Image */}
                        <div className="hidden md:block flex-shrink-0">
                            <div className="relative w-[240px] h-[120px] rounded-xl overflow-hidden shadow-lg border border-white/50">
                                <Image
                                    src="/image/landing_logo.png"
                                    alt="AI Road Detection"
                                    fill
                                    className="object-cover"
                                    quality={85}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Project Selection Section */}
                    <div>
                        <ProjectSelectionSection onSelectionComplete={handleSelectionComplete} />
                    </div>

                    {/* Footer */}
                    <div className="mt-auto pt-3 pb-2 text-center">
                        <p className="text-sm text-gray-400 dark:text-gray-500">
                            Sentient Geeks Pvt. Ltd.
                        </p>
                    </div>
                </div>
            </main>
        </div>
    )
}
