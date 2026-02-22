from ultralytics import YOLO
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

    def load_model(self, model_path=None):
        if model_path:
            self.model_path = model_path
            
        self.is_loading = True
        try:
            # Handle simple model names like "yolov8n" by appending .pt and checking local dir
            # If it's just a name, ultralytics handles downloading automatically usually
            target_path = self.model_path
            if not target_path.endswith(".pt"):
                 target_path += ".pt"
                 
            # If path doesn't exist locally, Ultralytics will download it to current dir
            print(f"Loading YOLO model: {target_path}")
            try:
                self.model = YOLO(target_path)
                print(f"✓ Model loaded: {target_path}")
            except Exception as e:
                print(f"Error loading model {target_path}: {e}")
                if target_path != "yolov8n.pt":
                    print("Fallback to yolov8n.pt")
                    self.model = YOLO("yolov8n.pt")
        finally:
            self.is_loading = False

    def reload_model(self, model_name):
        print(f"Initiating reload to: {model_name}")
        # Build logic moved to load_model, we just call it
        # The caller (routes.py) should ideally wrap this in BackgroundTasks
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
