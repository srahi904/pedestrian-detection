import { useState } from "react";
import {
  AlertTriangle,
  Bell,
  Check,
  Filter,
  Users,
  ShieldAlert,
  Timer,
  Skull,
  Eye,
  X,
} from "lucide-react";
import type { Alert } from "../data/mockData";
import { cn } from "../utils/cn";
import { useApp } from "../context/AppContext";

type SeverityFilter = "all" | "critical" | "high" | "medium" | "low";
type TypeFilter = "all" | "crowd" | "intrusion" | "loitering" | "anomaly" | "fallen";

const severityColors = {
  critical: { bg: "bg-red-500/10", border: "border-red-500/30", text: "text-red-400", dot: "bg-red-400" },
  high: { bg: "bg-orange-500/10", border: "border-orange-500/30", text: "text-orange-400", dot: "bg-orange-400" },
  medium: { bg: "bg-amber-500/10", border: "border-amber-500/30", text: "text-amber-400", dot: "bg-amber-400" },
  low: { bg: "bg-slate-500/10", border: "border-slate-500/30", text: "text-slate-400", dot: "bg-slate-400" },
};

const typeIcons: Record<Alert["type"], React.ElementType> = {
  crowd: Users,
  intrusion: ShieldAlert,
  loitering: Timer,
  anomaly: Eye,
  fallen: Skull,
};

export function AlertsPage() {
  const { alerts, markAllAlertsRead } = useApp();
  const [severityFilter, setSeverityFilter] = useState<SeverityFilter>("all");
  const [typeFilter, setTypeFilter] = useState<TypeFilter>("all");
  const [selectedAlert, setSelectedAlert] = useState<Alert | null>(null);
  
  // ... (filters logic)

  const filteredAlerts = alerts.filter((a) => {
    if (severityFilter !== "all" && a.severity !== severityFilter) return false;
    if (typeFilter !== "all" && a.type !== typeFilter) return false;
    return true;
  });

  const unacknowledgedCount = alerts.filter((a) => !a.acknowledged).length;
  const criticalCount = alerts.filter((a) => a.severity === "critical" && !a.acknowledged).length;

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Alert Management</h1>
          <p className="text-slate-400 text-sm mt-1">Monitor and manage detection alerts</p>
        </div>
        <div className="flex items-center gap-3">
          {criticalCount > 0 && (
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-red-500/10 border border-red-500/20 animate-pulse">
              <AlertTriangle className="h-3.5 w-3.5 text-red-400" />
              <span className="text-xs font-medium text-red-400">{criticalCount} Critical</span>
            </div>
          )}
          <button
            onClick={() => markAllAlertsRead && markAllAlertsRead()}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/30 transition-colors"
          >
            <Check className="h-3.5 w-3.5" /> Acknowledge All
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        {[
          { label: "Total Alerts", value: alerts.length, color: "text-white" },
          { label: "Unacknowledged", value: unacknowledgedCount, color: "text-amber-400" },
          { label: "Critical", value: alerts.filter((a) => a.severity === "critical").length, color: "text-red-400" },
          { label: "High", value: alerts.filter((a) => a.severity === "high").length, color: "text-orange-400" },
          { label: "Resolved", value: alerts.filter((a) => a.acknowledged).length, color: "text-emerald-400" },
        ].map((s) => (
          <div key={s.label} className="rounded-lg bg-slate-900 border border-slate-800 p-3 text-center">
            <p className={cn("text-2xl font-bold", s.color)}>{s.value}</p>
            <p className="text-[10px] text-slate-500 uppercase tracking-wider mt-1">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-1.5 text-xs text-slate-400">
          <Filter className="h-3.5 w-3.5" /> Severity:
        </div>
        <div className="flex gap-1">
          {(["all", "critical", "high", "medium", "low"] as const).map((s) => (
            <button
              key={s}
              onClick={() => setSeverityFilter(s)}
              className={cn(
                "px-2.5 py-1 rounded-lg text-xs font-medium capitalize transition-colors",
                severityFilter === s
                  ? "bg-cyan-500/20 text-cyan-400 border border-cyan-500/30"
                  : "bg-slate-800 text-slate-400 border border-slate-700 hover:bg-slate-700"
              )}
            >
              {s}
            </button>
          ))}
        </div>
        <div className="w-px h-5 bg-slate-700" />
        <div className="flex items-center gap-1.5 text-xs text-slate-400">Type:</div>
        <div className="flex gap-1 flex-wrap">
          {(["all", "crowd", "intrusion", "loitering", "anomaly", "fallen"] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTypeFilter(t)}
              className={cn(
                "px-2.5 py-1 rounded-lg text-xs font-medium capitalize transition-colors",
                typeFilter === t
                  ? "bg-violet-500/20 text-violet-400 border border-violet-500/30"
                  : "bg-slate-800 text-slate-400 border border-slate-700 hover:bg-slate-700"
              )}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      {/* Alert Detail Modal */}
      {selectedAlert && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm" onClick={() => setSelectedAlert(null)}>
          <div className="bg-slate-900 border border-slate-700 rounded-xl p-6 max-w-lg w-full mx-4" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-white">Alert Details</h3>
              <button onClick={() => setSelectedAlert(null)} className="p-1 rounded hover:bg-slate-800">
                <X className="h-4 w-4 text-slate-400" />
              </button>
            </div>
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <span className={cn("px-2 py-0.5 rounded text-xs font-bold uppercase", severityColors[selectedAlert.severity].bg, severityColors[selectedAlert.severity].text)}>
                  {selectedAlert.severity}
                </span>
                <span className="px-2 py-0.5 rounded text-xs font-medium capitalize bg-slate-800 text-slate-300">{selectedAlert.type}</span>
              </div>
              <p className="text-sm text-white">{selectedAlert.message}</p>
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="p-2 rounded bg-slate-800">
                  <span className="text-slate-500">Camera</span>
                  <p className="text-white font-medium mt-0.5">{selectedAlert.camera}</p>
                </div>
                <div className="p-2 rounded bg-slate-800">
                  <span className="text-slate-500">Timestamp</span>
                  <p className="text-white font-medium mt-0.5">{selectedAlert.timestamp}</p>
                </div>
                <div className="p-2 rounded bg-slate-800">
                  <span className="text-slate-500">Status</span>
                  <p className={cn("font-medium mt-0.5", selectedAlert.acknowledged ? "text-emerald-400" : "text-amber-400")}>
                    {selectedAlert.acknowledged ? "Acknowledged" : "Pending"}
                  </p>
                </div>
                <div className="p-2 rounded bg-slate-800">
                  <span className="text-slate-500">Alert ID</span>
                  <p className="text-white font-medium mt-0.5">{selectedAlert.id}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Alert List */}
      <div className="space-y-2">
        {filteredAlerts.length === 0 ? (
          <div className="text-center py-12 rounded-xl bg-slate-900 border border-slate-800">
            <Bell className="h-8 w-8 text-slate-600 mx-auto mb-2" />
            <p className="text-sm text-slate-400">No alerts match the current filters</p>
          </div>
        ) : (
          filteredAlerts.map((alert) => {
            const colors = severityColors[alert.severity];
            const TypeIcon = typeIcons[alert.type];
            return (
              <div
                key={alert.id}
                onClick={() => setSelectedAlert(alert)}
                className={cn(
                  "flex items-center justify-between p-4 rounded-xl border cursor-pointer transition-all hover:scale-[1.005]",
                  colors.bg,
                  colors.border,
                  alert.acknowledged && "opacity-60"
                )}
              >
                <div className="flex items-center gap-4">
                  <div className={cn("h-10 w-10 rounded-lg flex items-center justify-center", colors.bg)}>
                    <TypeIcon className={cn("h-5 w-5", colors.text)} />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className={cn("px-1.5 py-0.5 rounded text-[10px] font-bold uppercase", colors.bg, colors.text)}>
                        {alert.severity}
                      </span>
                      <span className="text-[10px] text-slate-500 capitalize">{alert.type}</span>
                      {!alert.acknowledged && (
                        <div className={cn("h-1.5 w-1.5 rounded-full animate-pulse", colors.dot)} />
                      )}
                    </div>
                    <p className="text-sm text-white font-medium">{alert.message}</p>
                    <p className="text-[10px] text-slate-500 mt-1">
                      {alert.camera} • {alert.timestamp}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {alert.acknowledged ? (
                    <span className="flex items-center gap-1 text-xs text-emerald-400">
                      <Check className="h-3.5 w-3.5" /> Resolved
                    </span>
                  ) : (
                    <span className="text-[10px] text-slate-400">Click to view</span>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
