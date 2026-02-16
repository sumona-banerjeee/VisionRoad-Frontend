export type DetectionType = "pothole-detection" | "sign-board-detection" | "pot-sign-detection"

export interface DetectionListItem {
    detection_id?: number
    pothole_id?: number
    signboard_id?: number
    type: string
    first_detected_frame: number
    first_detected_time: number
    confidence: number
    bbox?: { x1: number; y1: number; x2: number; y2: number }
    lat?: number
    lng?: number
}

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
        unique_defected_sign_board?: number
        unique_pothole?: number
        unique_road_crack?: number
        unique_damaged_road_marking?: number
        unique_good_sign_board?: number
        total_road_damage?: number
        total_detections: number
        total_frames: number
        detection_rate: number
    }
    pothole_list?: Array<DetectionListItem>
    defected_sign_board_list?: Array<DetectionListItem>
    road_crack_list?: Array<DetectionListItem>
    damaged_road_marking_list?: Array<DetectionListItem>
    good_sign_board_list?: Array<DetectionListItem>
    signboard_list?: Array<DetectionListItem> // Keeping for backward compatibility
    frames: Array<{
        frame_id: number
        // Legacy format: separate arrays
        potholes?: Array<{
            pothole_id: number
            bbox: { x1: number; y1: number; x2: number; y2: number }
            confidence: number
        }>
        signboards?: Array<{
            signboard_id: number
            type: string
            bbox: { x1: number; y1: number; x2: number; y2: number }
            confidence: number
        }>
        // Flat format (pot-sign-detection): unified detections array
        detections?: Array<{
            frame_id: number
            detection_id: number
            type: string
            confidence: number
            bbox: { x1: number; y1: number; x2: number; y2: number }
            center?: { x: number; y: number }
            area?: number
            count?: {
                defected_sign_board: number
                pothole: number
                road_crack: number
                damaged_road_marking: number
                good_sign_board: number
            }
        }>
    }>
}
