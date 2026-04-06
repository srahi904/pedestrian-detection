from ultralytics import YOLO
from huggingface_hub import hf_hub_download
from app.core.logging import add_log
import cv2
import os

class PedestrianDetector:
    def __init__(self, model_path="weights/yolov8s.pt"):
        self.model_path = model_path
        self.model = None
        # COCO class 0 = "person"
        self.PERSON_CLASS_ID = 0
        self.CONFIDENCE_THRESHOLD = 0.65
        self.is_loading = False
        self.status_message = "Initializing..."

    def load_model(self, model_path=None):
        if model_path:
            self.model_path = model_path
            
        self.is_loading = True
        try:
            # Handle simple model names like "yolov8n" by appending .pt
            target_path = self.model_path
            if not target_path.endswith(".pt"):
                 target_path += ".pt"
            
            filename = os.path.basename(target_path)
            
            self.status_message = f"Downloading {filename} from HuggingFace..."
            add_log("INFO", "Model", f"Downloading {filename} from HuggingFace repo...")
            try:
                # Fetch from your HuggingFace Repository explicitly
                local_path = hf_hub_download(
                    repo_id="rahi904/pedestrian-detection",
                    filename=filename,
                    cache_dir="weights"
                )
                add_log("INFO", "Model", f"Download complete for {filename}, loading into GPU memory...")
                
                self.status_message = f"Loading {filename} into memory..."
                self.model = YOLO(local_path)
                self.status_message = f"Model {filename} ready"
                add_log("INFO", "Model", f"✓ Model {filename} loaded successfully")
            except Exception as e:
                add_log("ERROR", "Model", f"Failed to load {filename}: {str(e)}")
                if "yolov8n" not in target_path:
                    self.status_message = f"Failed to load {filename}, falling back to yolov8n.pt..."
                    add_log("WARNING", "Model", f"Falling back to yolov8n.pt")
                    fallback_path = hf_hub_download(
                        repo_id="rahi904/pedestrian-detection",
                        filename="yolov8n.pt",
                        cache_dir="weights"
                    )
                    self.status_message = "Loading yolov8n.pt into memory..."
                    self.model = YOLO(fallback_path)
                    self.status_message = "Model yolov8n.pt ready (fallback)"
                    add_log("INFO", "Model", "✓ Fallback model yolov8n.pt loaded successfully")
                else:
                    self.status_message = f"Error: Failed to load {filename}"
                    add_log("CRITICAL", "Model", f"All model loading failed for {filename}")
        finally:
            self.is_loading = False

    def reload_model(self, model_name):
        filename = model_name if model_name.endswith(".pt") else f"{model_name}.pt"
        self.status_message = f"Switching to {filename}..."
        add_log("INFO", "Model", f"Model switch requested: switching to {filename}")
        self.load_model(model_name)

    def detect_pedestrians(self, frame):
        """Run YOLOv8 inference on a video frame."""
        if self.model is None:
            return []
            
        results = self.model(
            frame,
            classes=[self.PERSON_CLASS_ID],  # Filter person class only
            conf=self.CONFIDENCE_THRESHOLD,
            iou=0.45,          # NMS IoU threshold
            imgsz=640,          # Input resolution
            verbose=False
        )
        
        detections = []
        for result in results:
            for box in result.boxes:
                x1, y1, x2, y2 = box.xyxy[0].cpu().numpy()
                confidence = float(box.conf[0])
                detections.append({
                    "bbox": [float(x1), float(y1), float(x2 - x1), float(y2 - y1)],
                    "confidence": confidence,
                    "class": "person"
                })
        
        return detections
