"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Loader2, CheckCircle2, FolderPlus, MapPin, Building2, Route, X } from "lucide-react"
import { SidebarNavigation } from "@/components/sidebar-navigation"
import { DataTable } from "@/components/data-table"
import { createProject, fetchProjects, type ProjectCreate, type Project } from "@/lib/api"

export default function CreateProjectPage() {
    const [projects, setProjects] = useState<Project[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [success, setSuccess] = useState(false)
    const [error, setError] = useState<string | null>(null)

    // Form fields
    const [name, setName] = useState("")
    const [state, setState] = useState("")
    const [corridorName, setCorridorName] = useState("")
    const [startLat, setStartLat] = useState("")
    const [startLng, setStartLng] = useState("")
    const [endLat, setEndLat] = useState("")
    const [endLng, setEndLng] = useState("")

    // Load projects
    const loadProjects = async () => {
        try {
            setIsLoading(true)
            setError(null)
            const data = await fetchProjects()
            setProjects(data)
        } catch (err) {
            setError("Failed to load projects. Please check if the backend is running.")
        } finally {
            setIsLoading(false)
        }
    }

    useEffect(() => {
        loadProjects()
    }, [])

    const resetForm = () => {
        setName("")
        setState("")
        setCorridorName("")
        setStartLat("")
        setStartLng("")
        setEndLat("")
        setEndLng("")
        setError(null)
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!name.trim()) {
            setError("Project name is required")
            return
        }

        setIsSubmitting(true)
        setError(null)

        try {
            const data: ProjectCreate = {
                name: name.trim(),
                state: state.trim() || null,
                corridor_name: corridorName.trim() || null,
                start_lat: startLat ? parseFloat(startLat) : null,
                start_lng: startLng ? parseFloat(startLng) : null,
                end_lat: endLat ? parseFloat(endLat) : null,
                end_lng: endLng ? parseFloat(endLng) : null,
            }

            await createProject(data)
            setSuccess(true)

            // Refresh projects list
            await loadProjects()

            setTimeout(() => {
                resetForm()
                setSuccess(false)
                setIsModalOpen(false)
            }, 2000)
        } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to create project")
        } finally {
            setIsSubmitting(false)
        }
    }

    const columns = [
        {
            key: "name",
            header: "Project Name",
            render: (project: Project) => (
                <div className="font-semibold text-gray-900 dark:text-gray-100">{project.name}</div>
            )
        },
        {
            key: "state",
            header: "State",
            render: (project: Project) => {
                if (!project.state) return <span className="text-gray-400">—</span>
                return (
                    <div className="flex flex-wrap gap-1.5">
                        {project.state.split(',').map((item, idx) => (
                            <span
                                key={idx}
                                className="px-2 py-0.5 rounded-full bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-[11px] font-semibold border border-blue-100 dark:border-blue-800 shadow-sm"
                            >
                                {item.trim()}
                            </span>
                        ))}
                    </div>
                )
            }
        },
        {
            key: "corridor_name",
            header: "Corridor",
        },
        {
            key: "created_at",
            header: "Created",
            render: (project: Project) => new Date(project.created_at).toLocaleDateString()
        },
    ]

    return (
        <div className="min-h-screen bg-mesh-gradient text-gray-900 dark:text-gray-100">
            <SidebarNavigation />
            <main className="ml-16 min-h-screen relative overflow-hidden">
                <div className="mx-auto px-4 py-8 max-w-6xl relative z-10">
                    {/* Header */}
                    <div className="mb-8 animate-in fade-in slide-in-from-left duration-700">
                        <div className="flex items-center gap-6">
                            <div className="flex-shrink-0 w-16 h-16 rounded-2xl bg-white shadow-xl border-2 border-blue-800 transition-transform duration-300 hover:scale-110 flex items-center justify-center">
                                <FolderPlus className="h-8 w-8 text-blue-600" />
                            </div>
                            <div className="flex flex-col">
                                <h1 className="text-3xl md:text-4xl font-extrabold text-blue-600 tracking-tight">
                                    Projects
                                </h1>
                                <p className="text-gray-500 dark:text-gray-400 mt-1 text-sm font-medium italic">
                                    Manage road infrastructure projects
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Error Message */}
                    {error && !isModalOpen && (
                        <div className="mb-6 flex items-center gap-3 p-4 rounded-xl bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 animate-in fade-in slide-in-from-top duration-300">
                            <div className="w-5 h-5 rounded-full bg-red-100 dark:bg-red-900 flex items-center justify-center flex-shrink-0">
                                <span className="text-xs font-bold text-red-500">!</span>
                            </div>
                            <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
                        </div>
                    )}

                    {/* Data Table */}
                    <div className="animate-in fade-in slide-in-from-bottom duration-700 delay-150">
                        <DataTable
                            title="All Projects"
                            data={projects}
                            columns={columns}
                            onAddNew={() => setIsModalOpen(true)}
                            addButtonText="Add New Project"
                            isLoading={isLoading}
                        />
                    </div>

                    {/* Footer */}
                    <div className="mt-8 text-center animate-in fade-in duration-700 delay-300">
                        <p className="text-xs text-gray-400 dark:text-gray-500">
                            Sentient Geeks Pvt. Ltd.
                        </p>
                    </div>
                </div>
            </main>

            {/* Modal Dialog */}
            <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
                <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <FolderPlus className="h-5 w-5 text-blue-500" />
                            Create New Project
                        </DialogTitle>
                        <DialogDescription>
                            Fill in the details for your new road infrastructure project
                        </DialogDescription>
                    </DialogHeader>

                    {/* Success Message in Modal */}
                    {success && (
                        <div className="flex items-center gap-3 p-4 rounded-xl bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30 border border-blue-200 dark:border-blue-800 animate-in fade-in slide-in-from-top duration-300">
                            <CheckCircle2 className="h-5 w-5 text-blue-500 flex-shrink-0" />
                            <p className="text-sm font-medium text-blue-700 dark:text-blue-400">Project created successfully!</p>
                        </div>
                    )}

                    {/* Error Message in Modal */}
                    {error && (
                        <div className="flex items-center gap-3 p-4 rounded-xl bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 animate-in fade-in slide-in-from-top duration-300">
                            <div className="w-5 h-5 rounded-full bg-red-100 dark:bg-red-900 flex items-center justify-center flex-shrink-0">
                                <span className="text-xs font-bold text-red-500">!</span>
                            </div>
                            <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Project Name */}
                        <div className="space-y-2">
                            <Label htmlFor="name" className="text-sm font-semibold flex items-center gap-1">
                                Project Name <span className="text-red-500">*</span>
                            </Label>
                            <Input
                                id="name"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                placeholder="e.g., Delhi-Chandigarh Highway"
                                className="h-11"
                                required
                            />
                        </div>

                        {/* State & Corridor Row */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="state" className="text-sm font-semibold">
                                    State <span className="text-gray-400 font-normal text-xs">(Optional)</span>
                                </Label>
                                <Input
                                    id="state"
                                    value={state}
                                    onChange={(e) => setState(e.target.value)}
                                    placeholder="e.g., Haryana"
                                    className="h-11"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="corridor" className="text-sm font-semibold flex items-center gap-1">
                                    <Route className="h-3.5 w-3.5 text-gray-400" />
                                    Corridor Name <span className="text-gray-400 font-normal text-xs">(Optional)</span>
                                </Label>
                                <Input
                                    id="corridor"
                                    value={corridorName}
                                    onChange={(e) => setCorridorName(e.target.value)}
                                    placeholder="e.g., National Highway 44"
                                    className="h-11"
                                />
                            </div>
                        </div>

                        {/* GPS Coordinates Section */}
                        <div className="space-y-4">
                            <div className="flex items-center gap-2">
                                <div className="p-1.5 rounded-lg bg-gradient-to-br from-blue-400 to-indigo-500 shadow-md shadow-blue-500/20">
                                    <MapPin className="h-4 w-4 text-white" />
                                </div>
                                <h3 className="text-sm font-bold text-gray-700 dark:text-gray-300">GPS Coordinates</h3>
                                <span className="text-xs text-gray-400">(Optional)</span>
                            </div>

                            {/* Start Point */}
                            <div className="p-4 rounded-xl bg-gradient-to-r from-blue-50/50 to-indigo-50/50 dark:from-blue-950/20 dark:to-indigo-950/20 border border-blue-100 dark:border-blue-900/50">
                                <p className="text-xs font-semibold text-blue-600 dark:text-blue-400 mb-3 uppercase tracking-wide">Start Point</p>
                                <div className="grid grid-cols-2 gap-3">
                                    <div className="space-y-1.5">
                                        <Label htmlFor="start-lat" className="text-xs text-gray-500">Latitude</Label>
                                        <Input
                                            id="start-lat"
                                            type="number"
                                            step="any"
                                            value={startLat}
                                            onChange={(e) => setStartLat(e.target.value)}
                                            placeholder="-90 to 90"
                                            className="h-10 text-sm"
                                        />
                                    </div>
                                    <div className="space-y-1.5">
                                        <Label htmlFor="start-lng" className="text-xs text-gray-500">Longitude</Label>
                                        <Input
                                            id="start-lng"
                                            type="number"
                                            step="any"
                                            value={startLng}
                                            onChange={(e) => setStartLng(e.target.value)}
                                            placeholder="-180 to 180"
                                            className="h-10 text-sm"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* End Point */}
                            <div className="p-4 rounded-xl bg-gradient-to-r from-blue-50/50 to-indigo-50/50 dark:from-blue-950/20 dark:to-indigo-950/20 border border-blue-100 dark:border-blue-900/50">
                                <p className="text-xs font-semibold text-blue-600 dark:text-blue-400 mb-3 uppercase tracking-wide">End Point</p>
                                <div className="grid grid-cols-2 gap-3">
                                    <div className="space-y-1.5">
                                        <Label htmlFor="end-lat" className="text-xs text-gray-500">Latitude</Label>
                                        <Input
                                            id="end-lat"
                                            type="number"
                                            step="any"
                                            value={endLat}
                                            onChange={(e) => setEndLat(e.target.value)}
                                            placeholder="-90 to 90"
                                            className="h-10 text-sm"
                                        />
                                    </div>
                                    <div className="space-y-1.5">
                                        <Label htmlFor="end-lng" className="text-xs text-gray-500">Longitude</Label>
                                        <Input
                                            id="end-lng"
                                            type="number"
                                            step="any"
                                            value={endLng}
                                            onChange={(e) => setEndLng(e.target.value)}
                                            placeholder="-180 to 180"
                                            className="h-10 text-sm"
                                        />
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
                                disabled={isSubmitting || !name.trim()}
                                className="flex-1 bg-gradient-to-r from-blue-500 via-indigo-500 to-blue-700 hover:from-blue-600 hover:via-indigo-600 hover:to-blue-800 text-white"
                            >
                                {isSubmitting ? (
                                    <span className="flex items-center gap-2">
                                        <Loader2 className="h-4 w-4 animate-spin" />
                                        Creating...
                                    </span>
                                ) : (
                                    <span className="flex items-center gap-2">
                                        <FolderPlus className="h-4 w-4" />
                                        Create Project
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
