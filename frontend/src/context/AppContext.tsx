import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
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
  const [recentDetections, setRecentDetections] = useState<Detection[]>([]);
  const [isLive, setIsLive] = useState(true);
  const [systemHealth, setSystemHealth] = useState<"online" | "offline" | "maintenance" | "loading_model">("online");
  const [weeklyStats, setWeeklyStats] = useState(weeklyData);
  const [hourlyStats, setHourlyStats] = useState(hourlyTraffic);
  const [zoneStats, setZoneStats] = useState<ZoneData[]>(zoneAnalytics);
  const [heatmapStats, setHeatmapStats] = useState(heatmapData);

  // Poll API for real-time updates
  useEffect(() => {
    if (!isLive) return;

    const fetchData = async () => {
      try {
        // Check health first to see if model is loading
        const health = await AppAPI.checkHealth();
        if (typeof health === 'object' && health.model_loading) {
            setSystemHealth("loading_model");
            // If loading, we might still want to fetch stale data or just return
            // For now, let's return to avoid timeouts on other endpoints if they depend on model lock
            return;
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
        setCameras(prev => {
          return camerasData.map(apiCam => {
             const existing = prev.find(p => p.id === apiCam.id);
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
        setAlerts(prev => {
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
        
        setSystemHealth("online");
      } catch (err) {
        console.warn("API connection failed, falling back to simulation", err);
        setSystemHealth("offline");
        
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

    const interval = setInterval(fetchData, 2000);
    // fetchData(); // Initial fetch - removed to avoid double call on mount with interval?
    // Actually typically good to keep initial fetch for immediate data
    fetchData();

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
