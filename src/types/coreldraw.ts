export interface Point2D {
  x: number;
  y: number;
}

export type NodeType = 'cusp' | 'smooth' | 'symmetric';

export interface BezierNode {
  id: string;
  x: number;
  y: number;
  handleIn?: Point2D | null;
  handleOut?: Point2D | null;
  type: NodeType;
  isSelected?: boolean;
}

export interface Subpath {
  nodes: BezierNode[];
  isClosed: boolean;
}

export type FillType = 'none' | 'solid' | 'linear' | 'radial' | 'pattern' | 'mesh';

export interface GradientStop {
  offset: number; // 0 to 1
  color: string;
}

export interface GradientFill {
  type: 'linear' | 'radial' | 'conical';
  start: Point2D;
  end: Point2D;
  stops: GradientStop[];
}

export interface ObjectFill {
  type: FillType;
  color: string;
  gradient?: GradientFill;
  pantoneSpot?: {
    code: string;
    name: string;
    cmyk: [number, number, number, number];
  };
}

export type StrokeStyle = 'solid' | 'dashed' | 'dotted' | 'dash-dot' | 'cut-contour';
export type StrokeCap = 'butt' | 'round' | 'square';
export type StrokeJoin = 'miter' | 'round' | 'bevel';
export type ArrowheadType = 'none' | 'arrow' | 'stealth' | 'circle' | 'diamond' | 'bar';

export interface ObjectOutline {
  color: string;
  width: number;
  style: StrokeStyle;
  cap: StrokeCap;
  join: StrokeJoin;
  startArrow: ArrowheadType;
  endArrow: ArrowheadType;
  behindFill?: boolean;
  scaleWithObject?: boolean;
  isCutContour?: boolean; // Prepress / Vinyl Cutter Hairline
}

export interface DropShadowEffect {
  enabled: boolean;
  color: string;
  blur: number;
  offsetX: number;
  offsetY: number;
  opacity: number;
}

export interface Extrude3DEffect {
  enabled: boolean;
  depth: number;
  angle: number; // in degrees
  vanishingPoint: Point2D;
  bevel: number;
  lightIntensity: number;
  faceColor?: string;
  sideColor?: string;
}

export interface ContourEffect {
  enabled: boolean;
  type: 'outside' | 'inside' | 'center';
  steps: number;
  offset: number;
  endColor: string;
}

export interface TransparencyEffect {
  enabled: boolean;
  type: 'uniform' | 'linear' | 'radial';
  opacity: number; // 0 to 1
  start?: Point2D;
  end?: Point2D;
}

export type PainterlyMediaType =
  | 'watercolor'
  | 'pastel'
  | 'chalk'
  | 'acrylic'
  | 'oil'
  | 'wet-blend'
  | 'calligraphy'
  | 'marker'
  | 'charcoal'
  | 'spray';

export interface PainterlyStrokePoint {
  x: number;
  y: number;
  pressure: number; // 0 to 1
  tiltX?: number;
  tiltY?: number;
  speed?: number;
}

export interface PainterlyBrushSettings {
  mediaType: PainterlyMediaType;
  size: number;
  opacity: number;
  color: string;
  wetness: number; // 0 to 100
  bleed: number; // 0 to 100
  bristleTexture: number; // 0 to 100
  tiltSensitivity: boolean;
  jitter: number;
}

export type ObjectType =
  | 'path'
  | 'rect'
  | 'ellipse'
  | 'polygon'
  | 'star'
  | 'complex-star'
  | 'spiral'
  | 'graph-paper'
  | 'text'
  | 'dimension'
  | 'artistic-brush'
  | 'painterly-brush'
  | 'image'
  | 'group';

export interface CorelTransform {
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number; // degrees
  scaleX: number;
  scaleY: number;
  skewX: number;
  skewY: number;
}

export interface CorelObject {
  id: string;
  name: string;
  type: ObjectType;
  transform: CorelTransform;
  
  // Vector geometry data (when converted to curves or custom path)
  subpaths: Subpath[];
  
  // Shape specific parameters (parametric before "Convert to Curves")
  rectProps?: {
    cornerRadii: [number, number, number, number]; // tl, tr, br, bl
    isRoundedLinked: boolean;
  };
  ellipseProps?: {
    kind: 'ellipse' | 'pie' | 'arc';
    startAngle: number;
    endAngle: number;
  };
  polygonProps?: {
    sides: number;
  };
  starProps?: {
    points: number;
    sharpness: number; // 0 to 1 inner radius ratio
  };
  spiralProps?: {
    turns: number;
    type: 'symmetric' | 'logarithmic';
  };
  graphPaperProps?: {
    rows: number;
    cols: number;
  };
  textProps?: {
    text: string;
    fontFamily: string;
    fontSize: number;
    fontWeight: string | number;
    fontStyle: 'normal' | 'italic';
    textDecoration: 'none' | 'underline' | 'line-through';
    textAlign: 'left' | 'center' | 'right' | 'justify';
    letterSpacing: number;
    lineHeight: number;
    fitToPathId?: string;
    variableWeight?: number;
    variableWidth?: number;
    variableSlant?: number;
  };
  dimensionProps?: {
    start: Point2D;
    end: Point2D;
    offset: number;
    unit: 'mm' | 'px' | 'in' | 'cm';
    decimalPlaces: number;
    showUnits: boolean;
  };
  brushProps?: {
    preset: 'calligraphy' | 'watercolor' | 'marker' | 'charcoal' | 'spray';
    smoothing: number;
    pressurePoints?: number[];
  };
  painterlyProps?: {
    mediaType: PainterlyMediaType;
    points: PainterlyStrokePoint[];
    size: number;
    opacity: number;
    wetness: number;
    bleed: number;
    color: string;
  };
  imageProps?: {
    src: string;
    naturalWidth: number;
    naturalHeight: number;
    filter?: {
      brightness: number; // 50 to 200
      contrast: number; // 50 to 200
      saturation: number; // 0 to 200
      hueRotate: number; // 0 to 360
      blur: number; // 0 to 20
      sepia: number; // 0 to 100
      grayscale: number; // 0 to 100
      invert: boolean;
      levelsMin?: number;
      levelsMax?: number;
      levelsGamma?: number;
      curvesHighlight?: number;
      curvesShadow?: number;
      vibrance?: number;
    };
    maskDataUrl?: string;
  };
  groupProps?: {
    childrenIds: string[];
  };

  // Styling & effects
  fill: ObjectFill;
  outline: ObjectOutline;
  shadow: DropShadowEffect;
  extrude: Extrude3DEffect;
  contour: ContourEffect;
  transparency: TransparencyEffect;
  
  opacity: number;
  locked: boolean;
  visible: boolean;
  zIndex: number;
}

export interface CorelPage {
  id: string;
  name: string;
  width: number;
  height: number;
  unit: 'mm' | 'px' | 'in';
  preset: string; // e.g. 'A4', 'Letter', '1080p', 'Custom'
  orientation: 'portrait' | 'landscape';
  background: string;
  isMasterPage?: boolean;
}

export interface Guideline {
  id: string;
  orientation: 'horizontal' | 'vertical';
  position: number;
  color: string;
  locked?: boolean;
}

export interface SnapSettings {
  snapToGrid: boolean;
  snapToGuidelines: boolean;
  snapToObjects: boolean;
  snapToPage: boolean;
  gridSize: number;
  snapThreshold: number;
}

export type ActiveTool =
  | 'pick'
  | 'freehand-pick'
  | 'shape' // F10 Node Tool
  | 'smooth'
  | 'smudge'
  | 'roughen'
  | 'crop'
  | 'knife'
  | 'eraser'
  | 'virtual-segment-delete'
  | 'zoom'
  | 'pan'
  | 'freehand' // F5
  | '2point-line'
  | 'bezier'
  | 'pen'
  | 'bspline'
  | 'polyline'
  | '3point-curve'
  | 'artistic-media'
  | 'painterly-brush' // 2025 Painterly Brush
  | 'rectangle' // F6
  | '3point-rectangle'
  | 'ellipse' // F7
  | '3point-ellipse'
  | 'polygon' // Y
  | 'star'
  | 'complex-star'
  | 'graph-paper' // D
  | 'spiral'
  | 'text' // F8
  | 'dimension'
  | 'connector'
  | 'drop-shadow'
  | 'contour'
  | 'blend'
  | 'distort'
  | 'envelope'
  | 'extrude'
  | 'transparency'
  | 'color-eyedropper'
  | 'attributes-eyedropper'
  | 'interactive-fill' // G
  | 'smart-fill'
  | 'photo-retouch'
  | 'photo-mask'
  | 'capture-region';

export type DockerTab =
  | 'objects'
  | 'properties'
  | 'transform'
  | 'shaping'
  | 'colors'
  | 'effects'
  | 'photo'
  | 'typography'
  | 'fontmanager'
  | 'prepress'
  | 'ai'
  | 'trace'
  | 'align'
  | 'history'
  | 'cloud';

export type ViewMode = 'wireframe' | 'draft' | 'normal' | 'enhanced';

export type SuiteAppMode =
  | 'coreldraw'
  | 'photopaint'
  | 'fontmanager'
  | 'powertrace'
  | 'capture'
  | 'cloud';

export interface PrepressSettings {
  mode: 'composite' | 'separations' | 'imposition' | 'cutpath';
  separations: {
    cyan: boolean;
    magenta: boolean;
    yellow: boolean;
    black: boolean;
    spots: boolean;
  };
  invertPlates: boolean;
  activeSeparationView?: 'all' | 'cyan' | 'magenta' | 'yellow' | 'black' | 'spot';
  imposition: '1-up' | '2-up-spread' | '2-up-booklet' | '4-up-step' | '8-up-signature';
  binding: 'saddle-stitch' | 'perfect-bound' | 'side-stitch';
  creepMm: number;
  bleedMm: number;
  slugMm: number;
  cropMarks: boolean;
  registrationMarks: boolean;
  colorBars: boolean;
  starTargets: boolean;
  showCutContours: boolean;
}

export interface PantoneColor {
  code: string;
  name: string;
  hex: string;
  cmyk: [number, number, number, number];
  category: 'Dualities 2025' | 'PMS Solid' | 'Pastels' | 'Neon' | 'Metallics' | 'Earth & Luxe';
}

export interface GoogleFontMeta {
  family: string;
  category: 'sans-serif' | 'serif' | 'display' | 'handwriting' | 'monospace';
  variants: string[];
  isVariable: boolean;
  popularRank: number;
  axes?: {
    weight?: [number, number];
    width?: [number, number];
    slant?: [number, number];
  };
}

export interface HistoryStep {
  id: string;
  actionName: string;
  timestamp: number;
  snapshot: {
    pages: CorelPage[];
    activePageId: string;
    objects: Record<string, CorelObject[]>; // pageId -> objects
    selectedIds: string[];
    guidelines: Guideline[];
  };
}

export interface ProjectDocument {
  id: string;
  name: string;
  version: string;
  createdAt: string;
  updatedAt: string;
  pages: CorelPage[];
  activePageId: string;
  objects: Record<string, CorelObject[]>;
  guidelines: Guideline[];
  snapSettings: SnapSettings;
  colorPalette: string[];
}
