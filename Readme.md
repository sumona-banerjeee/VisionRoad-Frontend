# YOLOPOTHOLE - Pothole Detection System

Real-time pothole detection system using YOLO with adaptive ROI, ByteTrack tracking, and WebSocket-based progress monitoring.

---

## 📋 Table of Contents

- [Features](#features)
- [Architecture](#architecture)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Configuration](#configuration)
- [Usage](#usage)
- [API Reference](#api-reference)
- [WebSocket Protocol](#websocket-protocol)
- [Sample Data](#sample-data)
- [Troubleshooting](#troubleshooting)

---

## ✨ Features

- **Adaptive ROI Detection**: Adjusts detection region based on vehicle speed
- **ByteTrack Multi-Object Tracking**: Prevents duplicate pothole counting
- **Real-time WebSocket Updates**: Live progress monitoring during processing
- **Frame-by-Frame Analysis**: Detailed detection logs with bounding box coordinates
- **Video Playback with Overlays**: Interactive video player with detection visualization
- **RESTful API**: Complete CRUD operations for video processing

---

## 🏗️ Architecture

```
YOLOPOTHOLE/
├── app/
│   ├── core/
│   │   └── storage.py          # In-memory storage
│   ├── routes/
│   │   └── upload_process_routes.py  # API endpoints
│   ├── services/
│   │   ├── upload_service.py   # File upload handling
│   │   └── video_processor.py  # Core detection logic
│   └── ws/
│       └── websocket_manager.py  # WebSocket management
├── frontend/
│   ├── app/
│   │   └── page.tsx            # Main page
│   └── components/
│       ├── upload-section.tsx  # Upload UI
│       ├── summary-section.tsx # Results summary
│       └── video-player-section.tsx  # Video player
├── models/
│   └── pothole-detector.pt     # YOLO model
├── uploads/                    # Uploaded videos
├── results/                    # JSON results
└── main.py                     # FastAPI entry
```

---

## 📦 Prerequisites

### Backend
- Python 3.9+
- CUDA-compatible GPU (optional, recommended)
- FFmpeg

### Frontend
- Node.js 18+
- npm/yarn/pnpm

---

## 🚀 Installation

### Backend Setup

```bash
# Clone repository
git clone <repository-url>
cd YOLOPOTHOLE

# Create virtual environment
python -m venv .venv
source .venv/bin/activate  # Windows: .venv\Scripts\activate

# Install dependencies
pip install fastapi uvicorn python-multipart
pip install opencv-python ultralytics
pip install websockets

# Create required directories
mkdir -p uploads results models
```

### Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Required packages
npm install lucide-react
npm install @radix-ui/react-progress
npm install @radix-ui/react-scroll-area
```

---

## ⚙️ Configuration

### Backend Configuration

**`app/core/storage.py`**
```python
from pathlib import Path

# Storage directories
UPLOAD_DIR = Path("uploads")
RESULTS_DIR = Path("results")
MODELS_DIR = Path("models")

# In-memory storage
processing_status = {}
detection_results = {}

# Ensure directories exist
UPLOAD_DIR.mkdir(exist_ok=True)
RESULTS_DIR.mkdir(exist_ok=True)
MODELS_DIR.mkdir(exist_ok=True)
```

**`main.py`**
```python
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routes.upload_process_routes import router

app = FastAPI(title="YOLOPOTHOLE API", version="1.0.0")

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "https://karlene-unprovoked-lithely.ngrok-free.dev/api/v1",
        "https://secret-pharmaceutical-murphy-traffic.trycloudflare.com"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routes
app.include_router(router, prefix="/api/v1", tags=["detection"])

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
```

### Frontend Configuration

**`.env.local`**
```bash
NEXT_PUBLIC_WS_URL=ws://localhost:8000/api/v1
```

### Model Configuration

**Adaptive Parameters** (in `video_processor.py`):
```python
# Speed < 30 km/h: ROI 50%, Confidence 0.35
# Speed 30-60 km/h: ROI 65%, Confidence 0.28
# Speed > 60 km/h: ROI 75%, Confidence 0.22

MIN_DETECTION_FRAMES = 3  # Frames needed to confirm pothole
DETECTION_TIME_WINDOW = 1.0  # Time window in seconds
```

---

## 📖 Usage

### Starting the Backend

```bash
# Development
python main.py

# Production
uvicorn main:app --host 0.0.0.0 --port 8000 --workers 4
```

### Starting the Frontend

```bash
cd frontend

# Development
npm run dev

# Production
npm run build
npm start
```

### Basic Workflow

1. **Upload Video**: Select video file and set vehicle speed
2. **Monitor Progress**: Real-time WebSocket updates
3. **View Results**: Summary statistics and video playback
4. **Analyze Detections**: Frame-by-frame detection logs

---

## 🔌 API Reference

### REST Endpoints

#### 1. Upload Video
```http
POST /api/v1/upload
Content-Type: multipart/form-data

Parameters:
- file: Video file (mp4, avi, mov, mkv)
- speed_kmh: Vehicle speed (integer, default: 30)

Response:
{
  "video_id": "uuid-string",
  "filename": "video.mp4",
  "message": "Video uploaded successfully. Processing started.",
  "status": "queued"
}
```

#### 2. Get Processing Status
```http
GET /api/v1/status/{video_id}

Response:
{
  "status": "processing",
  "progress": 45,
  "message": "Processing frame 450/1000"
}
```

#### 3. Get Detection Results
```http
GET /api/v1/results/{video_id}

Response: See "Sample Detection Results" below
```

#### 4. List All Videos
```http
GET /api/v1/videos

Response:
{
  "videos": [
    {
      "video_id": "uuid-string",
      "status": "completed",
      "progress": 100,
      "summary": { ... }
    }
  ]
}
```

### Internal API Calls (Frontend)

**Upload Request**:
```typescript
const formData = new FormData()
formData.append("file", file)
formData.append("speed_kmh", "30")

const response = await fetch(`${API_URL}/upload`, {
  method: "POST",
  body: formData
})

const result = await response.json()
// Returns: { video_id, filename, message, status }
```

**Results Request**:
```typescript
const response = await fetch(`${API_URL}/results/${videoId}`)
const detectionData: DetectionData = await response.json()
```

---

## 🔄 WebSocket Protocol

### Connection
```javascript
const ws = new WebSocket(`ws://localhost:8000/api/v1/ws/${videoId}`)
```

### Message Types

#### 1. Status Update
```json
{
  "type": "status",
  "status": "processing",
  "progress": 0,
  "message": "Loading model..."
}
```

#### 2. Progress Update
```json
{
  "type": "progress",
  "progress": 45,
  "message": "Processing frame 450/1000",
  "unique_potholes": 12,
  "total_detections": 87
}
```

#### 3. Completion
```json
{
  "type": "complete",
  "status": "completed",
  "progress": 100,
  "message": "Processing completed successfully",
  "summary": {
    "unique_potholes": 25,
    "total_detections": 143,
    "total_frames": 1000,
    "detection_rate": 35.2
  }
}
```

#### 4. Error
```json
{
  "type": "error",
  "status": "error",
  "message": "Processing failed: Model not found"
}
```

#### 5. Heartbeat
```json
{
  "type": "heartbeat"
}
```

---

## 📊 Sample Data

### Sample Detection Results

```json
{
  "video_id": "550e8400-e29b-41d4-a716-446655440000",
  "video_path": "uploads/550e8400-e29b-41d4-a716-446655440000.mp4",
  "speed_kmh": 45,
  "processed_at": "2025-12-18T10:30:45.123456",
  "video_info": {
    "total_frames": 1200,
    "fps": 30.0,
    "duration": 40.0,
    "width": 1920,
    "height": 1080,
    "resolution": "1920x1080"
  },
  "summary": {
    "total_frames": 1200,
    "unique_potholes": 18,
    "total_detections": 245,
    "frames_with_detections": 147,
    "detection_rate": 12.25
  },
  "pothole_list": [
    {
      "pothole_id": 1,
      "first_detected_frame": 45,
      "first_detected_time": 1.5,
      "confidence": 0.876
    },
    {
      "pothole_id": 2,
      "first_detected_frame": 128,
      "first_detected_time": 4.27,
      "confidence": 0.923
    }
  ],
  "frames": [
    {
      "frame_id": 45,
      "speed_kmh": 45,
      "roi_ratio": 0.65,
      "potholes": [
        {
          "frame_id": 45,
          "pothole_id": 1,
          "type": "pothole",
          "confidence": 0.876,
          "bbox": {
            "x1": 450,
            "y1": 720,
            "x2": 580,
            "y2": 820
          },
          "center": {
            "x": 515,
            "y": 770
          },
          "area": 13000
        }
      ]
    }
  ]
}
```

### Sample WebSocket Messages (Sequential)

```javascript
// 1. Initial connection
{ "type": "status", "status": "queued", "progress": 0, "message": "Video uploaded, starting processing..." }

// 2. Model loading
{ "type": "status", "status": "processing", "progress": 0, "message": "Loading model..." }

// 3. Processing started
{ "type": "status", "status": "processing", "progress": 5, "message": "Model loaded, processing video..." }

// 4. Progress updates (every 5%)
{ "type": "progress", "progress": 10, "message": "Processing frame 120/1200", "unique_potholes": 3, "total_detections": 18 }
{ "type": "progress", "progress": 25, "message": "Processing frame 300/1200", "unique_potholes": 7, "total_detections": 52 }
{ "type": "progress", "progress": 50, "message": "Processing frame 600/1200", "unique_potholes": 12, "total_detections": 134 }

// 5. Completion
{ 
  "type": "complete", 
  "status": "completed", 
  "progress": 100, 
  "message": "Processing completed successfully",
  "summary": {
    "unique_potholes": 18,
    "total_detections": 245,
    "total_frames": 1200,
    "detection_rate": 12.25
  }
}
```

### Sample Frontend State

```typescript
type DetectionData = {
  video_id: string
  video_info: {
    fps: number              // 30.0
    width: number            // 1920
    height: number           // 1080
    total_frames: number     // 1200
  }
  summary: {
    unique_potholes: number     // 18
    total_detections: number    // 245
    total_frames: number        // 1200
    detection_rate: number      // 12.25
  }
  frames: Array<{
    frame_id: number
    potholes: Array<{
      pothole_id: number
      bbox: { x1: number; y1: number; x2: number; y2: number }
      confidence: number
    }>
  }>
}
```

---

## 🐛 Troubleshooting

### Backend Issues

**Model Not Loading**
```bash
# Check model path
ls models/pothole-detector.pt

# Test YOLO installation
python -c "from ultralytics import YOLO; print('OK')"
```

**CUDA/GPU Issues**
```bash
# Check CUDA availability
python -c "import torch; print(torch.cuda.is_available())"

# Force CPU mode in video_processor.py
self.pothole_model = YOLO("models/pothole-detector.pt", device='cpu')
```

**WebSocket Connection Failed**
- Ensure CORS is properly configured
- Check firewall settings for port 8000
- Verify WebSocket URL matches backend

### Frontend Issues

**Video Not Playing**
```typescript
// Check browser console for errors
// Ensure video MIME type is supported
// Verify video file is accessible via ObjectURL
```

**Bounding Boxes Not Showing**
```typescript
// Check canvas dimensions match video
// Verify detection data structure
// Inspect frameDetectionMap in DevTools
```

**Progress Not Updating**
```typescript
// Check WebSocket connection status
// Verify video_id matches between upload and WS
// Look for network errors in browser DevTools
```

### Performance Optimization

**Slow Processing**
- Use GPU acceleration (CUDA)
- Reduce video resolution
- Lower frame rate
- Adjust confidence thresholds

**High Memory Usage**
```python
# Limit thread pool workers
executor = ThreadPoolExecutor(max_workers=2)

# Reduce detection history
pothole_tracker = defaultdict(lambda: deque(maxlen=10))
```

---

## 📝 Notes

- **Tracking**: Requires consistent object IDs from ByteTrack
- **Frame Calculation**: Uses `Math.round(currentTime * fps)` for accuracy
- **Logging**: Limited to last 50 entries to prevent memory issues
- **Storage**: Results saved to both memory and JSON files
- **Cleanup**: Implement periodic cleanup for old videos/results

---

## 🔒 Security Considerations

- Validate file types and sizes on upload
- Sanitize video_id to prevent path traversal
- Implement rate limiting for API endpoints
- Add authentication for production deployments
- Use HTTPS/WSS in production



**Built with FastAPI, YOLO, React, and shadcn/ui**