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

export type FillType = 'none' | 'solid' | 'linear' | 'radial' | 'pattern';

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
}

export type StrokeStyle = 'solid' | 'dashed' | 'dotted' | 'dash-dot';
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
  imageProps?: {
    src: string;
    naturalWidth: number;
    naturalHeight: number;
    filter?: {
      brightness: number;
      contrast: number;
      invert: boolean;
      grayscale: boolean;
    };
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
  | 'smart-fill';

export type DockerTab =
  | 'objects'
  | 'properties'
  | 'transform'
  | 'shaping'
  | 'colors'
  | 'effects'
  | 'trace'
  | 'align'
  | 'history';

export type ViewMode = 'wireframe' | 'draft' | 'normal' | 'enhanced';

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
