import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import {
  cameras as initialCameras,
  recentAlerts as initialAlerts,
  detectionMetrics as initialMetrics,
  weeklyData,
  hourlyTraffic,
  zoneAnalytics,
  heatmapData,
  CameraFeed,
  Alert,
  Detection,
  ZoneData,
} from "../data/mockData";
import { AppAPI } from "../services/api";

interface AppContextType {
  cameras: CameraFeed[];
  alerts: Alert[];
  stats: typeof initialMetrics;
  recentDetections: Detection[];
  isLive: boolean;
  setIsLive: (status: boolean) => void;
  systemHealth: "online" | "offline" | "maintenance" | "loading_model";
  statusMessage: string;
  weeklyStats: typeof weeklyData;
  hourlyStats: typeof hourlyTraffic;
  zoneStats: ZoneData[];
  heatmapStats: any[];
  markAllAlertsRead: () => Promise<void>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider = ({ children }: { children: ReactNode }) => {
  const [cameras, setCameras] = useState<CameraFeed[]>(initialCameras);
  const [alerts, setAlerts] = useState<Alert[]>(initialAlerts);
  const [stats, setStats] = useState(initialMetrics);
  const [recentDetections] = useState<Detection[]>([]);
  const [isLive, setIsLive] = useState(true);
  const [systemHealth, setSystemHealth] = useState<"online" | "offline" | "maintenance" | "loading_model">("online");
  const [statusMessage, setStatusMessage] = useState("Connecting to server...");
  const [weeklyStats, setWeeklyStats] = useState(weeklyData);
  const [hourlyStats, setHourlyStats] = useState(hourlyTraffic);
  const [zoneStats, setZoneStats] = useState<ZoneData[]>(zoneAnalytics);
  const [heatmapStats, setHeatmapStats] = useState(heatmapData);

  // Poll API for real-time updates
  useEffect(() => {
    if (!isLive) return;

    // Track consecutive failures so one slow poll doesn't flip us to "offline"
    let failCount = 0;
    const FAIL_THRESHOLD = 3; // Need 3 consecutive failures to show offline

    const fetchData = async () => {
      try {
        // Check health first to see if model is loading
        const health = await AppAPI.checkHealth();

        // Health check itself failed (returned false = network error)
        if (health === false) {
          failCount++;
          if (failCount >= FAIL_THRESHOLD) {
            setSystemHealth("offline");
            setStatusMessage("Backend server is unreachable");
          } else {
            setStatusMessage(`Connection attempt failed (${failCount}/${FAIL_THRESHOLD})...`);
          }
          // Don't fetch other endpoints if health is down
          return;
        }

        // Server responded, reset fail counter
        failCount = 0;

        // Model is currently being reloaded — show loading state but DON'T go offline
        if (typeof health === 'object' && health.model_loading) {
            setSystemHealth("loading_model");
            setStatusMessage(health.status_detail || "Model is loading...");
            // Skip fetching other endpoints while model is loading
            return;
        }

        // Server is healthy — grab the detail message
        if (typeof health === 'object') {
          setStatusMessage(health.status_detail || `Active — ${health.current_model || 'unknown'} model`);
        }

        const [camerasData, alertsData, sysStats, weekStats, hourStats, znStats, hmStats] = await Promise.all([
          AppAPI.getCameras(),
          AppAPI.getAlerts(),
          AppAPI.getSystemStats(),
          AppAPI.getWeeklyStats(),
          AppAPI.getHourlyStats(),
          AppAPI.getZoneStats(),
          AppAPI.getHeatmapStats()
        ]);

        // Transform backend camera data to frontend CameraFeed interface
        setCameras(() => {
          return camerasData.map(apiCam => {
             return {
               id: apiCam.id,
               name: apiCam.name,
               status: apiCam.status,
               pedestrianCount: apiCam.pedestrian_count,
               location: apiCam.location,
               resolution: apiCam.resolution,
               fps: apiCam.fps,
               lastDetection: "Just now"
             };
          });
        });

        // Transform alerts
        setAlerts(() => {
           const newAlerts = alertsData.alerts.map((a: any) => ({
             id: a.id,
             type: a.type,
             severity: a.severity,
             message: a.message,
             camera: a.camera,
             timestamp: a.timestamp,
             acknowledged: a.acknowledged
           }));
           return newAlerts;
        });

        // Update Stats
        setStats(prev => ({
            ...prev,
            totalDetections: sysStats.total_detections_today,
            avgConfidence: sysStats.avg_confidence,
            processingLatency: sysStats.processing_latency_ms,
            gpuUtilization: sysStats.gpu_utilization,
            trackingAccuracy: sysStats.tracking_accuracy,
            falsePositiveRate: sysStats.false_positive_rate
        }));

        setWeeklyStats(weekStats);
        setHourlyStats(hourStats);
        setZoneStats(znStats);
        setHeatmapStats(hmStats);
        
        // Update status message with live GPU info
        setStatusMessage(`Processing ${sysStats.gpu_utilization}% GPU load`);
        setSystemHealth("online");
      } catch (err) {
        console.warn("API data fetch failed", err);
        failCount++;
        if (failCount >= FAIL_THRESHOLD) {
          setSystemHealth("offline");
          const errMsg = (err as any)?.message || "Unknown error";
          if (errMsg.includes("timeout")) {
            setStatusMessage("Server response timed out");
          } else if (errMsg.includes("Network Error")) {
            setStatusMessage("Network connection lost");
          } else {
            setStatusMessage(`Connection error: ${errMsg}`);
          }
        }
        
        // Fallback simulation (keep existing logic)
        setCameras((prev) =>
          prev.map((cam) => ({
            ...cam,
            pedestrianCount: Math.max(0, cam.pedestrianCount + (Math.random() > 0.5 ? 1 : -1) * Math.floor(Math.random() * 5)),
            status: Math.random() > 0.98 ? (Math.random() > 0.5 ? "maintenance" : "offline") : "online",
          }))
        );
      }
    };

    const interval = setInterval(fetchData, 3000); // Slightly slower polling to give model time to load
    fetchData(); // Initial fetch

    return () => clearInterval(interval);
  }, [isLive]);

  const markAllAlertsRead = async () => {
    try {
      // Optimistic update
      setAlerts(prev => prev.map(a => ({ ...a, acknowledged: true })));
      
      if (isLive) {
        await AppAPI.acknowledgeAllAlerts();
      }
    } catch (err) {
      console.error("Failed to mark all read", err);
      // Revert if needed, but for now we rely on next poll to fix it if failed
    }
  };

  return (
    <AppContext.Provider
      value={{
        cameras,
        alerts,
        stats,
        recentDetections,
        isLive,
        setIsLive,
        systemHealth,
        statusMessage,
        weeklyStats,
        hourlyStats,
        zoneStats,
        heatmapStats,
        markAllAlertsRead
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error("useApp must be used within an AppProvider");
  }
  return context;
};
