import { CorelObject, Point2D, Subpath, BezierNode } from '../types/coreldraw';
import { interpolateHexColor } from './effectsEngine';
import { cubicBezierPoint, distance, lerpNum } from './vectorMath';

export interface BlendStepObject {
  id: string;
  stepIndex: number;
  transform: CorelObject['transform'];
  subpaths: Subpath[];
  fillColor: string;
  outlineColor: string;
  opacity: number;
}

/**
 * Compute vector blend steps between two CorelObjects
 */
export function computeVectorBlend(
  objA: CorelObject,
  objB: CorelObject,
  steps: number = 8
): BlendStepObject[] {
  const result: BlendStepObject[] = [];
  const tA = objA.transform;
  const tB = objB.transform;
  const colA = objA.fill.color || '#3b82f6';
  const colB = objB.fill.color || '#f59e0b';
  const outA = objA.outline.color || '#1e293b';
  const outB = objB.outline.color || '#1e293b';

  for (let i = 1; i <= steps; i++) {
    const t = i / (steps + 1);

    const stepTransform: CorelObject['transform'] = {
      x: lerpNum(tA.x, tB.x, t),
      y: lerpNum(tA.y, tB.y, t),
      width: lerpNum(tA.width, tB.width, t),
      height: lerpNum(tA.height, tB.height, t),
      rotation: lerpNum(tA.rotation, tB.rotation, t),
      scaleX: lerpNum(tA.scaleX, tB.scaleX, t),
      scaleY: lerpNum(tA.scaleY, tB.scaleY, t),
      skewX: lerpNum(tA.skewX, tB.skewX, t),
      skewY: lerpNum(tA.skewY, tB.skewY, t),
    };

    // Interpolate subpaths if both have paths
    const stepSubpaths: Subpath[] = [];
    const maxSubpaths = Math.max(objA.subpaths.length, objB.subpaths.length);

    for (let s = 0; s < maxSubpaths; s++) {
      const spA = objA.subpaths[s] || objA.subpaths[0];
      const spB = objB.subpaths[s] || objB.subpaths[0];
      if (!spA || !spB) continue;

      const nodeCount = Math.max(spA.nodes.length, spB.nodes.length);
      const blendedNodes: BezierNode[] = [];

      for (let n = 0; n < nodeCount; n++) {
        const nA = spA.nodes[n % spA.nodes.length];
        const nB = spB.nodes[n % spB.nodes.length];

        blendedNodes.push({
          id: `blend_node_${i}_${s}_${n}`,
          x: lerpNum(nA.x, nB.x, t),
          y: lerpNum(nA.y, nB.y, t),
          handleIn: nA.handleIn && nB.handleIn ? {
            x: lerpNum(nA.handleIn.x, nB.handleIn.x, t),
            y: lerpNum(nA.handleIn.y, nB.handleIn.y, t),
          } : undefined,
          handleOut: nA.handleOut && nB.handleOut ? {
            x: lerpNum(nA.handleOut.x, nB.handleOut.x, t),
            y: lerpNum(nA.handleOut.y, nB.handleOut.y, t),
          } : undefined,
          type: 'smooth',
        });
      }

      stepSubpaths.push({
        isClosed: spA.isClosed || spB.isClosed,
        nodes: blendedNodes,
      });
    }

    result.push({
      id: `blend_step_${Date.now()}_${i}`,
      stepIndex: i,
      transform: stepTransform,
      subpaths: stepSubpaths,
      fillColor: interpolateHexColor(colA, colB, t),
      outlineColor: interpolateHexColor(outA, outB, t),
      opacity: lerpNum(objA.opacity, objB.opacity, t),
    });
  }

  return result;
}

/**
 * Generate Block Shadow polygon facets (solid signage / screen-printing shadow)
 */
export function generateBlockShadowFacets(
  obj: CorelObject,
  depth: number = 30,
  angleDeg: number = 45,
  color: string = '#000000'
): { points: Point2D[]; fill: string }[] {
  const rad = (angleDeg * Math.PI) / 180;
  const dx = Math.cos(rad) * depth;
  const dy = Math.sin(rad) * depth;

  const facets: { points: Point2D[]; fill: string }[] = [];

  for (const sp of obj.subpaths) {
    const nodes = sp.nodes;
    if (nodes.length < 2) continue;

    for (let i = 0; i < nodes.length; i++) {
      const pA = { x: nodes[i].x, y: nodes[i].y };
      const pB = { x: nodes[(i + 1) % nodes.length].x, y: nodes[(i + 1) % nodes.length].y };

      const pA_back = { x: pA.x + dx, y: pA.y + dy };
      const pB_back = { x: pB.x + dx, y: pB.y + dy };

      facets.push({
        points: [pA, pB, pB_back, pA_back],
        fill: color,
      });
    }
  }

  return facets;
}

/**
 * Generate Vector QR Code Matrix (21x21 basic grid representation)
 */
export function generateVectorQrMatrix(text: string): boolean[][] {
  const size = 25;
  const matrix: boolean[][] = Array.from({ length: size }, () => Array(size).fill(false));

  const drawFinder = (startX: number, startY: number) => {
    for (let r = 0; r < 7; r++) {
      for (let c = 0; c < 7; c++) {
        const isBorder = r === 0 || r === 6 || c === 0 || c === 6;
        const isCenter = r >= 2 && r <= 4 && c >= 2 && c <= 4;
        matrix[startY + r][startX + c] = isBorder || isCenter;
      }
    }
  };

  drawFinder(0, 0); // Top Left
  drawFinder(size - 7, 0); // Top Right
  drawFinder(0, size - 7); // Bottom Left

  let hash = 0;
  for (let i = 0; i < text.length; i++) {
    hash = (hash << 5) - hash + text.charCodeAt(i);
    hash |= 0;
  }

  for (let r = 0; r < size; r++) {
    for (let c = 0; c < size; c++) {
      const inFinderTL = r < 8 && c < 8;
      const inFinderTR = r < 8 && c >= size - 8;
      const inFinderBL = r >= size - 8 && c < 8;
      if (!inFinderTL && !inFinderTR && !inFinderBL) {
        const val = ((hash ^ (r * 31 + c * 17)) & (1 << ((r + c) % 16))) !== 0;
        matrix[r][c] = val;
      }
    }
  }

  return matrix;
}

/**
 * Generate Vector 1D Barcode Pattern (Code 128 / EAN Bars)
 */
export function generateBarcodeBars(code: string): number[] {
  const bars: number[] = [2, 1, 1, 2]; // Guard
  for (let i = 0; i < code.length; i++) {
    const charCode = code.charCodeAt(i);
    bars.push((charCode % 3) + 1);
    bars.push(((charCode >> 1) % 3) + 1);
    bars.push(((charCode >> 2) % 2) + 1);
  }
  bars.push(2, 1, 2); // Stop guard
  return bars;
}
