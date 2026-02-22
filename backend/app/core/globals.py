from app.models.detector import PedestrianDetector
from app.models.tracker import PedestrianTracker

# Defaults matching frontend
app_settings = {
    "model_variant": "yolov8s",
    "confidence_threshold": 0.65,
    "nms_iou_threshold": 0.45,
    # Add other backend-relevant settings here if needed
}

# Initialize global instances
# Models will be loaded at startup via main.py lifespan
detector = PedestrianDetector(model_path=f"weights/{app_settings['model_variant']}.pt")
tracker = PedestrianTracker()
