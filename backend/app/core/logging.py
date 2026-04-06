"""Centralized logging for PedTrack AI — shared across all modules."""
import time

# In-memory log store (circular buffer style)
system_logs = []

def add_log(level: str, source: str, message: str):
    """Add a log entry. Levels: INFO, WARNING, ERROR, CRITICAL. Sources: System, Model, Camera, API, Settings."""
    timestamp = time.strftime("%Y-%m-%d %H:%M:%S", time.gmtime())
    entry = {
        "timestamp": timestamp,
        "level": level,
        "source": source,
        "message": message
    }
    system_logs.insert(0, entry)  # Prepend for newest first
    if len(system_logs) > 1000:   # Keep last 1000 logs
        system_logs.pop()
    # Also print to console for debugging
    print(f"[LOG] [{level}] [{source}] {message}")
