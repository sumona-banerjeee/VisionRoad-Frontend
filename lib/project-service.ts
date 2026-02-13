"use client"

import {
    type Project,
    type Package,
    type Location,
    type Video,
    type Detection
} from "./api"

/**
 * Service to handle data extraction from project summaries
 */
export const projectDataService = {
    /**
     * Extracts all detections from a project summary, optionally filtered by package and location
     */
    extractDetections(
        projectSummary: any,
        selectedPackageId?: string | null,
        selectedLocationId?: string | null
    ): Detection[] {
        if (!projectSummary) return []

        const detections: Detection[] = []
        const packagesToProcess = selectedPackageId && selectedPackageId !== "all"
            ? { [selectedPackageId]: projectSummary.packages[selectedPackageId] }
            : projectSummary.packages || {}

        for (const [pkgName, pkg] of Object.entries(packagesToProcess)) {
            const locationsToProcess = selectedLocationId && selectedLocationId !== "all"
                ? { [selectedLocationId]: (pkg as any).locations[selectedLocationId] }
                : (pkg as any).locations || {}

            for (const [locName, loc] of Object.entries(locationsToProcess)) {
                if (!loc) continue
                const locationDetections = (loc as any).detections || []
                detections.push(...locationDetections)
            }
        }

        return detections
    }
}

/**
 * API service for project and video data
 */
export * from "./api"
