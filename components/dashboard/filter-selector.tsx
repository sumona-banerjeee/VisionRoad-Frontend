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
        <div className="flex flex-wrap items-center gap-3 p-3 rounded-xl bg-card border border-[var(--border)] shadow-sm">
            {/* Project Dropdown */}
            <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-blue-100 dark:bg-blue-900/50">
                    <FolderOpen className="h-4 w-4 text-indigo-500" />
                </div>
                <Select
                    value={selectedProjectId || ""}
                    onValueChange={onProjectChange}
                    disabled={isLoading || projects.length === 0}
                >
                    <SelectTrigger className="w-[200px] h-8 text-sm bg-transparent border-0 shadow-none focus:ring-0 px-1">
                        <SelectValue placeholder="Select project" />
                    </SelectTrigger>
                    <SelectContent>
                        {projects.map((project) => (
                            <SelectItem key={project.id} value={project.id}>
                                {project.name}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>

            {/* Divider */}
            {selectedProjectId && packages.length > 0 && (
                <div className="h-5 w-px bg-gray-300 dark:bg-gray-600" />
            )}

            {/* Package Dropdown */}
            {selectedProjectId && packages.length > 0 && (
                <div className="flex items-center gap-2">
                    <div className="p-1.5 rounded-lg bg-emerald-100 dark:bg-emerald-900/50">
                        <Package className="h-4 w-4 text-emerald-500" />
                    </div>
                    <Select
                        value={selectedPackageId || "all"}
                        onValueChange={onPackageChange}
                        disabled={isLoading}
                    >
                        <SelectTrigger className="w-[200px] h-8 text-sm bg-transparent border-0 shadow-none focus:ring-0 px-1">
                            <SelectValue placeholder="All packages" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Packages</SelectItem>
                            {packages.map((pkg) => (
                                <SelectItem key={pkg.id} value={pkg.id}>
                                    {pkg.name}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
            )}

            {/* Divider */}
            {selectedPackageId && selectedPackageId !== "all" && locations.length > 0 && (
                <div className="h-5 w-px bg-gray-300 dark:bg-gray-600" />
            )}

            {/* Location Dropdown */}
            {selectedPackageId && selectedPackageId !== "all" && locations.length > 0 && (
                <div className="flex items-center gap-2">
                    <div className="p-1.5 rounded-lg bg-purple-100 dark:bg-purple-900/50">
                        <MapPin className="h-4 w-4 text-purple-500" />
                    </div>
                    <Select
                        value={selectedLocationId || "all"}
                        onValueChange={onLocationChange}
                        disabled={isLoading}
                    >
                        <SelectTrigger className="w-[200px] h-8 text-sm bg-transparent border-0 shadow-none focus:ring-0 px-1">
                            <SelectValue placeholder="All locations" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Locations</SelectItem>
                            {locations.map((loc) => (
                                <SelectItem key={loc.id} value={loc.id}>
                                    {loc.name}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
            )}
        </div>
    )
}
