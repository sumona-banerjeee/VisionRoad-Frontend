"use client"

import { NavigationMenu } from "@/components/navigation-menu"
import { DashboardMap } from "@/components/dashboard/dashboard-map"

export default function MapPage() {
    return (
        <div className="min-h-screen bg-mesh-gradient relative overflow-hidden">
            {/* Navigation Menu */}
            <NavigationMenu />

            <div className="container mx-auto px-4 py-8 max-w-7xl relative z-10">
                {/* Header */}
                <div className="mb-8">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-3xl md:text-4xl font-bold text-gradient leading-tight">
                                Detection Map
                            </h1>
                            <p className="text-muted-foreground mt-1">
                                View all detected potholes and signboards on the map
                            </p>
                        </div>
                    </div>
                </div>

                {/* Map */}
                <div className="">
                    <DashboardMap className="h-[calc(100vh-200px)] min-h-[500px]" />
                </div>

                {/* Legend */}
                <div className="mt-6 flex flex-wrap gap-6">
                    <div className="flex items-center gap-2">
                        <div className="w-4 h-4 rounded-full bg-red-500 border-2 border-red-600" />
                        <span className="text-sm text-muted-foreground">Pothole</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-4 h-4 rounded-full bg-blue-500 border-2 border-blue-600" />
                        <span className="text-sm text-muted-foreground">Signboard</span>
                    </div>
                </div>

                {/* Footer */}
                <div className="mt-8 text-center">
                    <p className="text-sm text-muted-foreground">
                        Sentient Geeks Pvt. Ltd.
                    </p>
                </div>
            </div>
        </div>
    )
}
