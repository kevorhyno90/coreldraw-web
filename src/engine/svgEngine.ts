import { CorelObject, CorelPage, Subpath, BezierNode } from '../types/coreldraw';
import { subpathsToSvgPathData } from './vectorMath';
import { generate3DExtrusionFacets } from './effectsEngine';

// Export CorelDRAW Page Objects to standard SVG string
export function exportPageToSvg(page: CorelPage, objects: CorelObject[]): string {
  const { width, height } = page;

  // Collect gradients & filters for <defs>
  const defs: string[] = [];
  const body: string[] = [];

  // Drop shadow filter
  defs.push(`
    <filter id="corel-shadow" x="-50%" y="-50%" width="200%" height="200%">
      <feDropShadow dx="3" dy="3" stdDeviation="4" flood-color="#000000" flood-opacity="0.5" />
    </filter>
  `);

  for (const obj of objects) {
    if (!obj.visible) continue;

    const { x, y, width: w, height: h, rotation } = obj.transform;
    const transformAttr = rotation ? `transform="rotate(${rotation} ${x + w / 2} ${y + h / 2})"` : '';
    const opacityAttr = obj.opacity < 1 ? `opacity="${obj.opacity}"` : '';

    // Handle Fills & Gradients
    let fillAttr = 'fill="none"';
    if (obj.fill.type === 'solid') {
      fillAttr = `fill="${obj.fill.color}"`;
    } else if (obj.fill.type === 'linear' && obj.fill.gradient) {
      const gradId = `grad_${obj.id}`;
      const g = obj.fill.gradient;
      const stopsXml = g.stops.map(s => `<stop offset="${(s.offset * 100).toFixed(0)}%" stop-color="${s.color}" />`).join('');
      defs.push(`
        <linearGradient id="${gradId}" x1="${g.start.x}" y1="${g.start.y}" x2="${g.end.x}" y2="${g.end.y}" gradientUnits="userSpaceOnUse">
          ${stopsXml}
        </linearGradient>
      `);
      fillAttr = `fill="url(#${gradId})"`;
    } else if (obj.fill.type === 'radial' && obj.fill.gradient) {
      const gradId = `radial_${obj.id}`;
      const g = obj.fill.gradient;
      const stopsXml = g.stops.map(s => `<stop offset="${(s.offset * 100).toFixed(0)}%" stop-color="${s.color}" />`).join('');
      defs.push(`
        <radialGradient id="${gradId}" cx="${g.start.x}" cy="${g.start.y}" r="${Math.hypot(g.end.x - g.start.x, g.end.y - g.start.y)}" gradientUnits="userSpaceOnUse">
          ${stopsXml}
        </radialGradient>
      `);
      fillAttr = `fill="url(#${gradId})"`;
    }

    // Handle Outline / Stroke
    let strokeAttr = 'stroke="none"';
    if (obj.outline.width > 0 && obj.outline.color) {
      const dash =
        obj.outline.style === 'dashed' ? 'stroke-dasharray="6,4"' :
        obj.outline.style === 'dotted' ? 'stroke-dasharray="2,3"' :
        obj.outline.style === 'dash-dot' ? 'stroke-dasharray="8,3,2,3"' : '';
      
      strokeAttr = `stroke="${obj.outline.color}" stroke-width="${obj.outline.width}" stroke-linecap="${obj.outline.cap}" stroke-linejoin="${obj.outline.join}" ${dash}`;
    }

    const filterAttr = obj.shadow?.enabled ? 'filter="url(#corel-shadow)"' : '';

    // Render 3D Extrusion facets behind the shape if enabled
    if (obj.extrude?.enabled) {
      const facets = generate3DExtrusionFacets(obj, obj.extrude);
      for (const facet of facets) {
        const pts = facet.points.map(p => `${(p.x + x).toFixed(2)},${(p.y + y).toFixed(2)}`).join(' ');
        body.push(`<polygon points="${pts}" fill="${facet.fill}" stroke="${facet.stroke || 'none'}" opacity="${facet.opacity}" />`);
      }
    }

    // Text object
    if (obj.type === 'text' && obj.textProps) {
      const tp = obj.textProps;
      body.push(`
        <text x="${x}" y="${y + tp.fontSize}" font-family="${tp.fontFamily}" font-size="${tp.fontSize}" font-weight="${tp.fontWeight}" font-style="${tp.fontStyle}" text-anchor="${tp.textAlign}" ${fillAttr} ${strokeAttr} ${opacityAttr} ${transformAttr} ${filterAttr}>
          ${escapeXml(tp.text)}
        </text>
      `);
      continue;
    }

    // Dimension object
    if (obj.type === 'dimension' && obj.dimensionProps) {
      const dp = obj.dimensionProps;
      const midX = (dp.start.x + dp.end.x) / 2;
      const midY = (dp.start.y + dp.end.y) / 2 - dp.offset;
      const dist = Math.hypot(dp.end.x - dp.start.x, dp.end.y - dp.start.y).toFixed(1);
      const text = `${dist} ${dp.showUnits ? dp.unit : ''}`;

      body.push(`
        <g ${transformAttr}>
          <line x1="${dp.start.x}" y1="${dp.start.y - dp.offset}" x2="${dp.end.x}" y2="${dp.end.y - dp.offset}" stroke="${obj.outline.color}" stroke-width="${obj.outline.width}" marker-start="url(#arrow)" marker-end="url(#arrow)" />
          <line x1="${dp.start.x}" y1="${dp.start.y}" x2="${dp.start.x}" y2="${dp.start.y - dp.offset * 1.2}" stroke="${obj.outline.color}" stroke-width="1" stroke-dasharray="2,2" />
          <line x1="${dp.end.x}" y1="${dp.end.y}" x2="${dp.end.x}" y2="${dp.end.y - dp.offset * 1.2}" stroke="${obj.outline.color}" stroke-width="1" stroke-dasharray="2,2" />
          <text x="${midX}" y="${midY - 4}" text-anchor="middle" font-size="12" font-family="Inter, sans-serif" fill="${obj.outline.color}">${text}</text>
        </g>
      `);
      continue;
    }

    // Image object
    if (obj.type === 'image' && obj.imageProps) {
      body.push(`
        <image href="${obj.imageProps.src}" x="${x}" y="${y}" width="${w}" height="${h}" ${opacityAttr} ${transformAttr} />
      `);
      continue;
    }

    // Path / Shape objects
    const pathD = subpathsToSvgPathData(obj.subpaths);
    if (pathD) {
      body.push(`
        <g transform="translate(${x}, ${y})" ${transformAttr}>
          <path d="${pathD}" ${fillAttr} ${strokeAttr} ${opacityAttr} ${filterAttr} />
        </g>
      `);
    }
  }

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 ${width} ${height}" width="${width}" height="${height}">
  <defs>
    ${defs.join('\n')}
  </defs>
  <rect width="100%" height="100%" fill="${page.background || '#ffffff'}" />
  ${body.join('\n')}
</svg>`;
}

function escapeXml(unsafe: string): string {
  return unsafe.replace(/[<>&'"]/g, c => {
    switch (c) {
      case '<': return '&lt;';
      case '>': return '&gt;';
      case '&': return '&amp;';
      case '\'': return '&apos;';
      case '"': return '&quot;';
      default: return c;
    }
  });
}

// Simple SVG String to Corel Objects parser
export function parseSvgToCorelObjects(svgString: string): CorelObject[] {
  const parser = new DOMParser();
  const doc = parser.parseFromString(svgString, 'image/svg+xml');
  const objects: CorelObject[] = [];

  const pathNodes = doc.querySelectorAll('path, rect, circle, ellipse, polygon');
  let idx = 0;

  pathNodes.forEach(node => {
    const tagName = node.tagName.toLowerCase();
    let subpaths: Subpath[] = [];
    let x = 0;
    let y = 0;
    let w = 100;
    let h = 100;

    const fillVal = node.getAttribute('fill') || '#3b82f6';
    const strokeVal = node.getAttribute('stroke') || '#000000';
    const strokeWidth = parseFloat(node.getAttribute('stroke-width') || '0');

    if (tagName === 'rect') {
      x = parseFloat(node.getAttribute('x') || '0');
      y = parseFloat(node.getAttribute('y') || '0');
      w = parseFloat(node.getAttribute('width') || '100');
      h = parseFloat(node.getAttribute('height') || '100');
      subpaths = [
        {
          isClosed: true,
          nodes: [
            { id: '1', x: 0, y: 0, type: 'cusp' },
            { id: '2', x: w, y: 0, type: 'cusp' },
            { id: '3', x: w, y: h, type: 'cusp' },
            { id: '4', x: 0, y: h, type: 'cusp' },
          ],
        },
      ];
    } else if (tagName === 'circle' || tagName === 'ellipse') {
      const cx = parseFloat(node.getAttribute('cx') || '50');
      const cy = parseFloat(node.getAttribute('cy') || '50');
      const rx = parseFloat(node.getAttribute('rx') || node.getAttribute('r') || '50');
      const ry = parseFloat(node.getAttribute('ry') || node.getAttribute('r') || '50');
      x = cx - rx;
      y = cy - ry;
      w = rx * 2;
      h = ry * 2;
      const kx = rx * 0.55228;
      const ky = ry * 0.55228;
      subpaths = [
        {
          isClosed: true,
          nodes: [
            { id: '1', x: rx * 2, y: ry, handleIn: { x: rx * 2, y: ry - ky }, handleOut: { x: rx * 2, y: ry + ky }, type: 'symmetric' },
            { id: '2', x: rx, y: ry * 2, handleIn: { x: rx + kx, y: ry * 2 }, handleOut: { x: rx - kx, y: ry * 2 }, type: 'symmetric' },
            { id: '3', x: 0, y: ry, handleIn: { x: 0, y: ry + ky }, handleOut: { x: 0, y: ry - ky }, type: 'symmetric' },
            { id: '4', x: rx, y: 0, handleIn: { x: rx - kx, y: 0 }, handleOut: { x: rx + kx, y: 0 }, type: 'symmetric' },
          ],
        },
      ];
    }

    if (subpaths.length > 0) {
      idx++;
      objects.push({
        id: `imported_svg_${Date.now()}_${idx}`,
        name: `Imported ${tagName.toUpperCase()} ${idx}`,
        type: 'path',
        transform: {
          x,
          y,
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
          type: fillVal === 'none' ? 'none' : 'solid',
          color: fillVal === 'none' ? '#3b82f6' : fillVal,
        },
        outline: {
          color: strokeVal === 'none' ? '#000000' : strokeVal,
          width: strokeWidth,
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
        zIndex: idx,
      });
    }
  });

  return objects;
}
