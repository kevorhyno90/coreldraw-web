import { PainterlyMediaType, PainterlyStrokePoint } from '../types/coreldraw';

export interface BrushPresetConfig {
  name: string;
  mediaType: PainterlyMediaType;
  defaultSize: number;
  defaultOpacity: number;
  wetness: number;
  bleed: number;
  bristleTexture: number;
  description: string;
  icon: string;
}

export const PAINTERLY_PRESETS: BrushPresetConfig[] = [
  {
    name: 'Wet Watercolor Wash',
    mediaType: 'watercolor',
    defaultSize: 36,
    defaultOpacity: 0.65,
    wetness: 85,
    bleed: 70,
    bristleTexture: 10,
    description: 'Soft translucent pigment bleeding with feathered wet edges',
    icon: '🌊',
  },
  {
    name: 'Dry Pastel & Chalk',
    mediaType: 'pastel',
    defaultSize: 24,
    defaultOpacity: 0.85,
    wetness: 10,
    bleed: 5,
    bristleTexture: 80,
    description: 'Grainy paper stippling and textured edge breakup',
    icon: '🖍️',
  },
  {
    name: 'Impasto Acrylic',
    mediaType: 'acrylic',
    defaultSize: 28,
    defaultOpacity: 0.95,
    wetness: 40,
    bleed: 20,
    bristleTexture: 65,
    description: 'Rich opaque paint with heavy dimensional bristle ridges',
    icon: '🎨',
  },
  {
    name: 'Classic Fine Oil',
    mediaType: 'oil',
    defaultSize: 22,
    defaultOpacity: 0.9,
    wetness: 60,
    bleed: 35,
    bristleTexture: 75,
    description: 'Glossy blendable strokes with natural striations',
    icon: '🖌️',
  },
  {
    name: 'Wet Blend Smudger',
    mediaType: 'wet-blend',
    defaultSize: 32,
    defaultOpacity: 0.5,
    wetness: 95,
    bleed: 90,
    bristleTexture: 30,
    description: 'Soft gradient blending and pigment smearing',
    icon: '💨',
  },
  {
    name: 'Calligraphic Ribbon',
    mediaType: 'calligraphy',
    defaultSize: 18,
    defaultOpacity: 1.0,
    wetness: 20,
    bleed: 0,
    bristleTexture: 0,
    description: 'Dynamic chisel-nib angle variation and clean vector paths',
    icon: '✒️',
  },
  {
    name: 'Splatter & Spray',
    mediaType: 'spray',
    defaultSize: 45,
    defaultOpacity: 0.75,
    wetness: 50,
    bleed: 60,
    bristleTexture: 90,
    description: 'Aerosol mist with organic particle dispersion',
    icon: '✨',
  },
];

/**
 * Generate smooth SVG path from painterly stroke points with pressure variation
 */
export function generatePainterlyPath(points: PainterlyStrokePoint[], baseSize: number): string {
  if (points.length === 0) return '';
  if (points.length === 1) {
    const p = points[0];
    const r = (baseSize * (p.pressure || 0.5)) / 2;
    return `M ${p.x - r} ${p.y} A ${r} ${r} 0 1 0 ${p.x + r} ${p.y} A ${r} ${r} 0 1 0 ${p.x - r} ${p.y} Z`;
  }

  // Generate smooth outline polygon or curve path
  let path = `M ${points[0].x.toFixed(2)} ${points[0].y.toFixed(2)}`;
  for (let i = 1; i < points.length; i++) {
    const prev = points[i - 1];
    const curr = points[i];
    const midX = (prev.x + curr.x) / 2;
    const midY = (prev.y + curr.y) / 2;
    path += ` Q ${prev.x.toFixed(2)} ${prev.y.toFixed(2)} ${midX.toFixed(2)} ${midY.toFixed(2)}`;
  }
  const last = points[points.length - 1];
  path += ` L ${last.x.toFixed(2)} ${last.y.toFixed(2)}`;
  return path;
}

/**
 * Filter definition for SVG painterly effects
 */
export function getPainterlyFilterId(mediaType: PainterlyMediaType): string {
  return `filter-painterly-${mediaType}`;
}

export function getPainterlySvgFilters(): string {
  return `
    <defs>
      <!-- Watercolor bleed filter with turbulence -->
      <filter id="filter-painterly-watercolor" x="-20%" y="-20%" width="140%" height="140%">
        <feTurbulence type="fractalNoise" baseFrequency="0.04" numOctaves="4" result="noise" />
        <feDisplacementMap in="SourceGraphic" in2="noise" scale="8" xChannelSelector="R" yChannelSelector="G" result="displaced" />
        <feGaussianBlur in="displaced" stdDeviation="1.5" result="blurred" />
        <feMerge>
          <feMergeNode in="blurred" />
          <feMergeNode in="SourceGraphic" opacity="0.6" />
        </feMerge>
      </filter>

      <!-- Pastel & Chalk texture filter -->
      <filter id="filter-painterly-pastel" x="-10%" y="-10%" width="120%" height="120%">
        <feTurbulence type="fractalNoise" baseFrequency="0.18" numOctaves="3" result="grain" />
        <feColorMatrix type="matrix" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 3 -0.5" in="grain" result="grainAlpha" />
        <feComposite operator="in" in="SourceGraphic" in2="grainAlpha" result="textured" />
        <feMerge>
          <feMergeNode in="SourceGraphic" opacity="0.5" />
          <feMergeNode in="textured" />
        </feMerge>
      </filter>

      <!-- Acrylic impasto ridge filter -->
      <filter id="filter-painterly-acrylic" x="-15%" y="-15%" width="130%" height="130%">
        <feTurbulence type="turbulence" baseFrequency="0.08" numOctaves="2" result="brushNoise" />
        <feDisplacementMap in="SourceGraphic" in2="brushNoise" scale="4" xChannelSelector="R" yChannelSelector="B" result="rough" />
        <feSpecularLighting in="rough" surfaceScale="2" specularConstant="0.8" specularExponent="15" result="specular">
          <feDistantLight azimuth="45" elevation="60" />
        </feSpecularLighting>
        <feComposite in="rough" in2="specular" operator="arithmetic" k1="0" k2="1" k3="0.5" k4="0" />
      </filter>

      <!-- Oil painting glossy blend filter -->
      <filter id="filter-painterly-oil" x="-15%" y="-15%" width="130%" height="130%">
        <feTurbulence type="fractalNoise" baseFrequency="0.06" numOctaves="3" result="oilNoise" />
        <feDisplacementMap in="SourceGraphic" in2="oilNoise" scale="5" xChannelSelector="G" yChannelSelector="R" result="blend" />
        <feSpecularLighting in="blend" surfaceScale="2.5" specularConstant="1.2" specularExponent="25" result="sheen">
          <fePointLight x="200" y="100" z="200" />
        </feSpecularLighting>
        <feComposite in="blend" in2="sheen" operator="arithmetic" k1="0" k2="1" k3="0.4" k4="0" />
      </filter>
    </defs>
  `;
}
