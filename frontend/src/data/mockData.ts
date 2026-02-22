// Simulated surveillance data for the pedestrian detection system

export interface Detection {
  id: string;
  timestamp: string;
  camera: string;
  confidence: number;
  pedestrianCount: number;
  zone: string;
  status: "normal" | "warning" | "alert";
  boundingBoxes: { x: number; y: number; w: number; h: number; trackId: number }[];
}

export interface CameraFeed {
  id: string;
  name: string;
  location: string;
  status: "online" | "offline" | "maintenance";
  resolution: string;
  fps: number;
  pedestrianCount: number;
  lastDetection: string;
}

export interface Alert {
  id: string;
  type: "crowd" | "intrusion" | "loitering" | "anomaly" | "fallen";
  severity: "low" | "medium" | "high" | "critical";
  message: string;
  camera: string;
  timestamp: string;
  acknowledged: boolean;
}

export interface HourlyData {
  hour: string;
  count: number;
  avgConfidence: number;
}

export interface ZoneData {
  zone: string;
  current: number;
  max: number;
  avgDwell: number;
}

export const cameras: CameraFeed[] = [
  { id: "cam-01", name: "Main Entrance", location: "Building A - North", status: "online", resolution: "1920x1080", fps: 30, pedestrianCount: 24, lastDetection: "2 sec ago" },
  { id: "cam-02", name: "Parking Lot A", location: "Outdoor - East", status: "online", resolution: "1920x1080", fps: 30, pedestrianCount: 8, lastDetection: "5 sec ago" },
  { id: "cam-03", name: "Lobby Area", location: "Building A - Ground", status: "online", resolution: "2560x1440", fps: 25, pedestrianCount: 45, lastDetection: "1 sec ago" },
  { id: "cam-04", name: "Side Entrance", location: "Building B - West", status: "online", resolution: "1920x1080", fps: 30, pedestrianCount: 12, lastDetection: "3 sec ago" },
  { id: "cam-05", name: "Corridor B2", location: "Building B - Floor 2", status: "maintenance", resolution: "1280x720", fps: 15, pedestrianCount: 0, lastDetection: "N/A" },
  { id: "cam-06", name: "Emergency Exit", location: "Building A - South", status: "online", resolution: "1920x1080", fps: 30, pedestrianCount: 3, lastDetection: "12 sec ago" },
  { id: "cam-07", name: "Cafeteria", location: "Building C - Ground", status: "online", resolution: "2560x1440", fps: 25, pedestrianCount: 67, lastDetection: "1 sec ago" },
  { id: "cam-08", name: "Loading Dock", location: "Outdoor - South", status: "offline", resolution: "1920x1080", fps: 0, pedestrianCount: 0, lastDetection: "N/A" },
];

export const recentAlerts: Alert[] = [
  { id: "a-001", type: "crowd", severity: "high", message: "Crowd density exceeded threshold (>50) in Lobby Area", camera: "cam-03", timestamp: "2024-01-15 14:32:15", acknowledged: false },
  { id: "a-002", type: "loitering", severity: "medium", message: "Individual loitering detected near Emergency Exit for >5 minutes", camera: "cam-06", timestamp: "2024-01-15 14:28:42", acknowledged: false },
  { id: "a-003", type: "intrusion", severity: "critical", message: "Unauthorized person detected in restricted zone after hours", camera: "cam-04", timestamp: "2024-01-15 14:15:03", acknowledged: true },
  { id: "a-004", type: "fallen", severity: "critical", message: "Possible fallen pedestrian detected in Parking Lot A", camera: "cam-02", timestamp: "2024-01-15 14:10:22", acknowledged: false },
  { id: "a-005", type: "anomaly", severity: "low", message: "Unusual movement pattern detected in Cafeteria", camera: "cam-07", timestamp: "2024-01-15 13:55:10", acknowledged: true },
  { id: "a-006", type: "crowd", severity: "medium", message: "Crowd forming near Main Entrance during peak hours", camera: "cam-01", timestamp: "2024-01-15 13:45:00", acknowledged: true },
  { id: "a-007", type: "intrusion", severity: "high", message: "Motion detected in Loading Dock after hours", camera: "cam-08", timestamp: "2024-01-15 13:30:15", acknowledged: false },
  { id: "a-008", type: "loitering", severity: "low", message: "Extended stay detected in Corridor B2 hallway", camera: "cam-05", timestamp: "2024-01-15 13:15:30", acknowledged: true },
];

export const hourlyTraffic: HourlyData[] = [
  { hour: "06:00", count: 12, avgConfidence: 0.92 },
  { hour: "07:00", count: 45, avgConfidence: 0.94 },
  { hour: "08:00", count: 128, avgConfidence: 0.91 },
  { hour: "09:00", count: 195, avgConfidence: 0.93 },
  { hour: "10:00", count: 167, avgConfidence: 0.95 },
  { hour: "11:00", count: 143, avgConfidence: 0.92 },
  { hour: "12:00", count: 234, avgConfidence: 0.90 },
  { hour: "13:00", count: 256, avgConfidence: 0.91 },
  { hour: "14:00", count: 198, avgConfidence: 0.93 },
  { hour: "15:00", count: 176, avgConfidence: 0.94 },
  { hour: "16:00", count: 210, avgConfidence: 0.92 },
  { hour: "17:00", count: 287, avgConfidence: 0.89 },
  { hour: "18:00", count: 312, avgConfidence: 0.88 },
  { hour: "19:00", count: 189, avgConfidence: 0.91 },
  { hour: "20:00", count: 95, avgConfidence: 0.93 },
  { hour: "21:00", count: 45, avgConfidence: 0.95 },
  { hour: "22:00", count: 18, avgConfidence: 0.96 },
  { hour: "23:00", count: 8, avgConfidence: 0.97 },
];

export const zoneAnalytics: ZoneData[] = [
  { zone: "Main Entrance", current: 24, max: 80, avgDwell: 1.2 },
  { zone: "Lobby Area", current: 45, max: 100, avgDwell: 4.5 },
  { zone: "Cafeteria", current: 67, max: 120, avgDwell: 22.3 },
  { zone: "Parking Lot A", current: 8, max: 40, avgDwell: 3.1 },
  { zone: "Side Entrance", current: 12, max: 50, avgDwell: 0.8 },
  { zone: "Emergency Exit", current: 3, max: 20, avgDwell: 0.5 },
  { zone: "Corridor B2", current: 0, max: 30, avgDwell: 1.7 },
  { zone: "Loading Dock", current: 0, max: 15, avgDwell: 0.0 },
];

export const weeklyData = [
  { day: "Mon", pedestrians: 2450, alerts: 12 },
  { day: "Tue", pedestrians: 2680, alerts: 8 },
  { day: "Wed", pedestrians: 2890, alerts: 15 },
  { day: "Thu", pedestrians: 2720, alerts: 10 },
  { day: "Fri", pedestrians: 3150, alerts: 18 },
  { day: "Sat", pedestrians: 1850, alerts: 5 },
  { day: "Sun", pedestrians: 1200, alerts: 3 },
];

export const detectionMetrics = {
  totalDetections: 15847,
  avgConfidence: 0.923,
  trackingAccuracy: 0.891,
  falsePositiveRate: 0.032,
  processingLatency: 23, // ms
  modelsLoaded: 2,
  gpuUtilization: 67,
  memoryUsage: 4.2, // GB
};

export const heatmapData = Array.from({ length: 24 }, (_, hour) =>
  Array.from({ length: 7 }, (_, day) => ({
    hour,
    day,
    value: Math.floor(
      Math.random() * 100 *
      (hour >= 8 && hour <= 18 ? 1 : 0.3) *
      (day < 5 ? 1 : 0.5)
    ),
  }))
).flat();
