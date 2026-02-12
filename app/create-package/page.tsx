"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Loader2, CheckCircle2, Package, FolderKanban, Globe } from "lucide-react"
import { SidebarNavigation } from "@/components/sidebar-navigation"
import { DataTable } from "@/components/data-table"
import {
    fetchProjects,
    fetchAllPackages,
    createPackage,
    updatePackage,
    deletePackage,
    type Project,
    type Package as PackageType,
    type PackageCreate,
    type PackageUpdate
} from "@/lib/api"
import { toast } from "sonner"

export default function CreatePackagePage() {
    const [packages, setPackages] = useState<PackageType[]>([])
    const [projects, setProjects] = useState<Project[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [loadingProjects, setLoadingProjects] = useState(false)

    // Editing state
    const [isEditing, setIsEditing] = useState(false)
    const [currentPackage, setCurrentPackage] = useState<PackageType | null>(null)

    // Form fields
    const [selectedProjectId, setSelectedProjectId] = useState("")
    const [name, setName] = useState("")
    const [region, setRegion] = useState("")

    // Load packages and projects
    const loadPackages = async () => {
        try {
            setIsLoading(true)
            setError(null)
            const data = await fetchAllPackages()
            setPackages(data)
        } catch (err) {
            setError("Failed to load packages. Please check if the backend is running.")
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

    useEffect(() => {
        loadPackages()
        loadProjects()
    }, [])

    const resetForm = () => {
        setSelectedProjectId("")
        setName("")
        setRegion("")
        setError(null)
        setIsEditing(false)
        setCurrentPackage(null)
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!selectedProjectId) {
            setError("Please select a project first")
            return
        }
        if (!name.trim()) {
            setError("Package name is required")
            return
        }

        setIsSubmitting(true)
        setError(null)

        try {
            if (isEditing && currentPackage) {
                const data: PackageUpdate = {
                    name: name.trim(),
                    region: region.trim() || null,
                }
                await updatePackage(currentPackage.id, data)
                toast.success("Package updated successfully!")
            } else {
                const data: PackageCreate = {
                    project_id: selectedProjectId,
                    name: name.trim(),
                    region: region.trim() || null,
                }
                await createPackage(data)
                toast.success("Package created successfully!")
            }

            // Refresh packages list
            await loadPackages()

            // Close modal and reset form immediately
            setIsModalOpen(false)
            resetForm()
        } catch (err) {
            setError(err instanceof Error ? err.message : `Failed to ${isEditing ? 'update' : 'create'} package`)
        } finally {
            setIsSubmitting(false)
        }
    }

    const handleEdit = (pkg: PackageType) => {
        setIsEditing(true)
        setCurrentPackage(pkg)
        setSelectedProjectId(pkg.project_id)
        setName(pkg.name || "")
        setRegion(pkg.region || "")
        setIsModalOpen(true)
    }

    const handleDelete = async (pkg: PackageType) => {
        if (!confirm(`Are you sure you want to delete package "${pkg.name}"?`)) return

        try {
            setIsLoading(true)
            await deletePackage(pkg.id)
            toast.success("Package deleted successfully!")
            await loadPackages()
        } catch (err) {
            setError("Failed to delete package")
        } finally {
            setIsLoading(false)
        }
    }

    const getProjectName = (projectId: string) => {
        return projects.find(p => p.id === projectId)?.name || projectId
    }

    const columns = [
        {
            key: "name",
            header: "Package Name",
            render: (pkg: PackageType) => (
                <div className="font-semibold text-gray-900 dark:text-gray-100">{pkg.name}</div>
            )
        },
        {
            key: "project_id",
            header: "Project",
            render: (pkg: PackageType) => getProjectName(pkg.project_id)
        },
        {
            key: "project_state",
            header: "Project State",
            render: (pkg: PackageType) => {
                const project = projects.find(p => p.id === pkg.project_id)
                if (!project?.state) return <span className="text-gray-400">—</span>
                return (
                    <div className="flex flex-wrap gap-1">
                        {project.state.split(',').map((item, idx) => (
                            <span
                                key={idx}
                                className="px-2 py-0.5 rounded-full bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-[10px] font-semibold border border-blue-100 dark:border-blue-800 shadow-sm"
                            >
                                {item.trim()}
                            </span>
                        ))}
                    </div>
                )
            }
        },
        {
            key: "region",
            header: "Region",
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
                                <Package className="h-8 w-8 text-white" />
                            </div>
                            <div className="flex flex-col">
                                <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-gray-900 via-indigo-800 to-indigo-600 dark:from-white dark:via-indigo-200 dark:to-indigo-400 bg-clip-text text-transparent">
                                    Package Management
                                </h1>
                                <p className="text-gray-500 dark:text-gray-400 mt-1 text-sm font-medium italic">
                                    Manage project packages
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
                            title="All Packages"
                            data={packages}
                            columns={columns}
                            onAddNew={() => { setIsEditing(false); setIsModalOpen(true); }}
                            onEdit={handleEdit}
                            onDelete={handleDelete}
                            addButtonText="Add New Package"
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
                            <Package className="h-5 w-5 text-blue-500" />
                            {isEditing ? 'Edit Package' : 'Create New Package'}
                        </DialogTitle>
                        <DialogDescription>
                            {isEditing ? 'Update disclosure details for your road infrastructure package' : 'Select a project and fill in the package details'}
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

                    <form onSubmit={handleSubmit} className="space-y-8">
                        {/* Step 1: Select Project */}
                        {!isEditing && (
                            <div className="p-4 rounded-xl bg-blue-50/80 dark:bg-blue-900/40 border border-blue-200 dark:border-blue-800 shadow-sm">
                                <div className="flex items-center gap-2 mb-3">
                                    <div className="w-6 h-6 rounded-full bg-blue-600 flex items-center justify-center">
                                        <span className="text-white text-xs font-bold">1</span>
                                    </div>
                                    <p className="text-sm font-bold text-blue-700 dark:text-blue-400">Select Project</p>
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


                        {/* Step 2: Package Info */}
                        <div className={`space-y-4 ${selectedProjectId || isEditing ? 'opacity-100' : 'opacity-40 pointer-events-none'}`}>
                            {!isEditing && (
                                <div className="flex items-center gap-2">
                                    <div className={`w-6 h-6 rounded-full flex items-center justify-center ${selectedProjectId ? 'bg-blue-600' : 'bg-gray-300 dark:bg-gray-600'}`}>
                                        <span className="text-white text-xs font-bold">2</span>
                                    </div>
                                    <p className="text-sm font-bold text-gray-700 dark:text-gray-300">Package Information</p>
                                </div>
                            )}

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="pkg-name" className="text-sm font-semibold flex items-center gap-1">
                                        Package Name <span className="text-red-500">*</span>
                                    </Label>
                                    <Input
                                        id="pkg-name"
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        placeholder="Package Name"
                                        className="h-10 text-sm"
                                        required
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="region" className="text-sm font-semibold flex items-center gap-1">
                                        <Globe className="h-3.5 w-3.5 text-gray-400" />
                                        Region <span className="text-gray-400 font-normal text-xs">(Optional)</span>
                                    </Label>
                                    <Input
                                        id="region"
                                        value={region}
                                        onChange={(e) => setRegion(e.target.value)}
                                        placeholder="Region"
                                        className="h-10 text-sm focus-visible:ring-blue-500"
                                    />
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
                                disabled={isSubmitting || !name.trim() || !selectedProjectId}
                                className="flex-1 bg-gradient-to-r from-blue-500 via-indigo-500 to-blue-600 hover:from-blue-600 hover:via-indigo-600 hover:to-blue-700 text-white"
                            >
                                {isSubmitting ? (
                                    <span className="flex items-center gap-2">
                                        <Loader2 className="h-4 w-4 animate-spin" />
                                        {isEditing ? 'Updating...' : 'Creating...'}
                                    </span>
                                ) : (
                                    <span className="flex items-center gap-2">
                                        {isEditing ? <CheckCircle2 className="h-4 w-4" /> : <Package className="h-4 w-4" />}
                                        {isEditing ? 'Update Package' : 'Create Package'}
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
