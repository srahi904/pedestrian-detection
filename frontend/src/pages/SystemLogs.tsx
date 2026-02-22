import { useState, useEffect, useRef } from "react";
import {
  Terminal,
  RefreshCw,
  Search,
  Filter,
  AlertTriangle,
  Info,
  XCircle,
  Clock,
  Download
} from "lucide-react";
import { cn } from "../utils/cn";
import { AppAPI } from "../services/api";

interface LogEntry {
  timestamp: string;
  level: "INFO" | "WARNING" | "ERROR" | "CRITICAL";
  source: string;
  message: string;
}

const levelColors = {
  INFO: "text-blue-400",
  WARNING: "text-amber-400",
  ERROR: "text-red-400",
  CRITICAL: "text-pink-500 font-bold",
};

const levelIcons = {
  INFO: Info,
  WARNING: AlertTriangle,
  ERROR: XCircle,
  CRITICAL: AlertTriangle,
};

export function SystemLogs() {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterLevel, setFilterLevel] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [autoRefresh, setAutoRefresh] = useState(true);
  const logsEndRef = useRef<HTMLDivElement>(null);

  const fetchLogs = async () => {
    try {
      setLoading(true);
      const data = await AppAPI.getLogs(filterLevel !== "ALL" ? filterLevel : undefined);
      setLogs(data);
    } catch (err) {
      console.error("Failed to fetch logs", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
    const interval = setInterval(() => {
      if (autoRefresh) fetchLogs();
    }, 5000);
    return () => clearInterval(interval);
  }, [filterLevel, autoRefresh]);

  // Scroll to bottom on new logs if near bottom
  // useEffect(() => {
  //   logsEndRef.current?.scrollIntoView({ behavior: "smooth" });
  // }, [logs]);

  const filteredLogs = logs.filter(log =>
    log.message.toLowerCase().includes(searchQuery.toLowerCase()) ||
    log.source.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const downloadLogs = () => {
    const csv = [
      "Timestamp,Level,Source,Message",
      ...logs.map(l => `${l.timestamp},${l.level},${l.source},"${l.message.replace(/"/g, '""')}"`)
    ].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `system_logs_${new Date().toISOString()}.csv`;
    a.click();
  };

  return (
    <div className="p-6 space-y-6 flex flex-col h-[calc(100vh-2rem)]">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <Terminal className="h-6 w-6 text-green-400" /> System Logs
          </h1>
          <p className="text-slate-400 text-sm mt-1">Real-time system events and diagnostics</p>
        </div>
        <div className="flex items-center gap-3">
           <button
            onClick={() => setAutoRefresh(!autoRefresh)}
            className={cn(
              "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors",
              autoRefresh
                ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                : "bg-slate-800 text-slate-400 border-slate-700"
            )}
          >
            <Clock className="h-3.5 w-3.5" /> {autoRefresh ? "Live Updates On" : "Live Updates Off"}
          </button>
          <button
            onClick={fetchLogs}
            className="p-2 rounded-lg bg-slate-800 border border-slate-700 text-slate-300 hover:bg-slate-700 hover:text-white"
            title="Refresh"
          >
            <RefreshCw className={cn("h-4 w-4", loading && "animate-spin")} />
          </button>
          <button
            onClick={downloadLogs}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 hover:bg-cyan-500/30"
          >
            <Download className="h-3.5 w-3.5" /> Export
          </button>
        </div>
      </div>

      {/* Controls */}
      <div className="flex flex-wrap gap-4 items-center bg-slate-900/50 p-4 rounded-xl border border-slate-800">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
          <input
            type="text"
            placeholder="Search logs..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-950 border border-slate-700 rounded-lg pl-9 pr-3 py-2 text-sm text-white focus:outline-none focus:border-cyan-500"
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-slate-500" />
          <select
            value={filterLevel}
            onChange={(e) => setFilterLevel(e.target.value)}
            className="bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-cyan-500"
          >
            <option value="ALL">All Levels</option>
            <option value="INFO">INFO</option>
            <option value="WARNING">WARNING</option>
            <option value="ERROR">ERROR</option>
            <option value="CRITICAL">CRITICAL</option>
          </select>
        </div>
      </div>

      {/* Terminal View */}
      <div className="flex-1 bg-slate-950 rounded-xl border border-slate-800 overflow-hidden flex flex-col font-mono text-sm relative">
        <div className="flex items-center justify-between px-4 py-2 bg-slate-900 border-b border-slate-800">
          <div className="flex gap-2">
            <div className="h-3 w-3 rounded-full bg-red-500/50" />
            <div className="h-3 w-3 rounded-full bg-amber-500/50" />
            <div className="h-3 w-3 rounded-full bg-emerald-500/50" />
          </div>
          <span className="text-xs text-slate-500">pedtrack-backend.log</span>
        </div>
        
        <div className="flex-1 overflow-y-auto p-4 space-y-1 scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-transparent">
          {filteredLogs.length === 0 ? (
            <div className="text-center text-slate-500 py-20">
              No logs found matching your criteria
            </div>
          ) : (
            filteredLogs.map((log, idx) => {
              const Icon = levelIcons[log.level] || Info;
              return (
                <div key={idx} className="flex gap-3 hover:bg-white/5 p-1 rounded group items-center">
                  <span className="text-slate-500 shrink-0 select-none w-36 font-mono text-xs">{log.timestamp}</span>
                  <span className={cn("shrink-0 w-24 font-bold flex items-center gap-1.5", levelColors[log.level])}>
                    <Icon className="h-3.5 w-3.5" />
                    {log.level}
                  </span>
                  <span className="text-violet-400 shrink-0 w-24 font-mono">[{log.source}]</span>
                  <span className="text-slate-300 break-all">{log.message}</span>
                </div>
              );
            })
          )}
          <div ref={logsEndRef} />
        </div>
      </div>
    </div>
  );
}
