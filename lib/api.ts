/**
 * API Service Layer for VisionRoad Frontend
 * Provides typed functions for interacting with the backend API
 */

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000/api/v1"

// Type definitions
export interface Project {
    id: string
    name: string
    state: string | null
    corridor_name: string | null
    start_lat: number | null
    start_lng: number | null
    end_lat: number | null
    end_lng: number | null
    created_at: string
    updated_at: string
}

export interface Package {
    id: string
    project_id: string
    name: string
    region: string | null
    created_at: string
    updated_at: string
}

export interface Location {
    id: string
    package_id: string
    segment_name: string
    chainage_start_km: number | null
    chainage_end_km: number | null
    start_lat: number
    start_lng: number
    end_lat: number
    end_lng: number
    created_at: string
    updated_at: string
}

// Helper function for API requests
async function apiRequest<T>(endpoint: string): Promise<T> {
    const response = await fetch(`${API_URL}${endpoint}`, {
        headers: {
            "Content-Type": "application/json",
            "ngrok-skip-browser-warning": "true"
        }
    })

    if (!response.ok) {
        throw new Error(`API Error: ${response.status} ${response.statusText}`)
    }

    return response.json()
}

// API Functions

/**
 * Fetch all projects
 */
export async function fetchProjects(): Promise<Project[]> {
    return apiRequest<Project[]>("/projects/")
}

/**
 * Fetch packages filtered by project ID
 */
export async function fetchPackagesByProject(projectId: string): Promise<Package[]> {
    return apiRequest<Package[]>(`/packages/?project_id=${projectId}`)
}

/**
 * Fetch locations filtered by package ID
 */
export async function fetchLocationsByPackage(packageId: string): Promise<Location[]> {
    return apiRequest<Location[]>(`/locations/?package_id=${packageId}`)
}

/**
 * Session context type for storing user selections
 */
export interface SessionContext {
    projectId: string | null
    projectName: string | null
    packageId: string | null
    packageName: string | null
    locationId: string | null
    locationName: string | null
}

export const emptySessionContext: SessionContext = {
    projectId: null,
    projectName: null,
    packageId: null,
    packageName: null,
    locationId: null,
    locationName: null
}
