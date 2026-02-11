export type DetectionType = "pothole-detection" | "sign-board-detection"

export type DetectionData = {
    video_id: string
    detection_type?: string
    output_video_path?: string
    video_info: {
        fps: number
        width: number
        height: number
        total_frames: number
    }
    summary: {
        unique_potholes?: number
        unique_signboards?: number
        total_detections: number
        total_frames: number
        detection_rate: number
    }
    pothole_list?: Array<{
        pothole_id: number
        first_detected_frame: number
        first_detected_time: number
        confidence: number
        lat?: number
        lng?: number
    }>
    signboard_list?: Array<{
        signboard_id: number
        type: string
        first_detected_frame: number
        first_detected_time: number
        confidence: number
        lat?: number
        lng?: number
    }>
    frames: Array<{
        frame_id: number
        potholes?: Array<{
            pothole_id: number
            bbox: {
                x1: number
                y1: number
                x2: number
                y2: number
            }
            confidence: number
        }>
        signboards?: Array<{
            signboard_id: number
            type: string
            bbox: {
                x1: number
                y1: number
                x2: number
                y2: number
            }
            confidence: number
        }>
    }>
}
