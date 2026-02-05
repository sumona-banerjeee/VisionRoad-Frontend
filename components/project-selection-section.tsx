"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Loader2, MapPin, Package, FolderKanban, ArrowRight, AlertCircle } from "lucide-react"
import {
    fetchProjects,
    fetchPackagesByProject,
    fetchLocationsByPackage,
    type Project,
    type Package as PackageType,
    type Location,
    type SessionContext
} from "@/lib/api"

type ProjectSelectionSectionProps = {
    onSelectionComplete: (session: SessionContext) => void
}

export function ProjectSelectionSection({ onSelectionComplete }: ProjectSelectionSectionProps) {
    // Data states
    const [projects, setProjects] = useState<Project[]>([])
    const [packages, setPackages] = useState<PackageType[]>([])
    const [locations, setLocations] = useState<Location[]>([])

    // Selection states
    const [selectedProject, setSelectedProject] = useState<Project | null>(null)
    const [selectedPackage, setSelectedPackage] = useState<PackageType | null>(null)
    const [selectedLocation, setSelectedLocation] = useState<Location | null>(null)

    // Loading states
    const [loadingProjects, setLoadingProjects] = useState(true)
    const [loadingPackages, setLoadingPackages] = useState(false)
    const [loadingLocations, setLoadingLocations] = useState(false)

    // Error state
    const [error, setError] = useState<string | null>(null)

    // Load projects on mount
    useEffect(() => {
        const loadProjects = async () => {
            try {
                setLoadingProjects(true)
                setError(null)
                const data = await fetchProjects()
                setProjects(data)
            } catch (err) {
                console.error("Failed to load projects:", err)
                setError("Failed to load projects. Please check if the backend is running.")
            } finally {
                setLoadingProjects(false)
            }
        }
        loadProjects()
    }, [])

    // Load packages when project changes
    useEffect(() => {
        if (!selectedProject) {
            setPackages([])
            setSelectedPackage(null)
            return
        }

        const loadPackages = async () => {
            try {
                setLoadingPackages(true)
                setError(null)
                setSelectedPackage(null)
                setSelectedLocation(null)
                setLocations([])
                const data = await fetchPackagesByProject(selectedProject.id)
                setPackages(data)
            } catch (err) {
                console.error("Failed to load packages:", err)
                setError("Failed to load packages for the selected project.")
            } finally {
                setLoadingPackages(false)
            }
        }
        loadPackages()
    }, [selectedProject])

    // Load locations when package changes
    useEffect(() => {
        if (!selectedPackage) {
            setLocations([])
            setSelectedLocation(null)
            return
        }

        const loadLocations = async () => {
            try {
                setLoadingLocations(true)
                setError(null)
                setSelectedLocation(null)
                const data = await fetchLocationsByPackage(selectedPackage.id)
                setLocations(data)
            } catch (err) {
                console.error("Failed to load locations:", err)
                setError("Failed to load locations for the selected package.")
            } finally {
                setLoadingLocations(false)
            }
        }
        loadLocations()
    }, [selectedPackage])

    const handleProjectChange = (projectId: string) => {
        const project = projects.find(p => p.id === projectId) || null
        setSelectedProject(project)
    }

    const handlePackageChange = (packageId: string) => {
        const pkg = packages.find(p => p.id === packageId) || null
        setSelectedPackage(pkg)
    }

    const handleLocationChange = (locationId: string) => {
        const location = locations.find(l => l.id === locationId) || null
        setSelectedLocation(location)
    }

    const handleProceed = () => {
        if (selectedProject && selectedPackage && selectedLocation) {
            onSelectionComplete({
                projectId: selectedProject.id,
                projectName: selectedProject.name,
                packageId: selectedPackage.id,
                packageName: selectedPackage.name,
                locationId: selectedLocation.id,
                locationName: selectedLocation.segment_name
            })
        }
    }

    const isComplete = selectedProject && selectedPackage && selectedLocation

    return (
        <Card className="transition-all hover:shadow-lg border-0 bg-gradient-to-br from-card via-card to-muted/30">
            <CardHeader className="pb-4">
                <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-gradient-to-br from-primary/20 to-primary/5">
                        <FolderKanban className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                        <CardTitle className="text-xl">Select Project Location</CardTitle>
                        <CardDescription className="mt-1">
                            Choose your project, package, and location to begin video analysis
                        </CardDescription>
                    </div>
                </div>
            </CardHeader>
            <CardContent className="space-y-6">
                {/* Error Display */}
                {error && (
                    <div className="flex items-start gap-2 p-3 rounded-lg bg-destructive/10 text-destructive animate-in fade-in slide-in-from-top duration-300">
                        <AlertCircle className="h-5 w-5 mt-0.5 flex-shrink-0" />
                        <p className="text-sm">{error}</p>
                    </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Project Dropdown */}
                    <div className="space-y-2">
                        <Label htmlFor="project" className="flex items-center gap-2 text-sm font-medium">
                            <FolderKanban className="h-4 w-4 text-muted-foreground" />
                            Project
                        </Label>
                        <Select
                            value={selectedProject?.id || ""}
                            onValueChange={handleProjectChange}
                            disabled={loadingProjects}
                        >
                            <SelectTrigger id="project" className="h-11">
                                {loadingProjects ? (
                                    <div className="flex items-center gap-2">
                                        <Loader2 className="h-4 w-4 animate-spin" />
                                        <span>Loading...</span>
                                    </div>
                                ) : (
                                    <SelectValue placeholder="Select a project" />
                                )}
                            </SelectTrigger>
                            <SelectContent>
                                {projects.map((project) => (
                                    <SelectItem key={project.id} value={project.id}>
                                        <div className="flex flex-col">
                                            <span className="font-medium">{project.name}</span>
                                            {project.corridor_name && (
                                                <span className="text-xs text-muted-foreground">{project.corridor_name}</span>
                                            )}
                                        </div>
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        {selectedProject?.state && (
                            <p className="text-xs text-muted-foreground">
                                State: {selectedProject.state}
                            </p>
                        )}
                    </div>

                    {/* Package Dropdown */}
                    <div className="space-y-2">
                        <Label htmlFor="package" className="flex items-center gap-2 text-sm font-medium">
                            <Package className="h-4 w-4 text-muted-foreground" />
                            Package
                        </Label>
                        <Select
                            value={selectedPackage?.id || ""}
                            onValueChange={handlePackageChange}
                            disabled={!selectedProject || loadingPackages}
                        >
                            <SelectTrigger id="package" className="h-11">
                                {loadingPackages ? (
                                    <div className="flex items-center gap-2">
                                        <Loader2 className="h-4 w-4 animate-spin" />
                                        <span>Loading...</span>
                                    </div>
                                ) : (
                                    <SelectValue placeholder={selectedProject ? "Select a package" : "Select project first"} />
                                )}
                            </SelectTrigger>
                            <SelectContent>
                                {packages.map((pkg) => (
                                    <SelectItem key={pkg.id} value={pkg.id}>
                                        <div className="flex flex-col">
                                            <span className="font-medium">{pkg.name}</span>
                                            {pkg.region && (
                                                <span className="text-xs text-muted-foreground">{pkg.region}</span>
                                            )}
                                        </div>
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Location Dropdown */}
                    <div className="space-y-2">
                        <Label htmlFor="location" className="flex items-center gap-2 text-sm font-medium">
                            <MapPin className="h-4 w-4 text-muted-foreground" />
                            Location
                        </Label>
                        <Select
                            value={selectedLocation?.id || ""}
                            onValueChange={handleLocationChange}
                            disabled={!selectedPackage || loadingLocations}
                        >
                            <SelectTrigger id="location" className="h-11">
                                {loadingLocations ? (
                                    <div className="flex items-center gap-2">
                                        <Loader2 className="h-4 w-4 animate-spin" />
                                        <span>Loading...</span>
                                    </div>
                                ) : (
                                    <SelectValue placeholder={selectedPackage ? "Select a location" : "Select package first"} />
                                )}
                            </SelectTrigger>
                            <SelectContent>
                                {locations.map((location) => (
                                    <SelectItem key={location.id} value={location.id}>
                                        <div className="flex flex-col">
                                            <span className="font-medium">{location.segment_name}</span>
                                            {location.chainage_start_km !== null && location.chainage_end_km !== null && (
                                                <span className="text-xs text-muted-foreground">
                                                    KM {location.chainage_start_km} - {location.chainage_end_km}
                                                </span>
                                            )}
                                        </div>
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                {/* Selected Summary */}
                {isComplete && (
                    <div className="p-4 rounded-lg bg-primary/5 border border-primary/20 animate-in fade-in slide-in-from-bottom duration-300">
                        <p className="text-sm text-muted-foreground mb-1">Selected:</p>
                        <p className="font-medium">
                            {selectedProject?.name} → {selectedPackage?.name} → {selectedLocation?.segment_name}
                        </p>
                    </div>
                )}

                {/* Proceed Button */}
                <Button
                    onClick={handleProceed}
                    disabled={!isComplete}
                    className="w-full h-12 text-base font-semibold transition-all"
                    size="lg"
                >
                    {isComplete ? (
                        <>
                            Proceed to Upload
                            <ArrowRight className="ml-2 h-5 w-5" />
                        </>
                    ) : (
                        "Complete all selections to proceed"
                    )}
                </Button>
            </CardContent>
        </Card>
    )
}
