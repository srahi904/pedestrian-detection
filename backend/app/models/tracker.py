try:
    from deep_sort_realtime.deepsort_tracker import DeepSort
except (ImportError, ModuleNotFoundError, Exception) as e:
    print(f"Warning: deep-sort-realtime import failed: {e}")
    DeepSort = None

class PedestrianTracker:
    def __init__(self):
        self.active = False
        if DeepSort:
            try:
                # Using mobilenet for simpler setup without large weights file requirement if not present
                self.tracker = DeepSort(
                    max_age=70,
                    n_init=3,
                    max_iou_distance=0.7,
                    max_cosine_distance=0.4,
                    nn_budget=100,
                    embedder="mobilenet",
                    embedder_gpu=False,
                )
                self.active = True
            except Exception as e:
                print(f"Warning: Failed to initialize DeepSort: {e}")
        else:
            print("Tracker running in mock mode.")
    
    def update(self, detections, frame):
        """
        Update tracks with new detections.
        """
        if not self.active:
            # Mock behavior: just pass through detections with fake IDs
            results = []
            for i, d in enumerate(detections):
                results.append({
                    "track_id": hash(f"{d['bbox']}") % 1000,
                    "bbox": d["bbox"],
                    "age": 1,
                    "hits": 1
                })
            return results

        if not detections:
            self.tracker.update_tracks([], frame=frame)
            return []
        
        # Format: [[x, y, w, h], confidence, class_id]
        raw_detections = []
        for d in detections:
            bbox = d["bbox"] # [x, y, w, h]
            conf = d["confidence"]
            raw_detections.append((bbox, conf, "person"))
        
        tracks = self.tracker.update_tracks(
            raw_detections=raw_detections,
            frame=frame
        )
        
        results = []
        for track in tracks:
            if not track.is_confirmed():
                continue
            track_id = track.track_id
            # to_ltrb returns [left, top, right, bottom]
            ltrb = track.to_ltrb()
            
            # Convert to [x, y, w, h] for consistency if needed, or keep ltrb
            # The doc snippet used to_ltrb() but returned it as 'bbox'
            
            results.append({
                "track_id": track_id,
                "bbox": ltrb, 
                "age": track.age,
                "hits": track.hits
            })
        
        return results
