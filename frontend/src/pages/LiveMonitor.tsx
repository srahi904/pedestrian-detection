import { useState, useEffect, useCallback, useRef } from "react";
import {
  Maximize2,
  Volume2,
  VolumeX,
  Camera,
  Users,
  AlertTriangle,
  Grid3X3,
  Square,
  Columns2,
} from "lucide-react";
import { cn } from "../utils/cn";
import { useApp } from "../context/AppContext";

type LayoutMode = "grid" | "single" | "dual";

interface SimulatedPerson {
  id: number;
  x: number;
  y: number;
  w: number;
  h: number;
  vx: number;
  vy: number;
  color: string;
}

function CameraCanvas({ cameraId, pedestrianCount, isLarge }: { cameraId: string; pedestrianCount: number; isLarge: boolean }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const peopleRef = useRef<SimulatedPerson[]>([]);
  const animRef = useRef<number>(0);

  const colors = ["#06b6d4", "#8b5cf6", "#10b981", "#f59e0b", "#ef4444", "#ec4899"];

  useEffect(() => {
    const count = Math.max(3, Math.min(pedestrianCount, 12));
    const people: SimulatedPerson[] = [];
    for (let i = 0; i < count; i++) {
      people.push({
        id: i + 1,
        x: 50 + Math.random() * 250,
        y: 40 + Math.random() * 130,
        w: 18 + Math.random() * 10,
        h: 35 + Math.random() * 15,
        vx: (Math.random() - 0.5) * 1.5,
        vy: (Math.random() - 0.5) * 0.8,
        color: colors[i % colors.length],
      });
    }
    peopleRef.current = people;
  }, [cameraId, pedestrianCount]);

  const drawFrame = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const W = canvas.width;
    const H = canvas.height;

    // Background
    ctx.fillStyle = "#0a0e1a";
    ctx.fillRect(0, 0, W, H);

    // Grid lines (surveillance feel)
    ctx.strokeStyle = "#1a2332";
    ctx.lineWidth = 0.5;
    for (let x = 0; x < W; x += 30) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, H);
      ctx.stroke();
    }
    for (let y = 0; y < H; y += 30) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(W, y);
      ctx.stroke();
    }

    // Floor perspective lines
    ctx.strokeStyle = "#1e293b44";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(W / 2, 30);
    ctx.lineTo(0, H);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(W / 2, 30);
    ctx.lineTo(W, H);
    ctx.stroke();

    // Animate people
    peopleRef.current.forEach((p) => {
      p.x += p.vx;
      p.y += p.vy;

      if (p.x < 20 || p.x > W - 40) p.vx *= -1;
      if (p.y < 30 || p.y > H - 60) p.vy *= -1;

      // Body silhouette
      ctx.fillStyle = "#2a3a4a";
      ctx.fillRect(p.x + 2, p.y + 2, p.w, p.h);

      // Head
      ctx.beginPath();
      ctx.arc(p.x + p.w / 2 + 2, p.y - 4, 6, 0, Math.PI * 2);
      ctx.fill();

      // Bounding box
      ctx.strokeStyle = p.color;
      ctx.lineWidth = 2;
      ctx.setLineDash([]);
      ctx.strokeRect(p.x - 4, p.y - 14, p.w + 8, p.h + 18);

      // Corner markers
      const cornerLen = 6;
      ctx.lineWidth = 3;
      // Top-left
      ctx.beginPath();
      ctx.moveTo(p.x - 4, p.y - 14 + cornerLen);
      ctx.lineTo(p.x - 4, p.y - 14);
      ctx.lineTo(p.x - 4 + cornerLen, p.y - 14);
      ctx.stroke();
      // Top-right
      ctx.beginPath();
      ctx.moveTo(p.x + p.w + 4 - cornerLen, p.y - 14);
      ctx.lineTo(p.x + p.w + 4, p.y - 14);
      ctx.lineTo(p.x + p.w + 4, p.y - 14 + cornerLen);
      ctx.stroke();
      // Bottom-left
      ctx.beginPath();
      ctx.moveTo(p.x - 4, p.y + p.h + 4 - cornerLen);
      ctx.lineTo(p.x - 4, p.y + p.h + 4);
      ctx.lineTo(p.x - 4 + cornerLen, p.y + p.h + 4);
      ctx.stroke();
      // Bottom-right
      ctx.beginPath();
      ctx.moveTo(p.x + p.w + 4 - cornerLen, p.y + p.h + 4);
      ctx.lineTo(p.x + p.w + 4, p.y + p.h + 4);
      ctx.lineTo(p.x + p.w + 4, p.y + p.h + 4 - cornerLen);
      ctx.stroke();

      // Label
      ctx.fillStyle = p.color;
      ctx.fillRect(p.x - 4, p.y - 26, 44, 12);
      ctx.fillStyle = "#000";
      ctx.font = "bold 9px monospace";
      ctx.fillText(`ID:${p.id.toString().padStart(3, "0")}`, p.x - 1, p.y - 16);

      // Confidence
      ctx.fillStyle = p.color + "88";
      ctx.font = "8px monospace";
      ctx.fillText(`${(85 + Math.random() * 14).toFixed(0)}%`, p.x + p.w - 10, p.y + p.h + 14);
    });

    // Overlay: timestamp
    const now = new Date();
    ctx.fillStyle = "#00000088";
    ctx.fillRect(0, 0, W, 22);
    ctx.fillStyle = "#94a3b8";
    ctx.font = "10px monospace";
    ctx.fillText(
      `REC ● ${now.toLocaleTimeString()}.${now.getMilliseconds().toString().padStart(3, "0")}`,
      8,
      15
    );
    ctx.fillText(`CAM: ${cameraId.toUpperCase()}`, W - 90, 15);

    // Detection zone overlay
    ctx.strokeStyle = "#06b6d422";
    ctx.lineWidth = 1;
    ctx.setLineDash([5, 5]);
    ctx.strokeRect(15, 25, W - 30, H - 35);
    ctx.setLineDash([]);

    // Count indicator bottom
    ctx.fillStyle = "#00000088";
    ctx.fillRect(0, H - 22, W, 22);
    ctx.fillStyle = "#06b6d4";
    ctx.font = "bold 10px monospace";
    ctx.fillText(`PERSONS: ${peopleRef.current.length}`, 8, H - 7);
    ctx.fillStyle = "#10b981";
    ctx.fillText("● TRACKING", W - 85, H - 7);

    animRef.current = requestAnimationFrame(drawFrame);
  }, [cameraId]);

  useEffect(() => {
    animRef.current = requestAnimationFrame(drawFrame);
    return () => cancelAnimationFrame(animRef.current);
  }, [drawFrame]);

  return (
    <canvas
      ref={canvasRef}
      width={isLarge ? 640 : 380}
      height={isLarge ? 360 : 220}
      className="w-full h-full rounded"
    />
  );
}

export function LiveMonitor() {
  const { cameras } = useApp();
  const [layout, setLayout] = useState<LayoutMode>("grid");
  const [selectedCamera, setSelectedCamera] = useState<string | null>(null);
  const [_muted, setMuted] = useState(true);
  const muted = _muted;

  const onlineCameras = cameras.filter((c) => c.status === "online");

  return (
    <div className="p-6 space-y-4 relative">
      {/* System Status Overlay */}
      {cameras.length === 0 && (
          <div className="absolute inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm">
             <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-500 mx-auto mb-4"></div>
                <h2 className="text-xl font-bold text-white">Connecting to System...</h2>
             </div>
          </div>
      )}
      
      {/* Model Loading Overlay */}
      {/* We use specific systemHealth check here */}
      {(useApp().systemHealth === 'loading_model') && (
          <div className="absolute inset-0 z-50 flex items-center justify-center bg-slate-950/90 backdrop-blur-md">
             <div className="text-center max-w-md p-6 rounded-2xl bg-slate-900 border border-slate-800 shadow-2xl">
                <div className="relative mb-6">
                    <div className="animate-spin rounded-full h-16 w-16 border-4 border-slate-700 border-t-cyan-500 mx-auto"></div>
                    <div className="absolute inset-0 flex items-center justify-center">
                        <Camera className="h-6 w-6 text-cyan-500/50" />
                    </div>
                </div>
                <h2 className="text-2xl font-bold text-white mb-2">Switching AI Model</h2>
                <p className="text-slate-400">Downloading and initializing the new detection model. This may take a moment...</p>
                <div className="mt-6 flex justify-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-cyan-500 animate-bounce [animation-delay:-0.3s]"></span>
                    <span className="h-2 w-2 rounded-full bg-cyan-500 animate-bounce [animation-delay:-0.15s]"></span>
                    <span className="h-2 w-2 rounded-full bg-cyan-500 animate-bounce"></span>
                </div>
             </div>
          </div>
      )}
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Live Monitoring</h1>
          <p className="text-slate-400 text-sm mt-1">Real-time surveillance feeds with pedestrian detection overlay</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setMuted(!muted)}
            className="p-2 rounded-lg bg-slate-800 border border-slate-700 hover:bg-slate-700 transition-colors"
          >
            {muted ? <VolumeX className="h-4 w-4 text-slate-400" /> : <Volume2 className="h-4 w-4 text-cyan-400" />}
          </button>
          <div className="flex bg-slate-800 border border-slate-700 rounded-lg p-1">
            {([
              { mode: "grid" as const, icon: Grid3X3 },
              { mode: "dual" as const, icon: Columns2 },
              { mode: "single" as const, icon: Square },
            ]).map(({ mode, icon: Icon }) => (
              <button
                key={mode}
                onClick={() => { setLayout(mode); setSelectedCamera(null); }}
                className={cn(
                  "p-1.5 rounded transition-colors",
                  layout === mode ? "bg-cyan-500/20 text-cyan-400" : "text-slate-400 hover:text-white"
                )}
              >
                <Icon className="h-4 w-4" />
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Camera Grid */}
      <div
        className={cn(
          "grid gap-4",
          layout === "grid" ? "grid-cols-1 md:grid-cols-2 xl:grid-cols-3" :
          layout === "dual" ? "grid-cols-1 md:grid-cols-2" : "grid-cols-1 max-w-4xl mx-auto"
        )}
      >
        {(selectedCamera
          ? onlineCameras.filter((c) => c.id === selectedCamera)
          : layout === "single"
          ? onlineCameras.slice(0, 1)
          : layout === "dual"
          ? onlineCameras.slice(0, 2)
          : onlineCameras
        ).map((cam) => (
          <div
            key={cam.id}
            className="rounded-xl bg-slate-900 border border-slate-800 overflow-hidden group hover:border-cyan-500/30 transition-colors"
          >
            {/* Camera Feed Canvas */}
            <div className="relative aspect-video bg-slate-950">
              <CameraCanvas
                cameraId={cam.id}
                pedestrianCount={cam.pedestrianCount}
                isLarge={layout === "single"}
              />

              {/* Overlay Controls */}
              <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={() => { setSelectedCamera(cam.id); setLayout("single"); }}
                  className="p-1.5 rounded bg-black/50 hover:bg-black/80 transition-colors"
                >
                  <Maximize2 className="h-3.5 w-3.5 text-white" />
                </button>
              </div>

              {/* Live indicator */}
              <div className="absolute top-2 left-2 flex items-center gap-1.5 px-2 py-0.5 rounded bg-red-500/80">
                <div className="h-1.5 w-1.5 rounded-full bg-white animate-pulse" />
                <span className="text-[10px] font-bold text-white">LIVE</span>
              </div>
            </div>

            {/* Camera Info */}
            <div className="p-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Camera className="h-4 w-4 text-cyan-400" />
                <div>
                  <p className="text-sm font-medium text-white">{cam.name}</p>
                  <p className="text-[10px] text-slate-500">{cam.location}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1">
                  <Users className="h-3.5 w-3.5 text-cyan-400" />
                  <span className="text-sm font-bold text-white">{cam.pedestrianCount}</span>
                </div>
                <span className="text-[10px] text-slate-500">{cam.fps} FPS</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Offline / Maintenance Cameras */}
      {cameras.filter((c) => c.status !== "online").length > 0 && (
        <div className="rounded-xl bg-slate-900 border border-slate-800 p-4">
          <h3 className="text-sm font-semibold text-white mb-3">Offline / Maintenance Cameras</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {cameras.filter((c) => c.status !== "online").map((cam) => (
              <div key={cam.id} className="flex items-center justify-between p-3 rounded-lg bg-slate-800/50">
                <div className="flex items-center gap-2">
                  <div className={cn(
                    "h-2 w-2 rounded-full",
                    cam.status === "maintenance" ? "bg-amber-400" : "bg-red-400"
                  )} />
                  <span className="text-sm text-slate-300">{cam.name}</span>
                </div>
                <div className="flex items-center gap-1">
                  <AlertTriangle className={cn(
                    "h-3 w-3",
                    cam.status === "maintenance" ? "text-amber-400" : "text-red-400"
                  )} />
                  <span className={cn(
                    "text-xs capitalize",
                    cam.status === "maintenance" ? "text-amber-400" : "text-red-400"
                  )}>{cam.status}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
