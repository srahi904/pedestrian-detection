import os
from fastapi import FastAPI, WebSocket
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from app.core.globals import detector, tracker
from app.core.logging import add_log
from app.api.routes import router

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: load model (detector handles HF download + caching internally)
    add_log("INFO", "System", "PedTrack AI backend starting up...")
    try:
        detector.load_model()
        add_log("INFO", "System", "Startup complete — system ready")
    except Exception as e:
        add_log("ERROR", "System", f"Startup model load failed: {e}")
        add_log("WARNING", "System", "Running in mock/limited mode")
    yield
    # Shutdown: cleanup
    add_log("INFO", "System", "PedTrack AI backend shutting down...")

app = FastAPI(
    title="PedTrack AI API",
    version="1.2.2",
    lifespan=lifespan
)

# CORS: allow deployed frontend + localhost for dev
cors_origins = os.getenv("CORS_ORIGINS", "*").split(",")
app.add_middleware(
    CORSMiddleware,
    allow_origins=cors_origins,
    allow_credentials=True,
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
