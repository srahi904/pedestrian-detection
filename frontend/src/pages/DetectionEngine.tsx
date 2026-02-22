import { useState, useRef, useEffect, useCallback } from "react";
import {
  Upload,
  Play,
  Pause,
  RotateCcw,
  ScanEye,
  Target,
  Cpu,
  Gauge,
  Box,
  Layers,
  Zap,
  FileVideo,
  X,
  Download,
  BarChart3,
  Users,
  Clock,
  AlertCircle,
  CheckCircle2,
  Loader2,
} from "lucide-react";
import { cn } from "../utils/cn";

interface DetectionItem {
  bbox: [number, number, number, number];
  class: string;
  score: number;
  trackId?: number;
}

interface FrameResult {
  frameNumber: number;
  timestamp: number;
  personCount: number;
  detections: DetectionItem[];
}

type ModelStatus = "idle" | "loading" | "ready" | "error";
type ProcessingStatus = "idle" | "processing" | "paused" | "complete";

export function DetectionEngine() {
  const [modelStatus, setModelStatus] = useState<ModelStatus>("idle");
  const [modelLoadProgress, setModelLoadProgress] = useState(0);

  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [videoUrl, setVideoUrl] = useState<string>("");
  const [processingStatus, setProcessingStatus] = useState<ProcessingStatus>("idle");

  const [confidenceThreshold, setConfidenceThreshold] = useState(0.5);
  const [showBoundingBoxes, setShowBoundingBoxes] = useState(true);
  const [showLabels, setShowLabels] = useState(true);
  const [showTrails, setShowTrails] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);

  const [frameResults, setFrameResults] = useState<FrameResult[]>([]);
  const [fps, setFps] = useState(0);
  const [currentPersonCount, setCurrentPersonCount] = useState(0);
  const [maxPersonCount, setMaxPersonCount] = useState(0);
  const [avgPersonCount, setAvgPersonCount] = useState(0);
  const [processedFrames, setProcessedFrames] = useState(0);
  const [inferenceTime, setInferenceTime] = useState(0);
  const [videoReady, setVideoReady] = useState(false);
  const [modelError, setModelError] = useState("");

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const overlayCanvasRef = useRef<HTMLCanvasElement>(null);
  const mainFileInputRef = useRef<HTMLInputElement>(null);
  const sideFileInputRef = useRef<HTMLInputElement>(null);
  const modelRef = useRef<any>(null);
  const animRef = useRef<number>(0);
  const trailsRef = useRef<Map<number, Array<{ x: number; y: number }>>>(new Map());
  const nextTrackIdRef = useRef(1);
  const prevDetectionsRef = useRef<DetectionItem[]>([]);
  const isProcessingRef = useRef(false);
  const frameCounterRef = useRef(0);
  const lastFpsTimeRef = useRef(0);
  const fpsCountRef = useRef(0);
  const allResultsRef = useRef<FrameResult[]>([]);
  const maxCountRef = useRef(0);
  const totalCountRef = useRef(0);

  // Use refs for visualization settings so the detection loop always has current values
  const showBoundingBoxesRef = useRef(showBoundingBoxes);
  const showLabelsRef = useRef(showLabels);
  const showTrailsRef = useRef(showTrails);
  const confidenceThresholdRef = useRef(confidenceThreshold);
  const fpsRef = useRef(fps);

  useEffect(() => { showBoundingBoxesRef.current = showBoundingBoxes; }, [showBoundingBoxes]);
  useEffect(() => { showLabelsRef.current = showLabels; }, [showLabels]);
  useEffect(() => { showTrailsRef.current = showTrails; }, [showTrails]);
  useEffect(() => { confidenceThresholdRef.current = confidenceThreshold; }, [confidenceThreshold]);
  useEffect(() => { fpsRef.current = fps; }, [fps]);

  // Load model once on mount
  useEffect(() => {
    let cancelled = false;

    const doLoad = async () => {
      setModelStatus("loading");
      setModelLoadProgress(10);
      setModelError("");

      try {
        setModelLoadProgress(20);
        const tf = await import("@tensorflow/tfjs");
        if (cancelled) return;
        setModelLoadProgress(40);

        try {
          await tf.setBackend("webgl");
        } catch {
          await tf.setBackend("cpu");
        }
        await tf.ready();
        if (cancelled) return;
        setModelLoadProgress(60);

        const cocoSsd = await import("@tensorflow-models/coco-ssd");
        if (cancelled) return;
        setModelLoadProgress(80);

        const model = await cocoSsd.load({ base: "lite_mobilenet_v2" });
        if (cancelled) return;
        setModelLoadProgress(100);

        modelRef.current = model;
        setModelStatus("ready");
      } catch (err: any) {
        if (cancelled) return;
        console.error("Model loading failed:", err);
        setModelStatus("error");
        setModelError(err?.message || "Failed to load model");
      }
    };

    doLoad();
    return () => { cancelled = true; };
  }, []);

  // Handle file upload
  const handleFileUpload = useCallback((file: File) => {
    if (!file.type.startsWith("video/")) {
      alert("Please upload a video file (MP4, WebM, AVI, MOV)");
      return;
    }

    // Stop any current processing
    isProcessingRef.current = false;
    cancelAnimationFrame(animRef.current);

    // Cleanup old URL
    if (videoUrl) {
      URL.revokeObjectURL(videoUrl);
    }

    const url = URL.createObjectURL(file);
    setVideoFile(file);
    setVideoUrl(url);
    setVideoReady(false);
    setProcessingStatus("idle");
    setFrameResults([]);
    setProcessedFrames(0);
    setMaxPersonCount(0);
    setAvgPersonCount(0);
    setCurrentPersonCount(0);
    setFps(0);
    setInferenceTime(0);
    trailsRef.current.clear();
    nextTrackIdRef.current = 1;
    prevDetectionsRef.current = [];
    allResultsRef.current = [];
    maxCountRef.current = 0;
    totalCountRef.current = 0;
    frameCounterRef.current = 0;
  }, [videoUrl]);

  // When video element loads metadata, mark it ready
  useEffect(() => {
    const video = videoRef.current;
    if (!video || !videoUrl) return;

    const onLoadedData = () => {
      setVideoReady(true);
    };

    const onError = () => {
      console.error("Video failed to load");
      setVideoReady(false);
    };

    video.addEventListener("loadeddata", onLoadedData);
    video.addEventListener("error", onError);

    // Force reload
    video.load();

    return () => {
      video.removeEventListener("loadeddata", onLoadedData);
      video.removeEventListener("error", onError);
    };
  }, [videoUrl]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const file = e.dataTransfer.files[0];
    if (file) handleFileUpload(file);
  }, [handleFileUpload]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  // IoU tracking
  const computeIoU = (a: [number, number, number, number], b: [number, number, number, number]) => {
    const [ax, ay, aw, ah] = a;
    const [bx, by, bw, bh] = b;
    const x1 = Math.max(ax, bx);
    const y1 = Math.max(ay, by);
    const x2 = Math.min(ax + aw, bx + bw);
    const y2 = Math.min(ay + ah, by + bh);
    const inter = Math.max(0, x2 - x1) * Math.max(0, y2 - y1);
    const union = aw * ah + bw * bh - inter;
    return union > 0 ? inter / union : 0;
  };

  const assignTrackIds = (detections: DetectionItem[]): DetectionItem[] => {
    const prev = prevDetectionsRef.current;
    const assigned = new Set<number>();
    const result: DetectionItem[] = [];

    for (const det of detections) {
      let bestId = -1;
      let bestIoU = 0.3;
      for (const p of prev) {
        if (p.trackId !== undefined && !assigned.has(p.trackId)) {
          const iou = computeIoU(det.bbox, p.bbox);
          if (iou > bestIoU) {
            bestIoU = iou;
            bestId = p.trackId;
          }
        }
      }
      if (bestId >= 0) {
        assigned.add(bestId);
        result.push({ ...det, trackId: bestId });
      } else {
        const newId = nextTrackIdRef.current++;
        result.push({ ...det, trackId: newId });
      }
    }

    prevDetectionsRef.current = result;
    return result;
  };

  // Draw overlay using refs for current settings
  const drawOverlay = useCallback((detections: DetectionItem[], w: number, h: number) => {
    const overlay = overlayCanvasRef.current;
    if (!overlay) return;

    if (overlay.width !== w) overlay.width = w;
    if (overlay.height !== h) overlay.height = h;
    const ctx = overlay.getContext("2d");
    if (!ctx) return;

    ctx.clearRect(0, 0, w, h);

    // Draw trails
    if (showTrailsRef.current) {
      trailsRef.current.forEach((trail) => {
        if (trail.length < 2) return;
        ctx.beginPath();
        ctx.moveTo(trail[0].x, trail[0].y);
        for (let i = 1; i < trail.length; i++) {
          ctx.lineTo(trail[i].x, trail[i].y);
        }
        ctx.strokeStyle = "rgba(6, 182, 212, 0.4)";
        ctx.lineWidth = 2;
        ctx.stroke();
        for (let i = 0; i < trail.length; i++) {
          const alpha = i / trail.length;
          ctx.beginPath();
          ctx.arc(trail[i].x, trail[i].y, 2, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(6, 182, 212, ${alpha * 0.6})`;
          ctx.fill();
        }
      });
    }

    if (!showBoundingBoxesRef.current) {
      drawHUD(ctx, detections.length, w, h);
      return;
    }

    const colors = ["#06b6d4", "#8b5cf6", "#10b981", "#f59e0b", "#ef4444", "#ec4899", "#6366f1", "#14b8a6"];

    detections.forEach((det, i) => {
      const [x, y, bw, bh] = det.bbox;
      const color = colors[(det.trackId || i) % colors.length];
      const score = Math.round(det.score * 100);

      ctx.shadowColor = color;
      ctx.shadowBlur = 10;
      ctx.strokeStyle = color;
      ctx.lineWidth = 2.5;
      ctx.strokeRect(x, y, bw, bh);
      ctx.shadowBlur = 0;

      const cornerLen = Math.min(15, bw * 0.2, bh * 0.2);
      ctx.lineWidth = 3.5;
      ctx.strokeStyle = color;

      ctx.beginPath(); ctx.moveTo(x, y + cornerLen); ctx.lineTo(x, y); ctx.lineTo(x + cornerLen, y); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(x + bw - cornerLen, y); ctx.lineTo(x + bw, y); ctx.lineTo(x + bw, y + cornerLen); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(x, y + bh - cornerLen); ctx.lineTo(x, y + bh); ctx.lineTo(x + cornerLen, y + bh); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(x + bw - cornerLen, y + bh); ctx.lineTo(x + bw, y + bh); ctx.lineTo(x + bw, y + bh - cornerLen); ctx.stroke();

      if (!showLabelsRef.current) return;

      const label = det.trackId ? `ID:${det.trackId} ${score}%` : `Person ${score}%`;
      ctx.font = "bold 12px monospace";
      const textWidth = ctx.measureText(label).width;
      const labelH = 18;
      const labelY = Math.max(y - labelH - 2, 0);
      ctx.fillStyle = color;
      ctx.fillRect(x, labelY, textWidth + 10, labelH);
      ctx.fillStyle = "#000";
      ctx.font = "bold 11px monospace";
      ctx.fillText(label, x + 5, labelY + 13);
    });

    drawHUD(ctx, detections.length, w, h);
  }, []);

  const drawHUD = (ctx: CanvasRenderingContext2D, count: number, w: number, h: number) => {
    const now = new Date();
    ctx.fillStyle = "rgba(0,0,0,0.6)";
    ctx.fillRect(0, 0, w, 30);
    ctx.fillRect(0, h - 30, w, 30);

    ctx.fillStyle = "#ef4444";
    ctx.beginPath(); ctx.arc(16, 15, 5, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = "#fff";
    ctx.font = "bold 12px monospace";
    ctx.fillText("REC", 28, 19);
    ctx.fillStyle = "#94a3b8";
    ctx.font = "11px monospace";
    ctx.fillText(now.toLocaleTimeString(), 70, 19);
    ctx.fillStyle = "#06b6d4";
    ctx.font = "bold 12px monospace";
    ctx.fillText(`PERSONS: ${count}`, 14, h - 10);
    ctx.fillStyle = "#10b981";
    ctx.fillText("● DETECTING", w - 130, h - 10);
    ctx.fillStyle = "#8b5cf6";
    ctx.fillText(`${fpsRef.current} FPS`, w - 80, 19);
  };

  // Main detection loop
  const runDetection = useCallback(async () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    const model = modelRef.current;

    if (!video || !canvas || !model) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const detectFrame = async () => {
      if (!isProcessingRef.current) return;

      if (video.paused || video.ended) {
        if (video.ended) {
          setProcessingStatus("complete");
          isProcessingRef.current = false;
          const results = allResultsRef.current;
          if (results.length > 0) {
            const avg = totalCountRef.current / results.length;
            setAvgPersonCount(Math.round(avg * 10) / 10);
          }
          setFrameResults([...results]);
        }
        return;
      }

      const startTime = performance.now();
      frameCounterRef.current++;

      // Ensure canvas matches video dimensions
      if (canvas.width !== video.videoWidth || canvas.height !== video.videoHeight) {
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
      }
      ctx.drawImage(video, 0, 0, video.videoWidth, video.videoHeight);

      try {
        const predictions = await model.detect(canvas, 20, confidenceThresholdRef.current);

        const personDetections: DetectionItem[] = predictions
          .filter((p: any) => p.class === "person")
          .map((p: any) => ({
            bbox: p.bbox as [number, number, number, number],
            class: p.class as string,
            score: p.score as number,
          }));

        const tracked = assignTrackIds(personDetections);

        // Update trails
        for (const det of tracked) {
          if (det.trackId !== undefined) {
            const cx = det.bbox[0] + det.bbox[2] / 2;
            const cy = det.bbox[1] + det.bbox[3];
            const trail = trailsRef.current.get(det.trackId) || [];
            trail.push({ x: cx, y: cy });
            if (trail.length > 30) trail.shift();
            trailsRef.current.set(det.trackId, trail);
          }
        }

        const endTime = performance.now();
        const infTime = Math.round(endTime - startTime);
        setInferenceTime(infTime);

        const result: FrameResult = {
          frameNumber: frameCounterRef.current,
          timestamp: video.currentTime,
          personCount: tracked.length,
          detections: tracked,
        };

        allResultsRef.current.push(result);
        maxCountRef.current = Math.max(maxCountRef.current, tracked.length);
        totalCountRef.current += tracked.length;

        setCurrentPersonCount(tracked.length);
        setMaxPersonCount(maxCountRef.current);
        setProcessedFrames(frameCounterRef.current);

        // Batch update frameResults every 10 frames to avoid too many re-renders
        if (frameCounterRef.current % 10 === 0) {
          setFrameResults([...allResultsRef.current]);
        }

        // FPS calculation
        fpsCountRef.current++;
        const now = performance.now();
        if (now - lastFpsTimeRef.current >= 1000) {
          const currentFps = fpsCountRef.current;
          setFps(currentFps);
          fpsCountRef.current = 0;
          lastFpsTimeRef.current = now;
        }

        drawOverlay(tracked, video.videoWidth, video.videoHeight);
      } catch (err) {
        console.error("Detection error:", err);
      }

      if (isProcessingRef.current) {
        animRef.current = requestAnimationFrame(detectFrame);
      }
    };

    animRef.current = requestAnimationFrame(detectFrame);
  }, [drawOverlay]);

  // Start processing
  const startProcessing = useCallback(async () => {
    const video = videoRef.current;
    const model = modelRef.current;
    if (!video || !model || !videoReady) return;
    if (isProcessingRef.current) return;

    // Reset all state
    isProcessingRef.current = true;
    setProcessingStatus("processing");
    setFrameResults([]);
    setProcessedFrames(0);
    setMaxPersonCount(0);
    setAvgPersonCount(0);
    setCurrentPersonCount(0);
    setFps(0);
    trailsRef.current.clear();
    nextTrackIdRef.current = 1;
    prevDetectionsRef.current = [];
    allResultsRef.current = [];
    maxCountRef.current = 0;
    totalCountRef.current = 0;
    frameCounterRef.current = 0;
    lastFpsTimeRef.current = performance.now();
    fpsCountRef.current = 0;

    // Reset video to beginning
    video.currentTime = 0;
    video.playbackRate = playbackSpeed;
    video.muted = true;

    // Wait for seek to complete
    await new Promise<void>((resolve) => {
      const onSeeked = () => {
        video.removeEventListener("seeked", onSeeked);
        resolve();
      };
      if (video.currentTime === 0) {
        resolve();
      } else {
        video.addEventListener("seeked", onSeeked);
      }
    });

    // Small delay to ensure video is ready
    await new Promise(r => setTimeout(r, 100));

    try {
      await video.play();
    } catch (err) {
      console.error("Video play failed:", err);
      isProcessingRef.current = false;
      setProcessingStatus("idle");
      return;
    }

    runDetection();
  }, [videoReady, playbackSpeed, runDetection]);

  // Pause / Resume
  const togglePause = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;

    if (processingStatus === "processing") {
      video.pause();
      isProcessingRef.current = false;
      cancelAnimationFrame(animRef.current);
      setProcessingStatus("paused");
    } else if (processingStatus === "paused") {
      isProcessingRef.current = true;
      setProcessingStatus("processing");
      video.play();
      runDetection();
    }
  }, [processingStatus, runDetection]);

  // Reset
  const handleReset = useCallback(() => {
    isProcessingRef.current = false;
    cancelAnimationFrame(animRef.current);

    if (videoRef.current) {
      videoRef.current.pause();
      videoRef.current.currentTime = 0;
    }

    setProcessingStatus("idle");
    setFrameResults([]);
    setProcessedFrames(0);
    setMaxPersonCount(0);
    setAvgPersonCount(0);
    setCurrentPersonCount(0);
    setFps(0);
    setInferenceTime(0);
    trailsRef.current.clear();
    nextTrackIdRef.current = 1;
    prevDetectionsRef.current = [];
    allResultsRef.current = [];
    maxCountRef.current = 0;
    totalCountRef.current = 0;
    frameCounterRef.current = 0;

    const overlay = overlayCanvasRef.current;
    if (overlay) {
      const ctx = overlay.getContext("2d");
      if (ctx) ctx.clearRect(0, 0, overlay.width, overlay.height);
    }
  }, []);

  // Remove video
  const removeVideo = useCallback(() => {
    handleReset();
    if (videoUrl) URL.revokeObjectURL(videoUrl);
    setVideoFile(null);
    setVideoUrl("");
    setVideoReady(false);
  }, [handleReset, videoUrl]);

  // Export CSV
  const exportCSV = useCallback(() => {
    const results = allResultsRef.current.length > 0 ? allResultsRef.current : frameResults;
    if (results.length === 0) return;
    let csv = "Frame,Timestamp(s),PersonCount,TrackIDs,AvgConfidence\n";
    results.forEach((r) => {
      const trackIds = r.detections.map(d => d.trackId || "?").join(";");
      const avgConf = r.detections.length > 0
        ? (r.detections.reduce((s, d) => s + d.score, 0) / r.detections.length * 100).toFixed(1)
        : "0";
      csv += `${r.frameNumber},${r.timestamp.toFixed(2)},${r.personCount},"${trackIds}",${avgConf}\n`;
    });
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "pedestrian_detection_results.csv";
    a.click();
    URL.revokeObjectURL(url);
  }, [frameResults]);

  // Cleanup
  useEffect(() => {
    return () => {
      isProcessingRef.current = false;
      cancelAnimationFrame(animRef.current);
    };
  }, []);

  // Sparkline renderer
  const renderSparkline = () => {
    if (frameResults.length < 2) return null;
    const last50 = frameResults.slice(-50);
    const maxVal = Math.max(...last50.map((r) => r.personCount), 1);
    const w = 200;
    const h = 40;
    const stepX = w / (last50.length - 1);

    let pathD = "";
    last50.forEach((r, i) => {
      const x = i * stepX;
      const y = h - (r.personCount / maxVal) * h;
      if (i === 0) pathD += `M ${x} ${y}`;
      else pathD += ` L ${x} ${y}`;
    });

    return (
      <svg width={w} height={h} className="mt-1">
        <path d={pathD} fill="none" stroke="#06b6d4" strokeWidth="1.5" />
        {last50.length > 0 && (
          <circle
            cx={(last50.length - 1) * stepX}
            cy={h - (last50[last50.length - 1].personCount / maxVal) * h}
            r="3"
            fill="#06b6d4"
          />
        )}
      </svg>
    );
  };

  // Fetch settings from backend to display selected model
  const [modelMetadata, setModelMetadata] = useState({
    name: "COCO-SSD",
    backbone: "MobileNet v2",
    dataset: "COCO (80 classes)",
    runtime: "WebGL (Browser GPU)",
    precision: "Float32"
  });

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const { AppAPI } = await import("../services/api");
        const settings = await AppAPI.getSettings();
        
        if (settings && settings.model_variant) {
          const variant = settings.model_variant;
          const isYolo = variant.startsWith("yolo");
          
          let name = "COCO-SSD";
          let backbone = "MobileNet v2";
          let precision = "Float32";
          let runtime = "WebGL (Browser GPU)"; // Default for browser models

          if (isYolo) {
            const size = variant.replace("yolov8", "").toUpperCase();
            const sizeMap: Record<string, string> = {
              "N": "Nano",
              "S": "Small",
              "M": "Medium",
              "L": "Large",
              "X": "Extra (Max Accuracy)"
            };
            name = `YOLOv8-${sizeMap[size] || "Standard"}`;
            backbone = "CSPDarknet53";
            precision = settings.device?.includes("cuda") ? "FP16 (CUDA)" : "FP32";
            runtime = settings.device?.includes("cuda") ? "TensorRT / CUDA" : "ONNX Runtime";
          }

          setModelMetadata({
            name,
            backbone,
            dataset: "COCO (80 classes)",
            runtime,
            precision
          });
          
          // Also sync confidence if desired, though we have a local slider
          // setConfidenceThreshold(settings.confidence_threshold || 0.5);
        }
      } catch (err) {
        console.warn("Failed to fetch settings for display", err);
      }
    };
    fetchSettings();
  }, []);

  const canStartDetection = modelStatus === "ready" && videoReady;

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Detection Engine</h1>
          <p className="text-slate-400 text-sm mt-1">
            Upload a video to detect and count pedestrians per frame using {modelMetadata.name}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div
            className={cn(
              "flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium",
              modelStatus === "ready"
                ? "bg-emerald-500/10 border border-emerald-500/20 text-emerald-400"
                : modelStatus === "loading"
                ? "bg-amber-500/10 border border-amber-500/20 text-amber-400"
                : modelStatus === "error"
                ? "bg-red-500/10 border border-red-500/20 text-red-400"
                : "bg-slate-800 border border-slate-700 text-slate-400"
            )}
          >
            {modelStatus === "ready" && <CheckCircle2 className="h-3.5 w-3.5" />}
            {modelStatus === "loading" && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
            {modelStatus === "error" && <AlertCircle className="h-3.5 w-3.5" />}
            {modelStatus === "idle" && <Cpu className="h-3.5 w-3.5" />}
            {modelStatus === "ready"
              ? `${modelMetadata.name} Ready`
              : modelStatus === "loading"
              ? `Loading Model... ${modelLoadProgress}%`
              : modelStatus === "error"
              ? "Model Error"
              : "Model Not Loaded"}
          </div>
        </div>
      </div>

      {/* Model Error Detail */}
      {modelStatus === "error" && modelError && (
        <div className="rounded-xl bg-red-500/10 border border-red-500/20 p-4">
          <div className="flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-red-400 shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-red-400">Model Loading Failed</p>
              <p className="text-xs text-red-400/70 mt-1">{modelError}</p>
              <p className="text-xs text-slate-400 mt-2">
                This may happen if WebGL is not available. Try refreshing the page or using Chrome/Edge.
              </p>
              <button
                onClick={() => window.location.reload()}
                className="mt-3 px-4 py-1.5 rounded-lg bg-red-500/20 text-red-400 border border-red-500/30 text-xs font-medium hover:bg-red-500/30"
              >
                Reload Page
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
        {/* Main Video Area */}
        <div className="xl:col-span-3 space-y-4">
          {!videoUrl ? (
            <div
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onClick={() => mainFileInputRef.current?.click()}
              className="rounded-xl bg-slate-900 border-2 border-dashed border-slate-700 hover:border-cyan-500/50 transition-all cursor-pointer"
            >
              <div className="flex flex-col items-center justify-center py-24 px-8">
                <div className="h-20 w-20 rounded-2xl bg-gradient-to-br from-cyan-500/20 to-blue-500/20 flex items-center justify-center mb-6">
                  <FileVideo className="h-10 w-10 text-cyan-400" />
                </div>
                <h3 className="text-lg font-bold text-white mb-2">Upload a Video for Detection</h3>
                <p className="text-sm text-slate-400 text-center max-w-md mb-4">
                  Drag & drop a video file here, or click to browse. The {modelMetadata.name} model will detect and count all pedestrians in each frame.
                </p>
                <div className="flex items-center gap-3 mb-6">
                  {["MP4", "WebM", "AVI", "MOV"].map((fmt) => (
                    <span key={fmt} className="px-2.5 py-1 rounded-lg bg-slate-800 text-[10px] font-bold text-slate-400 border border-slate-700">
                      {fmt}
                    </span>
                  ))}
                </div>
                <div className="px-6 py-2.5 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-500 text-white text-sm font-medium shadow-lg shadow-cyan-500/20">
                  <Upload className="h-4 w-4 inline mr-2" />
                  Select Video File
                </div>
                {modelStatus === "loading" && (
                  <div className="mt-6 w-64">
                    <div className="flex justify-between text-[10px] mb-1">
                      <span className="text-amber-400">Loading {modelMetadata.name}...</span>
                      <span className="text-amber-400">{modelLoadProgress}%</span>
                    </div>
                    <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-amber-500 to-orange-500 rounded-full transition-all duration-300"
                        style={{ width: `${modelLoadProgress}%` }}
                      />
                    </div>
                  </div>
                )}
              </div>
              <input
                ref={mainFileInputRef}
                type="file"
                accept="video/mp4,video/webm,video/x-msvideo,video/quicktime,video/*"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handleFileUpload(file);
                  // Reset input so same file can be selected again
                  e.target.value = "";
                }}
              />
            </div>
          ) : (
            <div className="rounded-xl bg-slate-900 border border-slate-800 overflow-hidden">
              {/* Video + Overlay Stack */}
              <div className="relative bg-black aspect-video">
                <video
                  ref={videoRef}
                  src={videoUrl}
                  className="w-full h-full object-contain"
                  muted
                  playsInline
                  preload="auto"
                />
                <canvas ref={canvasRef} className="hidden" />
                <canvas
                  ref={overlayCanvasRef}
                  className="absolute inset-0 w-full h-full object-contain pointer-events-none"
                />

                {/* Processing Status Overlay */}
                {processingStatus === "idle" && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/40">
                    <div className="text-center">
                      {!videoReady && (
                        <div className="mb-4">
                          <Loader2 className="h-8 w-8 text-cyan-400 animate-spin mx-auto mb-2" />
                          <p className="text-xs text-slate-400">Loading video...</p>
                        </div>
                      )}
                      <button
                        onClick={startProcessing}
                        disabled={!canStartDetection}
                        className={cn(
                          "flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-bold transition-all shadow-lg mx-auto",
                          canStartDetection
                            ? "bg-gradient-to-r from-cyan-500 to-blue-500 text-white hover:from-cyan-400 hover:to-blue-400 shadow-cyan-500/30"
                            : "bg-slate-700 text-slate-400 cursor-not-allowed"
                        )}
                      >
                        {canStartDetection ? (
                          <>
                            <Play className="h-5 w-5" /> Start Detection
                          </>
                        ) : modelStatus === "loading" ? (
                          <>
                            <Loader2 className="h-5 w-5 animate-spin" /> Loading Model ({modelLoadProgress}%)...
                          </>
                        ) : !videoReady ? (
                          <>
                            <Loader2 className="h-5 w-5 animate-spin" /> Loading Video...
                          </>
                        ) : (
                          <>
                            <AlertCircle className="h-5 w-5" /> Model Error
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                )}

                {processingStatus === "complete" && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/40">
                    <div className="text-center">
                      <CheckCircle2 className="h-12 w-12 text-emerald-400 mx-auto mb-3" />
                      <p className="text-lg font-bold text-white mb-1">Detection Complete!</p>
                      <p className="text-sm text-slate-400 mb-4">
                        Processed {processedFrames} frames • Max {maxPersonCount} people detected
                      </p>
                      <div className="flex items-center gap-3 justify-center">
                        <button
                          onClick={handleReset}
                          className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-slate-800 text-sm text-slate-300 border border-slate-700 hover:bg-slate-700"
                        >
                          <RotateCcw className="h-4 w-4" /> Re-process
                        </button>
                        <button
                          onClick={exportCSV}
                          className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-cyan-500/20 text-sm text-cyan-400 border border-cyan-500/30 hover:bg-cyan-500/30"
                        >
                          <Download className="h-4 w-4" /> Export CSV
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* Live Stats Overlay */}
                {(processingStatus === "processing" || processingStatus === "paused") && (
                  <div className="absolute top-3 left-3 flex items-center gap-2">
                    <div className="px-2 py-1 rounded bg-black/60 backdrop-blur-sm border border-white/10">
                      <span className="text-[10px] font-bold text-cyan-400 font-mono">
                        PERSONS: {currentPersonCount}
                      </span>
                    </div>
                    <div className="px-2 py-1 rounded bg-black/60 backdrop-blur-sm border border-white/10">
                      <span className="text-[10px] font-bold text-violet-400 font-mono">
                        FRAME: {processedFrames}
                      </span>
                    </div>
                    <div className="px-2 py-1 rounded bg-black/60 backdrop-blur-sm border border-white/10">
                      <span className="text-[10px] font-bold text-amber-400 font-mono">
                        {inferenceTime}ms
                      </span>
                    </div>
                    {processingStatus === "paused" && (
                      <div className="px-2 py-1 rounded bg-amber-500/20 border border-amber-500/30">
                        <span className="text-[10px] font-bold text-amber-400 font-mono">
                          PAUSED
                        </span>
                      </div>
                    )}
                  </div>
                )}

                {/* Remove Video Button */}
                <button
                  onClick={(e) => { e.stopPropagation(); removeVideo(); }}
                  className="absolute top-3 right-3 p-1.5 rounded-lg bg-black/60 backdrop-blur-sm border border-white/10 hover:bg-black/80 transition-colors z-10"
                >
                  <X className="h-4 w-4 text-white" />
                </button>
              </div>

              {/* Controls Bar */}
              <div className="p-3 flex items-center justify-between border-t border-slate-800 bg-slate-900 flex-wrap gap-2">
                <div className="flex items-center gap-2">
                  {processingStatus === "idle" && (
                    <button
                      onClick={startProcessing}
                      disabled={!canStartDetection}
                      className={cn(
                        "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors",
                        canStartDetection
                          ? "bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 hover:bg-cyan-500/30"
                          : "bg-slate-800 text-slate-500 border border-slate-700 cursor-not-allowed"
                      )}
                    >
                      <Play className="h-3.5 w-3.5" /> Start
                    </button>
                  )}
                  {(processingStatus === "processing" || processingStatus === "paused") && (
                    <button
                      onClick={togglePause}
                      className={cn(
                        "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors",
                        processingStatus === "processing"
                          ? "bg-amber-500/20 text-amber-400 border border-amber-500/30"
                          : "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                      )}
                    >
                      {processingStatus === "processing" ? (
                        <><Pause className="h-3.5 w-3.5" /> Pause</>
                      ) : (
                        <><Play className="h-3.5 w-3.5" /> Resume</>
                      )}
                    </button>
                  )}
                  <button
                    onClick={handleReset}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-800 text-slate-300 border border-slate-700 hover:bg-slate-700 transition-colors"
                  >
                    <RotateCcw className="h-3.5 w-3.5" /> Reset
                  </button>
                  {(frameResults.length > 0 || allResultsRef.current.length > 0) && (
                    <button
                      onClick={exportCSV}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-800 text-slate-300 border border-slate-700 hover:bg-slate-700 transition-colors"
                    >
                      <Download className="h-3.5 w-3.5" /> Export
                    </button>
                  )}
                </div>

                <div className="flex items-center gap-4 text-xs text-slate-400">
                  {videoFile && (
                    <span className="flex items-center gap-1.5">
                      <FileVideo className="h-3.5 w-3.5 text-cyan-400" />
                      <span className="max-w-[150px] truncate">{videoFile.name}</span>
                      <span className="text-slate-600">
                        ({(videoFile.size / (1024 * 1024)).toFixed(1)} MB)
                      </span>
                    </span>
                  )}
                  <span className="flex items-center gap-1">
                    <Zap className="h-3.5 w-3.5 text-amber-400" />
                    {fps} FPS
                  </span>
                  <span className="flex items-center gap-1">
                    <Target className="h-3.5 w-3.5 text-cyan-400" />
                    {currentPersonCount} people
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Results Statistics */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            {[
              { label: "Current Count", value: currentPersonCount.toString(), icon: Users, color: "text-cyan-400", bgColor: "from-cyan-500/10 to-cyan-500/5" },
              { label: "Max Detected", value: maxPersonCount.toString(), icon: BarChart3, color: "text-violet-400", bgColor: "from-violet-500/10 to-violet-500/5" },
              { label: "Avg Per Frame", value: avgPersonCount > 0 ? avgPersonCount.toFixed(1) : "—", icon: Target, color: "text-emerald-400", bgColor: "from-emerald-500/10 to-emerald-500/5" },
              { label: "Frames Processed", value: processedFrames.toString(), icon: Clock, color: "text-amber-400", bgColor: "from-amber-500/10 to-amber-500/5" },
              { label: "Inference Time", value: `${inferenceTime}ms`, icon: Zap, color: "text-pink-400", bgColor: "from-pink-500/10 to-pink-500/5" },
            ].map((stat) => {
              const Icon = stat.icon;
              return (
                <div key={stat.label} className={cn("rounded-xl bg-gradient-to-br border border-slate-800 p-4", stat.bgColor)}>
                  <div className="flex items-center gap-2 mb-2">
                    <Icon className={cn("h-4 w-4", stat.color)} />
                    <span className="text-[10px] text-slate-500 uppercase tracking-wider">{stat.label}</span>
                  </div>
                  <p className={cn("text-2xl font-bold", stat.color)}>{stat.value}</p>
                </div>
              );
            })}
          </div>

          {/* Live Count Graph */}
          {frameResults.length > 1 && (
            <div className="rounded-xl bg-slate-900 border border-slate-800 p-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                  <BarChart3 className="h-4 w-4 text-cyan-400" />
                  Person Count per Frame
                </h3>
                <span className="text-[10px] text-slate-500">{frameResults.length} total frames</span>
              </div>
              {renderSparkline()}
              <div className="mt-4 h-20 flex items-end gap-px overflow-hidden">
                {frameResults.slice(-100).map((r, i) => {
                  const maxH = Math.max(...frameResults.slice(-100).map((f) => f.personCount), 1);
                  const barH = (r.personCount / maxH) * 100;
                  return (
                    <div
                      key={i}
                      className="flex-1 min-w-[2px] rounded-t-sm bg-cyan-500/60 hover:bg-cyan-400 transition-colors"
                      style={{ height: `${Math.max(barH, 2)}%` }}
                      title={`Frame ${r.frameNumber}: ${r.personCount} people`}
                    />
                  );
                })}
              </div>
              <div className="flex justify-between mt-1 text-[9px] text-slate-600">
                <span>Frame {frameResults.length > 100 ? frameResults.length - 100 : 1}</span>
                <span>Frame {frameResults.length}</span>
              </div>
            </div>
          )}

          {/* Detection Log Table */}
          {frameResults.length > 0 && (
            <div className="rounded-xl bg-slate-900 border border-slate-800 overflow-hidden">
              <div className="p-4 border-b border-slate-800 flex items-center justify-between">
                <h3 className="text-sm font-semibold text-white">Detection Log</h3>
                <span className="text-[10px] text-slate-500">{frameResults.length} frames recorded</span>
              </div>
              <div className="max-h-60 overflow-y-auto">
                <table className="w-full text-xs">
                  <thead className="sticky top-0 bg-slate-800">
                    <tr>
                      <th className="text-left px-4 py-2 text-slate-400 font-medium">Frame</th>
                      <th className="text-left px-4 py-2 text-slate-400 font-medium">Time (s)</th>
                      <th className="text-left px-4 py-2 text-slate-400 font-medium">People</th>
                      <th className="text-left px-4 py-2 text-slate-400 font-medium">Track IDs</th>
                      <th className="text-left px-4 py-2 text-slate-400 font-medium">Confidence</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[...frameResults].reverse().slice(0, 50).map((r) => (
                      <tr key={r.frameNumber} className="border-t border-slate-800/50 hover:bg-slate-800/30">
                        <td className="px-4 py-2 text-white font-mono">#{r.frameNumber}</td>
                        <td className="px-4 py-2 text-slate-300">{r.timestamp.toFixed(2)}s</td>
                        <td className="px-4 py-2">
                          <span className={cn(
                            "px-2 py-0.5 rounded-full text-[10px] font-bold",
                            r.personCount === 0 ? "bg-slate-700 text-slate-400"
                              : r.personCount <= 3 ? "bg-emerald-500/20 text-emerald-400"
                              : r.personCount <= 6 ? "bg-cyan-500/20 text-cyan-400"
                              : "bg-amber-500/20 text-amber-400"
                          )}>
                            {r.personCount} {r.personCount === 1 ? "person" : "people"}
                          </span>
                        </td>
                        <td className="px-4 py-2 text-slate-400 font-mono text-[10px]">
                          {r.detections.map((d) => `#${d.trackId || "?"}`).join(", ") || "—"}
                        </td>
                        <td className="px-4 py-2 text-slate-400 font-mono text-[10px]">
                          {r.detections.length > 0
                            ? `${Math.round((r.detections.reduce((s, d) => s + d.score, 0) / r.detections.length) * 100)}% avg`
                            : "—"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        {/* Right Panel - Controls */}
        <div className="space-y-4">
          {/* Model Info */}
          <div className="rounded-xl bg-slate-900 border border-slate-800 p-4">
            <h3 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
              <Cpu className="h-4 w-4 text-cyan-400" /> Detection Model
            </h3>
            <div className="space-y-3">
              <div className="p-3 rounded-lg bg-cyan-500/5 border border-cyan-500/20">
                <p className="text-xs font-bold text-cyan-400">{modelMetadata.name}</p>
                <p className="text-[10px] text-slate-400 mt-1">{modelMetadata.backbone} backbone • {modelMetadata.runtime}</p>
              </div>
              <div className="space-y-2 text-xs">
                {[
                  { label: "Backbone", value: modelMetadata.backbone },
                  { label: "Dataset", value: modelMetadata.dataset },
                  { label: "Filtering", value: "Person class only" },
                  { label: "Runtime", value: modelMetadata.runtime },
                  { label: "Precision", value: modelMetadata.precision },
                ].map((item) => (
                  <div key={item.label} className="flex justify-between p-2 rounded bg-slate-800/50">
                    <span className="text-slate-400">{item.label}</span>
                    <span className="text-white font-medium">{item.value}</span>
                  </div>
                ))}
            </div>

              {modelStatus === "loading" && (
                <div className="space-y-1.5">
                  <div className="flex justify-between text-[10px]">
                    <span className="text-slate-400">Loading model...</span>
                    <span className="text-cyan-400">{modelLoadProgress}%</span>
                  </div>
                  <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full transition-all duration-300" style={{ width: `${modelLoadProgress}%` }} />
                  </div>
                </div>
              )}

              {modelStatus === "error" && (
                <button
                  onClick={() => window.location.reload()}
                  className="w-full py-2 rounded-lg bg-red-500/20 text-red-400 border border-red-500/30 text-xs font-medium hover:bg-red-500/30"
                >
                  Retry (Reload)
                </button>
              )}
            </div>
          </div>


          {/* Confidence Threshold */}
          <div className="rounded-xl bg-slate-900 border border-slate-800 p-4">
            <h3 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
              <Gauge className="h-4 w-4 text-emerald-400" /> Confidence Threshold
            </h3>
            <div className="space-y-3">
              <input type="range" min="0.1" max="0.95" step="0.05" value={confidenceThreshold}
                onChange={(e) => setConfidenceThreshold(parseFloat(e.target.value))}
                className="w-full accent-cyan-500" />
              <div className="flex justify-between text-xs text-slate-400">
                <span>10%</span>
                <span className="font-bold text-cyan-400">{(confidenceThreshold * 100).toFixed(0)}%</span>
                <span>95%</span>
              </div>
              <p className="text-[10px] text-slate-500">Higher = fewer but more confident detections</p>
            </div>
          </div>

          {/* Playback Speed */}
          <div className="rounded-xl bg-slate-900 border border-slate-800 p-4">
            <h3 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
              <Play className="h-4 w-4 text-violet-400" /> Playback Speed
            </h3>
            <div className="grid grid-cols-4 gap-1">
              {[0.25, 0.5, 1, 2].map((speed) => (
                <button key={speed} onClick={() => setPlaybackSpeed(speed)}
                  className={cn(
                    "py-1.5 rounded-lg text-xs font-medium transition-colors",
                    playbackSpeed === speed
                      ? "bg-violet-500/20 text-violet-400 border border-violet-500/30"
                      : "bg-slate-800 text-slate-400 border border-slate-700 hover:bg-slate-700"
                  )}
                >
                  {speed}x
                </button>
              ))}
            </div>
          </div>

          {/* Visualization Options */}
          <div className="rounded-xl bg-slate-900 border border-slate-800 p-4">
            <h3 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
              <Layers className="h-4 w-4 text-amber-400" /> Visualization
            </h3>
            <div className="space-y-3">
              {[
                { label: "Bounding Boxes", value: showBoundingBoxes, setter: setShowBoundingBoxes, icon: Box },
                { label: "Track Labels", value: showLabels, setter: setShowLabels, icon: ScanEye },
                { label: "Motion Trails", value: showTrails, setter: setShowTrails, icon: Target },
              ].map((opt) => {
                const Icon = opt.icon;
                return (
                  <button key={opt.label} onClick={() => opt.setter(!opt.value)}
                    className="w-full flex items-center justify-between p-2.5 rounded-lg bg-slate-800/50 border border-slate-700/50 hover:bg-slate-800 transition-colors">
                    <span className="flex items-center gap-2 text-xs text-slate-300">
                      <Icon className="h-3.5 w-3.5" /> {opt.label}
                    </span>
                    <div className={cn("w-8 h-4 rounded-full transition-colors relative", opt.value ? "bg-cyan-500" : "bg-slate-600")}>
                      <div className={cn("absolute top-0.5 w-3 h-3 rounded-full bg-white transition-transform", opt.value ? "translate-x-4" : "translate-x-0.5")} />
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Upload Another Video */}
          <div className="rounded-xl bg-slate-900 border border-slate-800 p-4">
            <h3 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
              <Upload className="h-4 w-4 text-cyan-400" /> Upload Video
            </h3>
            <div
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onClick={() => sideFileInputRef.current?.click()}
              className="border-2 border-dashed border-slate-700 rounded-lg p-4 text-center hover:border-cyan-500/50 transition-colors cursor-pointer"
            >
              <Upload className="h-6 w-6 text-slate-500 mx-auto mb-1.5" />
              <p className="text-[10px] text-slate-400">Drop video or click to upload</p>
              <p className="text-[10px] text-slate-600 mt-0.5">MP4, WebM, AVI, MOV</p>
            </div>
            <input
              ref={sideFileInputRef}
              type="file"
              accept="video/mp4,video/webm,video/x-msvideo,video/quicktime,video/*"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handleFileUpload(file);
                e.target.value = "";
              }}
            />
          </div>

          {/* How It Works */}
          <div className="rounded-xl bg-gradient-to-br from-cyan-500/5 to-violet-500/5 border border-slate-800 p-4">
            <h3 className="text-sm font-semibold text-white mb-2 flex items-center gap-2">
              <ScanEye className="h-4 w-4 text-cyan-400" /> How It Works
            </h3>
            <div className="space-y-2">
              {[
                "1. COCO-SSD model loads in browser (TensorFlow.js)",
                "2. Video frames captured via HTML5 Canvas API",
                "3. Each frame runs through MobileNet V2 backbone",
                "4. 'Person' class detections filtered by confidence",
                "5. IoU-based tracking assigns consistent IDs",
                "6. Bounding boxes & count overlay on video",
                "7. Per-frame results logged + CSV export",
              ].map((step) => (
                <div key={step} className="flex items-start gap-2">
                  <div className="h-1 w-1 rounded-full bg-cyan-400 mt-1.5 shrink-0" />
                  <span className="text-[10px] text-slate-400">{step}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
