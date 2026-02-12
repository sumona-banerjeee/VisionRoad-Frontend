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
import { createProject, fetchProjects, updateProject, deleteProject, type ProjectCreate, type Project, type ProjectUpdate } from "@/lib/api"
import { toast } from "sonner"

export default function CreateProjectPage() {
    const [projects, setProjects] = useState<Project[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [error, setError] = useState<string | null>(null)

    // Editing state
    const [isEditing, setIsEditing] = useState(false)
    const [currentProject, setCurrentProject] = useState<Project | null>(null)

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
        setIsEditing(false)
        setCurrentProject(null)
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
            if (isEditing && currentProject) {
                const data: ProjectUpdate = {
                    name: name.trim(),
                    state: state.trim() || null,
                    corridor_name: corridorName.trim() || null,
                    start_lat: startLat ? parseFloat(startLat) : null,
                    start_lng: startLng ? parseFloat(startLng) : null,
                    end_lat: endLat ? parseFloat(endLat) : null,
                    end_lng: endLng ? parseFloat(endLng) : null,
                }
                await updateProject(currentProject.id, data)
                toast.success("Project updated successfully!")
            } else {
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
                toast.success("Project created successfully!")
            }

            // Refresh projects list
            await loadProjects()

            // Close modal and reset form immediately
            setIsModalOpen(false)
            resetForm()
        } catch (err) {
            setError(err instanceof Error ? err.message : `Failed to ${isEditing ? 'update' : 'create'} project`)
        } finally {
            setIsSubmitting(false)
        }
    }

    const handleEdit = (project: Project) => {
        setIsEditing(true)
        setCurrentProject(project)
        setName(project.name || "")
        setState(project.state || "")
        setCorridorName(project.corridor_name || "")
        setStartLat(project.start_lat?.toString() || "")
        setStartLng(project.start_lng?.toString() || "")
        setEndLat(project.end_lat?.toString() || "")
        setEndLng(project.end_lng?.toString() || "")
        setIsModalOpen(true)
    }

    const handleDelete = async (project: Project) => {
        if (!confirm(`Are you sure you want to delete project "${project.name}"?`)) return

        try {
            setIsLoading(true)
            await deleteProject(project.id)
            toast.success("Project deleted successfully!")
            await loadProjects()
        } catch (err) {
            setError("Failed to delete project")
        } finally {
            setIsLoading(false)
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
                                <FolderPlus className="h-8 w-8 text-white" />
                            </div>
                            <div className="flex flex-col">
                                <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-gray-900 via-indigo-800 to-indigo-600 dark:from-white dark:via-indigo-200 dark:to-indigo-400 bg-clip-text text-transparent">
                                    Project Management
                                </h1>
                                <p className="text-gray-500 dark:text-gray-400 mt-1 text-sm font-medium italic">
                                    Manage road infrastructure projects
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
                            title="All Projects"
                            data={projects}
                            columns={columns}
                            onAddNew={() => { setIsEditing(false); setIsModalOpen(true); }}
                            onEdit={handleEdit}
                            onDelete={handleDelete}
                            addButtonText="Add New Project"
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
                            <FolderPlus className="h-5 w-5 text-blue-500" />
                            {isEditing ? 'Edit Project' : 'Create New Project'}
                        </DialogTitle>
                        <DialogDescription>
                            {isEditing ? 'Update disclosure details for your road infrastructure project' : 'Fill in the details for your new road infrastructure project'}
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
                        {/* Project Name */}
                        <div className="space-y-1.5">
                            <Label htmlFor="name" className="text-sm font-semibold flex items-center gap-1">
                                Project Name <span className="text-red-500">*</span>
                            </Label>
                            <Input
                                id="name"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                placeholder="Project Name"
                                className="h-10 text-sm"
                                required
                            />
                        </div>

                        {/* State & Corridor Row */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-1.5">
                                <Label htmlFor="state" className="text-sm font-semibold">
                                    State <span className="text-gray-400 font-normal text-xs">(Optional)</span>
                                </Label>
                                <Input
                                    id="state"
                                    value={state}
                                    onChange={(e) => setState(e.target.value)}
                                    placeholder="State"
                                    className="h-10 text-sm"
                                />
                            </div>
                            <div className="space-y-1.5">
                                <Label htmlFor="corridor" className="text-sm font-semibold flex items-center gap-1">
                                    <Route className="h-3.5 w-3.5 text-gray-400" />
                                    Corridor Name <span className="text-gray-400 font-normal text-xs">(Optional)</span>
                                </Label>
                                <Input
                                    id="corridor"
                                    value={corridorName}
                                    onChange={(e) => setCorridorName(e.target.value)}
                                    placeholder="Corridor Name"
                                    className="h-10 text-sm"
                                />
                            </div>
                        </div>

                        {/* GPS Coordinates Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            {/* Start Point */}
                            <div className="p-3 rounded-xl bg-blue-50/80 dark:bg-blue-900/40 border border-blue-200 dark:border-blue-800 shadow-sm">
                                <p className="text-[10px] font-bold text-blue-600 dark:text-blue-400 mb-2 uppercase tracking-wide flex items-center gap-1">
                                    <MapPin className="h-3 w-3" /> Start Point
                                </p>
                                <div className="grid grid-cols-2 gap-2">
                                    <div className="space-y-1">
                                        <Label htmlFor="start-lat" className="text-[10px] text-gray-500">Lat</Label>
                                        <Input
                                            id="start-lat"
                                            type="number"
                                            step="any"
                                            value={startLat}
                                            onChange={(e) => setStartLat(e.target.value)}
                                            placeholder="Lat"
                                            className="h-8 text-[11px]"
                                        />
                                    </div>
                                    <div className="space-y-1">
                                        <Label htmlFor="start-lng" className="text-[10px] text-gray-500">Lng</Label>
                                        <Input
                                            id="start-lng"
                                            type="number"
                                            step="any"
                                            value={startLng}
                                            onChange={(e) => setStartLng(e.target.value)}
                                            placeholder="Lng"
                                            className="h-8 text-[11px]"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* End Point */}
                            <div className="p-3 rounded-xl bg-blue-50/80 dark:bg-blue-900/40 border border-blue-200 dark:border-blue-800 shadow-sm">
                                <p className="text-[10px] font-bold text-blue-600 dark:text-blue-400 mb-2 uppercase tracking-wide flex items-center gap-1">
                                    <MapPin className="h-3 w-3" /> End Point
                                </p>
                                <div className="grid grid-cols-2 gap-2">
                                    <div className="space-y-1">
                                        <Label htmlFor="end-lat" className="text-[10px] text-gray-500">Lat</Label>
                                        <Input
                                            id="end-lat"
                                            type="number"
                                            step="any"
                                            value={endLat}
                                            onChange={(e) => setEndLat(e.target.value)}
                                            placeholder="Lat"
                                            className="h-8 text-[11px]"
                                        />
                                    </div>
                                    <div className="space-y-1">
                                        <Label htmlFor="end-lng" className="text-[10px] text-gray-500">Lng</Label>
                                        <Input
                                            id="end-lng"
                                            type="number"
                                            step="any"
                                            value={endLng}
                                            onChange={(e) => setEndLng(e.target.value)}
                                            placeholder="Lng"
                                            className="h-8 text-[11px]"
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
                                className="flex-1 bg-gradient-to-r from-blue-500 via-indigo-500 to-blue-700 hover:bg-blue-600 text-white"
                            >
                                {isSubmitting ? (
                                    <span className="flex items-center gap-2">
                                        <Loader2 className="h-4 w-4 animate-spin" />
                                        {isEditing ? 'Updating...' : 'Creating...'}
                                    </span>
                                ) : (
                                    <span className="flex items-center gap-2">
                                        {isEditing ? <CheckCircle2 className="h-4 w-4" /> : <FolderPlus className="h-4 w-4" />}
                                        {isEditing ? 'Update Project' : 'Create Project'}
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
