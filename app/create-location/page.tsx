"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Loader2, CheckCircle2, MapPin, Navigation, Milestone } from "lucide-react"
import { SidebarNavigation } from "@/components/sidebar-navigation"
import { DataTable } from "@/components/data-table"
import {
    fetchProjects,
    fetchPackagesByProject,
    fetchAllLocations,
    fetchAllPackages,
    createLocation,
    updateLocation,
    deleteLocation,
    type Project,
    type Package as PackageType,
    type Location,
    type LocationCreate,
    type LocationUpdate
} from "@/lib/api"
import { toast } from "sonner"

export default function CreateLocationPage() {
    const [locations, setLocations] = useState<Location[]>([])
    const [projects, setProjects] = useState<Project[]>([])
    const [packages, setPackages] = useState<PackageType[]>([])
    const [allPackages, setAllPackages] = useState<PackageType[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [loadingProjects, setLoadingProjects] = useState(false)
    const [loadingPackages, setLoadingPackages] = useState(false)

    // Editing state
    const [isEditing, setIsEditing] = useState(false)
    const [currentLocation, setCurrentLocation] = useState<Location | null>(null)

    // Form fields
    const [selectedProjectId, setSelectedProjectId] = useState("")
    const [selectedPackageId, setSelectedPackageId] = useState("")
    const [segmentName, setSegmentName] = useState("")
    const [chainageStartKm, setChainageStartKm] = useState("")
    const [chainageEndKm, setChainageEndKm] = useState("")
    const [startLat, setStartLat] = useState("")
    const [startLng, setStartLng] = useState("")
    const [endLat, setEndLat] = useState("")
    const [endLng, setEndLng] = useState("")

    // Load locations and projects
    const loadLocations = async () => {
        try {
            setIsLoading(true)
            setError(null)
            const data = await fetchAllLocations()
            setLocations(data)
        } catch (err) {
            setError("Failed to load locations. Please check if the backend is running.")
        } finally {
            setIsLoading(false)
        }
    }

    const loadProjects = async () => {
        try {
            setLoadingProjects(true)
            const data = await fetchProjects()
            setProjects(data)
        } catch (err) {
            setError("Failed to load projects.")
        } finally {
            setLoadingProjects(false)
        }
    }

    const loadAllPackages = async () => {
        try {
            const data = await fetchAllPackages()
            setAllPackages(data)
        } catch (err) {
            console.error("Failed to load all packages")
        }
    }

    useEffect(() => {
        loadLocations()
        loadProjects()
        loadAllPackages()
    }, [])

    // Load packages when project changes
    useEffect(() => {
        if (!selectedProjectId) {
            setPackages([])
            if (!isEditing) setSelectedPackageId("")
            return
        }

        const loadPackagesForProject = async () => {
            try {
                setLoadingPackages(true)
                if (!isEditing) setSelectedPackageId("")
                const data = await fetchPackagesByProject(selectedProjectId)
                setPackages(data)
            } catch (err) {
                setError("Failed to load packages for the selected project.")
            } finally {
                setLoadingPackages(false)
            }
        }
        loadPackagesForProject()
    }, [selectedProjectId, isEditing])

    const resetForm = () => {
        setSelectedProjectId("")
        setSelectedPackageId("")
        setSegmentName("")
        setChainageStartKm("")
        setChainageEndKm("")
        setStartLat("")
        setStartLng("")
        setEndLat("")
        setEndLng("")
        setError(null)
        setIsEditing(false)
        setCurrentLocation(null)
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!selectedPackageId && !isEditing) {
            setError("Please select a project and package first")
            return
        }
        if (!segmentName.trim()) {
            setError("Segment name is required")
            return
        }
        if (!startLat || !startLng || !endLat || !endLng) {
            setError("All GPS coordinates are required for locations")
            return
        }

        setIsSubmitting(true)
        setError(null)

        try {
            if (isEditing && currentLocation) {
                const data: LocationUpdate = {
                    segment_name: segmentName.trim(),
                    chainage_start_km: chainageStartKm ? parseFloat(chainageStartKm) : null,
                    chainage_end_km: chainageEndKm ? parseFloat(chainageEndKm) : null,
                    start_lat: parseFloat(startLat),
                    start_lng: parseFloat(startLng),
                    end_lat: parseFloat(endLat),
                    end_lng: parseFloat(endLng),
                }
                await updateLocation(currentLocation.id, data)
                toast.success("Location updated successfully!")
            } else {
                const data: LocationCreate = {
                    package_id: selectedPackageId,
                    segment_name: segmentName.trim(),
                    chainage_start_km: chainageStartKm ? parseFloat(chainageStartKm) : null,
                    chainage_end_km: chainageEndKm ? parseFloat(chainageEndKm) : null,
                    start_lat: parseFloat(startLat),
                    start_lng: parseFloat(startLng),
                    end_lat: parseFloat(endLat),
                    end_lng: parseFloat(endLng),
                }
                await createLocation(data)
                toast.success("Location created successfully!")
            }

            // Refresh locations list
            await loadLocations()

            // Close modal and reset form immediately
            setIsModalOpen(false)
            resetForm()
        } catch (err) {
            setError(err instanceof Error ? err.message : `Failed to ${isEditing ? 'update' : 'create'} location`)
        } finally {
            setIsSubmitting(false)
        }
    }

    const handleEdit = (location: Location) => {
        setIsEditing(true)
        setCurrentLocation(location)

        // Find project for this package
        const pkg = allPackages.find(p => p.id === location.package_id)
        if (pkg) {
            setSelectedProjectId(pkg.project_id)
            setSelectedPackageId(location.package_id)
        }

        setSegmentName(location.segment_name || "")
        setChainageStartKm(location.chainage_start_km?.toString() || "")
        setChainageEndKm(location.chainage_end_km?.toString() || "")
        setStartLat(location.start_lat.toString())
        setStartLng(location.start_lng.toString())
        setEndLat(location.end_lat.toString())
        setEndLng(location.end_lng.toString())
        setIsModalOpen(true)
    }

    const handleDelete = async (location: Location) => {
        if (!confirm(`Are you sure you want to delete location "${location.segment_name}"?`)) return

        try {
            setIsLoading(true)
            await deleteLocation(location.id)
            toast.success("Location deleted successfully!")
            await loadLocations()
        } catch (err) {
            setError("Failed to delete location")
        } finally {
            setIsLoading(false)
        }
    }

    const getPackageName = (packageId: string) => {
        return allPackages.find(p => p.id === packageId)?.name || packageId
    }

    const isFormComplete = selectedPackageId && segmentName.trim() && startLat && startLng && endLat && endLng

    const columns = [
        {
            key: "segment_name",
            header: "Segment Name",
            render: (location: Location) => (
                <div className="font-semibold text-gray-900 dark:text-gray-100">{location.segment_name}</div>
            )
        },
        {
            key: "package_id",
            header: "Package",
            render: (location: Location) => getPackageName(location.package_id)
        },
        {
            key: "project",
            header: "Project",
            render: (location: Location) => {
                const pkg = allPackages.find(p => p.id === location.package_id)
                const project = projects.find(p => p.id === pkg?.project_id)
                return project?.name || "—"
            }
        },
        {
            key: "chainage",
            header: "Chainage (km)",
            render: (location: Location) => {
                if (location.chainage_start_km !== null && location.chainage_end_km !== null) {
                    return (
                        <span className="px-2 py-0.5 rounded-full bg-amber-50 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 text-[10px] font-semibold border border-amber-100 dark:border-amber-800 whitespace-nowrap">
                            {location.chainage_start_km} - {location.chainage_end_km}
                        </span>
                    )
                }
                return "—"
            }
        },
        {
            key: "start_gps",
            header: "Start GPS",
            render: (location: Location) => (
                <span className="px-2 py-0.5 rounded-full bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-[10px] font-mono border border-blue-100 dark:border-blue-800 whitespace-nowrap">
                    {location.start_lat.toFixed(4)}, {location.start_lng.toFixed(4)}
                </span>
            )
        },
        {
            key: "end_gps",
            header: "End GPS",
            render: (location: Location) => (
                <span className="px-2 py-0.5 rounded-full bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-[10px] font-mono border border-blue-100 dark:border-blue-800 whitespace-nowrap">
                    {location.end_lat.toFixed(4)}, {location.end_lng.toFixed(4)}
                </span>
            )
        },
    ]

    return (
        <div className="min-h-screen bg-mesh-gradient text-gray-900 dark:text-gray-100">
            <SidebarNavigation />
            <main className="ml-16 min-h-screen relative overflow-hidden">
                <div className="mx-auto px-6 py-8 max-w-7xl relative z-10">
                    {/* Refined Header */}
                    <div className="mb-8">
                        <div className="flex items-center gap-5">
                            <div className="p-3 rounded-2xl bg-gradient-to-br from-[#9bddeb] to-[#60a5fa] shadow-md flex items-center justify-center">
                                <MapPin className="h-8 w-8 text-white" />
                            </div>
                            <div className="flex flex-col">
                                <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-gray-900 via-indigo-800 to-indigo-600 dark:from-white dark:via-indigo-200 dark:to-indigo-400 bg-clip-text text-transparent">
                                    Location Management
                                </h1>
                                <p className="text-gray-500 dark:text-gray-400 mt-1 text-sm font-medium italic">
                                    Manage road segment locations
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Error Message */}
                    {error && !isModalOpen && (
                        <div className="mb-6 flex items-center gap-3 p-4 rounded-xl bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800">
                            <div className="w-5 h-5 rounded-full bg-red-100 dark:bg-red-900 flex items-center justify-center flex-shrink-0">
                                <span className="text-xs font-bold text-red-500">!</span>
                            </div>
                            <p className="text-sm text-red-600 dark:text-red-400 break-all">{error}</p>
                        </div>
                    )}

                    {/* Data Table */}
                    <div>
                        <DataTable
                            title="All Locations"
                            data={locations}
                            columns={columns}
                            onAddNew={() => { setIsEditing(false); setIsModalOpen(true); }}
                            onEdit={handleEdit}
                            onDelete={handleDelete}
                            addButtonText="Add New Location"
                            isLoading={isLoading}
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

            {/* Modal Dialog */}
            <Dialog open={isModalOpen} onOpenChange={(open) => { if (!open) { setIsModalOpen(false); resetForm(); } else { setIsModalOpen(true); } }}>
                <DialogContent
                    className="max-w-2xl"
                    onOpenAutoFocus={(e) => e.preventDefault()}
                >
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <MapPin className="h-5 w-5 text-blue-500" />
                            {isEditing ? 'Edit Location' : 'Create New Location'}
                        </DialogTitle>
                        <DialogDescription>
                            {isEditing ? 'Update disclosure details for your road infrastructure segment' : 'Select project & package, then fill in the location details'}
                        </DialogDescription>
                    </DialogHeader>


                    {/* Error Message in Modal */}
                    {error && (
                        <div className="flex items-center gap-3 p-4 rounded-xl bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800">
                            <div className="w-5 h-5 rounded-full bg-red-100 dark:bg-red-900 flex items-center justify-center flex-shrink-0">
                                <span className="text-xs font-bold text-red-500">!</span>
                            </div>
                            <p className="text-sm text-red-600 dark:text-red-400 break-all">{error}</p>
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Step 1: Select Project */}
                        {!isEditing && (
                            <div className="p-3 rounded-xl bg-blue-50/80 dark:bg-blue-900/40 border border-blue-200 dark:border-blue-800 shadow-sm">
                                <div className="flex items-center gap-2 mb-2">
                                    <div className="w-5 h-5 rounded-full bg-blue-600 flex items-center justify-center">
                                        <span className="text-white text-[10px] font-bold">1</span>
                                    </div>
                                    <p className="text-xs font-bold text-blue-700 dark:text-blue-400">Select Project</p>
                                </div>
                                <Select value={selectedProjectId} onValueChange={setSelectedProjectId}>
                                    <SelectTrigger className="h-11 bg-white dark:bg-gray-800 border-blue-200 dark:border-blue-800 focus:border-blue-400">
                                        {loadingProjects ? (
                                            <div className="flex items-center gap-2">
                                                <Loader2 className="h-4 w-4 animate-spin text-blue-500" />
                                                <span className="text-gray-400">Loading projects...</span>
                                            </div>
                                        ) : (
                                            <SelectValue placeholder="Choose a project" />
                                        )}
                                    </SelectTrigger>
                                    <SelectContent>
                                        {projects.map(project => (
                                            <SelectItem key={project.id} value={project.id}>
                                                <span className="font-medium">{project.name}</span>
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        )}

                        {/* Step 2: Select Package */}
                        {!isEditing && (
                            <div className={`p-3 rounded-xl bg-blue-50/80 dark:bg-blue-900/40 border border-blue-200 dark:border-blue-800 shadow-sm ${selectedProjectId ? 'opacity-100' : 'opacity-40 pointer-events-none'}`}>
                                <div className="flex items-center gap-2 mb-2">
                                    <div className={`w-5 h-5 rounded-full flex items-center justify-center ${selectedProjectId ? 'bg-blue-600' : 'bg-gray-300 dark:bg-gray-600'}`}>
                                        <span className="text-white text-[10px] font-bold">2</span>
                                    </div>
                                    <p className="text-xs font-bold text-blue-700 dark:text-blue-400">Select Package</p>
                                </div>
                                <Select value={selectedPackageId} onValueChange={setSelectedPackageId} disabled={!selectedProjectId}>
                                    <SelectTrigger className="h-11 bg-white dark:bg-gray-800 border-blue-200 dark:border-blue-800 focus:border-blue-400">
                                        {loadingPackages ? (
                                            <div className="flex items-center gap-2">
                                                <Loader2 className="h-4 w-4 animate-spin text-blue-500" />
                                                <span className="text-gray-400">Loading packages...</span>
                                            </div>
                                        ) : (
                                            <SelectValue placeholder={selectedProjectId ? "Choose a package" : "Select project first"} />
                                        )}
                                    </SelectTrigger>
                                    <SelectContent>
                                        {packages.map(pkg => (
                                            <SelectItem key={pkg.id} value={pkg.id}>
                                                <span className="font-medium">{pkg.name}</span>
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        )}

                        {/* Step 3: Location Details */}
                        <div className={`space-y-4 ${selectedPackageId || isEditing ? 'opacity-100' : 'opacity-40 pointer-events-none'}`}>
                            {!isEditing && (
                                <div className="flex items-center gap-2">
                                    <div className={`w-5 h-5 rounded-full flex items-center justify-center ${selectedPackageId ? 'bg-blue-600' : 'bg-gray-300 dark:bg-gray-600'}`}>
                                        <span className="text-white text-[10px] font-bold">3</span>
                                    </div>
                                    <p className="text-xs font-bold text-gray-700 dark:text-gray-300">Location Information</p>
                                </div>
                            )}

                            {/* Segment Name & Chainage Row */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                    <Label htmlFor="segment" className="text-xs font-semibold flex items-center gap-1">
                                        Segment Name <span className="text-red-500">*</span>
                                    </Label>
                                    <Input
                                        id="segment"
                                        value={segmentName}
                                        onChange={(e) => setSegmentName(e.target.value)}
                                        placeholder="Location to Location"
                                        className="h-9 text-sm"
                                        required
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-2">
                                    <div className="space-y-1.5">
                                        <Label htmlFor="ch-start" className="text-[10px] font-semibold flex items-center gap-1">
                                            Start (km)
                                        </Label>
                                        <Input
                                            id="ch-start"
                                            type="number"
                                            step="any"
                                            min="0"
                                            value={chainageStartKm}
                                            onChange={(e) => setChainageStartKm(e.target.value)}
                                            placeholder="0"
                                            className="h-9 text-sm"
                                        />
                                    </div>
                                    <div className="space-y-1.5">
                                        <Label htmlFor="ch-end" className="text-[10px] font-semibold flex items-center gap-1">
                                            End (km)
                                        </Label>
                                        <Input
                                            id="ch-end"
                                            type="number"
                                            step="any"
                                            min="0"
                                            value={chainageEndKm}
                                            onChange={(e) => setChainageEndKm(e.target.value)}
                                            placeholder="0"
                                            className="h-9 text-sm"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* GPS Coordinates Grid */}
                            <div className="grid grid-cols-2 gap-3">
                                {/* Start Point */}
                                <div className="p-3 rounded-xl bg-blue-50/50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-900/50">
                                    <p className="text-[10px] font-bold text-blue-600 dark:text-blue-400 mb-2 uppercase tracking-wide flex items-center gap-1">
                                        <MapPin className="h-3 w-3" /> Start Point
                                    </p>
                                    <div className="grid grid-cols-1 gap-2">
                                        <div className="flex items-center gap-2">
                                            <Label htmlFor="s-lat" className="text-[10px] text-gray-500 w-8">Lat</Label>
                                            <Input
                                                id="s-lat"
                                                type="number"
                                                step="any"
                                                value={startLat}
                                                onChange={(e) => setStartLat(e.target.value)}
                                                placeholder="Lat"
                                                className="h-8 text-[11px]"
                                                required
                                            />
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Label htmlFor="s-lng" className="text-[10px] text-gray-500 w-8">Lng</Label>
                                            <Input
                                                id="s-lng"
                                                type="number"
                                                step="any"
                                                value={startLng}
                                                onChange={(e) => setStartLng(e.target.value)}
                                                placeholder="Lng"
                                                className="h-8 text-[11px]"
                                                required
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* End Point */}
                                <div className="p-3 rounded-xl bg-blue-50/50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-900/50">
                                    <p className="text-[10px] font-bold text-blue-600 dark:text-blue-400 mb-2 uppercase tracking-wide flex items-center gap-1">
                                        <MapPin className="h-3 w-3" /> End Point
                                    </p>
                                    <div className="grid grid-cols-1 gap-2">
                                        <div className="flex items-center gap-2">
                                            <Label htmlFor="e-lat" className="text-[10px] text-gray-500 w-8">Lat</Label>
                                            <Input
                                                id="e-lat"
                                                type="number"
                                                step="any"
                                                value={endLat}
                                                onChange={(e) => setEndLat(e.target.value)}
                                                placeholder="Lat"
                                                className="h-8 text-[11px]"
                                                required
                                            />
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Label htmlFor="e-lng" className="text-[10px] text-gray-500 w-8">Lng</Label>
                                            <Input
                                                id="e-lng"
                                                type="number"
                                                step="any"
                                                value={endLng}
                                                onChange={(e) => setEndLng(e.target.value)}
                                                placeholder="Lng"
                                                className="h-8 text-[11px]"
                                                required
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Submit Button */}
                        <div className="flex gap-3">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => {
                                    setIsModalOpen(false)
                                    resetForm()
                                }}
                                disabled={isSubmitting}
                                className="flex-1"
                            >
                                Cancel
                            </Button>
                            <Button
                                type="submit"
                                disabled={isSubmitting || !isFormComplete}
                                className="flex-1 bg-gradient-to-r from-blue-500 via-indigo-500 to-blue-600 hover:from-blue-600 hover:via-indigo-600 hover:to-blue-700 text-white"
                            >
                                {isSubmitting ? (
                                    <span className="flex items-center gap-2">
                                        <Loader2 className="h-4 w-4 animate-spin" />
                                        {isEditing ? 'Updating...' : 'Creating...'}
                                    </span>
                                ) : (
                                    <span className="flex items-center gap-2">
                                        {isEditing ? <CheckCircle2 className="h-4 w-4" /> : <MapPin className="h-4 w-4" />}
                                        {isEditing ? 'Update Location' : 'Create Location'}
                                    </span>
                                )}
                            </Button>
                        </div>
                    </form>
                </DialogContent>
            </Dialog>
        </div>
    )
}
