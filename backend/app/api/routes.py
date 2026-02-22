from fastapi import APIRouter, HTTPException, UploadFile, File
from typing import List, Optional
import time
import random
import numpy as np
import cv2
from pydantic import BaseModel

router = APIRouter()

# --- Models ---
class Camera(BaseModel):
    id: str
    name: str
    status: str
    resolution: str
    fps: int
    pedestrian_count: int
    location: str

class Detection(BaseModel):
    track_id: int
    bbox: List[float]
    confidence: float
    zone: str

class CameraDetections(BaseModel):
    camera_id: str
    timestamp: str
    detections: List[Detection]
    total_count: int

class Alert(BaseModel):
    id: str
    type: str
    severity: str
    message: str
    camera: str
    timestamp: str
    acknowledged: bool

class AlertResponse(BaseModel):
    alerts: List[Alert]
    total: int
    unacknowledged: int

class SettingsUpdate(BaseModel):
    confidence_threshold: float
    nms_iou_threshold: float
    model_variant: Optional[str] = "yolov8s"

# --- Mock Data ---
mock_cameras = [
    {"id": "cam-01", "name": "Main Entrance", "status": "online", "resolution": "1920x1080", "fps": 30, "pedestrian_count": 12, "location": "North Wing"},
    {"id": "cam-02", "name": "Lobby Area", "status": "online", "resolution": "1920x1080", "fps": 30, "pedestrian_count": 8, "location": "Ground Floor"},
    {"id": "cam-03", "name": "Corridor A", "status": "maintenance", "resolution": "1280x720", "fps": 0, "pedestrian_count": 0, "location": "East Wing"},
    {"id": "cam-04", "name": "Parking Lot", "status": "online", "resolution": "3840x2160", "fps": 24, "pedestrian_count": 3, "location": "Outdoor"},
]

mock_alerts = [
    {"id": "a-001", "type": "crowd", "severity": "high", "message": "Crowd density exceeded in Lobby", "camera": "Lobby Area", "timestamp": "10 min ago", "acknowledged": False},
    {"id": "a-002", "type": "loitering", "severity": "medium", "message": "Loitering detected at Entrance", "camera": "Main Entrance", "timestamp": "25 min ago", "acknowledged": True},
    {"id": "a-003", "type": "intrusion", "severity": "critical", "message": "Restricted area access", "camera": "Server Room", "timestamp": "1 hour ago", "acknowledged": False},
]

# --- Routes ---

@router.get("/")
async def root():
    return {"message": "PedTrack AI API v1.2.2"}

@router.get("/health")
async def health_check():
    from app.core.globals import detector
    status = "loading_model" if detector.is_loading else "ok"
    return {
        "status": status, 
        "service": "pedtrack-backend", 
        "uptime": "99.9%",
        "model_loading": detector.is_loading
    }

# ... (other routes) ...

from fastapi import BackgroundTasks

@router.get("/settings/threshold", response_model=SettingsUpdate)
async def get_thresholds():
    from app.core.globals import app_settings
    return app_settings

@router.put("/settings/threshold")
async def update_threshold(settings: SettingsUpdate, background_tasks: BackgroundTasks):
    from app.core.globals import app_settings, detector

    # Update global state
    app_settings["confidence_threshold"] = settings.confidence_threshold
    app_settings["nms_iou_threshold"] = settings.nms_iou_threshold
    
    # Update detector params
    detector.CONFIDENCE_THRESHOLD = settings.confidence_threshold
    
    # Handle model switch
    if settings.model_variant and settings.model_variant != app_settings["model_variant"]:
        app_settings["model_variant"] = settings.model_variant
        try:
             # Run in background to avoid blocking response
             background_tasks.add_task(detector.reload_model, settings.model_variant)
        except Exception as e:
            print(f"Failed to initiate model reload: {e}")
            
    return {
        "confidence_threshold": settings.confidence_threshold,
        "nms_iou_threshold": settings.nms_iou_threshold,
        "model_variant": settings.model_variant,
        "updated_at": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()),
        "message": "Settings updated"
    }

@router.get("/cameras", response_model=List[Camera])
async def get_cameras():
    # Simulate dynamic counts
    for cam in mock_cameras:
        if cam["status"] == "online":
            change = random.randint(-2, 2)
            cam["pedestrian_count"] = max(0, cam["pedestrian_count"] + change)
    return mock_cameras

@router.get("/cameras/{camera_id}/detections", response_model=CameraDetections)
async def get_camera_detections(camera_id: str):
    camera = next((c for c in mock_cameras if c["id"] == camera_id), None)
    if not camera:
        raise HTTPException(status_code=404, detail="Camera not found")
    
    # Generate random detections based on count
    count = camera["pedestrian_count"]
    detections = []
    for i in range(count):
        detections.append({
            "track_id": 100 + i,
            "bbox": [random.randint(0, 1000), random.randint(0, 500), random.randint(50, 150), random.randint(100, 300)],
            "confidence": random.uniform(0.7, 0.99),
            "zone": "general"
        })
        
    return {
        "camera_id": camera_id,
        "timestamp": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()),
        "detections": detections,
        "total_count": count
    }

@router.post("/detect")
async def detect_pedestrians(file: UploadFile = File(...)):
    start_time = time.time()
    from app.core.globals import detector, app_settings
    
    # Read and decode image
    contents = await file.read()
    nparr = np.frombuffer(contents, np.uint8)
    frame = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
    
    if frame is None:
        raise HTTPException(status_code=400, detail="Invalid image file")

    # Run inference
    detections = detector.detect_pedestrians(frame)
    
    processing_time = (time.time() - start_time) * 1000
    
    return {
        "detections": detections,
        "processing_time_ms": round(processing_time, 2),
        "model": app_settings.get("model_variant", "unknown")
    }

@router.get("/alerts", response_model=AlertResponse)
async def get_alerts():
    unack = sum(1 for a in mock_alerts if not a["acknowledged"])
    return {
        "alerts": mock_alerts,
        "total": len(mock_alerts),
        "unacknowledged": unack
    }

@router.post("/alerts/acknowledge-all")
async def acknowledge_all_alerts():
    for alert in mock_alerts:
        alert["acknowledged"] = True
    return {"status": "success", "message": "All alerts acknowledged"}

# --- Stats Endpoints ---

@router.get("/stats/system")
async def get_system_stats():
    # Simulate system metrics
    return {
        "active_cameras": len([c for c in mock_cameras if c["status"] == "online"]),
        "total_detections_today": random.randint(1000, 5000), # Mock
        "avg_confidence": random.uniform(0.75, 0.92),
        "processing_latency_ms": random.randint(15, 45),
        "gpu_utilization": random.randint(20, 80),
        "tracking_accuracy": 0.94,
        "false_positive_rate": 0.02
    }

@router.get("/stats/weekly")
async def get_weekly_stats():
    # Mock weekly data
    days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]
    return [
        {"day": day, "pedestrians": random.randint(2000, 5000), "alerts": random.randint(5, 20)}
        for day in days
    ]

@router.get("/stats/hourly")
async def get_hourly_stats():
    # Mock hourly data for today
    return [
        {"hour": f"{i:02d}:00", "count": random.randint(50, 500)}
        for i in range(24)
    ]

@router.get("/stats/zones")
async def get_zone_stats():
    # Mock zone data
    zones = ["Main Entrance", "Lobby Area", "Cafeteria", "Parking Lot A", "Side Entrance", "Emergency Exit", "Corridor B2", "Loading Dock"]
    return [
        {
            "zone": z, 
            "current": random.randint(0, 50), 
            "max": 100, 
            "avgDwell": round(random.uniform(0.5, 25.0), 1)
        }
        for z in zones
    ]

@router.get("/stats/heatmap")
async def get_heatmap_stats():
    # Mock heatmap data (24 hours * 7 days)
    data = []
    for h in range(24):
        for d in range(7):
            val = int(random.random() * 100 * (1 if 8 <= h <= 18 else 0.3))
            data.append({"hour": h, "day": d, "value": val})
    return data


# --- Logging Infrastructure ---

class LogEntry(BaseModel):
    timestamp: str
    level: str  # INFO, WARNING, ERROR, CRITICAL
    source: str # System, Camera, Model, API
    message: str

# In-memory log store (circular buffer style)
system_logs = []

def add_log(level: str, source: str, message: str):
    timestamp = time.strftime("%Y-%m-%d %H:%M:%S", time.gmtime())
    entry = {
        "timestamp": timestamp,
        "level": level,
        "source": source,
        "message": message
    }
    system_logs.insert(0, entry) # Prepend for newest first
    if len(system_logs) > 1000: # Keep last 1000 logs
        system_logs.pop()

# Seed initial logs
add_log("INFO", "System", "System initialized successfully")
add_log("INFO", "Model", "YOLOv8 model loaded")
add_log("INFO", "API", "API Server started on port 8000")
add_log("WARNING", "Camera", "Camera-03 connection unstable")

@router.get("/logs", response_model=List[LogEntry])
async def get_logs(limit: int = 100, level: Optional[str] = None):
    filtered_logs = system_logs
    if level:
        filtered_logs = [log for log in system_logs if log["level"] == level]
    return filtered_logs[:limit]

@router.post("/logs")
async def create_log(entry: LogEntry):
    # Allow frontend to trigger logs (e.g. for client-side errors)
    add_log(entry.level, entry.source, entry.message)
    return {"status": "logged"}



