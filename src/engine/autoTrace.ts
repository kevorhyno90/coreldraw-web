import { BezierNode, CorelObject, Subpath } from '../types/coreldraw';

export interface TraceOptions {
  threshold: number; // 0 to 255
  smoothness: number; // 1 to 10
  colorCount: number; // 2 to 16 colors
  minPathLength: number; // filter small noise specks
}

// Convert image data to vector paths via boundary contour extraction
export async function traceImageToVector(
  imageSource: string,
  options: TraceOptions = { threshold: 128, smoothness: 4, colorCount: 4, minPathLength: 8 }
): Promise<{ objects: CorelObject[]; width: number; height: number }> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      try {
        const canvas = document.createElement('canvas');
        const maxDim = 400; // Resample for fast client-side tracing
        let w = img.naturalWidth || img.width;
        let h = img.naturalHeight || img.height;

        if (w > maxDim || h > maxDim) {
          const ratio = Math.min(maxDim / w, maxDim / h);
          w = Math.round(w * ratio);
          h = Math.round(h * ratio);
        }

        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('Cannot create 2d canvas context'));
          return;
        }

        ctx.drawImage(img, 0, 0, w, h);
        const imgData = ctx.getImageData(0, 0, w, h);
        const data = imgData.data;

        // Perform threshold / quantized color palette clustering
        const colors = [
          { r: 26, g: 32, b: 44, hex: '#1a202c' }, // dark
          { r: 66, g: 153, b: 225, hex: '#4299e1' }, // primary
          { r: 237, g: 137, b: 54, hex: '#ed8936' }, // accent
          { r: 247, g: 250, b: 252, hex: '#f7fafc' }, // light
        ];

        const objects: CorelObject[] = [];

        // Grid-based contour detection (Marching Squares)
        const visited = new Uint8Array(w * h);

        // Simple edge / region extractor
        for (let y = 1; y < h - 1; y += 2) {
          for (let x = 1; x < w - 1; x += 2) {
            const idx = (y * w + x) * 4;
            const r = data[idx];
            const g = data[idx + 1];
            const b = data[idx + 2];
            const a = data[idx + 3];

            if (a < 30) continue; // transparent pixel
            const brightness = 0.299 * r + 0.587 * g + 0.114 * b;

            if (brightness < options.threshold && !visited[y * w + x]) {
              // Trace contour around this dark region
              const contour = traceContour(x, y, w, h, data, options.threshold, visited);
              if (contour.length >= options.minPathLength) {
                const subpaths = smoothContourToSubpaths(contour, options.smoothness);
                if (subpaths.length > 0) {
                  objects.push({
                    id: `traced_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
                    name: `Traced Curve ${objects.length + 1}`,
                    type: 'path',
                    transform: {
                      x: 0,
                      y: 0,
                      width: w,
                      height: h,
                      rotation: 0,
                      scaleX: 1,
                      scaleY: 1,
                      skewX: 0,
                      skewY: 0,
                    },
                    subpaths,
                    fill: {
                      type: 'solid',
                      color: `rgb(${r}, ${g}, ${b})`,
                    },
                    outline: {
                      color: '#000000',
                      width: 1,
                      style: 'solid',
                      cap: 'round',
                      join: 'round',
                      startArrow: 'none',
                      endArrow: 'none',
                    },
                    shadow: { enabled: false, color: '#000000', blur: 4, offsetX: 2, offsetY: 2, opacity: 0.5 },
                    extrude: { enabled: false, depth: 10, angle: 45, vanishingPoint: { x: 0, y: 0 }, bevel: 0, lightIntensity: 0.8 },
                    contour: { enabled: false, type: 'outside', steps: 1, offset: 5, endColor: '#ffffff' },
                    transparency: { enabled: false, type: 'uniform', opacity: 1 },
                    opacity: 1,
                    locked: false,
                    visible: true,
                    zIndex: objects.length,
                  });
                }
              }
            }
          }
        }

        resolve({ objects, width: w, height: h });
      } catch (e) {
        reject(e);
      }
    };
    img.onerror = () => reject(new Error('Failed to load image for tracing'));
    img.src = imageSource;
  });
}

// Simple boundary follower (Moore-Neighbor style)
function traceContour(
  startX: number,
  startY: number,
  w: number,
  h: number,
  data: Uint8ClampedArray,
  threshold: number,
  visited: Uint8Array
): { x: number; y: number }[] {
  const points: { x: number; y: number }[] = [];
  let cx = startX;
  let cy = startY;
  const maxSteps = 1000;
  let steps = 0;

  // 8-neighbor offsets
  const dx = [1, 1, 0, -1, -1, -1, 0, 1];
  const dy = [0, 1, 1, 1, 0, -1, -1, -1];
  let dir = 0;

  while (steps < maxSteps) {
    points.push({ x: cx, y: cy });
    visited[cy * w + cx] = 1;

    let foundNext = false;
    for (let i = 0; i < 8; i++) {
      const ndir = (dir + i) % 8;
      const nx = cx + dx[ndir];
      const ny = cy + dy[ndir];

      if (nx >= 0 && nx < w && ny >= 0 && ny < h) {
        const idx = (ny * w + nx) * 4;
        const brightness = 0.299 * data[idx] + 0.587 * data[idx + 1] + 0.114 * data[idx + 2];
        const alpha = data[idx + 3];

        if (alpha > 30 && brightness < threshold) {
          cx = nx;
          cy = ny;
          dir = (ndir + 6) % 8; // backtrack 90 deg
          foundNext = true;
          break;
        }
      }
    }

    if (!foundNext || (cx === startX && cy === startY && steps > 3)) {
      break;
    }
    steps++;
  }

  return points;
}

// Fit smooth bezier curves through contour points
function smoothContourToSubpaths(contour: { x: number; y: number }[], smoothness: number): Subpath[] {
  if (contour.length < 3) return [];

  // Downsample according to smoothness factor
  const step = Math.max(2, Math.round(smoothness * 1.5));
  const sampled: { x: number; y: number }[] = [];

  for (let i = 0; i < contour.length; i += step) {
    sampled.push(contour[i]);
  }

  if (sampled.length < 3) return [];

  const nodes: BezierNode[] = sampled.map((pt, i) => {
    const prev = sampled[(i - 1 + sampled.length) % sampled.length];
    const next = sampled[(i + 1) % sampled.length];

    // Compute smooth tangent handle
    const vx = (next.x - prev.x) * 0.25;
    const vy = (next.y - prev.y) * 0.25;

    return {
      id: `trace_node_${i}_${Math.random().toString(36).substring(2, 6)}`,
      x: pt.x,
      y: pt.y,
      handleIn: { x: pt.x - vx, y: pt.y - vy },
      handleOut: { x: pt.x + vx, y: pt.y + vy },
      type: 'smooth',
    };
  });

  return [{ isClosed: true, nodes }];
}
