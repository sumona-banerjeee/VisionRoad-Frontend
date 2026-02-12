"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Loader2 } from "lucide-react"
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

    // Step status helpers
    const getStepStatus = (step: number) => {
        if (step === 1) return selectedProject ? 'completed' : 'active'
        if (step === 2) return selectedPackage ? 'completed' : selectedProject ? 'active' : 'pending'
        if (step === 3) return selectedLocation ? 'completed' : selectedPackage ? 'active' : 'pending'
        return 'pending'
    }

    return (
        <Card className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 shadow-xl shadow-blue-500/5 overflow-hidden">
            <CardHeader className="pb-6 border-b border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900">
                <div className="flex flex-col gap-4">
                    <div>
                        <CardTitle className="text-2xl font-semibold">Select Project Location</CardTitle>
                        <CardDescription className="mt-2 text-base">
                            Select Project, Package & Location to begin intelligent road analysis with advanced computer vision.
                        </CardDescription>
                    </div>

                    {/* Step Progress Indicator */}
                    <div className="flex items-center justify-center gap-2 pt-2">
                        {[1, 2, 3].map((step, index) => {
                            const status = getStepStatus(step)
                            const labels = ['Project', 'Package', 'Location']
                            return (
                                <div key={step} className="flex items-center">
                                    <div className="flex flex-col items-center">
                                        <div
                                            className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold transition-colors ${status === 'completed' ? 'bg-primary text-primary-foreground' :
                                                status === 'active' ? 'bg-primary text-primary-foreground ring-4 ring-primary/20' :
                                                    'bg-muted text-muted-foreground'
                                                }`}
                                        >
                                            {step}
                                        </div>
                                        <span className={`text-xs mt-1.5 font-medium ${status === 'pending' ? 'text-muted-foreground/60' : 'text-foreground'
                                            }`}>
                                            {labels[index]}
                                        </span>
                                    </div>
                                    {index < 2 && (
                                        <div className={`w-12 h-0.5 mx-2 mt-[-16px] rounded-full ${getStepStatus(step + 1) !== 'pending' ? 'bg-primary' : 'bg-border'
                                            }`} />
                                    )}
                                </div>
                            )
                        })}
                    </div>
                </div>
            </CardHeader>

            <CardContent className="pt-6 space-y-6">
                {/* Error Display */}
                {error && (
                    <div className="flex items-start gap-3 p-4 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive">
                        <div className="w-5 h-5 rounded-full bg-destructive/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                            <span className="text-xs font-bold">!</span>
                        </div>
                        <p className="text-sm leading-relaxed">{error}</p>
                    </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Project Dropdown */}
                    <div className="space-y-3">
                        <Label htmlFor="project" className="text-sm font-semibold text-foreground">
                            Project
                        </Label>
                        <div className="input-glow rounded-lg">
                            <Select
                                value={selectedProject?.id || ""}
                                onValueChange={handleProjectChange}
                                disabled={loadingProjects}
                            >
                                <SelectTrigger id="project" className="h-12 bg-background/50 border-border/50 hover:border-primary/50">
                                    {loadingProjects ? (
                                        <div className="flex items-center gap-2">
                                            <Loader2 className="h-4 w-4 animate-spin text-primary" />
                                            <span className="text-muted-foreground">Loading...</span>
                                        </div>
                                    ) : (
                                        <SelectValue placeholder="Select a project" />
                                    )}
                                </SelectTrigger>
                                <SelectContent>
                                    {projects.map((project) => (
                                        <SelectItem key={project.id} value={project.id}>
                                            <span className="font-medium">{project.name}</span>
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    {/* Package Dropdown */}
                    <div className="space-y-3">
                        <Label htmlFor="package" className="text-sm font-semibold text-foreground">
                            Package
                        </Label>
                        <div className="input-glow rounded-lg">
                            <Select
                                value={selectedPackage?.id || ""}
                                onValueChange={handlePackageChange}
                                disabled={!selectedProject || loadingPackages}
                            >
                                <SelectTrigger id="package" className="h-12 bg-background/50 border-border/50 hover:border-primary/50">
                                    {loadingPackages ? (
                                        <div className="flex items-center gap-2">
                                            <Loader2 className="h-4 w-4 animate-spin text-primary" />
                                            <span className="text-muted-foreground">Loading...</span>
                                        </div>
                                    ) : (
                                        <SelectValue placeholder={selectedProject ? "Select a package" : "Select project first"} />
                                    )}
                                </SelectTrigger>
                                <SelectContent>
                                    {packages.map((pkg) => (
                                        <SelectItem key={pkg.id} value={pkg.id}>
                                            <span className="font-medium">{pkg.name}</span>
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    {/* Location Dropdown */}
                    <div className="space-y-3">
                        <Label htmlFor="location" className="text-sm font-semibold text-foreground">
                            Location
                        </Label>
                        <div className="input-glow rounded-lg">
                            <Select
                                value={selectedLocation?.id || ""}
                                onValueChange={handleLocationChange}
                                disabled={!selectedPackage || loadingLocations}
                            >
                                <SelectTrigger id="location" className="h-12 bg-background/50 border-border/50 hover:border-primary/50">
                                    {loadingLocations ? (
                                        <div className="flex items-center gap-2">
                                            <Loader2 className="h-4 w-4 animate-spin text-primary" />
                                            <span className="text-muted-foreground">Loading...</span>
                                        </div>
                                    ) : (
                                        <SelectValue placeholder={selectedPackage ? "Select a location" : "Select package first"} />
                                    )}
                                </SelectTrigger>
                                <SelectContent>
                                    {locations.map((location) => (
                                        <SelectItem key={location.id} value={location.id}>
                                            <span className="font-medium">{location.segment_name}</span>
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                </div>

                {/* Selected Summary */}
                {isComplete && (
                    <div className="px-4 py-3 rounded-lg bg-primary/5 border border-primary/15">
                        <p className="text-xs text-muted-foreground flex items-center gap-2 flex-wrap">
                            <span className="font-medium">Path:</span>
                            <span className="text-foreground">{selectedProject?.name}</span>
                            <span>/</span>
                            <span className="text-foreground">{selectedPackage?.name}</span>
                            <span>/</span>
                            <span className="text-foreground">{selectedLocation?.segment_name}</span>
                        </p>
                    </div>
                )}

                {/* Proceed Button */}
                <Button
                    onClick={handleProceed}
                    disabled={!isComplete}
                    className={`w-full h-14 text-base font-semibold rounded-xl ${isComplete ? 'btn-gradient text-white' : ''
                        }`}
                    size="lg"
                >
                    {isComplete ? (
                        "Proceed to Upload"
                    ) : (
                        "Complete all selections to proceed"
                    )}
                </Button>
            </CardContent>
        </Card>
    )
}
