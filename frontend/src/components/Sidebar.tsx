import {
  LayoutDashboard,
  Video,
  ScanEye,
  BarChart3,
  Bell,
  FileText,
  Settings,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  Footprints,
  WifiOff,
  Hammer,
  ClipboardList
} from "lucide-react";
import type { Page } from "../App";
import { cn } from "../utils/cn";
import { useApp } from "../context/AppContext";

interface SidebarProps {
  currentPage: Page;
  onNavigate: (page: Page) => void;
  collapsed: boolean;
  onToggle: () => void;
}

export function Sidebar({ currentPage, onNavigate, collapsed, onToggle }: SidebarProps) {
  const { alerts, systemHealth, stats } = useApp();
  const unacknowledgedAlerts = alerts.filter(a => !a.acknowledged).length;

  const navItems = [
    { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
    { id: "live", label: "Live Monitor", icon: Video },
    { id: "detection", label: "Detection Engine", icon: ScanEye },
    { id: "analytics", label: "Analytics", icon: BarChart3 },
    { id: "alerts", label: "Alerts", icon: Bell, badge: unacknowledgedAlerts > 0 ? unacknowledgedAlerts : undefined },
    { id: "documentation", label: "Documentation", icon: FileText },
    { id: "logs", label: "System Logs", icon: ClipboardList },
    { id: "settings", label: "Settings", icon: Settings },
  ] as const;

  return (
    <div
      className={cn(
        "relative flex flex-col bg-slate-900 border-r border-slate-800 transition-all duration-300",
        collapsed ? "w-[72px]" : "w-[260px]"
      )}
    >
      {/* Logo */}
      <div className="flex items-center gap-3 p-4 border-b border-slate-800">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 shadow-lg shadow-cyan-500/20">
          <Footprints className="h-5 w-5 text-white" />
        </div>
        {!collapsed && (
          <div className="overflow-hidden">
            <h1 className="text-lg font-bold bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
              PedTrack AI
            </h1>
            <p className="text-[10px] text-slate-500 uppercase tracking-wider">Surveillance System</p>
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-3 space-y-1">
        {navItems.map((item: any) => {
          const Icon = item.icon;
          const isActive = currentPage === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id as Page)}
              className={cn(
                "group flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200",
                isActive
                  ? "bg-gradient-to-r from-cyan-500/20 to-blue-500/20 text-cyan-400 border border-cyan-500/30"
                  : "text-slate-400 hover:text-white hover:bg-slate-800/50"
              )}
              title={collapsed ? item.label : undefined}
            >
              <div className="relative">
                <Icon className={cn("h-5 w-5 shrink-0", isActive && "text-cyan-400")} />
                {collapsed && item.badge && (
                  <span className="absolute -top-1 -right-1 h-2.5 w-2.5 rounded-full bg-red-500 border border-slate-900" />
                )}
              </div>
              {!collapsed && (
                <div className="flex-1 flex items-center justify-between">
                  <span>{item.label}</span>
                  {item.badge && (
                    <span className="px-1.5 py-0.5 rounded-full bg-red-500 text-white text-[10px] font-bold">
                      {item.badge > 99 ? "99+" : item.badge}
                    </span>
                  )}
                </div>
              )}
            </button>
          );
        })}
      </nav>

      {/* System Status */}
      {!collapsed && (
        <div className={cn(
          "p-4 mx-3 mb-3 rounded-xl border",
          systemHealth === "online" ? "bg-gradient-to-br from-emerald-500/10 to-green-500/10 border-emerald-500/20" :
          systemHealth === "maintenance" ? "bg-gradient-to-br from-amber-500/10 to-orange-500/10 border-amber-500/20" :
          "bg-gradient-to-br from-red-500/10 to-pink-500/10 border-red-500/20"
        )}>
          <div className="flex items-center gap-2 mb-2">
            {systemHealth === "online" ? <ShieldCheck className="h-4 w-4 text-emerald-400" /> :
             systemHealth === "maintenance" ? <Hammer className="h-4 w-4 text-amber-400" /> :
             <WifiOff className="h-4 w-4 text-red-400" />}
            <span className={cn(
              "text-xs font-semibold capitalize",
              systemHealth === "online" ? "text-emerald-400" :
              systemHealth === "maintenance" ? "text-amber-400" :
              "text-red-400"
            )}>System {systemHealth}</span>
          </div>
          <p className="text-[11px] text-slate-400">
             {systemHealth === "online" ? `Processing ${stats.gpuUtilization}% GPU load` : "Check server logs"}
          </p>
          <div className="flex items-center gap-2 mt-2">
            <div className={cn(
              "h-1.5 w-1.5 rounded-full animate-pulse",
              systemHealth === "online" ? "bg-emerald-400" :
              systemHealth === "maintenance" ? "bg-amber-400" :
              "bg-red-400"
            )} />
            <span className={cn(
              "text-[10px]",
              systemHealth === "online" ? "text-emerald-400/70" :
              systemHealth === "maintenance" ? "text-amber-400/70" :
              "text-red-400/70"
            )}>
              {systemHealth === "online" ? "Live Feed Active" : "Stream Paused"}
            </span>
          </div>
        </div>
      )}

      {/* Collapse Toggle */}
      <button
        onClick={onToggle}
        className="absolute -right-3 top-20 h-6 w-6 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center hover:bg-slate-700 transition-colors"
      >
        {collapsed ? (
          <ChevronRight className="h-3 w-3 text-slate-400" />
        ) : (
          <ChevronLeft className="h-3 w-3 text-slate-400" />
        )}
      </button>
    </div>
  );
}
