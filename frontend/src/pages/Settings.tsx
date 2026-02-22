import { useState, useEffect } from "react";
import {
  Settings as SettingsIcon,
  Cpu,
  Gauge,
  Bell,
  Monitor,
  Save,
  RotateCcw,
  Shield,
  Database,
  Wifi,
  HardDrive,
} from "lucide-react";
import { cn } from "../utils/cn";
import { AppAPI } from "../services/api";

interface SettingsState {
  model: string;
  confidenceThreshold: number;
  nmsThreshold: number;
  inputResolution: string;
  device: string;
  maxFps: number;
  enableTracking: boolean;
  trackMaxAge: number;
  trackMinHits: number;
  enableCrowdAlert: boolean;
  crowdThreshold: number;
  enableLoiteringAlert: boolean;
  loiteringDuration: number;
  enableFallenAlert: boolean;
  enableIntrusionAlert: boolean;
  alertSound: boolean;
  alertEmail: boolean;
  retentionDays: number;
  enableHeatmap: boolean;
  enableAnalytics: boolean;
  darkMode: boolean;
  autoReconnect: boolean;
}

export function Settings() {
  const [settings, setSettings] = useState<SettingsState>({
    model: "yolov8s",
    confidenceThreshold: 0.65,
    nmsThreshold: 0.45,
    inputResolution: "640",
    device: "cuda:0",
    maxFps: 30,
    enableTracking: true,
    trackMaxAge: 70,
    trackMinHits: 3,
    enableCrowdAlert: true,
    crowdThreshold: 50,
    enableLoiteringAlert: true,
    loiteringDuration: 300,
    enableFallenAlert: true,
    enableIntrusionAlert: true,
    alertSound: true,
    alertEmail: false,
    retentionDays: 30,
    enableHeatmap: true,
    enableAnalytics: true,
    darkMode: true,
    autoReconnect: true,
  });

  // Load settings from backend on mount
  useEffect(() => {
    const loadSettings = async () => {
      try {
        const backendSettings = await AppAPI.getSettings();
        if (backendSettings) {
          setSettings(prev => ({
            ...prev,
            model: backendSettings.model_variant || prev.model,
            confidenceThreshold: backendSettings.confidence_threshold ?? prev.confidenceThreshold,
            nmsThreshold: backendSettings.nms_iou_threshold ?? prev.nmsThreshold
          }));
        }
      } catch (err) {
        console.error("Failed to load settings from backend", err);
      }
    };
    loadSettings();
  }, []);

  const [saved, setSaved] = useState(false);

  const updateSetting = <K extends keyof SettingsState>(key: K, value: SettingsState[K]) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
    setSaved(false);
  };

  const handleSave = async () => {
    try {
      await AppAPI.updateSettings(settings);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (err) {
      console.error("Failed to save settings", err);
      // Optional: show error toast
    }
  };

  const handleReset = () => {
    setSettings({
      model: "yolov8s",
      confidenceThreshold: 0.65,
      nmsThreshold: 0.45,
      inputResolution: "640",
      device: "cuda:0",
      maxFps: 30,
      enableTracking: true,
      trackMaxAge: 70,
      trackMinHits: 3,
      enableCrowdAlert: true,
      crowdThreshold: 50,
      enableLoiteringAlert: true,
      loiteringDuration: 300,
      enableFallenAlert: true,
      enableIntrusionAlert: true,
      alertSound: true,
      alertEmail: false,
      retentionDays: 30,
      enableHeatmap: true,
      enableAnalytics: true,
      darkMode: true,
      autoReconnect: true,
    });
  };

  const Toggle = ({ value, onChange }: { value: boolean; onChange: (v: boolean) => void }) => (
    <button
      onClick={() => onChange(!value)}
      className={cn(
        "w-10 h-5 rounded-full transition-colors relative",
        value ? "bg-cyan-500" : "bg-slate-600"
      )}
    >
      <div
        className={cn(
          "absolute top-0.5 w-4 h-4 rounded-full bg-white transition-transform shadow-sm",
          value ? "translate-x-5" : "translate-x-0.5"
        )}
      />
    </button>
  );

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">System Settings</h1>
          <p className="text-slate-400 text-sm mt-1">Configure detection, tracking, and alert parameters</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleReset}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-800 text-slate-300 border border-slate-700 hover:bg-slate-700 transition-colors"
          >
            <RotateCcw className="h-3.5 w-3.5" /> Reset Defaults
          </button>
          <button
            onClick={handleSave}
            className={cn(
              "flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-xs font-medium transition-colors",
              saved
                ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                : "bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 hover:bg-cyan-500/30"
            )}
          >
            <Save className="h-3.5 w-3.5" /> {saved ? "Saved!" : "Save Settings"}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Detection Settings */}
        <div className="rounded-xl bg-slate-900 border border-slate-800 p-5">
          <h3 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
            <Cpu className="h-4 w-4 text-cyan-400" /> Detection Model
          </h3>
          <div className="space-y-4">
            <div>
              <label className="text-xs text-slate-400 block mb-1.5">Model Variant</label>
              <select
                value={settings.model}
                onChange={(e) => updateSetting("model", e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-sm text-white focus:outline-none focus:border-cyan-500"
              >
                <option value="yolov8n">YOLOv8-Nano (Fastest)</option>
                <option value="yolov8s">YOLOv8-Small (Balanced)</option>
                <option value="yolov8m">YOLOv8-Medium (Accurate)</option>
                <option value="yolov8l">YOLOv8-Large (High Accuracy)</option>
                <option value="yolov8x">YOLOv8-Extra (Max Accuracy)</option>
              </select>
            </div>
            <div>
              <label className="text-xs text-slate-400 block mb-1.5">
                Confidence Threshold: <span className="text-cyan-400 font-bold">{(settings.confidenceThreshold * 100).toFixed(0)}%</span>
              </label>
              <input
                type="range"
                min="0.1"
                max="0.99"
                step="0.01"
                value={settings.confidenceThreshold}
                onChange={(e) => updateSetting("confidenceThreshold", parseFloat(e.target.value))}
                className="w-full accent-cyan-500"
              />
            </div>
            <div>
              <label className="text-xs text-slate-400 block mb-1.5">
                NMS IoU Threshold: <span className="text-cyan-400 font-bold">{(settings.nmsThreshold * 100).toFixed(0)}%</span>
              </label>
              <input
                type="range"
                min="0.1"
                max="0.9"
                step="0.05"
                value={settings.nmsThreshold}
                onChange={(e) => updateSetting("nmsThreshold", parseFloat(e.target.value))}
                className="w-full accent-cyan-500"
              />
            </div>
            <div>
              <label className="text-xs text-slate-400 block mb-1.5">Input Resolution</label>
              <select
                value={settings.inputResolution}
                onChange={(e) => updateSetting("inputResolution", e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-sm text-white focus:outline-none focus:border-cyan-500"
              >
                <option value="320">320×320 (Fast)</option>
                <option value="640">640×640 (Standard)</option>
                <option value="1280">1280×1280 (High-Res)</option>
              </select>
            </div>
            <div>
              <label className="text-xs text-slate-400 block mb-1.5">Compute Device</label>
              <select
                value={settings.device}
                onChange={(e) => updateSetting("device", e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-sm text-white focus:outline-none focus:border-cyan-500"
              >
                <option value="cuda:0">GPU 0 (CUDA)</option>
                <option value="cuda:1">GPU 1 (CUDA)</option>
                <option value="cpu">CPU Only</option>
              </select>
            </div>
          </div>
        </div>

        {/* Tracking Settings */}
        <div className="rounded-xl bg-slate-900 border border-slate-800 p-5">
          <h3 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
            <Gauge className="h-4 w-4 text-violet-400" /> Tracking (DeepSORT)
          </h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-300">Enable Tracking</span>
              <Toggle value={settings.enableTracking} onChange={(v) => updateSetting("enableTracking", v)} />
            </div>
            <div>
              <label className="text-xs text-slate-400 block mb-1.5">
                Track Max Age: <span className="text-violet-400 font-bold">{settings.trackMaxAge} frames</span>
              </label>
              <input
                type="range"
                min="10"
                max="150"
                step="5"
                value={settings.trackMaxAge}
                onChange={(e) => updateSetting("trackMaxAge", parseInt(e.target.value))}
                className="w-full accent-violet-500"
              />
            </div>
            <div>
              <label className="text-xs text-slate-400 block mb-1.5">
                Min Hits to Confirm: <span className="text-violet-400 font-bold">{settings.trackMinHits}</span>
              </label>
              <input
                type="range"
                min="1"
                max="10"
                step="1"
                value={settings.trackMinHits}
                onChange={(e) => updateSetting("trackMinHits", parseInt(e.target.value))}
                className="w-full accent-violet-500"
              />
            </div>
            <div>
              <label className="text-xs text-slate-400 block mb-1.5">
                Max FPS: <span className="text-violet-400 font-bold">{settings.maxFps}</span>
              </label>
              <input
                type="range"
                min="5"
                max="60"
                step="5"
                value={settings.maxFps}
                onChange={(e) => updateSetting("maxFps", parseInt(e.target.value))}
                className="w-full accent-violet-500"
              />
            </div>
          </div>
        </div>

        {/* Alert Settings */}
        <div className="rounded-xl bg-slate-900 border border-slate-800 p-5">
          <h3 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
            <Bell className="h-4 w-4 text-amber-400" /> Alert Configuration
          </h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-300">Crowd Detection Alerts</span>
              <Toggle value={settings.enableCrowdAlert} onChange={(v) => updateSetting("enableCrowdAlert", v)} />
            </div>
            {settings.enableCrowdAlert && (
              <div>
                <label className="text-xs text-slate-400 block mb-1.5">
                  Crowd Threshold: <span className="text-amber-400 font-bold">{settings.crowdThreshold} people</span>
                </label>
                <input
                  type="range"
                  min="5"
                  max="200"
                  step="5"
                  value={settings.crowdThreshold}
                  onChange={(e) => updateSetting("crowdThreshold", parseInt(e.target.value))}
                  className="w-full accent-amber-500"
                />
              </div>
            )}
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-300">Loitering Detection</span>
              <Toggle value={settings.enableLoiteringAlert} onChange={(v) => updateSetting("enableLoiteringAlert", v)} />
            </div>
            {settings.enableLoiteringAlert && (
              <div>
                <label className="text-xs text-slate-400 block mb-1.5">
                  Loitering Duration: <span className="text-amber-400 font-bold">{settings.loiteringDuration}s</span>
                </label>
                <input
                  type="range"
                  min="30"
                  max="600"
                  step="30"
                  value={settings.loiteringDuration}
                  onChange={(e) => updateSetting("loiteringDuration", parseInt(e.target.value))}
                  className="w-full accent-amber-500"
                />
              </div>
            )}
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-300">Fallen Pedestrian Alert</span>
              <Toggle value={settings.enableFallenAlert} onChange={(v) => updateSetting("enableFallenAlert", v)} />
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-300">Intrusion Detection</span>
              <Toggle value={settings.enableIntrusionAlert} onChange={(v) => updateSetting("enableIntrusionAlert", v)} />
            </div>
            <div className="h-px bg-slate-800" />
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-300">Alert Sound</span>
              <Toggle value={settings.alertSound} onChange={(v) => updateSetting("alertSound", v)} />
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-300">Email Notifications</span>
              <Toggle value={settings.alertEmail} onChange={(v) => updateSetting("alertEmail", v)} />
            </div>
          </div>
        </div>

        {/* System Settings */}
        <div className="rounded-xl bg-slate-900 border border-slate-800 p-5">
          <h3 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
            <SettingsIcon className="h-4 w-4 text-emerald-400" /> System
          </h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-300">Enable Heatmap Generation</span>
              <Toggle value={settings.enableHeatmap} onChange={(v) => updateSetting("enableHeatmap", v)} />
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-300">Analytics Collection</span>
              <Toggle value={settings.enableAnalytics} onChange={(v) => updateSetting("enableAnalytics", v)} />
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-300">Auto-Reconnect Cameras</span>
              <Toggle value={settings.autoReconnect} onChange={(v) => updateSetting("autoReconnect", v)} />
            </div>
            <div>
              <label className="text-xs text-slate-400 block mb-1.5">
                Data Retention: <span className="text-emerald-400 font-bold">{settings.retentionDays} days</span>
              </label>
              <input
                type="range"
                min="7"
                max="365"
                step="7"
                value={settings.retentionDays}
                onChange={(e) => updateSetting("retentionDays", parseInt(e.target.value))}
                className="w-full accent-emerald-500"
              />
            </div>
          </div>
        </div>
      </div>

      {/* System Info */}
      <div className="rounded-xl bg-slate-900 border border-slate-800 p-5">
        <h3 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
          <Monitor className="h-4 w-4 text-cyan-400" /> System Information
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: "GPU", value: "NVIDIA RTX 3070", detail: "8GB VRAM", icon: Cpu, color: "text-cyan-400" },
            { label: "Database", value: "PostgreSQL 15", detail: "2.4 GB used", icon: Database, color: "text-violet-400" },
            { label: "Storage", value: "142 GB free", detail: "of 500 GB", icon: HardDrive, color: "text-emerald-400" },
            { label: "Network", value: "Connected", detail: "1 Gbps", icon: Wifi, color: "text-amber-400" },
          ].map((info) => {
            const Icon = info.icon;
            return (
              <div key={info.label} className="rounded-lg bg-slate-800/50 border border-slate-700/50 p-3">
                <div className="flex items-center gap-2 mb-2">
                  <Icon className={cn("h-4 w-4", info.color)} />
                  <span className="text-xs text-slate-400">{info.label}</span>
                </div>
                <p className="text-sm font-bold text-white">{info.value}</p>
                <p className="text-[10px] text-slate-500 mt-0.5">{info.detail}</p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Version Info */}
      <div className="flex items-center justify-between px-4 py-3 rounded-xl bg-slate-900/50 border border-slate-800">
        <div className="flex items-center gap-4 text-xs text-slate-500">
          <span className="flex items-center gap-1.5">
            <Shield className="h-3.5 w-3.5" /> PedTrack AI v1.2.2
          </span>
          <span>Build 2026.02.17</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="h-2 w-2 rounded-full bg-emerald-400" />
          <span className="text-xs text-emerald-400">All systems operational</span>
        </div>
      </div>
    </div>
  );
}
