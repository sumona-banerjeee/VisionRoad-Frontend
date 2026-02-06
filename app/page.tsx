"use client"

import { useRouter } from "next/navigation"
import { ProjectSelectionSection } from "@/components/project-selection-section"
import { SidebarNavigation } from "@/components/sidebar-navigation"
import { type SessionContext, saveSession } from "@/lib/api"

export default function SelectionPage() {
  const router = useRouter()

  const handleSelectionComplete = (session: SessionContext) => {
    // Save session to storage and navigate to upload page
    saveSession(session)
    router.push("/upload")
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/50 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950">
      {/* Sidebar Navigation */}
      <SidebarNavigation />

      {/* Main Content */}
      <main className="ml-16 min-h-screen relative overflow-hidden">
        {/* Decorative background elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -left-40 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl" />
          <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-blue-500/5 rounded-full blur-3xl" />
        </div>

        <div className="container mx-auto px-4 py-12 max-w-5xl relative z-10">
          {/* Premium Header */}
          <div className="mb-10 animate-in fade-in slide-in-from-top duration-700">
            <div className="text-center max-w-2xl mx-auto">
              <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-gray-900 via-indigo-800 to-indigo-600 dark:from-white dark:via-indigo-200 dark:to-indigo-400 bg-clip-text text-transparent leading-tight">
                VisionRoad Detection System
              </h1>
            </div>
          </div>

          {/* Project Selection Section */}
          <div className="animate-in fade-in slide-in-from-bottom duration-700 delay-150">
            <ProjectSelectionSection onSelectionComplete={handleSelectionComplete} />
          </div>

          {/* Footer */}
          <div className="mt-12 text-center animate-in fade-in duration-700 delay-300">
            <p className="text-sm text-gray-400 dark:text-gray-500">
              Sentient Geeks Pvt. Ltd.
            </p>
          </div>
        </div>
      </main>
    </div>
  )
}
