/**
 * IndexedDB storage for video files
 * Used to persist video files across page navigations
 */

const DB_NAME = 'visionroad_db'
const DB_VERSION = 1
const VIDEO_STORE = 'videos'

let db: IDBDatabase | null = null

/**
 * Open the IndexedDB database
 */
async function openDB(): Promise<IDBDatabase> {
    if (db) return db

    return new Promise((resolve, reject) => {
        const request = indexedDB.open(DB_NAME, DB_VERSION)

        request.onerror = () => reject(request.error)
        request.onsuccess = () => {
            db = request.result
            resolve(db)
        }

        request.onupgradeneeded = (event) => {
            const database = (event.target as IDBOpenDBRequest).result
            if (!database.objectStoreNames.contains(VIDEO_STORE)) {
                database.createObjectStore(VIDEO_STORE, { keyPath: 'id' })
            }
        }
    })
}

/**
 * Store a video file in IndexedDB
 */
export async function storeVideoFile(videoId: string, file: File): Promise<void> {
    const database = await openDB()

    return new Promise((resolve, reject) => {
        const transaction = database.transaction([VIDEO_STORE], 'readwrite')
        const store = transaction.objectStore(VIDEO_STORE)

        const request = store.put({
            id: videoId,
            file: file,
            timestamp: Date.now()
        })

        request.onerror = () => reject(request.error)
        request.onsuccess = () => resolve()
    })
}

/**
 * Retrieve a video file from IndexedDB
 */
export async function getVideoFile(videoId: string): Promise<File | null> {
    const database = await openDB()

    return new Promise((resolve, reject) => {
        const transaction = database.transaction([VIDEO_STORE], 'readonly')
        const store = transaction.objectStore(VIDEO_STORE)

        const request = store.get(videoId)

        request.onerror = () => reject(request.error)
        request.onsuccess = () => {
            const result = request.result
            resolve(result ? result.file : null)
        }
    })
}

/**
 * Clear a video file from IndexedDB
 */
export async function clearVideoFile(videoId: string): Promise<void> {
    const database = await openDB()

    return new Promise((resolve, reject) => {
        const transaction = database.transaction([VIDEO_STORE], 'readwrite')
        const store = transaction.objectStore(VIDEO_STORE)

        const request = store.delete(videoId)

        request.onerror = () => reject(request.error)
        request.onsuccess = () => resolve()
    })
}

/**
 * Clear all video files from IndexedDB
 */
export async function clearAllVideos(): Promise<void> {
    const database = await openDB()

    return new Promise((resolve, reject) => {
        const transaction = database.transaction([VIDEO_STORE], 'readwrite')
        const store = transaction.objectStore(VIDEO_STORE)

        const request = store.clear()

        request.onerror = () => reject(request.error)
        request.onsuccess = () => resolve()
    })
}
