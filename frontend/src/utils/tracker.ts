/**
 * Robust multi-object tracker with Kalman-style prediction,
 * appearance matching via color histograms, and re-identification
 * for when people leave and return to the frame.
 */

interface BBox {
  x: number;
  y: number;
  w: number;
  h: number;
}

interface TrackState {
  id: number;
  bbox: BBox;
  velocity: { dx: number; dy: number };
  age: number;         // total frames this track has existed
  hits: number;        // consecutive successful matches
  misses: number;      // consecutive frames without a match
  confidence: number;
  colorHist: number[]; // simple color signature for re-id
  lastSeen: number;    // frame number when last matched
}

export interface TrackedDetection {
  bbox: [number, number, number, number]; // [x, y, w, h]
  class: string;
  score: number;
  trackId: number;
}

interface RawDetection {
  bbox: [number, number, number, number];
  class: string;
  score: number;
}

export class PedestrianTracker {
  private tracks: TrackState[] = [];
  private lostTracks: TrackState[] = []; // tracks that left the frame — for re-id
  private nextId = 1;
  private frameCount = 0;

  // Configurable parameters
  private readonly MAX_MISSES = 30;              // keep track alive for 30 frames without match
  private readonly MAX_LOST_AGE = 300;            // remember lost tracks for 300 frames (~10 sec at 30fps)
  private readonly IOU_THRESHOLD = 0.2;           // minimum IoU for matching
  private readonly PREDICT_WEIGHT = 0.6;          // how much to trust velocity prediction
  private readonly COLOR_HIST_WEIGHT = 0.35;      // weight for color similarity in matching
  private readonly IOU_WEIGHT = 0.65;             // weight for IoU in matching  
  private readonly REID_COLOR_THRESHOLD = 0.55;   // minimum color similarity for re-identification
  private readonly REID_POSITION_THRESHOLD = 200; // max distance (px) for re-id candidate

  reset() {
    this.tracks = [];
    this.lostTracks = [];
    this.nextId = 1;
    this.frameCount = 0;
  }

  update(
    detections: RawDetection[],
    canvas?: HTMLCanvasElement | null
  ): TrackedDetection[] {
    this.frameCount++;

    // 1. Predict new positions using velocity
    for (const track of this.tracks) {
      track.bbox.x += track.velocity.dx * this.PREDICT_WEIGHT;
      track.bbox.y += track.velocity.dy * this.PREDICT_WEIGHT;
    }

    // 2. Extract color histograms for each detection
    const detColorHists: number[][] = [];
    if (canvas) {
      const ctx = canvas.getContext("2d");
      if (ctx) {
        for (const det of detections) {
          detColorHists.push(this.extractColorHist(ctx, det.bbox));
        }
      }
    }

    // 3. Build cost matrix: tracks (rows) x detections (cols)
    const costMatrix: number[][] = [];
    for (let t = 0; t < this.tracks.length; t++) {
      const row: number[] = [];
      for (let d = 0; d < detections.length; d++) {
        const iou = this.computeIoU(
          this.tracks[t].bbox,
          this.bboxArrayToObj(detections[d].bbox)
        );

        let colorSim = 0;
        if (detColorHists[d] && this.tracks[t].colorHist.length > 0) {
          colorSim = this.colorHistSimilarity(this.tracks[t].colorHist, detColorHists[d]);
        }

        // Combined score (higher = better match)
        const score = this.IOU_WEIGHT * iou + this.COLOR_HIST_WEIGHT * colorSim;
        row.push(score);
      }
      costMatrix.push(row);
    }

    // 4. Greedy Hungarian-style matching (best-first assignment)
    const matchedTracks = new Set<number>();
    const matchedDets = new Set<number>();
    const assignments: Array<{ trackIdx: number; detIdx: number; score: number }> = [];

    // Flatten all scores and sort descending
    const allPairs: Array<{ t: number; d: number; score: number }> = [];
    for (let t = 0; t < costMatrix.length; t++) {
      for (let d = 0; d < costMatrix[t].length; d++) {
        allPairs.push({ t, d, score: costMatrix[t][d] });
      }
    }
    allPairs.sort((a, b) => b.score - a.score);

    for (const pair of allPairs) {
      if (matchedTracks.has(pair.t) || matchedDets.has(pair.d)) continue;
      if (pair.score < this.IOU_THRESHOLD * this.IOU_WEIGHT) continue; // minimum quality

      matchedTracks.add(pair.t);
      matchedDets.add(pair.d);
      assignments.push({ trackIdx: pair.t, detIdx: pair.d, score: pair.score });
    }

    // 5. Update matched tracks
    for (const { trackIdx, detIdx } of assignments) {
      const track = this.tracks[trackIdx];
      const det = detections[detIdx];
      const newBbox = this.bboxArrayToObj(det.bbox);

      // Update velocity (smoothed)
      track.velocity.dx = 0.7 * track.velocity.dx + 0.3 * (newBbox.x - track.bbox.x);
      track.velocity.dy = 0.7 * track.velocity.dy + 0.3 * (newBbox.y - track.bbox.y);

      track.bbox = newBbox;
      track.confidence = det.score;
      track.hits++;
      track.misses = 0;
      track.age++;
      track.lastSeen = this.frameCount;

      // Update color histogram (exponential moving average)
      if (detColorHists[detIdx]) {
        if (track.colorHist.length === 0) {
          track.colorHist = detColorHists[detIdx];
        } else {
          track.colorHist = track.colorHist.map(
            (v, i) => 0.8 * v + 0.2 * (detColorHists[detIdx][i] || 0)
          );
        }
      }
    }

    // 6. Handle unmatched tracks (increment misses)
    for (let t = 0; t < this.tracks.length; t++) {
      if (!matchedTracks.has(t)) {
        this.tracks[t].misses++;
        this.tracks[t].age++;
      }
    }

    // 7. Move dead tracks to lostTracks for re-id, remove very old lost tracks
    const activeTracks: TrackState[] = [];
    for (const track of this.tracks) {
      if (track.misses > this.MAX_MISSES) {
        // Only save for re-id if we had enough confidence (seen for >5 frames)
        if (track.hits >= 5 && track.colorHist.length > 0) {
          this.lostTracks.push({ ...track });
        }
      } else {
        activeTracks.push(track);
      }
    }
    this.tracks = activeTracks;

    // Prune very old lost tracks
    this.lostTracks = this.lostTracks.filter(
      t => (this.frameCount - t.lastSeen) < this.MAX_LOST_AGE
    );

    // 8. Handle unmatched detections → try re-id first, then create new tracks
    for (let d = 0; d < detections.length; d++) {
      if (matchedDets.has(d)) continue;

      const det = detections[d];
      const newBbox = this.bboxArrayToObj(det.bbox);
      const detHist = detColorHists[d] || [];

      // Try re-identification from lost tracks
      let reIdTrack: TrackState | null = null;
      let bestReIdScore = this.REID_COLOR_THRESHOLD;

      if (detHist.length > 0) {
        for (let i = 0; i < this.lostTracks.length; i++) {
          const lost = this.lostTracks[i];
          if (lost.colorHist.length === 0) continue;

          const colorSim = this.colorHistSimilarity(lost.colorHist, detHist);
          
          // Also check position proximity (person shouldn't teleport)
          const posDist = Math.sqrt(
            Math.pow(lost.bbox.x - newBbox.x, 2) + Math.pow(lost.bbox.y - newBbox.y, 2)
          );

          if (colorSim > bestReIdScore && posDist < this.REID_POSITION_THRESHOLD) {
            bestReIdScore = colorSim;
            reIdTrack = lost;
          }
        }
      }

      if (reIdTrack) {
        // Re-identified! Restore the old track with the same ID
        const restored: TrackState = {
          id: reIdTrack.id,
          bbox: newBbox,
          velocity: { dx: 0, dy: 0 },
          age: reIdTrack.age + 1,
          hits: reIdTrack.hits + 1,
          misses: 0,
          confidence: det.score,
          colorHist: detHist,
          lastSeen: this.frameCount,
        };
        this.tracks.push(restored);

        // Remove from lost tracks
        this.lostTracks = this.lostTracks.filter(t => t.id !== reIdTrack!.id);
      } else {
        // Brand new track
        const newTrack: TrackState = {
          id: this.nextId++,
          bbox: newBbox,
          velocity: { dx: 0, dy: 0 },
          age: 1,
          hits: 1,
          misses: 0,
          confidence: det.score,
          colorHist: detHist,
          lastSeen: this.frameCount,
        };
        this.tracks.push(newTrack);
      }
    }

    // 9. Output confirmed tracks (at least 2 hits to avoid flicker)
    return this.tracks
      .filter(t => t.hits >= 2 || t.age <= 1)
      .map(t => ({
        bbox: [t.bbox.x, t.bbox.y, t.bbox.w, t.bbox.h] as [number, number, number, number],
        class: "person",
        score: t.confidence,
        trackId: t.id,
      }));
  }

  // --- Helper methods ---

  private bboxArrayToObj(bbox: [number, number, number, number]): BBox {
    return { x: bbox[0], y: bbox[1], w: bbox[2], h: bbox[3] };
  }

  private computeIoU(a: BBox, b: BBox): number {
    const x1 = Math.max(a.x, b.x);
    const y1 = Math.max(a.y, b.y);
    const x2 = Math.min(a.x + a.w, b.x + b.w);
    const y2 = Math.min(a.y + a.h, b.y + b.h);
    const inter = Math.max(0, x2 - x1) * Math.max(0, y2 - y1);
    const union = a.w * a.h + b.w * b.h - inter;
    return union > 0 ? inter / union : 0;
  }

  /**
   * Extract a simple color histogram from the bounding box region.
   * Uses 8 bins per channel (R, G, B) = 24 values total.
   * This serves as a lightweight "appearance descriptor" for re-id.
   */
  private extractColorHist(
    ctx: CanvasRenderingContext2D,
    bbox: [number, number, number, number]
  ): number[] {
    const [x, y, w, h] = bbox;
    // Sample from the center 60% of the bbox to avoid background
    const cx = Math.max(0, Math.round(x + w * 0.2));
    const cy = Math.max(0, Math.round(y + h * 0.2));
    const cw = Math.max(1, Math.round(w * 0.6));
    const ch = Math.max(1, Math.round(h * 0.6));

    try {
      const imageData = ctx.getImageData(cx, cy, cw, ch);
      const data = imageData.data;
      const bins = 8;
      const hist = new Array(bins * 3).fill(0);
      const totalPixels = cw * ch;

      for (let i = 0; i < data.length; i += 4) {
        const r = data[i];
        const g = data[i + 1];
        const b = data[i + 2];
        hist[Math.floor(r / 32)]++;                    // R bins 0-7
        hist[bins + Math.floor(g / 32)]++;              // G bins 8-15
        hist[bins * 2 + Math.floor(b / 32)]++;          // B bins 16-23
      }

      // Normalize
      for (let i = 0; i < hist.length; i++) {
        hist[i] /= totalPixels;
      }
      return hist;
    } catch {
      return [];
    }
  }

  /**
   * Compute similarity between two color histograms using
   * Bhattacharyya coefficient (1 = identical, 0 = completely different).
   */
  private colorHistSimilarity(a: number[], b: number[]): number {
    if (a.length === 0 || b.length === 0 || a.length !== b.length) return 0;
    let sum = 0;
    for (let i = 0; i < a.length; i++) {
      sum += Math.sqrt(a[i] * b[i]);
    }
    return sum;
  }
}
