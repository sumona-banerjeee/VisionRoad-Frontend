"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
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
import { FilterSelector } from "@/components/dashboard/filter-selector"
import { DetectionDonutChart } from "@/components/dashboard/detection-donut-chart"
import { LocationBarChart } from "@/components/dashboard/location-bar-chart"
import { DashboardMap } from "@/components/dashboard/dashboard-map"
import {
    fetchProjects,
    type Project
} from "@/lib/api"

const API_URL = "http://127.0.0.1:8000/api/v1"

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
    totalDefectedSignboard: number
    totalPothole: number
    totalRoadCrack: number
    totalDamagedRoadMarking: number
    totalGoodSignboard: number
    totalRoadDamage: number
    locationData: Array<{
        name: string
        defected_sign_board: number
        pothole: number
        road_crack: number
        damaged_road_marking: number
        good_sign_board: number
        total: number
    }>
}

function calculateStats(summary: ProjectSummary | null): DetectionStats {
    if (!summary) {
        return {
            totalDefectedSignboard: 0,
            totalPothole: 0,
            totalRoadCrack: 0,
            totalDamagedRoadMarking: 0,
            totalGoodSignboard: 0,
            totalRoadDamage: 0,
            locationData: []
        }
    }

    let totalDefectedSignboard = 0
    let totalPothole = 0
    let totalRoadCrack = 0
    let totalDamagedRoadMarking = 0
    let totalGoodSignboard = 0
    let totalRoadDamage = 0
    const locationData: DetectionStats["locationData"] = []

    for (const pkg of Object.values(summary.packages || {})) {
        for (const [locName, loc] of Object.entries(pkg.locations || {})) {
            let locDefectedSignboard = 0
            let locPothole = 0
            let locRoadCrack = 0
            let locDamagedRoadMarking = 0
            let locGoodSignboard = 0

            for (const detection of loc.detections || []) {
                const type = detection.type.toLowerCase()
                if (type === "defected_sign_board") {
                    locDefectedSignboard++
                    totalDefectedSignboard++
                } else if (type === "pothole") {
                    locPothole++
                    totalPothole++
                } else if (type === "road_crack") {
                    locRoadCrack++
                    totalRoadCrack++
                } else if (type === "damaged_road_marking") {
                    locDamagedRoadMarking++
                    totalDamagedRoadMarking++
                } else if (type === "good_sign_board") {
                    locGoodSignboard++
                    totalGoodSignboard++
                }
            }

            const locTotalDamage = locDefectedSignboard + locPothole + locRoadCrack + locDamagedRoadMarking
            totalRoadDamage += (locDefectedSignboard > 0 || locPothole > 0 || locRoadCrack > 0 || locDamagedRoadMarking > 0) ? 1 : 0 // This logic might need refinement based on "total_road_damage" definition

            if (locDefectedSignboard > 0 || locPothole > 0 || locRoadCrack > 0 || locDamagedRoadMarking > 0 || locGoodSignboard > 0) {
                const shortName = locName.length > 20 ? locName.substring(0, 20) + "..." : locName
                locationData.push({
                    name: shortName,
                    defected_sign_board: locDefectedSignboard,
                    pothole: locPothole,
                    road_crack: locRoadCrack,
                    damaged_road_marking: locDamagedRoadMarking,
                    good_sign_board: locGoodSignboard,
                    total: locDefectedSignboard + locPothole + locRoadCrack + locDamagedRoadMarking + locGoodSignboard
                })
            }
        }
    }

    // Recalculate totalRoadDamage based on backends unique count
    // But since we are aggregating from locations, we just sum them up or use a simpler metric
    // The user's JSON shows "total_road_damage": 9 which is sum of 2+6+0+1
    totalRoadDamage = totalDefectedSignboard + totalPothole + totalRoadCrack + totalDamagedRoadMarking

    return {
        totalDefectedSignboard,
        totalPothole,
        totalRoadCrack,
        totalDamagedRoadMarking,
        totalGoodSignboard,
        totalRoadDamage,
        locationData
    }
}

export default function DashboardPage() {
    const [isLoading, setIsLoading] = useState(true)
    const [projects, setProjects] = useState<Project[]>([])
    const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null)
    const [projectSummary, setProjectSummary] = useState<ProjectSummary | null>(null)
    const [stats, setStats] = useState<DetectionStats>({
        totalDefectedSignboard: 0,
        totalPothole: 0,
        totalRoadCrack: 0,
        totalDamagedRoadMarking: 0,
        totalGoodSignboard: 0,
        totalRoadDamage: 0,
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

    const selectedProject = projects.find(p => p.id === selectedProjectId)

    // Extract packages from project summary
    const packages = projectSummary
        ? Object.keys(projectSummary.packages || {}).map(pkgName => ({
            id: pkgName,
            name: pkgName
        }))
        : []

    // Extract locations from selected package
    const [selectedPackageId, setSelectedPackageId] = useState<string | null>(null)
    const [selectedLocationId, setSelectedLocationId] = useState<string | null>(null)

    const locations = projectSummary && selectedPackageId && selectedPackageId !== "all"
        ? Object.keys(projectSummary.packages[selectedPackageId]?.locations || {}).map(locName => ({
            id: locName,
            name: locName
        }))
        : []

    // Load project summary when project changes
    useEffect(() => {
        if (!selectedProjectId) {
            setProjectSummary(null)
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
            } catch (err) {
                console.error("Failed to load project summary:", err)
                setError("Failed to load project summary.")
                setProjectSummary(null)
            } finally {
                setIsLoading(false)
            }
        }

        loadProjectSummary()
    }, [selectedProjectId])

    // Reset package and location when project changes
    useEffect(() => {
        setSelectedPackageId(null)
        setSelectedLocationId(null)
    }, [selectedProjectId])

    // Reset location when package changes
    useEffect(() => {
        setSelectedLocationId(null)
    }, [selectedPackageId])

    // Filter stats based on selections
    useEffect(() => {
        if (!projectSummary) {
            setStats({
                totalDefectedSignboard: 0,
                totalPothole: 0,
                totalRoadCrack: 0,
                totalDamagedRoadMarking: 0,
                totalGoodSignboard: 0,
                totalRoadDamage: 0,
                locationData: []
            })
            return
        }

        let totalDefectedSignboard = 0
        let totalPothole = 0
        let totalRoadCrack = 0
        let totalDamagedRoadMarking = 0
        let totalGoodSignboard = 0
        const locationData: DetectionStats["locationData"] = []

        const packagesToProcess = selectedPackageId && selectedPackageId !== "all"
            ? { [selectedPackageId]: projectSummary.packages[selectedPackageId] }
            : projectSummary.packages || {}

        for (const [pkgName, pkg] of Object.entries(packagesToProcess)) {
            const locationsToProcess = selectedLocationId && selectedLocationId !== "all"
                ? { [selectedLocationId]: pkg.locations[selectedLocationId] }
                : pkg.locations || {}

            for (const [locName, loc] of Object.entries(locationsToProcess)) {
                if (!loc) continue

                let locDefectedSignboard = 0
                let locPothole = 0
                let locRoadCrack = 0
                let locDamagedRoadMarking = 0
                let locGoodSignboard = 0

                for (const detection of loc.detections || []) {
                    const type = detection.type.toLowerCase()
                    if (type === "defected_sign_board") {
                        locDefectedSignboard++
                        totalDefectedSignboard++
                    } else if (type === "pothole") {
                        locPothole++
                        totalPothole++
                    } else if (type === "road_crack") {
                        locRoadCrack++
                        totalRoadCrack++
                    } else if (type === "damaged_road_marking") {
                        locDamagedRoadMarking++
                        totalDamagedRoadMarking++
                    } else if (type === "good_sign_board") {
                        locGoodSignboard++
                        totalGoodSignboard++
                    }
                }

                if (locDefectedSignboard > 0 || locPothole > 0 || locRoadCrack > 0 || locDamagedRoadMarking > 0 || locGoodSignboard > 0) {
                    const shortName = locName.length > 20 ? locName.substring(0, 20) + "..." : locName
                    locationData.push({
                        name: shortName,
                        defected_sign_board: locDefectedSignboard,
                        pothole: locPothole,
                        road_crack: locRoadCrack,
                        damaged_road_marking: locDamagedRoadMarking,
                        good_sign_board: locGoodSignboard,
                        total: locDefectedSignboard + locPothole + locRoadCrack + locDamagedRoadMarking + locGoodSignboard
                    })
                }
            }
        }

        setStats({
            totalDefectedSignboard,
            totalPothole,
            totalRoadCrack,
            totalDamagedRoadMarking,
            totalGoodSignboard,
            totalRoadDamage: totalDefectedSignboard + totalPothole + totalRoadCrack + totalDamagedRoadMarking,
            locationData
        })
    }, [projectSummary, selectedPackageId, selectedLocationId])

    return (
        <div className="min-h-screen bg-mesh-gradient text-gray-900 dark:text-gray-100">
            {/* Sidebar Navigation */}
            <SidebarNavigation />

            {/* Main Content - offset by sidebar width */}
            <main className="ml-16 min-h-screen">
                <div className="p-4 px-8 max-w-full mx-auto">
                    {/* Header */}
                    <div className="mb-8 flex items-center gap-5">
                        <div className="p-3 rounded-2xl bg-gradient-to-br from-[#9bddeb] to-[#60a5fa] shadow-md flex items-center justify-center relative overflow-hidden group">
                            {/* Constant orbit animations removed */}
                            <div className="absolute inset-0 bg-white/20 opacity-50"></div>
                            <div className="absolute inset-0 border-2 border-white/30 rounded-2xl opacity-30"></div>
                            <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white relative z-10">
                                <path d="M50 20L85 80H15L50 20Z" stroke="currentColor" strokeWidth="6" strokeLinejoin="round" />
                                <path d="M40 80L50 55L60 80" stroke="currentColor" strokeWidth="6" />
                            </svg>
                        </div>
                        <div>
                            <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 via-indigo-800 to-indigo-600 dark:from-white dark:via-indigo-200 dark:to-indigo-400 bg-clip-text text-transparent">
                                VisionRoad Analytics Dashboard
                            </h1>
                            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                                A Comprehensive Overview Of Your Road Infrastructure Analysis
                            </p>
                        </div>
                    </div>

                    {/* Error Display */}
                    {error && (
                        <div className="mb-4 flex items-center gap-2 p-3 rounded-xl bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 text-sm">
                            <AlertCircle className="h-4 w-4 flex-shrink-0" />
                            <p>{error}</p>
                        </div>
                    )}

                    {/* Stats Cards - Top Row */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                        <GradientStatsCard
                            title="Total Road Damage"
                            subtitle="Combined damage detections"
                            value={stats.totalRoadDamage}
                            icon={TrendingUp}
                            gradient="purple"
                            isLoading={isLoading}
                        />
                        <GradientStatsCard
                            title="Potholes"
                            subtitle="Surface depressions"
                            value={stats.totalPothole}
                            icon={AlertTriangle}
                            gradient="green"
                            isLoading={isLoading}
                        />
                        <GradientStatsCard
                            title="Defected Signboards"
                            subtitle="Damaged traffic signs"
                            value={stats.totalDefectedSignboard}
                            icon={RectangleHorizontal}
                            gradient="blue"
                            isLoading={isLoading}
                        />
                        <GradientStatsCard
                            title="Road Cracks"
                            subtitle="Surface fissures"
                            value={stats.totalRoadCrack}
                            icon={AlertTriangle}
                            gradient="orange"
                            isLoading={isLoading}
                        />
                        <GradientStatsCard
                            title="Damaged Markings"
                            subtitle="Worn road lines"
                            value={stats.totalDamagedRoadMarking}
                            icon={TrendingUp}
                            gradient="indigo"
                            isLoading={isLoading}
                        />
                        <GradientStatsCard
                            title="Good Signboards"
                            subtitle="Informational markers"
                            value={stats.totalGoodSignboard}
                            icon={RectangleHorizontal}
                            gradient="emerald"
                            isLoading={isLoading}
                        />
                    </div>

                    {/* Filter Selector - Above main content */}
                    <div className="mb-6">
                        <FilterSelector
                            projects={projects}
                            selectedProjectId={selectedProjectId}
                            selectedPackageId={selectedPackageId}
                            selectedLocationId={selectedLocationId}
                            onProjectChange={setSelectedProjectId}
                            onPackageChange={setSelectedPackageId}
                            onLocationChange={setSelectedLocationId}
                            packages={packages}
                            locations={locations}
                            isLoading={isLoading}
                        />
                    </div>

                    {/* Charts Row - Side by Side */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
                        {/* Left Chart - Detection Distribution */}
                        <Card className="rounded-xl overflow-hidden">
                            <CardHeader className="pb-2 border-b border-[var(--border)]">
                                <CardTitle className="text-base font-bold flex items-center gap-2">
                                    <div className="p-1.5 rounded-lg bg-[#2563eb]/10 shadow-sm">
                                        <BarChart3 className="h-4 w-4 text-[#2563eb]" />
                                    </div>
                                    <span className="text-[#2563eb]">
                                        Detection Distribution
                                    </span>
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="pt-4">
                                <DetectionDonutChart
                                    defectedSignboard={stats.totalDefectedSignboard}
                                    pothole={stats.totalPothole}
                                    roadCrack={stats.totalRoadCrack}
                                    damagedRoadMarking={stats.totalDamagedRoadMarking}
                                    goodSignboard={stats.totalGoodSignboard}
                                    isLoading={isLoading}
                                />
                            </CardContent>
                        </Card>

                        {/* Right Chart - Location Bar Chart */}
                        <Card className="rounded-xl overflow-hidden">
                            <CardHeader className="pb-2 border-b border-[var(--border)]">
                                <CardTitle className="text-base font-bold flex items-center gap-2">
                                    <div className="p-1.5 rounded-lg bg-[#2563eb]/10 shadow-sm">
                                        <MapPinIcon className="h-4 w-4 text-[#2563eb]" />
                                    </div>
                                    <span className="text-[#2563eb]">
                                        Detections by Location
                                    </span>
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="pt-4">
                                <LocationBarChart
                                    data={stats.locationData.map(loc => ({
                                        name: loc.name,
                                        defected_sign_board: loc.defected_sign_board,
                                        pothole: loc.pothole,
                                        road_crack: loc.road_crack,
                                        damaged_road_marking: loc.damaged_road_marking,
                                        good_sign_board: loc.good_sign_board,
                                        total: loc.total
                                    }))}
                                    isLoading={isLoading}
                                />
                            </CardContent>
                        </Card>
                    </div>

                    {/* Map - Full Width Below Charts */}
                    <div>
                        <DashboardMap
                            selectedProjectId={selectedProjectId}
                            selectedPackageId={selectedPackageId}
                            selectedLocationId={selectedLocationId}
                            projectSummary={projectSummary}
                        />
                    </div>

                    {/* Footer */}
                    <div className="mt-8 text-center">
                        <p className="text-xs text-gray-400 dark:text-gray-500">
                            Sentient Geeks Pvt. Ltd.
                        </p>
                    </div>
                </div>
            </main>
        </div>
    )
}
