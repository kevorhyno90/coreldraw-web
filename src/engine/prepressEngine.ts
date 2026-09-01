import { CorelObject, CorelPage, PrepressSettings } from '../types/coreldraw';
import { hexToCmyk } from './pantoneDualities';

export interface PlateSeparationResult {
  plate: 'cyan' | 'magenta' | 'yellow' | 'black' | 'spot';
  plateName: string;
  color: string;
  density: number; // 0 to 1
  objects: CorelObject[];
}

/**
 * Filter an object's fill and outline color for a specific CMYK plate
 */
export function getSeparationFilteredColor(
  hexColor: string,
  plate: 'cyan' | 'magenta' | 'yellow' | 'black' | 'spot',
  invert: boolean
): string {
  if (!hexColor || hexColor === 'none' || hexColor === 'transparent') return 'none';
  const [c, m, y, k] = hexToCmyk(hexColor);

  let density = 0;
  if (plate === 'cyan') density = c / 100;
  else if (plate === 'magenta') density = m / 100;
  else if (plate === 'yellow') density = y / 100;
  else if (plate === 'black') density = k / 100;
  else if (plate === 'spot') density = (c + m + y + k) > 10 ? 1 : 0;

  if (invert) {
    density = 1 - density;
  }

  // Convert density into grayscale plate representation (0 density = white, 1 density = black)
  const grayVal = Math.round(255 * (1 - density));
  return `rgb(${grayVal}, ${grayVal}, ${grayVal})`;
}

/**
 * Generate CutContour hairline path for vinyl plotters and CNC cutters
 */
export function createCutContourObject(sourceObj: CorelObject): CorelObject {
  return {
    ...sourceObj,
    id: `cutcontour-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    name: `CutContour - ${sourceObj.name}`,
    fill: { type: 'none', color: 'none' },
    outline: {
      color: '#FF007F', // Standard Prepress CutContour Spot 100% Magenta/Pink
      width: 0.25, // Hairline
      style: 'cut-contour',
      cap: 'round',
      join: 'round',
      startArrow: 'none',
      endArrow: 'none',
      isCutContour: true,
    },
    shadow: { enabled: false, color: '', blur: 0, offsetX: 0, offsetY: 0, opacity: 0 },
    extrude: { enabled: false, depth: 0, angle: 0, vanishingPoint: { x: 0, y: 0 }, bevel: 0, lightIntensity: 1 },
    contour: { enabled: false, type: 'outside', steps: 1, offset: 0, endColor: '' },
    transparency: { enabled: false, type: 'uniform', opacity: 1 },
  };
}

/**
 * Compute imposition layout positions for pages
 */
export interface ImposedPageSlot {
  pageIndex: number;
  pageId: string;
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number;
  sheetNumber: number;
}

export function computeImpositionLayout(
  pages: CorelPage[],
  sheetWidth: number,
  sheetHeight: number,
  impositionType: PrepressSettings['imposition'],
  _bleedMm: number = 3
): ImposedPageSlot[] {
  const slots: ImposedPageSlot[] = [];
  if (pages.length === 0) return slots;

  if (impositionType === '1-up') {
    pages.forEach((p, idx) => {
      slots.push({
        pageIndex: idx,
        pageId: p.id,
        x: (sheetWidth - p.width) / 2,
        y: (sheetHeight - p.height) / 2,
        width: p.width,
        height: p.height,
        rotation: 0,
        sheetNumber: idx + 1,
      });
    });
  } else if (impositionType === '2-up-spread' || impositionType === '2-up-booklet') {
    const pw = pages[0]?.width || 400;
    const ph = pages[0]?.height || 600;
    const totalW = pw * 2 + 20;
    const startX = (sheetWidth - totalW) / 2;
    const startY = (sheetHeight - ph) / 2;

    for (let i = 0; i < pages.length; i += 2) {
      const sheetNum = Math.floor(i / 2) + 1;
      // Left Page
      if (pages[i]) {
        slots.push({
          pageIndex: i,
          pageId: pages[i].id,
          x: startX,
          y: startY,
          width: pw,
          height: ph,
          rotation: 0,
          sheetNumber: sheetNum,
        });
      }
      // Right Page
      if (pages[i + 1]) {
        slots.push({
          pageIndex: i + 1,
          pageId: pages[i + 1].id,
          x: startX + pw + 20,
          y: startY,
          width: pw,
          height: ph,
          rotation: 0,
          sheetNumber: sheetNum,
        });
      }
    }
  } else if (impositionType === '4-up-step') {
    const pw = (sheetWidth - 60) / 2;
    const ph = (sheetHeight - 60) / 2;

    for (let i = 0; i < pages.length; i += 4) {
      const sheetNum = Math.floor(i / 4) + 1;
      const positions = [
        { x: 20, y: 20 },
        { x: pw + 40, y: 20 },
        { x: 20, y: ph + 40 },
        { x: pw + 40, y: ph + 40 },
      ];
      for (let s = 0; s < 4; s++) {
        if (pages[i + s]) {
          slots.push({
            pageIndex: i + s,
            pageId: pages[i + s].id,
            x: positions[s].x,
            y: positions[s].y,
            width: pw,
            height: ph,
            rotation: 0,
            sheetNumber: sheetNum,
          });
        }
      }
    }
  }

  return slots;
}
