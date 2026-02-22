from fastapi import FastAPI, WebSocket
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from app.core.globals import detector, tracker
from app.api.routes import router
# from app.models.detector import PedestrianDetector
# from app.models.tracker import PedestrianTracker

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: load models
    try:
        detector.load_model()
        print("✓ YOLOv8 model loaded")
    except Exception as e:
        print(f"Warning: Could not load YOLOv8 model: {e}")
        print("Starting in mock/limited mode.")
    yield
    # Shutdown: cleanup
    # detector.cleanup()

app = FastAPI(
    title="PedTrack AI API",
    version="1.2.2",
    lifespan=lifespan
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(router, prefix="/api/v1")

@app.websocket("/ws/stream/{camera_id}")
async def video_stream(websocket: WebSocket, camera_id: str):
    await websocket.accept()
    # In a real app, this would use the VideoProcessor to stream frames
    # processor = VideoProcessor(camera_id, detector, tracker)
    
    # async for result in processor.process_stream():
    #     await websocket.send_json({
    #         "frame_id": result.frame_id,
    #         "detections": result.detections,
    #         "tracks": result.tracks,
    #         "alerts": result.alerts,
    #         "timestamp": result.timestamp
    #     })
    
    # Mock stream for now
    import asyncio
    import json
    import time
    try:
        while True:
            await websocket.send_json({
                "frame_id": int(time.time() * 30),
                "detections": [],
                "tracks": [],
                "alerts": [],
                "timestamp": time.time(),
                "status": "simulated_stream"
            })
            await asyncio.sleep(0.033) # ~30 FPS
    except Exception:
        pass
