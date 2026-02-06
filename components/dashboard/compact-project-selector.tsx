"use client"

import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { FolderOpen, MapPin, Building2 } from "lucide-react"
import { type Project } from "@/lib/api"

interface CompactProjectSelectorProps {
    projects: Project[]
    selectedProjectId: string | null
    onProjectChange: (projectId: string) => void
    selectedProject: Project | undefined
    isLoading?: boolean
}

export function CompactProjectSelector({
    projects,
    selectedProjectId,
    onProjectChange,
    selectedProject,
    isLoading = false
}: CompactProjectSelectorProps) {
    return (
        <div className="flex flex-wrap items-center gap-3 p-3 rounded-xl bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm border border-gray-200/50 dark:border-gray-700/50">
            {/* Project Dropdown */}
            <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-indigo-100 dark:bg-indigo-900/50">
                    <FolderOpen className="h-4 w-4 text-indigo-500" />
                </div>
                <Select
                    value={selectedProjectId || ""}
                    onValueChange={onProjectChange}
                    disabled={isLoading || projects.length === 0}
                >
                    <SelectTrigger className="w-[220px] h-8 text-sm bg-transparent border-0 shadow-none focus:ring-0 px-1">
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

            {/* Corridor Badge */}
            {selectedProject?.corridor_name && (
                <>
                    <div className="h-5 w-px bg-gray-300 dark:bg-gray-600" />
                    <div className="flex items-center gap-2">
                        <div className="p-1.5 rounded-lg bg-emerald-100 dark:bg-emerald-900/50">
                            <MapPin className="h-3.5 w-3.5 text-emerald-500" />
                        </div>
                        <span className="text-sm text-gray-600 dark:text-gray-300">
                            {selectedProject.corridor_name}
                        </span>
                    </div>
                </>
            )}

            {/* State Badge */}
            {selectedProject?.state && (
                <>
                    <div className="h-5 w-px bg-gray-300 dark:bg-gray-600" />
                    <div className="flex items-center gap-2">
                        <div className="p-1.5 rounded-lg bg-purple-100 dark:bg-purple-900/50">
                            <Building2 className="h-3.5 w-3.5 text-purple-500" />
                        </div>
                        <span className="text-sm text-gray-600 dark:text-gray-300">
                            {selectedProject.state}
                        </span>
                    </div>
                </>
            )}
        </div>
    )
}
