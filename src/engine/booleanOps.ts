import polygonClipping, { Geom, MultiPolygon, Polygon, Ring, Pair } from 'polygon-clipping';
import { CorelObject, Subpath, BezierNode } from '../types/coreldraw';
import { cubicBezierPoint } from './vectorMath';

// Convert a Subpath into a polygon ring (array of [x, y] coordinates in world space)
export function subpathToPolygonRing(subpath: Subpath, worldOffsetX: number, worldOffsetY: number, samplesPerSegment: number = 12): Ring {
  const ring: Ring = [];
  const nodes = subpath.nodes;
  if (nodes.length < 2) return ring;

  for (let i = 0; i < nodes.length; i++) {
    const curr = nodes[i];
    const next = nodes[(i + 1) % nodes.length];

    if (i === nodes.length - 1 && !subpath.isClosed) {
      ring.push([curr.x + worldOffsetX, curr.y + worldOffsetY]);
      break;
    }

    const p0 = { x: curr.x + worldOffsetX, y: curr.y + worldOffsetY };
    const p1 = curr.handleOut ? { x: curr.handleOut.x + worldOffsetX, y: curr.handleOut.y + worldOffsetY } : p0;
    const p3 = { x: next.x + worldOffsetX, y: next.y + worldOffsetY };
    const p2 = next.handleIn ? { x: next.handleIn.x + worldOffsetX, y: next.handleIn.y + worldOffsetY } : p3;

    if (!curr.handleOut && !next.handleIn) {
      ring.push([p0.x, p0.y]);
    } else {
      for (let s = 0; s < samplesPerSegment; s++) {
        const t = s / samplesPerSegment;
        const pt = cubicBezierPoint(p0, p1, p2, p3, t);
        ring.push([pt.x, pt.y]);
      }
    }
  }

  // Ensure ring is closed for polygon-clipping
  if (ring.length > 0) {
    const first = ring[0];
    const last = ring[ring.length - 1];
    if (first[0] !== last[0] || first[1] !== last[1]) {
      ring.push([first[0], first[1]]);
    }
  }

  return ring;
}

// Convert a CorelObject into a polygon-clipping MultiPolygon / Polygon
export function objectToPolygon(obj: CorelObject): Polygon {
  const { x, y } = obj.transform;
  const poly: Polygon = [];

  for (const subpath of obj.subpaths) {
    const ring = subpathToPolygonRing(subpath, x, y);
    if (ring.length >= 3) {
      poly.push(ring);
    }
  }

  return poly;
}

// Convert polygon-clipping result (MultiPolygon) back into CorelDRAW Subpaths
export function multiPolygonToSubpaths(
  multiPoly: MultiPolygon,
  originX: number,
  originY: number,
  simplificationTolerance: number = 1.0
): Subpath[] {
  const result: Subpath[] = [];

  for (const poly of multiPoly) {
    for (const ring of poly) {
      if (ring.length < 3) continue;

      // Filter out redundant collinear or very close points
      const filteredPts: [number, number][] = [];
      for (let i = 0; i < ring.length - 1; i++) {
        const pt = ring[i];
        if (filteredPts.length === 0) {
          filteredPts.push(pt);
        } else {
          const last = filteredPts[filteredPts.length - 1];
          const dist = Math.hypot(pt[0] - last[0], pt[1] - last[1]);
          if (dist >= simplificationTolerance) {
            filteredPts.push(pt);
          }
        }
      }

      if (filteredPts.length < 3) continue;

      const nodes: BezierNode[] = filteredPts.map((pt, idx) => ({
        id: `node_${idx}_${Math.random().toString(36).substring(2, 7)}`,
        x: pt[0] - originX,
        y: pt[1] - originY,
        type: 'cusp',
      }));

      result.push({
        isClosed: true,
        nodes,
      });
    }
  }

  return result;
}

export type BooleanOp = 'weld' | 'trim' | 'intersect' | 'simplify' | 'frontMinusBack' | 'backMinusFront';

// Perform Boolean operations on two or more Corel objects
export function performBooleanOperation(
  objects: CorelObject[],
  operation: BooleanOp
): { newObject: CorelObject; removedIds: string[] } | null {
  if (objects.length < 2) return null;

  try {
    const polyA = objectToPolygon(objects[0]);
    const polyB = objectToPolygon(objects[1]);

    if (polyA.length === 0 || polyB.length === 0) return null;

    let resultGeom: MultiPolygon;

    switch (operation) {
      case 'weld':
        resultGeom = polygonClipping.union(polyA, polyB);
        // If more objects, weld iteratively
        for (let i = 2; i < objects.length; i++) {
          const nextPoly = objectToPolygon(objects[i]);
          if (nextPoly.length > 0) {
            resultGeom = polygonClipping.union(resultGeom, nextPoly);
          }
        }
        break;

      case 'trim':
      case 'frontMinusBack':
        // Objects are sorted by z-order: target is first, tool is second
        resultGeom = polygonClipping.difference(polyA, polyB);
        break;

      case 'backMinusFront':
        resultGeom = polygonClipping.difference(polyB, polyA);
        break;

      case 'intersect':
        resultGeom = polygonClipping.intersection(polyA, polyB);
        break;

      case 'simplify':
        resultGeom = polygonClipping.union(polyA, polyB);
        break;

      default:
        return null;
    }

    if (!resultGeom || resultGeom.length === 0) return null;

    // Determine new bounding box
    let minX = Infinity;
    let minY = Infinity;
    let maxX = -Infinity;
    let maxY = -Infinity;

    for (const poly of resultGeom) {
      for (const ring of poly) {
        for (const [px, py] of ring) {
          if (px < minX) minX = px;
          if (py < minY) minY = py;
          if (px > maxX) maxX = px;
          if (py > maxY) maxY = py;
        }
      }
    }

    const width = Math.max(2, maxX - minX);
    const height = Math.max(2, maxY - minY);

    const subpaths = multiPolygonToSubpaths(resultGeom, minX, minY);
    if (subpaths.length === 0) return null;

    const baseObj = objects[0];
    const newObject: CorelObject = {
      id: `obj_weld_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      name: `${operation.toUpperCase()} Result`,
      type: 'path',
      transform: {
        x: minX,
        y: minY,
        width,
        height,
        rotation: 0,
        scaleX: 1,
        scaleY: 1,
        skewX: 0,
        skewY: 0,
      },
      subpaths,
      fill: { ...baseObj.fill },
      outline: { ...baseObj.outline },
      shadow: { ...baseObj.shadow },
      extrude: { ...baseObj.extrude },
      contour: { ...baseObj.contour },
      transparency: { ...baseObj.transparency },
      opacity: baseObj.opacity,
      locked: false,
      visible: true,
      zIndex: baseObj.zIndex,
    };

    return {
      newObject,
      removedIds: objects.map(o => o.id),
    };
  } catch (err) {
    console.error('Boolean operation failed:', err);
    return null;
  }
}
