import { useState } from "react";
import {
  BookOpen,
  Code,
  Cpu,
  Layers,
  GitBranch,
  Workflow,
  ChevronDown,
  ChevronRight,
  ExternalLink,
  Server,
  Monitor,
  Zap,
  Target,
  Eye,
  Settings,
  Activity,
} from "lucide-react";
import { cn } from "../utils/cn";

type DocSection = "overview" | "architecture" | "models" | "backend" | "frontend" | "tracking" | "deployment" | "api";

interface Section {
  id: DocSection;
  title: string;
  icon: React.ElementType;
}

const sections: Section[] = [
  { id: "overview", title: "System Overview", icon: BookOpen },
  { id: "architecture", title: "Architecture", icon: Layers },
  { id: "models", title: "Detection Models", icon: Cpu },
  { id: "tracking", title: "Tracking Algorithm", icon: Eye },
  { id: "backend", title: "Backend (Python)", icon: Server },
  { id: "frontend", title: "Frontend (React)", icon: Monitor },
  { id: "api", title: "API Reference", icon: Code },
  { id: "deployment", title: "Deployment Guide", icon: Settings },
];

function CodeBlock({ code, language = "python" }: { code: string; language?: string }) {
  return (
    <div className="rounded-lg bg-slate-950 border border-slate-800 overflow-hidden">
      <div className="flex items-center justify-between px-3 py-1.5 bg-slate-900 border-b border-slate-800">
        <span className="text-[10px] text-slate-500 uppercase tracking-wider font-mono">{language}</span>
        <button className="text-[10px] text-slate-500 hover:text-slate-300 transition-colors">Copy</button>
      </div>
      <pre className="p-4 overflow-x-auto">
        <code className="text-xs font-mono text-emerald-400 leading-relaxed">{code}</code>
      </pre>
    </div>
  );
}

function InfoCard({ title, items }: { title: string; items: { label: string; value: string }[] }) {
  return (
    <div className="rounded-lg bg-slate-800/50 border border-slate-700/50 p-4">
      <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-3">{title}</h4>
      <div className="space-y-2">
        {items.map((item) => (
          <div key={item.label} className="flex items-start justify-between gap-2">
            <span className="text-xs text-slate-400">{item.label}</span>
            <span className="text-xs text-white font-medium text-right">{item.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export function Documentation() {
  const [activeSection, setActiveSection] = useState<DocSection>("overview");
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);

  const renderContent = () => {
    switch (activeSection) {
      case "overview":
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-bold text-white mb-2">System Overview</h2>
              <p className="text-sm text-slate-300 leading-relaxed">
                PedTrack AI is a comprehensive <strong className="text-cyan-400">Pedestrian Detection and Tracking Surveillance System</strong> designed 
                to monitor, detect, and track pedestrians in real-time across multiple camera feeds. The system leverages state-of-the-art 
                deep learning models for accurate detection with robust multi-object tracking capabilities.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <InfoCard title="Detection Engine" items={[
                { label: "Primary Model", value: "YOLOv8 (Ultralytics)" },
                { label: "Backbone", value: "CSPDarknet53" },
                { label: "Input Resolution", value: "640×640" },
                { label: "Detection Speed", value: "23ms @ GPU" },
                { label: "mAP@50", value: "44.9% (COCO)" },
              ]} />
              <InfoCard title="Tracking System" items={[
                { label: "Algorithm", value: "DeepSORT" },
                { label: "Re-ID Model", value: "OSNet" },
                { label: "Max Track Age", value: "70 frames" },
                { label: "IOU Threshold", value: "0.3" },
                { label: "Kalman Filter", value: "Linear Motion" },
              ]} />
              <InfoCard title="System Specs" items={[
                { label: "Backend", value: "Python + FastAPI" },
                { label: "Frontend", value: "React + TypeScript" },
                { label: "Video Processing", value: "OpenCV" },
                { label: "GPU Support", value: "CUDA / TensorRT" },
                { label: "Database", value: "PostgreSQL + Redis" },
              ]} />
            </div>

            <div className="rounded-xl bg-gradient-to-r from-emerald-500/10 to-cyan-500/10 border border-emerald-500/20 p-5 mb-4">
              <h3 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
                <Target className="h-4 w-4 text-emerald-400" /> Browser-Based Detection (Live Demo)
              </h3>
              <p className="text-xs text-slate-300 leading-relaxed mb-3">
                The <strong className="text-emerald-400">Detection Engine</strong> page features <strong className="text-emerald-400">real pedestrian detection in the browser</strong> using 
                TensorFlow.js and the COCO-SSD model (MobileNet V2 backbone). Upload any video and watch real-time bounding boxes, 
                tracking IDs, and per-frame person counts — no backend required!
              </p>
              <div className="grid grid-cols-2 gap-2 text-[10px]">
                {[
                  "TensorFlow.js + WebGL GPU acceleration",
                  "COCO-SSD MobileNet V2 (80-class model)",
                  "Person-class filtering with confidence threshold",
                  "IoU-based frame-to-frame tracking",
                  "Per-frame person count graph",
                  "CSV export of detection results",
                ].map((f) => (
                  <div key={f} className="flex items-center gap-1.5 text-slate-300">
                    <div className="h-1.5 w-1.5 rounded-full bg-emerald-400 shrink-0" />
                    {f}
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-xl bg-gradient-to-r from-cyan-500/10 to-violet-500/10 border border-cyan-500/20 p-5">
              <h3 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
                <Zap className="h-4 w-4 text-cyan-400" /> Key Features
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {[
                  "Real-time pedestrian detection with YOLOv8",
                  "Browser-based detection via COCO-SSD (TensorFlow.js)",
                  "Video upload with per-frame person counting",
                  "Multi-object tracking with DeepSORT + IoU tracking",
                  "Multi-camera support with unified dashboard",
                  "Zone-based monitoring with crowd alerts",
                  "Heatmap generation for traffic analysis",
                  "Loitering & anomaly detection",
                  "REST API for third-party integration",
                  "Configurable confidence thresholds",
                  "Motion trail visualization",
                  "CSV export of detection results",
                ].map((feature) => (
                  <div key={feature} className="flex items-center gap-2 text-xs text-slate-300">
                    <div className="h-1.5 w-1.5 rounded-full bg-cyan-400 shrink-0" />
                    {feature}
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h3 className="text-sm font-bold text-white mb-3">Technology Stack</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {[
                  { name: "Python 3.10+", desc: "Backend runtime", color: "text-blue-400" },
                  { name: "FastAPI", desc: "REST API framework", color: "text-emerald-400" },
                  { name: "PyTorch", desc: "Deep learning", color: "text-orange-400" },
                  { name: "Ultralytics", desc: "YOLOv8 impl.", color: "text-violet-400" },
                  { name: "OpenCV", desc: "Video processing", color: "text-cyan-400" },
                  { name: "React 19", desc: "Frontend UI", color: "text-sky-400" },
                  { name: "TypeScript", desc: "Type safety", color: "text-blue-400" },
                  { name: "PostgreSQL", desc: "Data storage", color: "text-indigo-400" },
                ].map((tech) => (
                  <div key={tech.name} className="rounded-lg bg-slate-800/50 border border-slate-700/50 p-3">
                    <p className={cn("text-sm font-bold", tech.color)}>{tech.name}</p>
                    <p className="text-[10px] text-slate-500 mt-0.5">{tech.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );

      case "architecture":
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-bold text-white mb-2">System Architecture</h2>
              <p className="text-sm text-slate-300 leading-relaxed">
                The system follows a modular microservices architecture with clear separation between video processing, 
                detection, tracking, and presentation layers.
              </p>
            </div>

            {/* Architecture Diagram */}
            <div className="rounded-xl bg-slate-950 border border-slate-800 p-6">
              <h3 className="text-sm font-bold text-white mb-6 text-center">Architecture Diagram</h3>
              <div className="space-y-4 max-w-3xl mx-auto">
                {/* Input Layer */}
                <div className="text-center">
                  <div className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-cyan-500/10 border border-cyan-500/30">
                    <Monitor className="h-4 w-4 text-cyan-400" />
                    <span className="text-xs font-bold text-cyan-400">INPUT LAYER</span>
                  </div>
                  <div className="grid grid-cols-3 gap-2 mt-2">
                    {["RTSP Cameras", "Video Files", "USB Webcam"].map((s) => (
                      <div key={s} className="px-3 py-1.5 rounded bg-slate-800 text-[10px] text-slate-400 text-center">{s}</div>
                    ))}
                  </div>
                </div>
                <div className="text-center text-slate-600">↓</div>

                {/* Processing Layer */}
                <div className="text-center">
                  <div className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-violet-500/10 border border-violet-500/30">
                    <Cpu className="h-4 w-4 text-violet-400" />
                    <span className="text-xs font-bold text-violet-400">PROCESSING LAYER</span>
                  </div>
                  <div className="grid grid-cols-4 gap-2 mt-2">
                    {["Frame Decoder (OpenCV)", "Pre-processing (Resize/Normalize)", "YOLOv8 Detection", "DeepSORT Tracking"].map((s) => (
                      <div key={s} className="px-2 py-1.5 rounded bg-slate-800 text-[10px] text-slate-400 text-center">{s}</div>
                    ))}
                  </div>
                </div>
                <div className="text-center text-slate-600">↓</div>

                {/* Analysis Layer */}
                <div className="text-center">
                  <div className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-emerald-500/10 border border-emerald-500/30">
                    <Activity className="h-4 w-4 text-emerald-400" />
                    <span className="text-xs font-bold text-emerald-400">ANALYSIS LAYER</span>
                  </div>
                  <div className="grid grid-cols-4 gap-2 mt-2">
                    {["Zone Detection", "Crowd Analysis", "Anomaly Detection", "Heatmap Generation"].map((s) => (
                      <div key={s} className="px-2 py-1.5 rounded bg-slate-800 text-[10px] text-slate-400 text-center">{s}</div>
                    ))}
                  </div>
                </div>
                <div className="text-center text-slate-600">↓</div>

                {/* API Layer */}
                <div className="text-center">
                  <div className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-amber-500/10 border border-amber-500/30">
                    <Server className="h-4 w-4 text-amber-400" />
                    <span className="text-xs font-bold text-amber-400">API LAYER (FastAPI)</span>
                  </div>
                  <div className="grid grid-cols-3 gap-2 mt-2">
                    {["REST Endpoints", "WebSocket Stream", "Auth & Rate Limiting"].map((s) => (
                      <div key={s} className="px-2 py-1.5 rounded bg-slate-800 text-[10px] text-slate-400 text-center">{s}</div>
                    ))}
                  </div>
                </div>
                <div className="text-center text-slate-600">↓</div>

                {/* Presentation Layer */}
                <div className="text-center">
                  <div className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-sky-500/10 border border-sky-500/30">
                    <Monitor className="h-4 w-4 text-sky-400" />
                    <span className="text-xs font-bold text-sky-400">PRESENTATION (React)</span>
                  </div>
                  <div className="grid grid-cols-4 gap-2 mt-2">
                    {["Dashboard", "Live Monitor", "Analytics", "Alerts"].map((s) => (
                      <div key={s} className="px-2 py-1.5 rounded bg-slate-800 text-[10px] text-slate-400 text-center">{s}</div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Data Flow */}
            <div>
              <h3 className="text-sm font-bold text-white mb-3">Data Flow Pipeline</h3>
              <div className="space-y-2">
                {[
                  { step: "1", title: "Frame Acquisition", desc: "OpenCV captures frames from RTSP streams / video files at configured FPS" },
                  { step: "2", title: "Pre-processing", desc: "Resize to 640×640, normalize pixel values, convert BGR→RGB for model input" },
                  { step: "3", title: "Object Detection", desc: "YOLOv8 processes frame through CSPDarknet53 backbone → FPN neck → Detection head" },
                  { step: "4", title: "NMS Filtering", desc: "Non-Maximum Suppression filters overlapping boxes (IoU > 0.45)" },
                  { step: "5", title: "Feature Extraction", desc: "OSNet extracts 512-dim appearance features for each detection" },
                  { step: "6", title: "DeepSORT Tracking", desc: "Kalman filter prediction + Hungarian algorithm matches detections to existing tracks" },
                  { step: "7", title: "Zone Analysis", desc: "Check each tracked person against defined zone polygons for alerts" },
                  { step: "8", title: "Result Broadcasting", desc: "Send annotated frame + metadata via WebSocket to connected clients" },
                ].map((item) => (
                  <div key={item.step} className="flex items-start gap-3 p-3 rounded-lg bg-slate-800/50">
                    <div className="h-6 w-6 rounded-full bg-cyan-500/20 flex items-center justify-center shrink-0">
                      <span className="text-[10px] font-bold text-cyan-400">{item.step}</span>
                    </div>
                    <div>
                      <p className="text-xs font-bold text-white">{item.title}</p>
                      <p className="text-[10px] text-slate-400 mt-0.5">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );

      case "models":
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-bold text-white mb-2">Detection Models</h2>
              <p className="text-sm text-slate-300 leading-relaxed">
                We use <strong className="text-cyan-400">YOLOv8</strong> (You Only Look Once v8) by Ultralytics as our primary detection model. 
                YOLOv8 represents the latest evolution of the YOLO family, offering superior speed-accuracy trade-offs.
              </p>
            </div>

            {/* Model Comparison Table */}
            <div className="rounded-xl bg-slate-900 border border-slate-800 overflow-hidden">
              <div className="p-4 border-b border-slate-800">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Target className="h-4 w-4 text-cyan-400" /> YOLOv8 Model Variants
                </h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="bg-slate-800/50">
                      {["Model", "Params", "FLOPs", "mAP@50", "mAP@50-95", "Speed (ms)", "Use Case"].map((h) => (
                        <th key={h} className="text-left px-4 py-2.5 text-slate-400 font-medium">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {[
                      { model: "YOLOv8n", params: "3.2M", flops: "8.7G", map50: "37.3%", map95: "18.7%", speed: "12ms", use: "Edge / Mobile", active: false },
                      { model: "YOLOv8s", params: "11.2M", flops: "28.6G", map50: "44.9%", map95: "22.4%", speed: "23ms", use: "Balanced ✓", active: true },
                      { model: "YOLOv8m", params: "25.9M", flops: "78.9G", map50: "50.2%", map95: "27.3%", speed: "45ms", use: "High Accuracy", active: false },
                      { model: "YOLOv8l", params: "43.7M", flops: "165.2G", map50: "52.9%", map95: "29.0%", speed: "72ms", use: "Server GPU", active: false },
                      { model: "YOLOv8x", params: "68.2M", flops: "257.8G", map50: "53.9%", map95: "30.2%", speed: "95ms", use: "Max Accuracy", active: false },
                    ].map((r) => (
                      <tr key={r.model} className={cn("border-t border-slate-800", r.active && "bg-cyan-500/5")}>
                        <td className={cn("px-4 py-2.5 font-bold", r.active ? "text-cyan-400" : "text-white")}>{r.model}</td>
                        <td className="px-4 py-2.5 text-slate-300">{r.params}</td>
                        <td className="px-4 py-2.5 text-slate-300">{r.flops}</td>
                        <td className="px-4 py-2.5 text-emerald-400 font-medium">{r.map50}</td>
                        <td className="px-4 py-2.5 text-slate-300">{r.map95}</td>
                        <td className="px-4 py-2.5 text-amber-400">{r.speed}</td>
                        <td className="px-4 py-2.5 text-slate-300">{r.use}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Model Architecture */}
            <div className="rounded-xl bg-slate-900 border border-slate-800 p-5">
              <h3 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
                <Layers className="h-4 w-4 text-violet-400" /> YOLOv8 Architecture
              </h3>
              <div className="space-y-4 text-xs text-slate-300 leading-relaxed">
                <div>
                  <h4 className="text-white font-bold mb-1">Backbone: CSPDarknet53</h4>
                  <p>Cross-Stage Partial connections with Darknet53 for efficient feature extraction. Uses C2f modules (Cross Stage Partial bottleneck with 2 convolutions) replacing C3 modules from YOLOv5 for improved gradient flow.</p>
                </div>
                <div>
                  <h4 className="text-white font-bold mb-1">Neck: PAN-FPN (Path Aggregation Network)</h4>
                  <p>Feature Pyramid Network with Path Aggregation for multi-scale feature fusion. Combines low-level spatial features with high-level semantic features for detecting pedestrians at various distances.</p>
                </div>
                <div>
                  <h4 className="text-white font-bold mb-1">Head: Decoupled Anchor-Free</h4>
                  <p>YOLOv8 uses an anchor-free detection head with decoupled classification and regression branches. This eliminates the need for anchor box hyperparameters and improves detection generalization.</p>
                </div>
                <div>
                  <h4 className="text-white font-bold mb-1">Loss Function</h4>
                  <p>Combines CIoU loss for bounding box regression, Binary Cross-Entropy for classification, and Distribution Focal Loss (DFL) for refined box prediction.</p>
                </div>
              </div>
            </div>

            {/* Why YOLOv8 */}
            <div className="rounded-xl bg-gradient-to-r from-cyan-500/5 to-violet-500/5 border border-slate-800 p-5">
              <h3 className="text-sm font-bold text-white mb-3">Why YOLOv8 for Pedestrian Detection?</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {[
                  { title: "Real-time Speed", desc: "23ms inference on GPU enables 30+ FPS processing of live video streams" },
                  { title: "High Accuracy", desc: "44.9% mAP@50 on COCO, with fine-tuning on pedestrian datasets achieving 60%+ mAP" },
                  { title: "Anchor-Free Design", desc: "No anchor box tuning required, better generalization across camera angles and distances" },
                  { title: "Multi-Scale Detection", desc: "PAN-FPN enables detection of pedestrians at various distances (near and far from camera)" },
                  { title: "Easy Fine-Tuning", desc: "Ultralytics API makes custom training on surveillance datasets straightforward" },
                  { title: "TensorRT Support", desc: "Export to TensorRT for 2-3x inference speedup on NVIDIA GPUs" },
                ].map((item) => (
                  <div key={item.title} className="p-3 rounded-lg bg-slate-800/50">
                    <p className="text-xs font-bold text-cyan-400">{item.title}</p>
                    <p className="text-[10px] text-slate-400 mt-1">{item.desc}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* COCO-SSD Browser Model */}
            <div className="rounded-xl bg-gradient-to-r from-emerald-500/5 to-cyan-500/5 border border-emerald-500/20 p-5">
              <h3 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
                <Zap className="h-4 w-4 text-emerald-400" /> Browser Detection: COCO-SSD (TensorFlow.js)
              </h3>
              <p className="text-xs text-slate-300 leading-relaxed mb-3">
                For the browser-based Detection Engine, we use the <strong className="text-emerald-400">COCO-SSD</strong> model 
                with a <strong className="text-emerald-400">MobileNet V2</strong> backbone running entirely client-side via TensorFlow.js. 
                This enables real pedestrian detection without any server infrastructure.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
                {[
                  { title: "Zero Backend Required", desc: "Model runs entirely in browser using WebGL GPU acceleration" },
                  { title: "MobileNet V2 Backbone", desc: "Lightweight architecture optimized for mobile/web inference" },
                  { title: "COCO Dataset", desc: "Pre-trained on 80 object classes, filtered for 'person' class only" },
                  { title: "IoU Tracking", desc: "Simple but effective frame-to-frame tracking using Intersection over Union matching" },
                ].map((item) => (
                  <div key={item.title} className="p-3 rounded-lg bg-slate-800/50">
                    <p className="text-xs font-bold text-emerald-400">{item.title}</p>
                    <p className="text-[10px] text-slate-400 mt-1">{item.desc}</p>
                  </div>
                ))}
              </div>
            </div>

            <CodeBlock
              code={`// Browser-based COCO-SSD Detection (TypeScript/React)
import * as tf from '@tensorflow/tfjs';
import * as cocoSsd from '@tensorflow-models/coco-ssd';

// Load model (runs once)
await tf.setBackend('webgl');
await tf.ready();
const model = await cocoSsd.load({ base: 'lite_mobilenet_v2' });

// Detect pedestrians in a canvas frame
const predictions = await model.detect(canvas, 20, 0.5);
const persons = predictions.filter(p => p.class === 'person');

// Each detection: { bbox: [x,y,w,h], class: 'person', score: 0.92 }
console.log(\`Found \${persons.length} people\`);`}
              language="typescript"
            />

            <CodeBlock
              code={`# YOLOv8 Pedestrian Detection - inference.py
from ultralytics import YOLO
import cv2

# Load pre-trained model (or custom fine-tuned model)
model = YOLO("yolov8s.pt")  # Using YOLOv8-Small variant

# Configure for pedestrian detection only
# COCO class 0 = "person"
PERSON_CLASS_ID = 0
CONFIDENCE_THRESHOLD = 0.65

def detect_pedestrians(frame):
    """Run YOLOv8 inference on a video frame."""
    results = model(
        frame,
        classes=[PERSON_CLASS_ID],  # Filter person class only
        conf=CONFIDENCE_THRESHOLD,
        iou=0.45,          # NMS IoU threshold
        imgsz=640,          # Input resolution
        device="cuda:0",    # GPU acceleration
        verbose=False
    )
    
    detections = []
    for result in results:
        for box in result.boxes:
            x1, y1, x2, y2 = box.xyxy[0].cpu().numpy()
            confidence = float(box.conf[0])
            detections.append({
                "bbox": [x1, y1, x2 - x1, y2 - y1],
                "confidence": confidence,
                "class": "person"
            })
    
    return detections`}
              language="python"
            />
          </div>
        );

      case "tracking":
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-bold text-white mb-2">Tracking Algorithm: DeepSORT</h2>
              <p className="text-sm text-slate-300 leading-relaxed">
                We implement <strong className="text-cyan-400">DeepSORT</strong> (Deep Simple Online and Realtime Tracking) for 
                multi-object tracking. DeepSORT extends the original SORT algorithm by integrating deep appearance features 
                for robust re-identification across frames.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <InfoCard title="DeepSORT Parameters" items={[
                { label: "Max Age", value: "70 frames" },
                { label: "Min Hits", value: "3 frames" },
                { label: "IoU Threshold", value: "0.3" },
                { label: "Max Cosine Distance", value: "0.4" },
                { label: "NN Budget", value: "100 features" },
                { label: "Kalman Filter", value: "8-state linear" },
              ]} />
              <InfoCard title="Re-ID Model (OSNet)" items={[
                { label: "Architecture", value: "OSNet-x1.0" },
                { label: "Feature Dim", value: "512" },
                { label: "Training Data", value: "Market-1501" },
                { label: "Rank-1 Accuracy", value: "94.8%" },
                { label: "mAP", value: "84.9%" },
                { label: "Inference Speed", value: "2ms/crop" },
              ]} />
            </div>

            <div className="rounded-xl bg-slate-900 border border-slate-800 p-5">
              <h3 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
                <Workflow className="h-4 w-4 text-emerald-400" /> How DeepSORT Works
              </h3>
              <div className="space-y-3">
                {[
                  { step: "1. Prediction", desc: "Kalman filter predicts the next state (position, velocity) for each existing track" },
                  { step: "2. Detection", desc: "YOLOv8 provides new bounding box detections for the current frame" },
                  { step: "3. Feature Extraction", desc: "OSNet extracts 512-dim appearance features from each detection crop" },
                  { step: "4. Cost Matrix", desc: "Compute combined cost using Mahalanobis distance (motion) + cosine distance (appearance)" },
                  { step: "5. Matching", desc: "Hungarian algorithm performs optimal assignment between predictions and detections" },
                  { step: "6. Cascade Match", desc: "Priority matching for recently seen tracks; unmatched detections create new tracks" },
                  { step: "7. Update", desc: "Kalman filter updates matched tracks; increment age for unmatched tracks" },
                  { step: "8. Cleanup", desc: "Remove tracks exceeding max_age; confirm tentative tracks reaching min_hits" },
                ].map((item) => (
                  <div key={item.step} className="flex items-start gap-3 p-2 rounded-lg bg-slate-800/30">
                    <span className="text-[10px] font-bold text-emerald-400 whitespace-nowrap">{item.step}</span>
                    <span className="text-[11px] text-slate-300">{item.desc}</span>
                  </div>
                ))}
              </div>
            </div>

            <CodeBlock
              code={`# DeepSORT Tracking Implementation - tracker.py
from deep_sort_realtime.deepsort_tracker import DeepSort
import numpy as np

class PedestrianTracker:
    def __init__(self):
        self.tracker = DeepSort(
            max_age=70,              # Frames before track deletion
            n_init=3,                # Detections before track confirmation
            max_iou_distance=0.7,    # Max IoU distance for matching
            max_cosine_distance=0.4, # Max appearance feature distance
            nn_budget=100,           # Gallery size per track
            embedder="osnet_x1_0",   # Re-ID model
            embedder_gpu=True,
        )
    
    def update(self, detections, frame):
        """
        Update tracks with new detections.
        
        Args:
            detections: List of [x, y, w, h, confidence]
            frame: Current video frame (for feature extraction)
        
        Returns:
            List of tracked objects with IDs
        """
        if not detections:
            self.tracker.update_tracks([], frame=frame)
            return []
        
        # Format: [[x, y, w, h, conf], ...]
        bbs = np.array([[d[0], d[1], d[2], d[3]] for d in detections])
        confs = np.array([d[4] for d in detections])
        
        tracks = self.tracker.update_tracks(
            raw_detections=list(zip(bbs, confs)),
            frame=frame
        )
        
        results = []
        for track in tracks:
            if not track.is_confirmed():
                continue
            track_id = track.track_id
            bbox = track.to_ltrb()  # [left, top, right, bottom]
            results.append({
                "track_id": track_id,
                "bbox": bbox,
                "age": track.age,
                "hits": track.hits
            })
        
        return results`}
              language="python"
            />

            <div className="rounded-xl bg-gradient-to-r from-emerald-500/5 to-cyan-500/5 border border-slate-800 p-5">
              <h3 className="text-sm font-bold text-white mb-3">Why DeepSORT?</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs text-slate-300">
                {[
                  "Handles occlusions with appearance-based re-identification",
                  "Maintains consistent IDs across frames (low ID switching rate)",
                  "Kalman filter provides smooth trajectory estimation",
                  "Real-time performance (~2ms overhead per frame)",
                  "Extensible: works with any detector (YOLOv8, Faster R-CNN, etc.)",
                  "Well-tested on surveillance and pedestrian tracking benchmarks",
                ].map((p) => (
                  <div key={p} className="flex items-start gap-2">
                    <div className="h-1.5 w-1.5 rounded-full bg-emerald-400 mt-1 shrink-0" />
                    <span>{p}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );

      case "backend":
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-bold text-white mb-2">Backend Architecture (Python)</h2>
              <p className="text-sm text-slate-300 leading-relaxed">
                The backend is built with <strong className="text-cyan-400">FastAPI</strong> for high-performance async request handling, 
                with <strong className="text-cyan-400">OpenCV</strong> for video processing and <strong className="text-cyan-400">PyTorch</strong> for model inference.
              </p>
            </div>

            <div>
              <h3 className="text-sm font-bold text-white mb-3">Project Structure</h3>
              <CodeBlock
                code={`backend/
├── app/
│   ├── __init__.py
│   ├── main.py              # FastAPI entry point
│   ├── config.py             # Configuration settings
│   ├── models/
│   │   ├── detector.py       # YOLOv8 detection wrapper
│   │   ├── tracker.py        # DeepSORT tracking wrapper
│   │   └── analyzer.py       # Zone/crowd analysis
│   ├── api/
│   │   ├── routes.py         # REST API endpoints
│   │   ├── websocket.py      # WebSocket streaming
│   │   └── schemas.py        # Pydantic models
│   ├── core/
│   │   ├── video_processor.py    # Frame capture pipeline
│   │   ├── zone_manager.py       # Zone polygon definitions
│   │   ├── alert_engine.py       # Alert rule engine
│   │   └── heatmap_generator.py  # Heatmap accumulator
│   ├── db/
│   │   ├── database.py       # PostgreSQL connection
│   │   ├── models.py         # SQLAlchemy ORM models
│   │   └── redis_client.py   # Redis cache client
│   └── utils/
│       ├── logger.py         # Structured logging
│       └── gpu_utils.py      # CUDA memory management
├── weights/
│   ├── yolov8s.pt            # Detection model weights
│   └── osnet_x1_0.pth        # Re-ID model weights
├── requirements.txt
├── Dockerfile
└── docker-compose.yml`}
                language="bash"
              />
            </div>

            <CodeBlock
              code={`# main.py - FastAPI Application
from fastapi import FastAPI, WebSocket
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from app.models.detector import PedestrianDetector
from app.models.tracker import PedestrianTracker
from app.core.video_processor import VideoProcessor
from app.api.routes import router

detector = PedestrianDetector(model_path="weights/yolov8s.pt")
tracker = PedestrianTracker()

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: load models
    detector.load_model()
    print("✓ YOLOv8 model loaded on GPU")
    yield
    # Shutdown: cleanup
    detector.cleanup()

app = FastAPI(
    title="PedTrack AI API",
    version="1.0.0",
    lifespan=lifespan
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(router, prefix="/api/v1")

@app.websocket("/ws/stream/{camera_id}")
async def video_stream(websocket: WebSocket, camera_id: str):
    await websocket.accept()
    processor = VideoProcessor(camera_id, detector, tracker)
    
    async for result in processor.process_stream():
        await websocket.send_json({
            "frame_id": result.frame_id,
            "detections": result.detections,
            "tracks": result.tracks,
            "alerts": result.alerts,
            "timestamp": result.timestamp
        })`}
              language="python"
            />

            <div>
              <h3 className="text-sm font-bold text-white mb-3">Key Dependencies</h3>
              <CodeBlock
                code={`# requirements.txt
fastapi==0.104.1
uvicorn[standard]==0.24.0
ultralytics==8.0.200        # YOLOv8
deep-sort-realtime==1.3.2   # DeepSORT tracker
opencv-python-headless==4.8.1
torch==2.1.1+cu121          # PyTorch with CUDA
torchvision==0.16.1+cu121
numpy==1.25.2
sqlalchemy==2.0.23          # Database ORM
asyncpg==0.29.0             # Async PostgreSQL
redis==5.0.1                # Caching
pydantic==2.5.2             # Data validation
python-multipart==0.0.6     # File uploads
websockets==12.0            # WebSocket support`}
                language="text"
              />
            </div>
          </div>
        );

      case "frontend":
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-bold text-white mb-2">Frontend Architecture (React)</h2>
              <p className="text-sm text-slate-300 leading-relaxed">
                The frontend is built with <strong className="text-cyan-400">React 19 + TypeScript</strong>, using <strong className="text-cyan-400">Vite</strong> as 
                the build tool and <strong className="text-cyan-400">Tailwind CSS</strong> for styling. Charts are rendered with <strong className="text-cyan-400">Recharts</strong>.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <InfoCard title="Frontend Stack" items={[
                { label: "Framework", value: "React 19" },
                { label: "Language", value: "TypeScript 5.x" },
                { label: "Build Tool", value: "Vite 7.x" },
                { label: "Styling", value: "Tailwind CSS 4.x" },
                { label: "Charts", value: "Recharts" },
                { label: "Icons", value: "Lucide React" },
              ]} />
              <InfoCard title="Key Pages" items={[
                { label: "Dashboard", value: "System overview + stats" },
                { label: "Live Monitor", value: "Real-time camera feeds" },
                { label: "Detection Engine", value: "Interactive detection demo" },
                { label: "Analytics", value: "Traffic charts + heatmaps" },
                { label: "Alerts", value: "Alert management panel" },
                { label: "Documentation", value: "Full system docs" },
              ]} />
            </div>

            <CodeBlock
              code={`// Frontend Architecture - Key Components
//
// src/
// ├── App.tsx                   # Root with page routing
// ├── components/
// │   └── Sidebar.tsx           # Navigation sidebar
// ├── pages/
// │   ├── Dashboard.tsx         # KPI cards + charts overview
// │   ├── LiveMonitor.tsx       # Camera grid with canvas detection
// │   ├── DetectionEngine.tsx   # Interactive detection playground
// │   ├── Analytics.tsx         # Traffic analytics + heatmaps
// │   ├── AlertsPage.tsx        # Alert management & filtering
// │   ├── Documentation.tsx     # Technical documentation
// │   └── Settings.tsx          # System configuration
// ├── data/
// │   └── mockData.ts           # Simulated surveillance data
// └── utils/
//     └── cn.ts                 # Tailwind class merge utility
//
// WebSocket Integration (Production):
// const ws = new WebSocket("ws://api:8000/ws/stream/cam-01");
// ws.onmessage = (event) => {
//     const data = JSON.parse(event.data);
//     updateDetections(data.detections);
//     updateTracks(data.tracks);
//     checkAlerts(data.alerts);
// };`}
              language="typescript"
            />

            <div className="rounded-xl bg-slate-900 border border-slate-800 p-5">
              <h3 className="text-sm font-bold text-white mb-3">Canvas-Based Detection Visualization</h3>
              <p className="text-xs text-slate-300 leading-relaxed mb-3">
                The frontend uses HTML5 Canvas for rendering detection overlays in real-time. In production, the canvas 
                receives detection coordinates via WebSocket and draws bounding boxes, tracking trails, and heatmaps 
                over the decoded video frame. The demo mode simulates this with animated pedestrian silhouettes.
              </p>
              <div className="grid grid-cols-3 gap-2">
                {["Bounding Boxes with confidence", "Corner bracket markers", "Tracking ID labels"].map((f) => (
                  <div key={f} className="p-2 rounded bg-slate-800/50 text-[10px] text-slate-400 text-center">{f}</div>
                ))}
                {["Motion trail rendering", "Heatmap overlay accumulation", "Real-time FPS counter"].map((f) => (
                  <div key={f} className="p-2 rounded bg-slate-800/50 text-[10px] text-slate-400 text-center">{f}</div>
                ))}
              </div>
            </div>
          </div>
        );

      case "api":
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-bold text-white mb-2">API Reference</h2>
              <p className="text-sm text-slate-300 leading-relaxed">
                RESTful API endpoints for camera management, detection control, and alert handling.
              </p>
            </div>

            {[
              {
                method: "GET", path: "/api/v1/cameras", desc: "List all cameras",
                response: `[{
  "id": "cam-01",
  "name": "Main Entrance",
  "status": "online",
  "resolution": "1920x1080",
  "fps": 30,
  "pedestrian_count": 24
}]`
              },
              {
                method: "GET", path: "/api/v1/cameras/{id}/detections", desc: "Get current detections for a camera",
                response: `{
  "camera_id": "cam-01",
  "timestamp": "2024-01-15T14:32:15Z",
  "detections": [{
    "track_id": 42,
    "bbox": [120, 85, 45, 95],
    "confidence": 0.94,
    "zone": "entrance"
  }],
  "total_count": 24
}`
              },
              {
                method: "POST", path: "/api/v1/detect", desc: "Run detection on uploaded image/video",
                response: `{
  "detections": [{
    "bbox": [x, y, w, h],
    "confidence": 0.92,
    "class": "person"
  }],
  "processing_time_ms": 23,
  "model": "yolov8s"
}`
              },
              {
                method: "GET", path: "/api/v1/alerts", desc: "List all alerts with filtering",
                response: `{
  "alerts": [{
    "id": "a-001",
    "type": "crowd",
    "severity": "high",
    "message": "Crowd exceeded threshold",
    "camera_id": "cam-03",
    "timestamp": "2024-01-15T14:32:15Z"
  }],
  "total": 42,
  "unacknowledged": 8
}`
              },
              {
                method: "PUT", path: "/api/v1/settings/threshold", desc: "Update detection confidence threshold",
                response: `{
  "confidence_threshold": 0.65,
  "nms_iou_threshold": 0.45,
  "updated_at": "2024-01-15T14:32:15Z"
}`
              },
              {
                method: "WS", path: "/ws/stream/{camera_id}", desc: "WebSocket real-time detection stream",
                response: `// Each message:
{
  "frame_id": 15847,
  "timestamp": "2024-01-15T14:32:15.123Z",
  "detections": [...],
  "tracks": [...],
  "alerts": [...],
  "fps": 30
}`
              },
            ].map((endpoint) => (
              <div key={endpoint.path} className="rounded-xl bg-slate-900 border border-slate-800 overflow-hidden">
                <div className="flex items-center gap-3 p-3 border-b border-slate-800">
                  <span className={cn(
                    "px-2 py-0.5 rounded text-[10px] font-bold",
                    endpoint.method === "GET" ? "bg-emerald-500/20 text-emerald-400" :
                    endpoint.method === "POST" ? "bg-blue-500/20 text-blue-400" :
                    endpoint.method === "PUT" ? "bg-amber-500/20 text-amber-400" :
                    "bg-violet-500/20 text-violet-400"
                  )}>
                    {endpoint.method}
                  </span>
                  <code className="text-xs text-white font-mono">{endpoint.path}</code>
                  <span className="text-[10px] text-slate-500 ml-auto">{endpoint.desc}</span>
                </div>
                <pre className="p-3 text-[11px] font-mono text-emerald-400/80 overflow-x-auto">
                  {endpoint.response}
                </pre>
              </div>
            ))}
          </div>
        );

      case "deployment":
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-bold text-white mb-2">Local Setup & Installation</h2>
              <p className="text-sm text-slate-300 leading-relaxed">
                Follow these steps to set up the detection system locally for development.
              </p>
            </div>

            <div className="rounded-xl bg-slate-900 border border-slate-800 p-5">
              <h3 className="text-sm font-bold text-white mb-3">Prerequisites</h3>
              <ul className="list-disc list-inside text-xs text-slate-400 space-y-1">
                <li>Python 3.9+</li>
                <li>Node.js 16+ & npm</li>
                <li>Git</li>
              </ul>
            </div>

            <CodeBlock
              code={`# 1. Clone the repository
git clone https://github.com/pedtrack/pedtrack-ai.git
cd pedtrack-ai

# 2. Setup Backend
cd backend
python -m venv venv
# Windows:
venv\\Scripts\\activate
# Linux/Mac:
# source venv/bin/activate

pip install -r requirements.txt
# Start the API server
uvicorn app.main:app --reload

# 3. Setup Frontend (New Terminal)
cd ../
npm install
npm run dev

# 4. Access the application
# Frontend: http://localhost:5173
# API Docs: http://localhost:8000/docs`}
              language="bash"
            />

            {/* FAQ */}
            <div className="rounded-xl bg-slate-900 border border-slate-800 p-5">
              <h3 className="text-sm font-bold text-white mb-4">Frequently Asked Questions</h3>
              <div className="space-y-2">
                {[
                  { q: "Can I run without a GPU?", a: "Yes, but performance will be significantly reduced (~2-5 FPS instead of 30+). Set device='cpu' in the config." },
                  { q: "How do I add a new camera?", a: "POST to /api/v1/cameras with the RTSP URL. The system will automatically start processing the stream." },
                  { q: "Can I use a custom-trained model?", a: "Yes, replace the model file path in config. Any YOLOv8 model trained for person detection will work." },
                  { q: "What video formats are supported?", a: "MP4, AVI, MOV, MKV for file uploads. RTSP and HTTP streams for live cameras." },
                  { q: "How is historical data stored?", a: "Detection events are stored in PostgreSQL with timestamps. Redis caches real-time counts. Configurable retention period." },
                ].map((faq, idx) => (
                  <button
                    key={idx}
                    onClick={() => setExpandedFaq(expandedFaq === idx ? null : idx)}
                    className="w-full text-left p-3 rounded-lg bg-slate-800/50 hover:bg-slate-800 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-medium text-white">{faq.q}</span>
                      {expandedFaq === idx ? (
                        <ChevronDown className="h-3.5 w-3.5 text-slate-400" />
                      ) : (
                        <ChevronRight className="h-3.5 w-3.5 text-slate-400" />
                      )}
                    </div>
                    {expandedFaq === idx && (
                      <p className="text-[11px] text-slate-400 mt-2 pr-6">{faq.a}</p>
                    )}
                  </button>
                ))}
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Technical Documentation</h1>
          <p className="text-slate-400 text-sm mt-1">Complete system documentation, model details, and API reference</p>
        </div>
        <a href="#" className="flex items-center gap-1.5 text-xs text-cyan-400 hover:text-cyan-300">
          <GitBranch className="h-3.5 w-3.5" /> View Source <ExternalLink className="h-3 w-3" />
        </a>
      </div>

      <div className="flex gap-6">
        {/* Doc Navigation */}
        <div className="w-56 shrink-0">
          <nav className="sticky top-6 space-y-1">
            {sections.map((section) => {
              const Icon = section.icon;
              return (
                <button
                  key={section.id}
                  onClick={() => setActiveSection(section.id)}
                  className={cn(
                    "flex items-center gap-2 w-full px-3 py-2 rounded-lg text-xs font-medium transition-colors",
                    activeSection === section.id
                      ? "bg-cyan-500/20 text-cyan-400 border border-cyan-500/30"
                      : "text-slate-400 hover:text-white hover:bg-slate-800/50"
                  )}
                >
                  <Icon className="h-3.5 w-3.5" />
                  {section.title}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Content */}
        <div className="flex-1 max-w-4xl">
          {renderContent()}
        </div>
      </div>
    </div>
  );
}
