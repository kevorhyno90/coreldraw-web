import { Point2D, Subpath, BezierNode, CorelObject } from '../types/coreldraw';

export type ArtisticCategory = 'preset' | 'brush' | 'sprayer' | 'calligraphic' | 'expression';

export interface BrushPreset {
  id: string;
  name: string;
  category: ArtisticCategory;
  description: string;
  previewIcon: string;
  defaultWidth: number;
  angle?: number;
  smoothing: number;
  opacity: number;
  scatterObjects?: string[];
}

export const ARTISTIC_BRUSH_PRESETS: BrushPreset[] = [
  // Calligraphic & Presets
  {
    id: 'calligraphy_classic',
    name: 'Classic Calligraphy',
    category: 'calligraphic',
    description: 'Chiseled 45° angle calligraphic stroke with dynamic width transitions.',
    previewIcon: '✒️',
    defaultWidth: 16,
    angle: 45,
    smoothing: 0.7,
    opacity: 1,
  },
  {
    id: 'chisel_marker',
    name: 'Broad Chisel Marker',
    category: 'preset',
    description: 'Crisp angled highlighter / marker stroke.',
    previewIcon: '🖊️',
    defaultWidth: 24,
    angle: 60,
    smoothing: 0.6,
    opacity: 0.85,
  },
  {
    id: 'fine_quill',
    name: 'Fine Pen & Quill',
    category: 'preset',
    description: 'Tapered pressure-sensitive inking pen.',
    previewIcon: '🖋️',
    defaultWidth: 6,
    smoothing: 0.8,
    opacity: 1,
  },

  // Artistic Brushes
  {
    id: 'watercolor_wash',
    name: 'Watercolor Wash',
    category: 'brush',
    description: 'Soft translucent watercolor stroke with bleeding edges.',
    previewIcon: '🎨',
    defaultWidth: 32,
    smoothing: 0.85,
    opacity: 0.6,
  },
  {
    id: 'charcoal_rough',
    name: 'Rough Charcoal',
    category: 'brush',
    description: 'Textured chalk & charcoal stroke for expressive sketching.',
    previewIcon: '✏️',
    defaultWidth: 18,
    smoothing: 0.4,
    opacity: 0.9,
  },
  {
    id: 'oil_impasto',
    name: 'Oil Pastel',
    category: 'brush',
    description: 'Rich opaque oil pastel paint brush.',
    previewIcon: '🖌️',
    defaultWidth: 22,
    smoothing: 0.75,
    opacity: 1,
  },
  {
    id: 'neon_glow',
    name: 'Neon Glow Tube',
    category: 'brush',
    description: 'Electric glowing vector neon stroke.',
    previewIcon: '⚡',
    defaultWidth: 14,
    smoothing: 0.9,
    opacity: 1,
  },

  // Sprayer Presets
  {
    id: 'sprayer_stars',
    name: 'Stars Sprayer',
    category: 'sprayer',
    description: 'Scatters glowing 5-point stars along the drawn path.',
    previewIcon: '⭐',
    defaultWidth: 40,
    smoothing: 0.7,
    opacity: 1,
    scatterObjects: ['star'],
  },
  {
    id: 'sprayer_bubbles',
    name: 'Bubbles Sprayer',
    category: 'sprayer',
    description: 'Scatters iridescent glass bubbles along the curve.',
    previewIcon: '🫧',
    defaultWidth: 45,
    smoothing: 0.7,
    opacity: 0.8,
    scatterObjects: ['bubble'],
  },
  {
    id: 'sprayer_sparkles',
    name: 'Sparkles & Diamonds',
    category: 'sprayer',
    description: 'Scatters 4-point sparkle diamonds with glowing cores.',
    previewIcon: '✨',
    defaultWidth: 35,
    smoothing: 0.7,
    opacity: 1,
    scatterObjects: ['sparkle'],
  },
  {
    id: 'sprayer_leaves',
    name: 'Autumn Leaves Sprayer',
    category: 'sprayer',
    description: 'Scatters warm autumn oak and maple leaves along the path.',
    previewIcon: '🍂',
    defaultWidth: 50,
    smoothing: 0.65,
    opacity: 1,
    scatterObjects: ['leaf'],
  },
  {
    id: 'sprayer_hearts',
    name: 'Hearts Garland',
    category: 'sprayer',
    description: 'Scatters romantic vector hearts along the stroke.',
    previewIcon: '❤️',
    defaultWidth: 38,
    smoothing: 0.7,
    opacity: 1,
    scatterObjects: ['heart'],
  },
];

/**
 * Generate Calligraphic Chiseled Ribbon Polygon Outline
 */
export function generateCalligraphicStroke(
  points: Point2D[],
  width: number,
  angleDegrees: number = 45
): Subpath[] {
  if (points.length < 2) return [];

  const rad = (angleDegrees * Math.PI) / 180;
  const halfW = width / 2;
  const dx = Math.cos(rad) * halfW;
  const dy = Math.sin(rad) * halfW;

  const leftNodes: BezierNode[] = [];
  const rightNodes: BezierNode[] = [];

  points.forEach((pt, i) => {
    leftNodes.push({
      id: `calli_l_${i}`,
      x: pt.x + dx,
      y: pt.y - dy,
      type: 'smooth',
    });
    rightNodes.unshift({
      id: `calli_r_${i}`,
      x: pt.x - dx,
      y: pt.y + dy,
      type: 'smooth',
    });
  });

  const allNodes = [...leftNodes, ...rightNodes];

  return [
    {
      isClosed: true,
      nodes: allNodes,
    },
  ];
}

/**
 * Generate Scattered Vector Sprayer Objects Along Path
 */
export function generateSprayerParticles(
  points: Point2D[],
  preset: BrushPreset,
  baseColor: string
): CorelObject[] {
  if (points.length < 2) return [];

  const particles: CorelObject[] = [];
  const spacing = Math.max(15, preset.defaultWidth * 0.75);

  let accumulatedDist = 0;
  let lastPt = points[0];

  for (let i = 1; i < points.length; i++) {
    const pt = points[i];
    const segDist = Math.hypot(pt.x - lastPt.x, pt.y - lastPt.y);
    accumulatedDist += segDist;

    if (accumulatedDist >= spacing) {
      accumulatedDist = 0;
      const size = (preset.defaultWidth * (0.6 + Math.random() * 0.8));
      const jitterX = (Math.random() - 0.5) * (preset.defaultWidth * 0.4);
      const jitterY = (Math.random() - 0.5) * (preset.defaultWidth * 0.4);
      const rot = Math.floor(Math.random() * 360);

      const scatterType = preset.scatterObjects?.[0] || 'star';

      if (scatterType === 'star') {
        particles.push({
          id: `spray_star_${Date.now()}_${i}`,
          name: `Sprayed Star ${i}`,
          type: 'star',
          transform: {
            x: pt.x + jitterX - size / 2,
            y: pt.y + jitterY - size / 2,
            width: size,
            height: size,
            rotation: rot,
            scaleX: 1,
            scaleY: 1,
            skewX: 0,
            skewY: 0,
          },
          starProps: { points: 5, sharpness: 0.5 },
          subpaths: [],
          fill: { type: 'solid', color: baseColor || '#f59e0b' },
          outline: { color: 'none', width: 0, style: 'solid', cap: 'round', join: 'round', startArrow: 'none', endArrow: 'none' },
          shadow: { enabled: true, color: '#f59e0b', blur: 4, offsetX: 0, offsetY: 0, opacity: 0.6 },
          extrude: { enabled: false, depth: 0, angle: 0, vanishingPoint: { x: 0, y: 0 }, bevel: 0, lightIntensity: 0.8 },
          contour: { enabled: false, type: 'outside', steps: 1, offset: 5, endColor: '#fff' },
          transparency: { enabled: false, type: 'uniform', opacity: 1 },
          opacity: 0.9,
          locked: false,
          visible: true,
          zIndex: 1,
        });
      } else if (scatterType === 'bubble') {
        particles.push({
          id: `spray_bubble_${Date.now()}_${i}`,
          name: `Sprayed Bubble ${i}`,
          type: 'ellipse',
          transform: {
            x: pt.x + jitterX - size / 2,
            y: pt.y + jitterY - size / 2,
            width: size,
            height: size,
            rotation: 0,
            scaleX: 1,
            scaleY: 1,
            skewX: 0,
            skewY: 0,
          },
          ellipseProps: { kind: 'ellipse', startAngle: 0, endAngle: 360 },
          subpaths: [],
          fill: { type: 'solid', color: 'rgba(56, 189, 248, 0.4)' },
          outline: { color: '#ffffff', width: 1.5, style: 'solid', cap: 'round', join: 'round', startArrow: 'none', endArrow: 'none' },
          shadow: { enabled: false, color: '#000', blur: 0, offsetX: 0, offsetY: 0, opacity: 0 },
          extrude: { enabled: false, depth: 0, angle: 0, vanishingPoint: { x: 0, y: 0 }, bevel: 0, lightIntensity: 0.8 },
          contour: { enabled: false, type: 'outside', steps: 1, offset: 5, endColor: '#fff' },
          transparency: { enabled: false, type: 'uniform', opacity: 0.8 },
          opacity: 0.85,
          locked: false,
          visible: true,
          zIndex: 1,
        });
      } else {
        // Generic sparkle / circle particle
        particles.push({
          id: `spray_pt_${Date.now()}_${i}`,
          name: `Sprayed Element ${i}`,
          type: 'ellipse',
          transform: {
            x: pt.x + jitterX - size / 2,
            y: pt.y + jitterY - size / 2,
            width: size,
            height: size,
            rotation: rot,
            scaleX: 1,
            scaleY: 1,
            skewX: 0,
            skewY: 0,
          },
          ellipseProps: { kind: 'ellipse', startAngle: 0, endAngle: 360 },
          subpaths: [],
          fill: { type: 'solid', color: baseColor },
          outline: { color: 'none', width: 0, style: 'solid', cap: 'round', join: 'round', startArrow: 'none', endArrow: 'none' },
          shadow: { enabled: true, color: baseColor, blur: 6, offsetX: 0, offsetY: 0, opacity: 0.7 },
          extrude: { enabled: false, depth: 0, angle: 0, vanishingPoint: { x: 0, y: 0 }, bevel: 0, lightIntensity: 0.8 },
          contour: { enabled: false, type: 'outside', steps: 1, offset: 5, endColor: '#fff' },
          transparency: { enabled: false, type: 'uniform', opacity: 1 },
          opacity: 1,
          locked: false,
          visible: true,
          zIndex: 1,
        });
      }
    }

    lastPt = pt;
  }

  return particles;
}
