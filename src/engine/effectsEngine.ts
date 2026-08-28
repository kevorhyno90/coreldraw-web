import { CorelObject, Subpath, Point2D, Extrude3DEffect, ContourEffect, DropShadowEffect } from '../types/coreldraw';
import { cubicBezierPoint, distance, lerp, subpathsToSvgPathData } from './vectorMath';

// Generate 3D Extrusion facets (front face, side polygons, back face)
export interface ExtrusionFacet {
  points: Point2D[];
  fill: string;
  stroke?: string;
  opacity: number;
}

export function generate3DExtrusionFacets(obj: CorelObject, extrude: Extrude3DEffect): ExtrusionFacet[] {
  if (!extrude.enabled || extrude.depth <= 0) return [];

  const rad = (extrude.angle * Math.PI) / 180;
  const dx = Math.cos(rad) * extrude.depth;
  const dy = Math.sin(rad) * extrude.depth;

  const baseColor = extrude.sideColor || obj.fill.color || '#3b82f6';
  const light = extrude.lightIntensity || 0.8;

  const facets: ExtrusionFacet[] = [];

  // Iterate over subpaths and create 3D connecting ribbons
  for (const subpath of obj.subpaths) {
    const nodes = subpath.nodes;
    if (nodes.length < 2) continue;

    // Discretize the curve into polygon points for crisp 3D projection
    const frontPts: Point2D[] = [];
    const samplesPerSeg = 8;

    for (let i = 0; i < nodes.length; i++) {
      const curr = nodes[i];
      const next = nodes[(i + 1) % nodes.length];

      if (i === nodes.length - 1 && !subpath.isClosed) {
        frontPts.push({ x: curr.x, y: curr.y });
        break;
      }

      const p0 = { x: curr.x, y: curr.y };
      const p1 = curr.handleOut || p0;
      const p3 = { x: next.x, y: next.y };
      const p2 = next.handleIn || p3;

      if (!curr.handleOut && !next.handleIn) {
        frontPts.push(p0);
      } else {
        for (let s = 0; s < samplesPerSeg; s++) {
          frontPts.push(cubicBezierPoint(p0, p1, p2, p3, s / samplesPerSeg));
        }
      }
    }

    // Create side quads connecting frontPts[i] -> frontPts[i+1] -> backPts[i+1] -> backPts[i]
    for (let i = 0; i < frontPts.length; i++) {
      const pA = frontPts[i];
      const pB = frontPts[(i + 1) % frontPts.length];

      const pA_back: Point2D = { x: pA.x + dx, y: pA.y + dy };
      const pB_back: Point2D = { x: pB.x + dx, y: pB.y + dy };

      // Normal angle for simple Lambertian directional shading
      const edgeAngle = Math.atan2(pB.y - pA.y, pB.x - pA.x);
      const shadeFactor = Math.abs(Math.sin(edgeAngle - rad)) * 0.4 + 0.6 * light;
      const shadedColor = adjustColorBrightness(baseColor, shadeFactor);

      facets.push({
        points: [pA, pB, pB_back, pA_back],
        fill: shadedColor,
        stroke: 'rgba(0,0,0,0.1)',
        opacity: 0.95,
      });
    }
  }

  return facets;
}

// Generate stepped contour paths (inward or outward offset)
export function generateContourSteps(obj: CorelObject, contour: ContourEffect): { pathData: string; fill: string; outline: string; scale: number; opacity: number }[] {
  if (!contour.enabled || contour.steps <= 0) return [];

  const steps = Math.min(10, Math.max(1, contour.steps));
  const results: { pathData: string; fill: string; outline: string; scale: number; opacity: number }[] = [];

  const startColor = obj.fill.color || '#3b82f6';
  const endColor = contour.endColor || '#f59e0b';
  const baseD = subpathsToSvgPathData(obj.subpaths);

  for (let i = 1; i <= steps; i++) {
    const t = i / steps;
    const stepColor = interpolateHexColor(startColor, endColor, t);
    const scaleFactor = contour.type === 'outside' ? 1 + (contour.offset * i) / 100 : 1 - (contour.offset * i) / 100;

    if (scaleFactor > 0.05) {
      results.push({
        pathData: baseD,
        fill: stepColor,
        outline: obj.outline.color,
        scale: scaleFactor,
        opacity: 1 - t * 0.2,
      });
    }
  }

  return results;
}

// Helper: Adjust color brightness
function adjustColorBrightness(hex: string, factor: number): string {
  let c = hex.replace('#', '');
  if (c.length === 3) c = c.split('').map(x => x + x).join('');
  if (c.length !== 6) return hex;

  const num = parseInt(c, 16);
  let r = Math.min(255, Math.max(0, Math.round(((num >> 16) & 255) * factor)));
  let g = Math.min(255, Math.max(0, Math.round(((num >> 8) & 255) * factor)));
  let b = Math.min(255, Math.max(0, Math.round((num & 255) * factor)));

  return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`;
}

// Helper: Interpolate between two hex colors
export function interpolateHexColor(hex1: string, hex2: string, t: number): string {
  let c1 = hex1.replace('#', '');
  let c2 = hex2.replace('#', '');
  if (c1.length === 3) c1 = c1.split('').map(x => x + x).join('');
  if (c2.length === 3) c2 = c2.split('').map(x => x + x).join('');

  const n1 = parseInt(c1, 16) || 0;
  const n2 = parseInt(c2, 16) || 0;

  const r1 = (n1 >> 16) & 255;
  const g1 = (n1 >> 8) & 255;
  const b1 = n1 & 255;

  const r2 = (n2 >> 16) & 255;
  const g2 = (n2 >> 8) & 255;
  const b2 = n2 & 255;

  const r = Math.round(r1 + (r2 - r1) * t);
  const g = Math.round(g1 + (g2 - g1) * t);
  const b = Math.round(b1 + (b2 - b1) * t);

  return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`;
}
