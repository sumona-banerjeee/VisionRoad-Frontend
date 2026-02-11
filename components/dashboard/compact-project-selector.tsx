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
            <div className="flex flex-col min-w-[120px]">
                <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground leading-none mb-1">Project</span>
                <Select
                    value={selectedProjectId || ""}
                    onValueChange={onProjectChange}
                    disabled={isLoading || projects.length === 0}
                >
                    <SelectTrigger className="h-auto p-0 border-0 shadow-none focus:ring-0 text-sm font-bold text-gray-900 dark:text-white bg-transparent text-left">
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
                    <div className="h-8 w-px bg-gray-200 dark:bg-gray-700 mx-2" />
                    <div className="flex flex-col">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground leading-none mb-1">Corridor</span>
                        <span className="text-xs font-bold text-gray-600 dark:text-gray-400">
                            {selectedProject.corridor_name}
                        </span>
                    </div>
                </>
            )}

            {/* State Badge */}
            {selectedProject?.state && (
                <>
                    <div className="h-8 w-px bg-gray-200 dark:bg-gray-700 mx-2" />
                    <div className="flex flex-col">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground leading-none mb-1">State</span>
                        <span className="text-xs font-bold text-gray-600 dark:text-gray-400">
                            {selectedProject.state}
                        </span>
                    </div>
                </>
            )}
        </div>
    )
}
