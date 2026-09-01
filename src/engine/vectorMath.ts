import { BezierNode, Point2D, Subpath, CorelObject } from '../types/coreldraw';

export function distance(p1: Point2D, p2: Point2D): number {
  return Math.hypot(p2.x - p1.x, p2.y - p1.y);
}

export function lerp(p1: Point2D, p2: Point2D, t: number): Point2D {
  return {
    x: p1.x + (p2.x - p1.x) * t,
    y: p1.y + (p2.y - p1.y) * t,
  };
}

export function lerpNum(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}


export function rotatePoint(p: Point2D, center: Point2D, angleDeg: number): Point2D {
  const rad = (angleDeg * Math.PI) / 180;
  const cos = Math.cos(rad);
  const sin = Math.sin(rad);
  const dx = p.x - center.x;
  const dy = p.y - center.y;
  return {
    x: center.x + (dx * cos - dy * sin),
    y: center.y + (dx * sin + dy * cos),
  };
}

// Cubic Bezier evaluation at t [0, 1]
export function cubicBezierPoint(p0: Point2D, p1: Point2D, p2: Point2D, p3: Point2D, t: number): Point2D {
  const mt = 1 - t;
  const mt2 = mt * mt;
  const mt3 = mt2 * mt;
  const t2 = t * t;
  const t3 = t2 * t;

  return {
    x: mt3 * p0.x + 3 * mt2 * t * p1.x + 3 * mt * t2 * p2.x + t3 * p3.x,
    y: mt3 * p0.y + 3 * mt2 * t * p1.y + 3 * mt * t2 * p2.y + t3 * p3.y,
  };
}

// Subdivide cubic bezier using de Casteljau
export function splitCubicBezier(
  p0: Point2D,
  p1: Point2D,
  p2: Point2D,
  p3: Point2D,
  t: number
): { left: [Point2D, Point2D, Point2D, Point2D]; right: [Point2D, Point2D, Point2D, Point2D] } {
  const p01 = lerp(p0, p1, t);
  const p12 = lerp(p1, p2, t);
  const p23 = lerp(p2, p3, t);

  const p012 = lerp(p01, p12, t);
  const p123 = lerp(p12, p23, t);

  const p0123 = lerp(p012, p123, t);

  return {
    left: [p0, p01, p012, p0123],
    right: [p0123, p123, p23, p3],
  };
}

// Convert SVG path commands / subpaths to SVG path string (d)
export function subpathsToSvgPathData(subpaths: Subpath[]): string {
  if (!subpaths || subpaths.length === 0) return '';
  let d = '';

  for (const subpath of subpaths) {
    const nodes = subpath.nodes;
    if (!nodes || nodes.length === 0) continue;

    d += `M ${nodes[0].x.toFixed(3)} ${nodes[0].y.toFixed(3)} `;

    for (let i = 1; i < nodes.length; i++) {
      const prev = nodes[i - 1];
      const curr = nodes[i];

      const cp1 = prev.handleOut || prev;
      const cp2 = curr.handleIn || curr;

      if (!prev.handleOut && !curr.handleIn) {
        d += `L ${curr.x.toFixed(3)} ${curr.y.toFixed(3)} `;
      } else {
        d += `C ${cp1.x.toFixed(3)} ${cp1.y.toFixed(3)}, ${cp2.x.toFixed(3)} ${cp2.y.toFixed(3)}, ${curr.x.toFixed(3)} ${curr.y.toFixed(3)} `;
      }
    }

    if (subpath.isClosed && nodes.length > 1) {
      const first = nodes[0];
      const last = nodes[nodes.length - 1];
      if (last.handleOut || first.handleIn) {
        const cp1 = last.handleOut || last;
        const cp2 = first.handleIn || first;
        d += `C ${cp1.x.toFixed(3)} ${cp1.y.toFixed(3)}, ${cp2.x.toFixed(3)} ${cp2.y.toFixed(3)}, ${first.x.toFixed(3)} ${first.y.toFixed(3)} `;
      }
      d += 'Z ';
    }
  }

  return d.trim();
}

// Convert Rect to Subpaths
export function rectToSubpaths(w: number, h: number, cornerRadii: [number, number, number, number] = [0, 0, 0, 0]): Subpath[] {
  const [tl, tr, br, bl] = cornerRadii.map(r => Math.max(0, Math.min(r, Math.min(w, h) / 2)));
  const kappa = 0.5522847498307935; // Standard bezier circle approximation constant

  if (tl === 0 && tr === 0 && br === 0 && bl === 0) {
    return [
      {
        isClosed: true,
        nodes: [
          { id: 'n1', x: 0, y: 0, type: 'cusp' },
          { id: 'n2', x: w, y: 0, type: 'cusp' },
          { id: 'n3', x: w, y: h, type: 'cusp' },
          { id: 'n4', x: 0, y: h, type: 'cusp' },
        ],
      },
    ];
  }

  // Rounded rectangle with bezier corner arcs
  const nodes: BezierNode[] = [];
  
  // Top-left corner
  nodes.push({
    id: 'n1',
    x: tl,
    y: 0,
    type: 'smooth',
    handleIn: tl > 0 ? { x: tl * (1 - kappa), y: 0 } : null,
  });

  // Top-right corner
  nodes.push({
    id: 'n2',
    x: w - tr,
    y: 0,
    type: 'smooth',
    handleOut: tr > 0 ? { x: w - tr * (1 - kappa), y: 0 } : null,
  });
  nodes.push({
    id: 'n3',
    x: w,
    y: tr,
    type: 'smooth',
    handleIn: tr > 0 ? { x: w, y: tr * (1 - kappa) } : null,
  });

  // Bottom-right corner
  nodes.push({
    id: 'n4',
    x: w,
    y: h - br,
    type: 'smooth',
    handleOut: br > 0 ? { x: w, y: h - br * (1 - kappa) } : null,
  });
  nodes.push({
    id: 'n5',
    x: w - br,
    y: h,
    type: 'smooth',
    handleIn: br > 0 ? { x: w - br * (1 - kappa), y: h } : null,
  });

  // Bottom-left corner
  nodes.push({
    id: 'n6',
    x: bl,
    y: h,
    type: 'smooth',
    handleOut: bl > 0 ? { x: bl * (1 - kappa), y: h } : null,
  });
  nodes.push({
    id: 'n7',
    x: 0,
    y: h - bl,
    type: 'smooth',
    handleIn: bl > 0 ? { x: 0, y: h - bl * (1 - kappa) } : null,
  });

  // Back to top-left
  nodes.push({
    id: 'n8',
    x: 0,
    y: tl,
    type: 'smooth',
    handleOut: tl > 0 ? { x: 0, y: tl * (1 - kappa) } : null,
  });

  return [{ isClosed: true, nodes }];
}

// Convert Ellipse / Pie / Arc to Subpaths
export function ellipseToSubpaths(
  w: number,
  h: number,
  kind: 'ellipse' | 'pie' | 'arc' = 'ellipse',
  startAngle: number = 0,
  endAngle: number = 360
): Subpath[] {
  const rx = w / 2;
  const ry = h / 2;
  const cx = rx;
  const cy = ry;

  if (kind === 'ellipse' || Math.abs(endAngle - startAngle) >= 360) {
    const kx = rx * 0.5522847498;
    const ky = ry * 0.5522847498;

    return [
      {
        isClosed: true,
        nodes: [
          { id: 'e1', x: cx + rx, y: cy, handleIn: { x: cx + rx, y: cy - ky }, handleOut: { x: cx + rx, y: cy + ky }, type: 'symmetric' },
          { id: 'e2', x: cx, y: cy + ry, handleIn: { x: cx + kx, y: cy + ry }, handleOut: { x: cx - kx, y: cy + ry }, type: 'symmetric' },
          { id: 'e3', x: cx - rx, y: cy, handleIn: { x: cx - rx, y: cy + ky }, handleOut: { x: cx - rx, y: cy - ky }, type: 'symmetric' },
          { id: 'e4', x: cx, y: cy - ry, handleIn: { x: cx - kx, y: cy - ry }, handleOut: { x: cx + kx, y: cy - ry }, type: 'symmetric' },
        ],
      },
    ];
  }

  // Handle Arc or Pie segment
  const startRad = (startAngle * Math.PI) / 180;
  const endRad = (endAngle * Math.PI) / 180;
  const steps = 16;
  const nodes: BezierNode[] = [];

  if (kind === 'pie') {
    nodes.push({ id: 'center', x: cx, y: cy, type: 'cusp' });
  }

  for (let i = 0; i <= steps; i++) {
    const angle = startRad + (endRad - startRad) * (i / steps);
    nodes.push({
      id: `arc_${i}`,
      x: cx + rx * Math.cos(angle),
      y: cy + ry * Math.sin(angle),
      type: 'smooth',
    });
  }

  return [{ isClosed: kind === 'pie', nodes }];
}

// Convert Polygon to Subpaths
export function polygonToSubpaths(w: number, h: number, sides: number = 5): Subpath[] {
  const rx = w / 2;
  const ry = h / 2;
  const cx = rx;
  const cy = ry;
  const nodes: BezierNode[] = [];

  for (let i = 0; i < sides; i++) {
    const angle = -Math.PI / 2 + (i * 2 * Math.PI) / sides;
    nodes.push({
      id: `poly_${i}`,
      x: cx + rx * Math.cos(angle),
      y: cy + ry * Math.sin(angle),
      type: 'cusp',
    });
  }

  return [{ isClosed: true, nodes }];
}

// Convert Star to Subpaths
export function starToSubpaths(w: number, h: number, points: number = 5, sharpness: number = 0.5): Subpath[] {
  const rx = w / 2;
  const ry = h / 2;
  const cx = rx;
  const cy = ry;
  const innerRx = rx * (1 - sharpness * 0.7);
  const innerRy = ry * (1 - sharpness * 0.7);
  const totalVertices = points * 2;
  const nodes: BezierNode[] = [];

  for (let i = 0; i < totalVertices; i++) {
    const angle = -Math.PI / 2 + (i * Math.PI) / points;
    const isOuter = i % 2 === 0;
    const rX = isOuter ? rx : innerRx;
    const rY = isOuter ? ry : innerRy;

    nodes.push({
      id: `star_${i}`,
      x: cx + rX * Math.cos(angle),
      y: cy + rY * Math.sin(angle),
      type: 'cusp',
    });
  }

  return [{ isClosed: true, nodes }];
}

// Convert Spiral to Subpaths
export function spiralToSubpaths(w: number, h: number, turns: number = 4): Subpath[] {
  const cx = w / 2;
  const cy = h / 2;
  const maxR = Math.min(w, h) / 2;
  const steps = turns * 32;
  const nodes: BezierNode[] = [];

  for (let i = 0; i <= steps; i++) {
    const theta = (i / steps) * (turns * 2 * Math.PI);
    const r = (i / steps) * maxR;
    nodes.push({
      id: `spiral_${i}`,
      x: cx + r * Math.cos(theta),
      y: cy + r * Math.sin(theta),
      type: 'smooth',
    });
  }

  return [{ isClosed: false, nodes }];
}

// Calculate precise bounding box of an object
export function getObjectBounds(obj: CorelObject): { minX: number; minY: number; maxX: number; maxY: number; width: number; height: number } {
  const { x, y, width, height } = obj.transform;
  return {
    minX: x,
    minY: y,
    maxX: x + width,
    maxY: y + height,
    width,
    height,
  };
}

// Calculate combined bounding box of multiple objects
export function getSelectionBounds(objects: CorelObject[]): { minX: number; minY: number; maxX: number; maxY: number; width: number; height: number; centerX: number; centerY: number } | null {
  if (objects.length === 0) return null;

  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;

  for (const obj of objects) {
    const b = getObjectBounds(obj);
    if (b.minX < minX) minX = b.minX;
    if (b.minY < minY) minY = b.minY;
    if (b.maxX > maxX) maxX = b.maxX;
    if (b.maxY > maxY) maxY = b.maxY;
  }

  const width = Math.max(1, maxX - minX);
  const height = Math.max(1, maxY - minY);

  return {
    minX,
    minY,
    maxX,
    maxY,
    width,
    height,
    centerX: minX + width / 2,
    centerY: minY + height / 2,
  };
}
