import {
  BarChart3,
  TrendingUp,
  Users,
  Clock,
  MapPin,
  Activity,
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
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
} from "recharts";
import { cn } from "../utils/cn";
import { useApp } from "../context/AppContext";

const COLORS = ["#06b6d4", "#8b5cf6", "#10b981", "#f59e0b", "#ef4444", "#ec4899", "#6366f1", "#14b8a6"];
const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

export function Analytics() {
  const { weeklyStats, hourlyStats, stats, zoneStats, heatmapStats } = useApp();

  const zoneChartData = zoneStats.map((z) => ({
    name: z.zone,
    current: z.current,
    capacity: z.max,
    utilization: Math.round((z.current / z.max) * 100),
  }));

  const pieData = zoneStats.map((z) => ({
    name: z.zone,
    value: z.current,
  })).filter((d) => d.value > 0);

  const dwellData = zoneStats.map((z) => ({
    zone: z.zone.length > 10 ? z.zone.slice(0, 10) + "…" : z.zone,
    dwell: z.avgDwell,
    fullZone: z.zone,
  }));

  const radarData = [
    { metric: "Detection Rate", value: (stats.avgConfidence * 100) },
    { metric: "Tracking", value: (stats.trackingAccuracy * 100) },
    { metric: "Speed", value: 85 },
    { metric: "Accuracy", value: 94 },
    { metric: "Coverage", value: 78 },
    { metric: "Uptime", value: 98 },
  ];

  // Heatmap rendering
  const renderHeatmap = () => {
    const hours = Array.from({ length: 24 }, (_, i) => i);
    return (
      <div className="overflow-x-auto">
        <div className="min-w-[500px]">
          <div className="flex gap-0.5 mb-1 ml-12">
            {DAYS.map((d) => (
              <div key={d} className="flex-1 text-center text-[10px] text-slate-500">{d}</div>
            ))}
          </div>
          {hours.map((hour) => (
            <div key={hour} className="flex gap-0.5 items-center mb-0.5">
              <div className="w-10 text-right text-[10px] text-slate-500 pr-2">
                {hour.toString().padStart(2, "0")}:00
              </div>
              {DAYS.map((_, dayIdx) => {
                const point = heatmapStats.find((d) => d.hour === hour && d.day === dayIdx);
                const val = point?.value ?? 0;
                const intensity = Math.min(val / 80, 1);
                return (
                  <div
                    key={dayIdx}
                    className="flex-1 h-4 rounded-sm"
                    style={{
                      backgroundColor:
                        intensity === 0
                          ? "#0f172a"
                          : `rgba(6, 182, 212, ${0.1 + intensity * 0.8})`,
                    }}
                    title={`${DAYS[dayIdx]} ${hour}:00 - ${val} pedestrians`}
                  />
                );
              })}
            </div>
          ))}
          <div className="flex items-center justify-end mt-2 gap-2">
            <span className="text-[10px] text-slate-500">Low</span>
            <div className="flex gap-0.5">
              {[0.1, 0.25, 0.4, 0.55, 0.7, 0.85, 1].map((v) => (
                <div
                  key={v}
                  className="w-4 h-3 rounded-sm"
                  style={{ backgroundColor: `rgba(6, 182, 212, ${v})` }}
                />
              ))}
            </div>
            <span className="text-[10px] text-slate-500">High</span>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white">Analytics & Insights</h1>
        <p className="text-slate-400 text-sm mt-1">
          Comprehensive pedestrian traffic analytics and zone analysis
        </p>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Avg Daily Traffic", value: (stats.totalDetections / 7).toFixed(0), icon: Users, color: "text-cyan-400", change: "+8.3%" },
          { label: "Peak Hour", value: "18:00", icon: Clock, color: "text-violet-400", change: "312 people" },
          { label: "Busiest Zone", value: "Cafeteria", icon: MapPin, color: "text-emerald-400", change: "67 current" },
          { label: "Avg Dwell Time", value: "4.9 min", icon: Activity, color: "text-amber-400", change: "+1.2 min" },
        ].map((s) => {
          const Icon = s.icon;
          return (
            <div key={s.label} className="rounded-xl bg-slate-900 border border-slate-800 p-4">
              <div className="flex items-center gap-2 mb-2">
                <Icon className={cn("h-4 w-4", s.color)} />
                <span className="text-xs text-slate-400">{s.label}</span>
              </div>
              <p className="text-xl font-bold text-white">{s.value}</p>
              <p className="text-[10px] text-emerald-400 mt-1">{s.change}</p>
            </div>
          );
        })}
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Traffic Over Time */}
        <div className="rounded-xl bg-slate-900 border border-slate-800 p-5">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="h-4 w-4 text-cyan-400" />
            <h3 className="text-sm font-semibold text-white">Hourly Traffic Pattern</h3>
          </div>
          <ResponsiveContainer width="100%" height={280}>
            <AreaChart data={hourlyStats}>
              <defs>
                <linearGradient id="grad1" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#06b6d4" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis dataKey="hour" stroke="#64748b" fontSize={10} />
              <YAxis stroke="#64748b" fontSize={10} />
              <Tooltip contentStyle={{ backgroundColor: "#0f172a", border: "1px solid #1e293b", borderRadius: "8px", fontSize: "11px" }} />
              <Area type="monotone" dataKey="count" stroke="#06b6d4" strokeWidth={2} fillOpacity={1} fill="url(#grad1)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Zone Occupancy */}
        <div className="rounded-xl bg-slate-900 border border-slate-800 p-5">
          <div className="flex items-center gap-2 mb-4">
            <BarChart3 className="h-4 w-4 text-violet-400" />
            <h3 className="text-sm font-semibold text-white">Zone Occupancy vs Capacity</h3>
          </div>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={zoneChartData} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis type="number" stroke="#64748b" fontSize={10} />
              <YAxis dataKey="name" type="category" stroke="#64748b" fontSize={9} width={90} />
              <Tooltip contentStyle={{ backgroundColor: "#0f172a", border: "1px solid #1e293b", borderRadius: "8px", fontSize: "11px" }} />
              <Bar dataKey="current" fill="#06b6d4" radius={[0, 4, 4, 0]} />
              <Bar dataKey="capacity" fill="#1e293b" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Weekly Comparison */}
        <div className="rounded-xl bg-slate-900 border border-slate-800 p-5">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="h-4 w-4 text-emerald-400" />
            <h3 className="text-sm font-semibold text-white">Weekly Comparison</h3>
          </div>
          <ResponsiveContainer width="100%" height={280}>
            <LineChart data={weeklyStats}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis dataKey="day" stroke="#64748b" fontSize={10} />
              <YAxis stroke="#64748b" fontSize={10} />
              <Tooltip contentStyle={{ backgroundColor: "#0f172a", border: "1px solid #1e293b", borderRadius: "8px", fontSize: "11px" }} />
              <Line type="monotone" dataKey="pedestrians" stroke="#10b981" strokeWidth={2} dot={{ r: 4, fill: "#10b981" }} />
              <Line type="monotone" dataKey="alerts" stroke="#ef4444" strokeWidth={2} dot={{ r: 4, fill: "#ef4444" }} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Distribution Pie */}
        <div className="rounded-xl bg-slate-900 border border-slate-800 p-5">
          <div className="flex items-center gap-2 mb-4">
            <MapPin className="h-4 w-4 text-amber-400" />
            <h3 className="text-sm font-semibold text-white">Zone Distribution</h3>
          </div>
          <ResponsiveContainer width="100%" height={280}>
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={100}
                paddingAngle={3}
                dataKey="value"
                label={({ name, percent }) => `${name} ${((percent ?? 0) * 100).toFixed(0)}%`}
              >
                {pieData.map((_, idx) => (
                  <Cell key={idx} fill={COLORS[idx % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip contentStyle={{ backgroundColor: "#0f172a", border: "1px solid #1e293b", borderRadius: "8px", fontSize: "11px" }} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Bottom Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Heatmap */}
        <div className="lg:col-span-2 rounded-xl bg-slate-900 border border-slate-800 p-5">
          <div className="flex items-center gap-2 mb-4">
            <Activity className="h-4 w-4 text-cyan-400" />
            <h3 className="text-sm font-semibold text-white">Weekly Activity Heatmap</h3>
          </div>
          {renderHeatmap()}
        </div>

        {/* Performance Radar */}
        <div className="rounded-xl bg-slate-900 border border-slate-800 p-5">
          <div className="flex items-center gap-2 mb-4">
            <Activity className="h-4 w-4 text-violet-400" />
            <h3 className="text-sm font-semibold text-white">System Performance</h3>
          </div>
          <ResponsiveContainer width="100%" height={260}>
            <RadarChart data={radarData}>
              <PolarGrid stroke="#1e293b" />
              <PolarAngleAxis dataKey="metric" stroke="#64748b" fontSize={10} />
              <PolarRadiusAxis stroke="#1e293b" fontSize={8} />
              <Radar dataKey="value" stroke="#8b5cf6" fill="#8b5cf6" fillOpacity={0.2} strokeWidth={2} />
            </RadarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Dwell Time Analysis */}
      <div className="rounded-xl bg-slate-900 border border-slate-800 p-5">
        <div className="flex items-center gap-2 mb-4">
          <Clock className="h-4 w-4 text-amber-400" />
          <h3 className="text-sm font-semibold text-white">Average Dwell Time by Zone (minutes)</h3>
        </div>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={dwellData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
            <XAxis dataKey="zone" stroke="#64748b" fontSize={10} />
            <YAxis stroke="#64748b" fontSize={10} />
            <Tooltip contentStyle={{ backgroundColor: "#0f172a", border: "1px solid #1e293b", borderRadius: "8px", fontSize: "11px" }} />
            <Bar dataKey="dwell" fill="#f59e0b" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
