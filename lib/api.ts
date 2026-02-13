/**
 * API Service Layer for VisionRoad Frontend
 * Provides typed functions for interacting with the backend API
 */

const API_URL = "http://127.0.0.1:8000/api/v1"

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

// Helper function for GET API requests
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

// Helper function for POST API requests
async function apiPostRequest<T>(endpoint: string, body: unknown): Promise<T> {
    const response = await fetch(`${API_URL}${endpoint}`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "ngrok-skip-browser-warning": "true"
        },
        body: JSON.stringify(body)
    })

    if (!response.ok) {
        const errorText = await response.text()
        throw new Error(`API Error: ${response.status} - ${errorText}`)
    }

    return response.json()
}

// Create request body types
export interface ProjectCreate {
    name: string
    state?: string | null
    corridor_name?: string | null
    start_lat?: number | null
    start_lng?: number | null
    end_lat?: number | null
    end_lng?: number | null
}

export interface PackageCreate {
    project_id: string
    name: string
    region?: string | null
}

export interface LocationCreate {
    package_id: string
    segment_name: string
    chainage_start_km?: number | null
    chainage_end_km?: number | null
    start_lat: number
    start_lng: number
    end_lat: number
    end_lng: number
}

// Update request body types
export interface ProjectUpdate {
    name?: string
    state?: string | null
    corridor_name?: string | null
    start_lat?: number | null
    start_lng?: number | null
    end_lat?: number | null
    end_lng?: number | null
}

export interface PackageUpdate {
    name?: string
    region?: string | null
}

export interface LocationUpdate {
    segment_name?: string
    chainage_start_km?: number | null
    chainage_end_km?: number | null
    start_lat?: number
    start_lng?: number
    end_lat?: number
    end_lng?: number
}

// Helper function for PUT API requests
async function apiPutRequest<T>(endpoint: string, body: unknown): Promise<T> {
    const response = await fetch(`${API_URL}${endpoint}`, {
        method: "PUT",
        headers: {
            "Content-Type": "application/json",
            "ngrok-skip-browser-warning": "true"
        },
        body: JSON.stringify(body)
    })

    if (!response.ok) {
        const errorText = await response.text()
        throw new Error(`API Error: ${response.status} - ${errorText}`)
    }

    return response.json()
}

// Helper function for DELETE API requests
async function apiDeleteRequest<T>(endpoint: string): Promise<T> {
    const response = await fetch(`${API_URL}${endpoint}`, {
        method: "DELETE",
        headers: {
            "Content-Type": "application/json",
            "ngrok-skip-browser-warning": "true"
        }
    })

    if (!response.ok) {
        const errorText = await response.text()
        throw new Error(`API Error: ${response.status} - ${errorText}`)
    }

    if (response.status === 204) {
        return { message: "Deleted successfully" } as unknown as T
    }

    return response.json()
}

/**
 * Create a new project
 */
export async function createProject(data: ProjectCreate): Promise<Project> {
    return apiPostRequest<Project>("/projects/", data)
}

/**
 * Create a new package in a project
 */
export async function createPackage(data: PackageCreate): Promise<Package> {
    return apiPostRequest<Package>("/packages/", data)
}

/**
 * Create a new location in a package
 */
export async function createLocation(data: LocationCreate): Promise<Location> {
    return apiPostRequest<Location>("/locations/", data)
}

/**
 * Update an existing project
 */
export async function updateProject(projectId: string, data: ProjectUpdate): Promise<Project> {
    return apiPutRequest<Project>(`/projects/${projectId}`, data)
}

/**
 * Delete a project
 */
export async function deleteProject(projectId: string): Promise<{ message: string }> {
    return apiDeleteRequest<{ message: string }>(`/projects/${projectId}`)
}

/**
 * Update an existing package
 */
export async function updatePackage(packageId: string, data: PackageUpdate): Promise<Package> {
    return apiPutRequest<Package>(`/packages/${packageId}`, data)
}

/**
 * Delete a package
 */
export async function deletePackage(packageId: string): Promise<{ message: string }> {
    return apiDeleteRequest<{ message: string }>(`/packages/${packageId}`)
}

/**
 * Update an existing location
 */
export async function updateLocation(locationId: string, data: LocationUpdate): Promise<Location> {
    return apiPutRequest<Location>(`/locations/${locationId}`, data)
}

/**
 * Delete a location
 */
export async function deleteLocation(locationId: string): Promise<{ message: string }> {
    return apiDeleteRequest<{ message: string }>(`/locations/${locationId}`)
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
 * Fetch all packages (for dashboard)
 */
export async function fetchAllPackages(): Promise<Package[]> {
    return apiRequest<Package[]>("/packages/")
}

/**
 * Fetch all locations (for dashboard)
 */
export async function fetchAllLocations(): Promise<Location[]> {
    return apiRequest<Location[]>("/locations/")
}

// Video type for dashboard
export interface Video {
    id: string
    filename: string
    detection_type: "pothole-detection" | "sign-board-detection" | "pot-sign-detection"
    status: "pending" | "processing" | "completed" | "failed"
    unique_defected_sign_board?: number
    unique_pothole?: number
    unique_road_crack?: number
    unique_damaged_road_marking?: number
    unique_good_sign_board?: number
    total_road_damage?: number
    total_detections?: number
    created_at: string
    updated_at: string
}

/**
 * Fetch all videos (for dashboard)
 */
export async function fetchVideos(): Promise<Video[]> {
    const response = await apiRequest<{
        videos: Array<{
            video_id: string;
            status: string;
            progress: number;
            summary?: {
                unique_defected_sign_board?: number;
                unique_pothole?: number;
                unique_road_crack?: number;
                unique_damaged_road_marking?: number;
                unique_good_sign_board?: number;
                total_road_damage?: number;
                total_detections?: number;
            }
        }>
    }>("/videos")

    // Transform the response to match our Video interface
    return response.videos.map(v => ({
        id: v.video_id,
        filename: v.video_id,
        detection_type: "pot-sign-detection" as const,
        status: v.status as Video["status"],
        unique_defected_sign_board: v.summary?.unique_defected_sign_board,
        unique_pothole: v.summary?.unique_pothole,
        unique_road_crack: v.summary?.unique_road_crack,
        unique_damaged_road_marking: v.summary?.unique_damaged_road_marking,
        unique_good_sign_board: v.summary?.unique_good_sign_board,
        total_road_damage: v.summary?.total_road_damage,
        total_detections: v.summary?.total_detections,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
    }))
}

// Detection type for map display
export interface Detection {
    id: number
    video_id: string
    type: string
    class: string
    confidence: number
    latitude: number | null
    longitude: number | null
    frame_number: number
    timestamp_ms: number
}

/**
 * Fetch all detections from completed videos (for dashboard map)
 * Uses the summary endpoint to get detections for each project
 */
export async function fetchAllDetections(): Promise<Detection[]> {
    try {
        // First get all projects
        const projects = await fetchProjects()

        // Then fetch detections for each project
        const allDetections: Detection[] = []

        for (const project of projects) {
            try {
                const summary = await apiRequest<{
                    packages: {
                        [key: string]: {
                            locations: {
                                [key: string]: {
                                    detections: Detection[]
                                }
                            }
                        }
                    }
                }>(`/summary/projects/${project.id}`)

                // Extract detections from the nested structure
                for (const pkg of Object.values(summary.packages || {})) {
                    for (const loc of Object.values(pkg.locations || {})) {
                        allDetections.push(...(loc.detections || []))
                    }
                }
            } catch (e) {
                // Skip projects that fail to load
                console.warn(`Failed to load detections for project ${project.id}:`, e)
            }
        }

        return allDetections
    } catch (e) {
        console.error("Failed to fetch all detections:", e)
        return []
    }
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

// Session Storage Keys
const SESSION_KEY = "visionroad_session"
const VIDEO_DATA_KEY = "visionroad_video_data"
const DETECTION_TYPE_KEY = "visionroad_detection_type"

/**
 * Save session to sessionStorage
 */
export function saveSession(session: SessionContext): void {
    if (typeof window !== "undefined") {
        sessionStorage.setItem(SESSION_KEY, JSON.stringify(session))
    }
}

/**
 * Load session from sessionStorage
 */
export function loadSession(): SessionContext {
    if (typeof window !== "undefined") {
        const stored = sessionStorage.getItem(SESSION_KEY)
        if (stored) {
            return JSON.parse(stored)
        }
    }
    return emptySessionContext
}

/**
 * Clear all session data
 */
export function clearSession(): void {
    if (typeof window !== "undefined") {
        sessionStorage.removeItem(SESSION_KEY)
        sessionStorage.removeItem(VIDEO_DATA_KEY)
        sessionStorage.removeItem(DETECTION_TYPE_KEY)
    }
}

/**
 * Video data for results page
 */
export interface VideoResultData {
    videoId: string
    detectionType: string
}

/**
 * Save video result data
 */
export function saveVideoData(data: VideoResultData): void {
    if (typeof window !== "undefined") {
        sessionStorage.setItem(VIDEO_DATA_KEY, JSON.stringify(data))
    }
}

/**
 * Load video result data
 */
export function loadVideoData(): VideoResultData | null {
    if (typeof window !== "undefined") {
        const stored = sessionStorage.getItem(VIDEO_DATA_KEY)
        if (stored) {
            return JSON.parse(stored)
        }
    }
    return null
}

/**
 * Check if session is complete
 */
export function isSessionValid(session: SessionContext): boolean {
    return !!(session.projectId && session.packageId && session.locationId)
}
