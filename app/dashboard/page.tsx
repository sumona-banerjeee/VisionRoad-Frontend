"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
    Plus,
    Loader2,
    AlertCircle,
    TrendingUp,
    MapPin as MapPinIcon,
    BarChart3,
    AlertTriangle,
    RectangleHorizontal
} from "lucide-react"
import { SidebarNavigation } from "@/components/sidebar-navigation"
import { GradientStatsCard } from "@/components/dashboard/gradient-stats-card"
import { CompactProjectSelector } from "@/components/dashboard/compact-project-selector"
import { DetectionDonutChart } from "@/components/dashboard/detection-donut-chart"
import { LocationBarChart } from "@/components/dashboard/location-bar-chart"
import { DashboardMap } from "@/components/dashboard/dashboard-map"
import {
    fetchProjects,
    type Project
} from "@/lib/api"

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000/api/v1"

interface ProjectSummary {
    project: {
        id: string
        name: string
        corridor_name: string | null
        state: string | null
    }
    packages: {
        [key: string]: {
            package_id: string
            region: string | null
            locations: {
                [key: string]: {
                    location_id: string
                    chainage: string | null
                    detection_count: number
                    detections: Array<{
                        id: number
                        type: string
                        class: string
                        confidence: number
                        latitude: number
                        longitude: number
                    }>
                }
            }
        }
    }
}

interface DetectionStats {
    totalPotholes: number
    totalSignboards: number
    totalDetections: number
    locationData: Array<{
        name: string
        potholes: number
        signboards: number
        total: number
    }>
}

function calculateStats(summary: ProjectSummary | null): DetectionStats {
    if (!summary) {
        return { totalPotholes: 0, totalSignboards: 0, totalDetections: 0, locationData: [] }
    }

    let totalPotholes = 0
    let totalSignboards = 0
    const locationData: DetectionStats["locationData"] = []

    for (const pkg of Object.values(summary.packages || {})) {
        for (const [locName, loc] of Object.entries(pkg.locations || {})) {
            let locPotholes = 0
            let locSignboards = 0

            for (const detection of loc.detections || []) {
                if (detection.type.toLowerCase().includes("pothole")) {
                    locPotholes++
                    totalPotholes++
                } else {
                    locSignboards++
                    totalSignboards++
                }
            }

            if (locPotholes > 0 || locSignboards > 0) {
                const shortName = locName.length > 20 ? locName.substring(0, 20) + "..." : locName
                locationData.push({
                    name: shortName,
                    potholes: locPotholes,
                    signboards: locSignboards,
                    total: locPotholes + locSignboards
                })
            }
        }
    }

    return {
        totalPotholes,
        totalSignboards,
        totalDetections: totalPotholes + totalSignboards,
        locationData
    }
}

export default function DashboardPage() {
    const router = useRouter()
    const [isLoading, setIsLoading] = useState(true)
    const [projects, setProjects] = useState<Project[]>([])
    const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null)
    const [projectSummary, setProjectSummary] = useState<ProjectSummary | null>(null)
    const [stats, setStats] = useState<DetectionStats>({
        totalPotholes: 0,
        totalSignboards: 0,
        totalDetections: 0,
        locationData: []
    })
    const [error, setError] = useState<string | null>(null)

    // Load projects on mount
    useEffect(() => {
        const loadProjects = async () => {
            try {
                setIsLoading(true)
                setError(null)
                const projectsData = await fetchProjects()
                setProjects(projectsData)

                if (projectsData.length > 0) {
                    setSelectedProjectId(projectsData[0].id)
                }
            } catch (err) {
                console.error("Failed to load projects:", err)
                setError("Failed to load projects. Please check if the backend is running.")
            } finally {
                setIsLoading(false)
            }
        }

        loadProjects()
    }, [])

    // Load project summary when project changes
    useEffect(() => {
        if (!selectedProjectId) {
            setProjectSummary(null)
            setStats({ totalPotholes: 0, totalSignboards: 0, totalDetections: 0, locationData: [] })
            return
        }

        const loadProjectSummary = async () => {
            try {
                setIsLoading(true)
                setError(null)

                const response = await fetch(`${API_URL}/summary/projects/${selectedProjectId}`, {
                    headers: {
                        "Content-Type": "application/json",
                        "ngrok-skip-browser-warning": "true"
                    }
                })

                if (!response.ok) {
                    throw new Error(`API Error: ${response.status}`)
                }

                const summary: ProjectSummary = await response.json()
                setProjectSummary(summary)
                setStats(calculateStats(summary))
            } catch (err) {
                console.error("Failed to load project summary:", err)
                setError("Failed to load project summary.")
                setProjectSummary(null)
                setStats({ totalPotholes: 0, totalSignboards: 0, totalDetections: 0, locationData: [] })
            } finally {
                setIsLoading(false)
            }
        }

        loadProjectSummary()
    }, [selectedProjectId])

    const handleNewAnalysis = () => {
        router.push("/")
    }

    const selectedProject = projects.find(p => p.id === selectedProjectId)

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/50 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950">
            {/* Sidebar Navigation */}
            <SidebarNavigation />

            {/* Main Content - offset by sidebar width */}
            <main className="ml-16 min-h-screen">
                <div className="p-6 max-w-[1600px] mx-auto">
                    {/* Header */}
                    <div className="mb-6 animate-in fade-in slide-in-from-top duration-500">
                        <div className="flex items-center justify-between">
                            <div>
                                <h1 className="text-2xl font-bold bg-gradient-to-r from-gray-900 via-indigo-800 to-indigo-600 dark:from-white dark:via-indigo-200 dark:to-indigo-400 bg-clip-text text-transparent">
                                    VisionRoad Analytics Dashboard
                                </h1>
                                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                                    A Comprehensive Overview Of Your Road Infrastructure Analysis
                                </p>
                            </div>
                            <Button
                                onClick={handleNewAnalysis}
                                className="bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/40 transition-all duration-300"
                            >
                                <Plus className="h-4 w-4 mr-2" />
                                New Analysis
                            </Button>
                        </div>
                    </div>

                    {/* Error Display */}
                    {error && (
                        <div className="mb-4 flex items-center gap-2 p-3 rounded-xl bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 text-sm animate-in fade-in duration-300">
                            <AlertCircle className="h-4 w-4 flex-shrink-0" />
                            <p>{error}</p>
                        </div>
                    )}

                    {/* Stats Cards - Top Row */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6 animate-in fade-in slide-in-from-bottom duration-500">
                        <GradientStatsCard
                            title="Total Detections"
                            subtitle="All detected objects"
                            value={stats.totalDetections}
                            icon={TrendingUp}
                            gradient="green"
                            isLoading={isLoading}
                        />
                        <GradientStatsCard
                            title="Potholes"
                            subtitle="Road surface damage"
                            value={stats.totalPotholes}
                            icon={AlertTriangle}
                            gradient="coral"
                            isLoading={isLoading}
                        />
                        <GradientStatsCard
                            title="Signboards"
                            subtitle="Traffic signs detected"
                            value={stats.totalSignboards}
                            icon={RectangleHorizontal}
                            gradient="blue"
                            isLoading={isLoading}
                        />
                    </div>

                    {/* Project Selector - Above main content */}
                    <div className="mb-6 animate-in fade-in slide-in-from-bottom duration-500 delay-100">
                        <CompactProjectSelector
                            projects={projects}
                            selectedProjectId={selectedProjectId}
                            onProjectChange={setSelectedProjectId}
                            selectedProject={selectedProject}
                            isLoading={isLoading}
                        />
                    </div>

                    {/* Main Content Grid - Map Left, Charts Right */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 animate-in fade-in slide-in-from-bottom duration-500 delay-200">
                        {/* Left Side - Map */}
                        <div>
                            <DashboardMap className="h-auto" />
                        </div>

                        {/* Right Side - Stacked Charts */}
                        <div className="space-y-4">
                            {/* Detection Distribution */}
                            <Card className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm border-0 shadow-lg shadow-gray-200/50 dark:shadow-gray-900/50 rounded-xl overflow-hidden">
                                <CardHeader className="pb-2 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950/30 dark:to-emerald-950/30">
                                    <CardTitle className="text-base font-bold flex items-center gap-2">
                                        <div className="p-1.5 rounded-lg bg-gradient-to-br from-emerald-400 to-teal-500 shadow-md shadow-emerald-500/30">
                                            <BarChart3 className="h-4 w-4 text-white" />
                                        </div>
                                        <span className="bg-gradient-to-r from-emerald-600 via-teal-500 to-emerald-600 dark:from-emerald-400 dark:via-teal-400 dark:to-emerald-400 bg-clip-text text-transparent">
                                            Detection Distribution
                                        </span>
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="pt-4">
                                    <DetectionDonutChart
                                        potholes={stats.totalPotholes}
                                        signboards={stats.totalSignboards}
                                        isLoading={isLoading}
                                    />
                                </CardContent>
                            </Card>

                            {/* Location Bar Chart */}
                            <Card className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm border-0 shadow-lg shadow-gray-200/50 dark:shadow-gray-900/50 rounded-xl overflow-hidden">
                                <CardHeader className="pb-2 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30">
                                    <CardTitle className="text-base font-bold flex items-center gap-2">
                                        <div className="p-1.5 rounded-lg bg-gradient-to-br from-blue-400 to-indigo-500 shadow-md shadow-blue-500/30">
                                            <MapPinIcon className="h-4 w-4 text-white" />
                                        </div>
                                        <span className="bg-gradient-to-r from-blue-600 via-indigo-500 to-blue-600 dark:from-blue-400 dark:via-indigo-400 dark:to-blue-400 bg-clip-text text-transparent">
                                            Detections by Location
                                        </span>
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="pt-4">
                                    <LocationBarChart
                                        data={stats.locationData}
                                        isLoading={isLoading}
                                    />
                                </CardContent>
                            </Card>
                        </div>
                    </div>

                    {/* Footer */}
                    <div className="mt-8 text-center animate-in fade-in duration-700 delay-300">
                        <p className="text-xs text-gray-400 dark:text-gray-500">
                            Sentient Geeks Pvt. Ltd.
                        </p>
                    </div>
                </div>
            </main>
        </div>
    )
}
