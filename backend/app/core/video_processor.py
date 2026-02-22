class VideoProcessor:
    def __init__(self, camera_id, detector, tracker):
        self.camera_id = camera_id
        self.detector = detector
        self.tracker = tracker

    async def process_stream(self):
        # Placeholder for actual frame reading loop
        # In real impl, would use cv2.VideoCapture(rtsp_url)
        yield {
            "frame_id": 0,
            "detections": [],
            "tracks": [],
            "alerts": [],
            "timestamp": 0
        }
