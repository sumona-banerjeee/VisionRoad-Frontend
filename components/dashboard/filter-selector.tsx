"use client"

import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { FolderOpen, Package, MapPin } from "lucide-react"
import { type Project } from "@/lib/api"

interface FilterSelectorProps {
    projects: Project[]
    selectedProjectId: string | null
    selectedPackageId: string | null
    selectedLocationId: string | null
    onProjectChange: (projectId: string) => void
    onPackageChange: (packageId: string) => void
    onLocationChange: (locationId: string) => void
    packages: Array<{ id: string; name: string }>
    locations: Array<{ id: string; name: string }>
    isLoading?: boolean
}

export function FilterSelector({
    projects,
    selectedProjectId,
    selectedPackageId,
    selectedLocationId,
    onProjectChange,
    onPackageChange,
    onLocationChange,
    packages,
    locations,
    isLoading = false
}: FilterSelectorProps) {
    return (
        <div className="flex flex-col gap-4 p-4">
            {/* Project Dropdown */}
            <div className="space-y-2">
                <div className="flex items-center gap-2 mb-1">
                    <div className="p-1 rounded-md bg-blue-100 dark:bg-blue-900/50">
                        <FolderOpen className="h-3.5 w-3.5 text-blue-600" />
                    </div>
                    <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Project</span>
                </div>
                <Select
                    value={selectedProjectId || ""}
                    onValueChange={onProjectChange}
                    disabled={isLoading || projects.length === 0}
                >
                    <SelectTrigger className="h-9 text-sm bg-slate-50 border border-slate-200 shadow-none ring-0! focus:ring-0 px-3 w-full rounded-lg">
                        <SelectValue placeholder="Select project" />
                    </SelectTrigger>
                    <SelectContent className="rounded-xl border-slate-200">
                        {projects.map((project) => (
                            <SelectItem key={project.id} value={project.id} className="rounded-lg">
                                {project.name}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>

            {/* Package Dropdown */}
            {selectedProjectId && (
                <div className="space-y-2">
                    <div className="flex items-center gap-2 mb-1">
                        <div className="p-1 rounded-md bg-emerald-100 dark:bg-emerald-900/50">
                            <Package className="h-3.5 w-3.5 text-emerald-600" />
                        </div>
                        <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Package</span>
                    </div>
                    <Select
                        value={selectedPackageId || "all"}
                        onValueChange={onPackageChange}
                        disabled={isLoading}
                    >
                        <SelectTrigger className="h-9 text-sm bg-slate-50 border border-slate-200 shadow-none ring-0! focus:ring-0 px-3 w-full rounded-lg">
                            <SelectValue placeholder="All packages" />
                        </SelectTrigger>
                        <SelectContent className="rounded-xl border-slate-200">
                            <SelectItem value="all" className="rounded-lg">All Packages</SelectItem>
                            {packages.map((pkg) => (
                                <SelectItem key={pkg.id} value={pkg.id} className="rounded-lg">
                                    {pkg.name}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
            )}

            {/* Location Dropdown */}
            {selectedPackageId && selectedPackageId !== "all" && (
                <div className="space-y-2">
                    <div className="flex items-center gap-2 mb-1">
                        <div className="p-1 rounded-md bg-purple-100 dark:bg-purple-900/50">
                            <MapPin className="h-3.5 w-3.5 text-purple-600" />
                        </div>
                        <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Location</span>
                    </div>
                    <Select
                        value={selectedLocationId || "all"}
                        onValueChange={onLocationChange}
                        disabled={isLoading}
                    >
                        <SelectTrigger className="h-9 text-sm bg-slate-50 border border-slate-200 shadow-none ring-0! focus:ring-0 px-3 w-full rounded-lg">
                            <SelectValue placeholder="All locations" />
                        </SelectTrigger>
                        <SelectContent className="rounded-xl border-slate-200">
                            <SelectItem value="all" className="rounded-lg">All Locations</SelectItem>
                            {locations.map((loc) => (
                                <SelectItem key={loc.id} value={loc.id} className="rounded-lg">
                                    {loc.name}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
            )}
        </div>
    );
}
