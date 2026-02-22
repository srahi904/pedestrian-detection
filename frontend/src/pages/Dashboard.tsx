import {
  Users,
  Camera,
  AlertTriangle,
  Activity,
  Eye,
  Shield,
  Zap,
  ArrowUpRight,
  ArrowDownRight,
  Clock,
} from "lucide-react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
} from "recharts";
import type { Page } from "../App";
import { cn } from "../utils/cn";
import { useApp } from "../context/AppContext";

interface DashboardProps {
  onNavigate: (page: Page) => void;
}

export function Dashboard({ onNavigate }: DashboardProps) {
  const { cameras, alerts, stats, weeklyStats, hourlyStats, isLive } = useApp();
  
  const onlineCameras = cameras.filter((c) => c.status === "online").length;
  const totalPedestrians = cameras.reduce((sum, c) => sum + c.pedestrianCount, 0);
  const unacknowledgedAlerts = alerts.filter((a) => !a.acknowledged).length;

  const statCards = [
    {
      label: "Active Pedestrians",
      value: totalPedestrians.toString(),
      change: "+12%",
      trend: "up" as const,
      icon: Users,
      color: "from-cyan-500 to-blue-500",
      shadow: "shadow-cyan-500/20",
    },
    {
      label: "Cameras Online",
      value: `${onlineCameras}/${cameras.length}`,
      change: "98% uptime",
      trend: "up" as const,
      icon: Camera,
      color: "from-emerald-500 to-green-500",
      shadow: "shadow-emerald-500/20",
    },
    {
      label: "Active Alerts",
      value: unacknowledgedAlerts.toString(),
      change: "-3 from yesterday",
      trend: "down" as const,
      icon: AlertTriangle,
      color: "from-amber-500 to-orange-500",
      shadow: "shadow-amber-500/20",
    },
    {
      label: "Detection Rate",
      value: `${(stats.avgConfidence * 100).toFixed(1)}%`,
      change: "+0.5%",
      trend: "up" as const,
      icon: Activity,
      color: "from-violet-500 to-purple-500",
      shadow: "shadow-violet-500/20",
    },
  ];

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Surveillance Dashboard</h1>
          <p className="text-slate-400 text-sm mt-1">
            Real-time pedestrian detection & tracking overview
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className={cn(
            "flex items-center gap-2 px-3 py-1.5 rounded-lg border transition-colors",
            isLive 
              ? "bg-emerald-500/10 border-emerald-500/20" 
              : "bg-slate-800 border-slate-700"
          )}>
            <div className={cn(
              "h-2 w-2 rounded-full", 
              isLive ? "bg-emerald-400 animate-pulse" : "bg-slate-500"
            )} />
            <span className={cn(
              "text-xs font-medium",
              isLive ? "text-emerald-400" : "text-slate-400"
            )}>
              {isLive ? "System Live" : "System Offline"}
            </span>
          </div>
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-800 border border-slate-700">
            <Clock className="h-3.5 w-3.5 text-slate-400" />
            <span className="text-xs text-slate-400">
              {new Date().toLocaleString()}
            </span>
          </div>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((stat) => {
          const Icon = stat.icon;
          return (
            <div
              key={stat.label}
              className="relative overflow-hidden rounded-xl bg-slate-900 border border-slate-800 p-5 hover:border-slate-700 transition-colors"
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs text-slate-400 uppercase tracking-wider">{stat.label}</p>
                  <p className="text-3xl font-bold text-white mt-2">{stat.value}</p>
                  <div className="flex items-center gap-1 mt-2">
                    {stat.trend === "up" ? (
                      <ArrowUpRight className="h-3.5 w-3.5 text-emerald-400" />
                    ) : (
                      <ArrowDownRight className="h-3.5 w-3.5 text-emerald-400" />
                    )}
                    <span className="text-xs text-emerald-400">{stat.change}</span>
                  </div>
                </div>
                <div
                  className={cn(
                    "h-12 w-12 rounded-xl flex items-center justify-center bg-gradient-to-br shadow-lg",
                    stat.color,
                    stat.shadow
                  )}
                >
                  <Icon className="h-6 w-6 text-white" />
                </div>
              </div>
              <div className={cn("absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r", stat.color)} />
            </div>
          );
        })}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Hourly Traffic Chart */}
        <div className="lg:col-span-2 rounded-xl bg-slate-900 border border-slate-800 p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-semibold text-white">Pedestrian Traffic Today</h3>
              <p className="text-xs text-slate-400 mt-0.5">Hourly detection count across all cameras</p>
            </div>
            <div className="flex items-center gap-2">
              <span className="flex items-center gap-1.5 text-xs text-cyan-400">
                <div className="h-2 w-2 rounded-full bg-cyan-400" /> Detections
              </span>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={280}>
            <AreaChart data={hourlyStats}>
              <defs>
                <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#06b6d4" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis dataKey="hour" stroke="#64748b" fontSize={11} />
              <YAxis stroke="#64748b" fontSize={11} />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#0f172a",
                  border: "1px solid #1e293b",
                  borderRadius: "8px",
                  fontSize: "12px",
                }}
                labelStyle={{ color: "#94a3b8" }}
              />
              <Area
                type="monotone"
                dataKey="count"
                stroke="#06b6d4"
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#colorCount)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Weekly Summary */}
        <div className="rounded-xl bg-slate-900 border border-slate-800 p-5">
          <div className="mb-4">
            <h3 className="text-sm font-semibold text-white">Weekly Overview</h3>
            <p className="text-xs text-slate-400 mt-0.5">Pedestrians per day this week</p>
          </div>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={weeklyStats}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis dataKey="day" stroke="#64748b" fontSize={11} />
              <YAxis stroke="#64748b" fontSize={11} />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#0f172a",
                  border: "1px solid #1e293b",
                  borderRadius: "8px",
                  fontSize: "12px",
                }}
              />
              <Bar dataKey="pedestrians" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Bottom Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Camera Status */}
        <div className="lg:col-span-2 rounded-xl bg-slate-900 border border-slate-800 p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-white">Camera Status</h3>
            <button
              onClick={() => onNavigate("live")}
              className="text-xs text-cyan-400 hover:text-cyan-300 flex items-center gap-1"
            >
              View All <ArrowUpRight className="h-3 w-3" />
            </button>
          </div>
          <div className="space-y-2">
            {cameras.slice(0, 6).map((cam) => (
              <div
                key={cam.id}
                className="flex items-center justify-between p-3 rounded-lg bg-slate-800/50 hover:bg-slate-800 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div
                    className={cn(
                      "h-2.5 w-2.5 rounded-full",
                      cam.status === "online"
                        ? "bg-emerald-400"
                        : cam.status === "maintenance"
                        ? "bg-amber-400"
                        : "bg-red-400"
                    )}
                  />
                  <div>
                    <p className="text-sm font-medium text-white">{cam.name}</p>
                    <p className="text-xs text-slate-400">{cam.location}</p>
                  </div>
                </div>
                <div className="flex items-center gap-6">
                  <div className="text-right">
                    <p className="text-sm font-semibold text-white">{cam.pedestrianCount}</p>
                    <p className="text-[10px] text-slate-500">people</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-slate-400">{cam.fps} FPS</p>
                    <p className="text-[10px] text-slate-500">{cam.resolution}</p>
                  </div>
                  <span
                    className={cn(
                      "text-[10px] px-2 py-1 rounded-full font-medium uppercase",
                      cam.status === "online"
                        ? "bg-emerald-400/10 text-emerald-400"
                        : cam.status === "maintenance"
                        ? "bg-amber-400/10 text-amber-400"
                        : "bg-red-400/10 text-red-400"
                    )}
                  >
                    {cam.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Alerts */}
        <div className="rounded-xl bg-slate-900 border border-slate-800 p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-white">Recent Alerts</h3>
            <button
              onClick={() => onNavigate("alerts")}
              className="text-xs text-cyan-400 hover:text-cyan-300 flex items-center gap-1"
            >
              View All <ArrowUpRight className="h-3 w-3" />
            </button>
          </div>
          <div className="space-y-2">
            {alerts.slice(0, 5).map((alert) => (
              <div
                key={alert.id}
                className={cn(
                  "p-3 rounded-lg border transition-colors",
                  alert.severity === "critical"
                    ? "bg-red-500/5 border-red-500/20"
                    : alert.severity === "high"
                    ? "bg-orange-500/5 border-orange-500/20"
                    : alert.severity === "medium"
                    ? "bg-amber-500/5 border-amber-500/20"
                    : "bg-slate-800/50 border-slate-700/50"
                )}
              >
                <div className="flex items-start gap-2">
                  <AlertTriangle
                    className={cn(
                      "h-3.5 w-3.5 mt-0.5 shrink-0",
                      alert.severity === "critical"
                        ? "text-red-400"
                        : alert.severity === "high"
                        ? "text-orange-400"
                        : alert.severity === "medium"
                        ? "text-amber-400"
                        : "text-slate-400"
                    )}
                  />
                  <div className="min-w-0">
                    <p className="text-xs text-white font-medium truncate">{alert.message}</p>
                    <p className="text-[10px] text-slate-500 mt-1">{alert.timestamp}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Performance Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Processing Latency", value: `${stats.processingLatency}ms`, icon: Zap, color: "text-cyan-400" },
          { label: "GPU Utilization", value: `${stats.gpuUtilization}%`, icon: Activity, color: "text-violet-400" },
          { label: "Tracking Accuracy", value: `${(stats.trackingAccuracy * 100).toFixed(1)}%`, icon: Eye, color: "text-emerald-400" },
          { label: "False Positive Rate", value: `${(stats.falsePositiveRate * 100).toFixed(1)}%`, icon: Shield, color: "text-amber-400" },
        ].map((metric) => {
          const Icon = metric.icon;
          return (
            <div key={metric.label} className="rounded-xl bg-slate-900 border border-slate-800 p-4 flex items-center gap-3">
              <Icon className={cn("h-5 w-5", metric.color)} />
              <div>
                <p className="text-lg font-bold text-white">{metric.value}</p>
                <p className="text-[10px] text-slate-400 uppercase tracking-wider">{metric.label}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
