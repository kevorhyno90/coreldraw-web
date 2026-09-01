import React, { createContext, useContext, useState, useEffect, useCallback, useMemo, useRef } from 'react';
import {
  ActiveTool,
  CorelObject,
  CorelPage,
  DockerTab,
  Guideline,
  HistoryStep,
  Point2D,
  ProjectDocument,
  SnapSettings,
  ViewMode,
  BezierNode,
  Subpath,
  SuiteAppMode,
  PrepressSettings,
  PainterlyBrushSettings,
} from '../types/coreldraw';
import { PRESET_TEMPLATES } from '../engine/presetTemplates';
import { getSelectionBounds, rectToSubpaths, ellipseToSubpaths, polygonToSubpaths, starToSubpaths } from '../engine/vectorMath';
import { BooleanOp, performBooleanOperation } from '../engine/booleanOps';
import { createCutContourObject } from '../engine/prepressEngine';
import { PANTONE_DUALITIES_2025 } from '../engine/pantoneDualities';

const DEFAULT_PAGE: CorelPage = {
  id: 'page_1',
  name: 'Page 1',
  width: 1000,
  height: 750,
  unit: 'px',
  preset: 'A4 Standard',
  orientation: 'landscape',
  background: '#ffffff',
  isMasterPage: false,
};

const DEFAULT_SNAP: SnapSettings = {
  snapToGrid: false,
  snapToGuidelines: true,
  snapToObjects: true,
  snapToPage: true,
  gridSize: 20,
  snapThreshold: 8,
};

const DEFAULT_PALETTE = [
  '#000000', '#1e293b', '#475569', '#94a3b8', '#cbd5e1', '#f1f5f9', '#ffffff',
  '#ef4444', '#f97316', '#f59e0b', '#eab308', '#84cc16', '#22c55e', '#10b981',
  '#06b6d4', '#0ea5e9', '#3b82f6', '#6366f1', '#8b5cf6', '#a855f7', '#d946ef', '#ec4899', '#f43f5e',
  '#b91c1c', '#c2410c', '#b45309', '#4d7c0f', '#15803d', '#0f766e', '#0369a1', '#1d4ed8', '#4338ca', '#6d28d9', '#86198f', '#be185d'
];

const DEFAULT_PREPRESS: PrepressSettings = {
  mode: 'composite',
  separations: {
    cyan: true,
    magenta: true,
    yellow: true,
    black: true,
    spots: true,
  },
  invertPlates: false,
  activeSeparationView: 'all',
  imposition: '1-up',
  binding: 'saddle-stitch',
  creepMm: 0.5,
  bleedMm: 3,
  slugMm: 12,
  cropMarks: true,
  registrationMarks: true,
  colorBars: true,
  starTargets: true,
  showCutContours: true,
};

const DEFAULT_PAINTERLY_BRUSH: PainterlyBrushSettings = {
  mediaType: 'watercolor',
  size: 32,
  opacity: 0.75,
  color: '#3b82f6',
  wetness: 80,
  bleed: 65,
  bristleTexture: 20,
  tiltSensitivity: true,
  jitter: 5,
};

interface CorelContextType {
  // Suite 2025 App Mode Switcher
  suiteAppMode: SuiteAppMode;
  setSuiteAppMode: (mode: SuiteAppMode) => void;

  // Document & Pages
  projectTitle: string;
  setProjectTitle: (t: string) => void;
  pages: CorelPage[];
  activePageId: string;
  activePage: CorelPage;
  addPage: (preset?: string, name?: string) => void;
  deletePage: (id: string) => void;
  duplicatePage: (id: string) => void;
  reorderPages: (fromIndex: number, toIndex: number) => void;
  setActivePageId: (id: string) => void;
  updateActivePage: (patch: Partial<CorelPage>) => void;

  // Objects
  objects: Record<string, CorelObject[]>;
  activeObjects: CorelObject[];
  addObject: (obj: Partial<CorelObject>) => CorelObject;
  updateObject: (id: string, patch: Partial<CorelObject>, recordHistory?: boolean) => void;
  updateSelectedObjects: (patch: Partial<CorelObject>, recordHistory?: boolean) => void;
  deleteSelected: () => void;
  duplicateSelected: () => void;
  selectAll: () => void;

  // Selection
  selectedIds: string[];
  setSelectedIds: (ids: string[]) => void;
  toggleSelect: (id: string, multi?: boolean) => void;
  clearSelection: () => void;
  selectedObjects: CorelObject[];
  primarySelectedObject: CorelObject | null;
  selectionBounds: ReturnType<typeof getSelectionBounds>;

  // Tools & UI State
  activeTool: ActiveTool;
  setActiveTool: (tool: ActiveTool) => void;
  activeFlyout: string | null;
  setActiveFlyout: (f: string | null) => void;
  viewMode: ViewMode;
  setViewMode: (m: ViewMode) => void;
  activeDockerTab: DockerTab | null;
  setActiveDockerTab: (tab: DockerTab | null) => void;
  openDialog: 'new' | 'export' | 'templates' | 'shortcuts' | 'about' | 'trace' | 'command' | 'cloud' | 'prepress' | 'fontmanager' | null;
  setOpenDialog: (d: 'new' | 'export' | 'templates' | 'shortcuts' | 'about' | 'trace' | 'command' | 'cloud' | 'prepress' | 'fontmanager' | null) => void;

  // Viewport navigation
  zoom: number;
  setZoom: React.Dispatch<React.SetStateAction<number>>;
  pan: Point2D;
  setPan: React.Dispatch<React.SetStateAction<Point2D>>;
  resetZoom: () => void;
  zoomToFit: () => void;
  zoomToSelection: () => void;

  // Guidelines & Snapping
  guidelines: Guideline[];
  addGuideline: (orientation: 'horizontal' | 'vertical', pos: number) => void;
  removeGuideline: (id: string) => void;
  snapSettings: SnapSettings;
  setSnapSettings: React.Dispatch<React.SetStateAction<SnapSettings>>;

  // Node Editing (F10)
  selectedNodeIds: string[];
  setSelectedNodeIds: (ids: string[]) => void;
  updateNode: (objId: string, nodeId: string, patch: Partial<BezierNode>) => void;
  convertToCurves: (objId: string) => void;

  // Z-Order & Grouping
  bringToFront: () => void;
  sendToBack: () => void;
  bringForward: () => void;
  sendBackward: () => void;
  groupSelected: () => void;
  ungroupSelected: () => void;
  alignSelected: (type: 'left' | 'center' | 'right' | 'top' | 'middle' | 'bottom' | 'page-center') => void;

  // Boolean Shaping
  applyBooleanOp: (op: BooleanOp) => void;

  // 2025 Painterly Brush Engine
  painterlySettings: PainterlyBrushSettings;
  setPainterlySettings: React.Dispatch<React.SetStateAction<PainterlyBrushSettings>>;

  // Artistic Media & Brushes
  activeBrushPreset: string;
  setActiveBrushPreset: (p: string) => void;
  activeBrushWidth: number;
  setActiveBrushWidth: (w: number) => void;
  activeBrushAngle: number;
  setActiveBrushAngle: (a: number) => void;
  activeBrushSmoothing: number;
  setActiveBrushSmoothing: (s: number) => void;

  // 2025 Prepress & Print Controls
  prepressSettings: PrepressSettings;
  setPrepressSettings: React.Dispatch<React.SetStateAction<PrepressSettings>>;
  generateCutContour: (objId?: string) => void;

  // CAPTURE Utility
  triggerScreenCapture: (mode: 'region' | 'screen' | 'canvas') => Promise<void>;

  // Color Palette & Active Colors
  colorPalette: string[];
  setColorPalette: (palette: string[]) => void;
  activeFillColor: string;
  setActiveFillColor: (c: string) => void;
  activeOutlineColor: string;
  setActiveOutlineColor: (c: string) => void;
  activeOutlineWidth: number;
  setActiveOutlineWidth: (w: number) => void;

  // History / Undo / Redo
  history: HistoryStep[];
  historyIndex: number;
  undo: () => void;
  redo: () => void;
  canUndo: boolean;
  canRedo: boolean;
  pushHistory: (actionName: string) => void;

  // Offline & PWA
  isOnline: boolean;
  isInstallable: boolean;
  promptInstall: () => void;

  // Project Serialization
  loadProjectDocument: (doc: ProjectDocument) => void;
  loadTemplate: (templateId: string) => void;
  getProjectDocument: () => ProjectDocument;
}

const CorelContext = createContext<CorelContextType | null>(null);

export const CorelProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [suiteAppMode, setSuiteAppMode] = useState<SuiteAppMode>('coreldraw');
  const [projectTitle, setProjectTitle] = useState("CorelDRAW Graphics Suite 2025 Artwork");
  const [pages, setPages] = useState<CorelPage[]>([DEFAULT_PAGE]);
  const [activePageId, setActivePageId] = useState('page_1');
  
  // Initial document loads the iconic balloon template objects
  const initialTemplate = PRESET_TEMPLATES[0];
  const [objects, setObjects] = useState<Record<string, CorelObject[]>>({
    page_1: initialTemplate.objects,
  });

  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [activeTool, setActiveTool] = useState<ActiveTool>('pick');
  const [activeFlyout, setActiveFlyout] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>('enhanced');
  const [activeDockerTab, setActiveDockerTab] = useState<DockerTab | null>('properties');
  const [openDialog, setOpenDialog] = useState<'new' | 'export' | 'templates' | 'shortcuts' | 'about' | 'trace' | 'command' | 'cloud' | 'prepress' | 'fontmanager' | null>(null);

  // 2025 Prepress & Painterly settings
  const [prepressSettings, setPrepressSettings] = useState<PrepressSettings>(DEFAULT_PREPRESS);
  const [painterlySettings, setPainterlySettings] = useState<PainterlyBrushSettings>(DEFAULT_PAINTERLY_BRUSH);

  // Offline and PWA Install Prompt State
  const [isOnline, setIsOnline] = useState<boolean>(typeof navigator !== 'undefined' ? navigator.onLine : true);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isInstallable, setIsInstallable] = useState(false);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    const handleBeforeInstall = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setIsInstallable(true);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    window.addEventListener('beforeinstallprompt', handleBeforeInstall);

    // Try restore offline autosaved project
    try {
      const autosaveStr = localStorage.getItem('devins_coreldraw_autosave');
      if (autosaveStr) {
        const saved = JSON.parse(autosaveStr);
        if (saved.pages && saved.objects) {
          setProjectTitle(saved.name || "CorelDRAW Graphics Suite 2025 Artwork");
          setPages(saved.pages);
          setActivePageId(saved.activePageId || saved.pages[0]?.id || 'page_1');
          setObjects(saved.objects);
          if (saved.guidelines) setGuidelines(saved.guidelines);
          if (saved.colorPalette) setColorPalette(saved.colorPalette);
        }
      }
    } catch (err) {
      console.warn('Autosave restore skipped:', err);
    }

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
    };
  }, []);

  const promptInstall = useCallback(async () => {
    if (!deferredPrompt) {
      alert("CorelDRAW Graphics Suite 2025 is already running offline in your browser!");
      return;
    }
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setIsInstallable(false);
      setDeferredPrompt(null);
    }
  }, [deferredPrompt]);

  // Viewport transform
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState<Point2D>({ x: 80, y: 40 });

  // Guidelines & Snapping
  const [guidelines, setGuidelines] = useState<Guideline[]>([
    { id: 'g1', orientation: 'horizontal', position: 375, color: '#06b6d4' },
    { id: 'g2', orientation: 'vertical', position: 500, color: '#06b6d4' },
  ]);
  const [snapSettings, setSnapSettings] = useState<SnapSettings>(DEFAULT_SNAP);

  // Node Editing
  const [selectedNodeIds, setSelectedNodeIds] = useState<string[]>([]);

  // Brush / Artistic Media
  const [activeBrushPreset, setActiveBrushPreset] = useState('calligraphy');
  const [activeBrushWidth, setActiveBrushWidth] = useState(12);
  const [activeBrushAngle, setActiveBrushAngle] = useState(45);
  const [activeBrushSmoothing, setActiveBrushSmoothing] = useState(50);

  // Color Palette
  const [colorPalette, setColorPalette] = useState<string[]>(DEFAULT_PALETTE);
  const [activeFillColor, setActiveFillColor] = useState('#3b82f6');
  const [activeOutlineColor, setActiveOutlineColor] = useState('#1e293b');
  const [activeOutlineWidth, setActiveOutlineWidth] = useState(1.5);

  // History system
  const [history, setHistory] = useState<HistoryStep[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const isHistoryActionRef = useRef(false);

  const activePage = useMemo(() => {
    return pages.find(p => p.id === activePageId) || pages[0] || DEFAULT_PAGE;
  }, [pages, activePageId]);

  const activeObjects = useMemo(() => {
    return objects[activePageId] || [];
  }, [objects, activePageId]);

  const selectedObjects = useMemo(() => {
    return activeObjects.filter(o => selectedIds.includes(o.id));
  }, [activeObjects, selectedIds]);

  const primarySelectedObject = useMemo(() => {
    if (selectedIds.length === 0) return null;
    return activeObjects.find(o => o.id === selectedIds[selectedIds.length - 1]) || null;
  }, [activeObjects, selectedIds]);

  const selectionBounds = useMemo(() => {
    return getSelectionBounds(selectedObjects);
  }, [selectedObjects]);

  // History helpers
  const pushHistory = useCallback((actionName: string) => {
    if (isHistoryActionRef.current) return;
    const newStep: HistoryStep = {
      id: `step_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
      actionName,
      timestamp: Date.now(),
      snapshot: {
        pages: JSON.parse(JSON.stringify(pages)),
        activePageId,
        objects: JSON.parse(JSON.stringify(objects)),
        selectedIds: [...selectedIds],
        guidelines: JSON.parse(JSON.stringify(guidelines)),
      },
    };

    setHistory(prev => {
      const sliced = prev.slice(0, historyIndex + 1);
      const updated = [...sliced, newStep];
      if (updated.length > 50) updated.shift();
      return updated;
    });
    setHistoryIndex(prev => Math.min(prev + 1, 49));

    // Autosave to LocalStorage
    try {
      localStorage.setItem('devins_coreldraw_autosave', JSON.stringify({
        name: projectTitle,
        pages,
        activePageId,
        objects,
        guidelines,
        colorPalette,
        timestamp: Date.now(),
      }));
    } catch (e) {
      console.warn('Autosave quota exceeded or disabled', e);
    }
  }, [pages, activePageId, objects, selectedIds, guidelines, colorPalette, projectTitle, historyIndex]);

  const canUndo = historyIndex > 0;
  const canRedo = historyIndex < history.length - 1;

  const undo = useCallback(() => {
    if (!canUndo) return;
    const targetStep = history[historyIndex - 1];
    if (!targetStep) return;

    isHistoryActionRef.current = true;
    setPages(JSON.parse(JSON.stringify(targetStep.snapshot.pages)));
    setActivePageId(targetStep.snapshot.activePageId);
    setObjects(JSON.parse(JSON.stringify(targetStep.snapshot.objects)));
    setSelectedIds([...targetStep.snapshot.selectedIds]);
    setGuidelines(JSON.parse(JSON.stringify(targetStep.snapshot.guidelines)));
    setHistoryIndex(prev => prev - 1);
    setTimeout(() => { isHistoryActionRef.current = false; }, 50);
  }, [canUndo, history, historyIndex]);

  const redo = useCallback(() => {
    if (!canRedo) return;
    const targetStep = history[historyIndex + 1];
    if (!targetStep) return;

    isHistoryActionRef.current = true;
    setPages(JSON.parse(JSON.stringify(targetStep.snapshot.pages)));
    setActivePageId(targetStep.snapshot.activePageId);
    setObjects(JSON.parse(JSON.stringify(targetStep.snapshot.objects)));
    setSelectedIds([...targetStep.snapshot.selectedIds]);
    setGuidelines(JSON.parse(JSON.stringify(targetStep.snapshot.guidelines)));
    setHistoryIndex(prev => prev + 1);
    setTimeout(() => { isHistoryActionRef.current = false; }, 50);
  }, [canRedo, history, historyIndex]);

  // Add new Object
  const addObject = useCallback((objPartial: Partial<CorelObject>): CorelObject => {
    const newObj: CorelObject = {
      id: objPartial.id || `obj_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      name: objPartial.name || `${objPartial.type || 'Shape'} ${activeObjects.length + 1}`,
      type: objPartial.type || 'path',
      transform: objPartial.transform || {
        x: 100,
        y: 100,
        width: 150,
        height: 150,
        rotation: 0,
        scaleX: 1,
        scaleY: 1,
        skewX: 0,
        skewY: 0,
      },
      subpaths: objPartial.subpaths || [],
      rectProps: objPartial.rectProps,
      ellipseProps: objPartial.ellipseProps,
      polygonProps: objPartial.polygonProps,
      starProps: objPartial.starProps,
      spiralProps: objPartial.spiralProps,
      textProps: objPartial.textProps,
      dimensionProps: objPartial.dimensionProps,
      brushProps: objPartial.brushProps,
      painterlyProps: objPartial.painterlyProps,
      imageProps: objPartial.imageProps,
      groupProps: objPartial.groupProps,
      fill: objPartial.fill || { type: 'solid', color: activeFillColor },
      outline: objPartial.outline || {
        color: activeOutlineColor,
        width: activeOutlineWidth,
        style: 'solid',
        cap: 'round',
        join: 'round',
        startArrow: 'none',
        endArrow: 'none',
      },
      shadow: objPartial.shadow || { enabled: false, color: '#000000', blur: 4, offsetX: 2, offsetY: 2, opacity: 0.5 },
      extrude: objPartial.extrude || { enabled: false, depth: 15, angle: 45, vanishingPoint: { x: 0, y: 0 }, bevel: 0, lightIntensity: 0.8 },
      contour: objPartial.contour || { enabled: false, type: 'outside', steps: 1, offset: 5, endColor: '#ffffff' },
      transparency: objPartial.transparency || { enabled: false, type: 'uniform', opacity: 1 },
      opacity: objPartial.opacity ?? 1,
      locked: false,
      visible: true,
      zIndex: activeObjects.length,
    };

    setObjects(prev => ({
      ...prev,
      [activePageId]: [...(prev[activePageId] || []), newObj],
    }));

    setSelectedIds([newObj.id]);
    pushHistory(`Create ${newObj.name}`);
    return newObj;
  }, [activeObjects.length, activeFillColor, activeOutlineColor, activeOutlineWidth, activePageId, pushHistory]);

  // Update single object
  const updateObject = useCallback((id: string, patch: Partial<CorelObject>, recordHistory: boolean = true) => {
    setObjects(prev => {
      const pageObjs = prev[activePageId] || [];
      const updated = pageObjs.map(o => (o.id === id ? { ...o, ...patch } : o));
      return { ...prev, [activePageId]: updated };
    });

    if (recordHistory) {
      pushHistory('Modify Object');
    }
  }, [activePageId, pushHistory]);

  // Update selected objects
  const updateSelectedObjects = useCallback((patch: Partial<CorelObject>, recordHistory: boolean = true) => {
    if (selectedIds.length === 0) return;

    setObjects(prev => {
      const pageObjs = prev[activePageId] || [];
      const updated = pageObjs.map(o => {
        if (!selectedIds.includes(o.id)) return o;
        return {
          ...o,
          ...patch,
          transform: patch.transform ? { ...o.transform, ...patch.transform } : o.transform,
          fill: patch.fill ? { ...o.fill, ...patch.fill } : o.fill,
          outline: patch.outline ? { ...o.outline, ...patch.outline } : o.outline,
          shadow: patch.shadow ? { ...o.shadow, ...patch.shadow } : o.shadow,
          extrude: patch.extrude ? { ...o.extrude, ...patch.extrude } : o.extrude,
          contour: patch.contour ? { ...o.contour, ...patch.contour } : o.contour,
          transparency: patch.transparency ? { ...o.transparency, ...patch.transparency } : o.transparency,
        };
      });
      return { ...prev, [activePageId]: updated };
    });

    if (recordHistory) {
      pushHistory('Update Selection');
    }
  }, [selectedIds, activePageId, pushHistory]);

  // Delete selected objects
  const deleteSelected = useCallback(() => {
    if (selectedIds.length === 0) return;
    setObjects(prev => ({
      ...prev,
      [activePageId]: (prev[activePageId] || []).filter(o => !selectedIds.includes(o.id)),
    }));
    setSelectedIds([]);
    pushHistory('Delete Objects');
  }, [selectedIds, activePageId, pushHistory]);

  // Duplicate selected objects
  const duplicateSelected = useCallback(() => {
    if (selectedIds.length === 0) return;
    const newObjs: CorelObject[] = [];
    const newIds: string[] = [];

    activeObjects.forEach(o => {
      if (selectedIds.includes(o.id)) {
        const cloned: CorelObject = {
          ...JSON.parse(JSON.stringify(o)),
          id: `obj_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
          name: `${o.name} Copy`,
          transform: {
            ...o.transform,
            x: o.transform.x + 20,
            y: o.transform.y + 20,
          },
          zIndex: activeObjects.length + newObjs.length,
        };
        newObjs.push(cloned);
        newIds.push(cloned.id);
      }
    });

    setObjects(prev => ({
      ...prev,
      [activePageId]: [...(prev[activePageId] || []), ...newObjs],
    }));
    setSelectedIds(newIds);
    pushHistory('Duplicate Objects');
  }, [selectedIds, activeObjects, activePageId, pushHistory]);

  // Select all objects on active page
  const selectAll = useCallback(() => {
    const ids = activeObjects.filter(o => o.visible && !o.locked).map(o => o.id);
    setSelectedIds(ids);
  }, [activeObjects]);

  // Toggle selection
  const toggleSelect = useCallback((id: string, multi: boolean = false) => {
    setSelectedIds(prev => {
      if (!multi) return [id];
      if (prev.includes(id)) {
        return prev.filter(i => i !== id);
      }
      return [...prev, id];
    });
  }, []);

  const clearSelection = useCallback(() => {
    setSelectedIds([]);
    setSelectedNodeIds([]);
  }, []);

  // Multi-Page Management
  const addPage = useCallback((preset: string = 'A4 Standard', name?: string) => {
    const newPageNum = pages.length + 1;
    const newPage: CorelPage = {
      id: `page_${Date.now()}`,
      name: name || `Page ${newPageNum}`,
      width: activePage.width,
      height: activePage.height,
      unit: activePage.unit,
      preset: preset,
      orientation: activePage.orientation,
      background: '#ffffff',
      isMasterPage: false,
    };
    setPages(prev => [...prev, newPage]);
    setObjects(prev => ({ ...prev, [newPage.id]: [] }));
    setActivePageId(newPage.id);
    pushHistory(`Add ${newPage.name}`);
  }, [pages.length, activePage, pushHistory]);

  const duplicatePage = useCallback((id: string) => {
    const target = pages.find(p => p.id === id);
    if (!target) return;
    const newPageId = `page_${Date.now()}`;
    const newPage: CorelPage = {
      ...JSON.parse(JSON.stringify(target)),
      id: newPageId,
      name: `${target.name} Copy`,
    };
    const clonedObjs = (objects[id] || []).map(o => ({
      ...JSON.parse(JSON.stringify(o)),
      id: `obj_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
    }));

    setPages(prev => [...prev, newPage]);
    setObjects(prev => ({ ...prev, [newPageId]: clonedObjs }));
    setActivePageId(newPageId);
    pushHistory(`Duplicate ${target.name}`);
  }, [pages, objects, pushHistory]);

  const reorderPages = useCallback((fromIndex: number, toIndex: number) => {
    setPages(prev => {
      const arr = [...prev];
      const [moved] = arr.splice(fromIndex, 1);
      arr.splice(toIndex, 0, moved);
      return arr;
    });
    pushHistory('Reorder Pages');
  }, [pushHistory]);

  const deletePage = useCallback((id: string) => {
    if (pages.length <= 1) {
      alert("Document must have at least one page.");
      return;
    }
    const idx = pages.findIndex(p => p.id === id);
    const nextPages = pages.filter(p => p.id !== id);
    const nextActive = nextPages[Math.max(0, idx - 1)]?.id || nextPages[0].id;
    setPages(nextPages);
    setActivePageId(nextActive);
    setObjects(prev => {
      const copy = { ...prev };
      delete copy[id];
      return copy;
    });
    pushHistory('Delete Page');
  }, [pages, pushHistory]);

  const updateActivePage = useCallback((patch: Partial<CorelPage>) => {
    setPages(prev => prev.map(p => (p.id === activePageId ? { ...p, ...patch } : p)));
    pushHistory('Update Page Settings');
  }, [activePageId, pushHistory]);

  // Guidelines
  const addGuideline = useCallback((orientation: 'horizontal' | 'vertical', pos: number) => {
    const gl: Guideline = {
      id: `guide_${Date.now()}`,
      orientation,
      position: pos,
      color: '#06b6d4',
    };
    setGuidelines(prev => [...prev, gl]);
  }, []);

  const removeGuideline = useCallback((id: string) => {
    setGuidelines(prev => prev.filter(g => g.id !== id));
  }, []);

  // Node editing (F10)
  const updateNode = useCallback((objId: string, nodeId: string, patch: Partial<BezierNode>) => {
    setObjects(prev => {
      const pageObjs = prev[activePageId] || [];
      const updated = pageObjs.map(obj => {
        if (obj.id !== objId) return obj;
        const newSubpaths = obj.subpaths.map(sp => ({
          ...sp,
          nodes: sp.nodes.map(n => (n.id === nodeId ? { ...n, ...patch } : n)),
        }));
        return { ...obj, subpaths: newSubpaths };
      });
      return { ...prev, [activePageId]: updated };
    });
  }, [activePageId]);

  // Convert to Curves (Ctrl+Q)
  const convertToCurves = useCallback((objId: string) => {
    const obj = activeObjects.find(o => o.id === objId);
    if (!obj || obj.type === 'path') return;

    let subpaths: Subpath[] = [];
    if (obj.type === 'rect') {
      subpaths = rectToSubpaths(obj.transform.width, obj.transform.height, obj.rectProps?.cornerRadii);
    } else if (obj.type === 'ellipse') {
      subpaths = ellipseToSubpaths(obj.transform.width, obj.transform.height);
    } else if (obj.type === 'polygon') {
      subpaths = polygonToSubpaths(obj.transform.width, obj.transform.height, obj.polygonProps?.sides || 5);
    } else if (obj.type === 'star') {
      subpaths = starToSubpaths(obj.transform.width, obj.transform.height, obj.starProps?.points || 5, obj.starProps?.sharpness || 0.5);
    }

    if (subpaths.length > 0) {
      updateObject(objId, {
        type: 'path',
        subpaths,
      });
      pushHistory('Convert to Curves');
    }
  }, [activeObjects, updateObject, pushHistory]);

  // Z-Order & Grouping
  const bringToFront = useCallback(() => {
    if (selectedIds.length === 0) return;
    setObjects(prev => {
      const pageObjs = prev[activePageId] || [];
      const nonSelected = pageObjs.filter(o => !selectedIds.includes(o.id));
      const selected = pageObjs.filter(o => selectedIds.includes(o.id));
      return { ...prev, [activePageId]: [...nonSelected, ...selected] };
    });
    pushHistory('Bring to Front');
  }, [selectedIds, activePageId, pushHistory]);

  const sendToBack = useCallback(() => {
    if (selectedIds.length === 0) return;
    setObjects(prev => {
      const pageObjs = prev[activePageId] || [];
      const nonSelected = pageObjs.filter(o => !selectedIds.includes(o.id));
      const selected = pageObjs.filter(o => selectedIds.includes(o.id));
      return { ...prev, [activePageId]: [...selected, ...nonSelected] };
    });
    pushHistory('Send to Back');
  }, [selectedIds, activePageId, pushHistory]);

  const bringForward = useCallback(() => {
    if (selectedIds.length === 0) return;
    setObjects(prev => {
      const pageObjs = [...(prev[activePageId] || [])];
      for (let i = pageObjs.length - 2; i >= 0; i--) {
        if (selectedIds.includes(pageObjs[i].id) && !selectedIds.includes(pageObjs[i + 1].id)) {
          const temp = pageObjs[i];
          pageObjs[i] = pageObjs[i + 1];
          pageObjs[i + 1] = temp;
        }
      }
      return { ...prev, [activePageId]: pageObjs };
    });
    pushHistory('Bring Forward');
  }, [selectedIds, activePageId, pushHistory]);

  const sendBackward = useCallback(() => {
    if (selectedIds.length === 0) return;
    setObjects(prev => {
      const pageObjs = [...(prev[activePageId] || [])];
      for (let i = 1; i < pageObjs.length; i++) {
        if (selectedIds.includes(pageObjs[i].id) && !selectedIds.includes(pageObjs[i - 1].id)) {
          const temp = pageObjs[i];
          pageObjs[i] = pageObjs[i - 1];
          pageObjs[i - 1] = temp;
        }
      }
      return { ...prev, [activePageId]: pageObjs };
    });
    pushHistory('Send Backward');
  }, [selectedIds, activePageId, pushHistory]);

  const groupSelected = useCallback(() => {
    if (selectedObjects.length < 2) return;
    const b = selectionBounds;
    if (!b) return;

    const groupObj: CorelObject = {
      id: `group_${Date.now()}`,
      name: `Group (${selectedObjects.length} objects)`,
      type: 'group',
      transform: {
        x: b.minX,
        y: b.minY,
        width: b.width,
        height: b.height,
        rotation: 0,
        scaleX: 1,
        scaleY: 1,
        skewX: 0,
        skewY: 0,
      },
      subpaths: [],
      groupProps: {
        childrenIds: selectedObjects.map(o => o.id),
      },
      fill: { type: 'none', color: 'none' },
      outline: { color: 'none', width: 0, style: 'solid', cap: 'butt', join: 'miter', startArrow: 'none', endArrow: 'none' },
      shadow: { enabled: false, color: '', blur: 0, offsetX: 0, offsetY: 0, opacity: 0 },
      extrude: { enabled: false, depth: 0, angle: 0, vanishingPoint: { x: 0, y: 0 }, bevel: 0, lightIntensity: 1 },
      contour: { enabled: false, type: 'outside', steps: 1, offset: 0, endColor: '' },
      transparency: { enabled: false, type: 'uniform', opacity: 1 },
      opacity: 1,
      locked: false,
      visible: true,
      zIndex: activeObjects.length,
    };

    setObjects(prev => ({
      ...prev,
      [activePageId]: [...(prev[activePageId] || []), groupObj],
    }));
    setSelectedIds([groupObj.id]);
    pushHistory('Group Objects');
  }, [selectedObjects, selectionBounds, activeObjects.length, activePageId, pushHistory]);

  const ungroupSelected = useCallback(() => {
    const groups = selectedObjects.filter(o => o.type === 'group');
    if (groups.length === 0) return;

    setObjects(prev => ({
      ...prev,
      [activePageId]: (prev[activePageId] || []).filter(o => !groups.some(g => g.id === o.id)),
    }));
    setSelectedIds([]);
    pushHistory('Ungroup Objects');
  }, [selectedObjects, activePageId, pushHistory]);

  // Align Objects
  const alignSelected = useCallback((type: 'left' | 'center' | 'right' | 'top' | 'middle' | 'bottom' | 'page-center') => {
    if (selectedObjects.length === 0) return;

    if (type === 'page-center') {
      const cx = activePage.width / 2;
      const cy = activePage.height / 2;
      if (selectionBounds) {
        const dx = cx - (selectionBounds.minX + selectionBounds.width / 2);
        const dy = cy - (selectionBounds.minY + selectionBounds.height / 2);
        selectedObjects.forEach(o => {
          updateObject(o.id, {
            transform: {
              ...o.transform,
              x: o.transform.x + dx,
              y: o.transform.y + dy,
            },
          }, false);
        });
      }
      pushHistory('Align Center to Page');
      return;
    }

    if (selectedObjects.length < 2 || !selectionBounds) return;
    const b = selectionBounds;

    selectedObjects.forEach(o => {
      let newX = o.transform.x;
      let newY = o.transform.y;

      if (type === 'left') newX = b.minX;
      else if (type === 'right') newX = b.maxX - o.transform.width;
      else if (type === 'center') newX = b.minX + (b.width - o.transform.width) / 2;
      else if (type === 'top') newY = b.minY;
      else if (type === 'bottom') newY = b.maxY - o.transform.height;
      else if (type === 'middle') newY = b.minY + (b.height - o.transform.height) / 2;

      updateObject(o.id, {
        transform: {
          ...o.transform,
          x: newX,
          y: newY,
        },
      }, false);
    });
    pushHistory(`Align ${type}`);
  }, [selectedObjects, activePage, selectionBounds, updateObject, pushHistory]);

  // Boolean Operations
  const applyBooleanOp = useCallback((op: BooleanOp) => {
    if (selectedObjects.length < 2) {
      alert("Please select at least 2 overlapping vector objects for Boolean operations.");
      return;
    }
    const result = performBooleanOperation(selectedObjects, op);
    if (!result) return;

    const { newObject, removedIds } = result;
    setObjects(prev => ({
      ...prev,
      [activePageId]: [...(prev[activePageId] || []).filter(o => !removedIds.includes(o.id)), newObject],
    }));
    setSelectedIds([newObject.id]);
    pushHistory(`Boolean ${op.toUpperCase()}`);
  }, [selectedObjects, activePageId, pushHistory]);

  // Prepress CutContour Generation
  const generateCutContour = useCallback((objId?: string) => {
    const target = objId ? activeObjects.find(o => o.id === objId) : primarySelectedObject;
    if (!target) {
      alert("Select an object to generate a Prepress CutContour hairline.");
      return;
    }
    const cutObj = createCutContourObject(target);
    setObjects(prev => ({
      ...prev,
      [activePageId]: [...(prev[activePageId] || []), cutObj],
    }));
    setSelectedIds([cutObj.id]);
    pushHistory('Generate CutContour Hairline');
  }, [activeObjects, primarySelectedObject, activePageId, pushHistory]);

  // Screen & Canvas CAPTURE Utility
  const triggerScreenCapture = useCallback(async (mode: 'region' | 'screen' | 'canvas') => {
    try {
      if (mode === 'canvas') {
        const svgEl = document.getElementById('corel-main-canvas-svg');
        if (!svgEl) return;
        const xml = new XMLSerializer().serializeToString(svgEl);
        const svgBlob = new Blob([xml], { type: 'image/svg+xml;charset=utf-8' });
        const url = URL.createObjectURL(svgBlob);
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          canvas.width = activePage.width;
          canvas.height = activePage.height;
          const ctx = canvas.getContext('2d');
          if (ctx) {
            ctx.fillStyle = activePage.background;
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            ctx.drawImage(img, 0, 0);
            const pngData = canvas.toDataURL('image/png');
            addObject({
              name: `Capture Canvas Snip`,
              type: 'image',
              transform: {
                x: 40,
                y: 40,
                width: Math.min(activePage.width * 0.8, 400),
                height: Math.min(activePage.height * 0.8, 300),
                rotation: 0,
                scaleX: 1,
                scaleY: 1,
                skewX: 0,
                skewY: 0,
              },
              imageProps: {
                src: pngData,
                naturalWidth: canvas.width,
                naturalHeight: canvas.height,
              },
            });
          }
          URL.revokeObjectURL(url);
        };
        img.src = url;
      } else if (navigator.mediaDevices && navigator.mediaDevices.getDisplayMedia) {
        const stream = await navigator.mediaDevices.getDisplayMedia({ video: true });
        const video = document.createElement('video');
        video.srcObject = stream;
        await video.play();
        
        const canvas = document.createElement('canvas');
        canvas.width = video.videoWidth || 1280;
        canvas.height = video.videoHeight || 720;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
          const dataUrl = canvas.toDataURL('image/png');
          addObject({
            name: `Screen Snip (${new Date().toLocaleTimeString()})`,
            type: 'image',
            transform: {
              x: 50,
              y: 50,
              width: 500,
              height: (500 * canvas.height) / canvas.width,
              rotation: 0,
              scaleX: 1,
              scaleY: 1,
              skewX: 0,
              skewY: 0,
            },
            imageProps: {
              src: dataUrl,
              naturalWidth: canvas.width,
              naturalHeight: canvas.height,
            },
          });
        }
        stream.getTracks().forEach(t => t.stop());
      } else {
        alert("Screen capture is supported in standard desktop browser sessions.");
      }
    } catch (err) {
      console.warn("Capture aborted or unavailable:", err);
    }
  }, [activePage, addObject]);

  // Viewport Navigation
  const resetZoom = useCallback(() => {
    setZoom(1);
    setPan({ x: 80, y: 40 });
  }, []);

  const zoomToFit = useCallback(() => {
    const container = document.getElementById('corel-viewport-container');
    if (!container) return;
    const rect = container.getBoundingClientRect();
    const margin = 80;
    const scaleX = (rect.width - margin) / activePage.width;
    const scaleY = (rect.height - margin) / activePage.height;
    const newZoom = Math.max(0.1, Math.min(2.5, Math.min(scaleX, scaleY)));
    setZoom(newZoom);
    setPan({
      x: (rect.width - activePage.width * newZoom) / 2,
      y: (rect.height - activePage.height * newZoom) / 2,
    });
  }, [activePage]);

  const zoomToSelection = useCallback(() => {
    if (!selectionBounds) {
      zoomToFit();
      return;
    }
    const container = document.getElementById('corel-viewport-container');
    if (!container) return;
    const rect = container.getBoundingClientRect();
    const margin = 100;
    const scaleX = (rect.width - margin) / selectionBounds.width;
    const scaleY = (rect.height - margin) / selectionBounds.height;
    const newZoom = Math.max(0.2, Math.min(4, Math.min(scaleX, scaleY)));
    setZoom(newZoom);
    setPan({
      x: (rect.width - selectionBounds.width * newZoom) / 2 - selectionBounds.minX * newZoom,
      y: (rect.height - selectionBounds.height * newZoom) / 2 - selectionBounds.minY * newZoom,
    });
  }, [selectionBounds, zoomToFit]);

  // Load Template
  const loadTemplate = useCallback((templateId: string) => {
    const t = PRESET_TEMPLATES.find(tpl => tpl.id === templateId);
    if (!t) return;
    setProjectTitle(t.title);
    setPages([t.page]);
    setActivePageId(t.page.id);
    setObjects({
      [t.page.id]: JSON.parse(JSON.stringify(t.objects)),
    });
    setSelectedIds([]);
    setHistory([]);
    setHistoryIndex(-1);
  }, []);

  // Load Document
  const loadProjectDocument = useCallback((doc: ProjectDocument) => {
    if (!doc.pages || doc.pages.length === 0) return;
    setProjectTitle(doc.name || 'Imported Artwork');
    setPages(doc.pages);
    setActivePageId(doc.activePageId || doc.pages[0].id);
    setObjects(doc.objects || {});
    if (doc.guidelines) setGuidelines(doc.guidelines);
    if (doc.snapSettings) setSnapSettings(doc.snapSettings);
    if (doc.colorPalette) setColorPalette(doc.colorPalette);
    setSelectedIds([]);
    setHistory([]);
    setHistoryIndex(-1);
  }, []);

  const getProjectDocument = useCallback((): ProjectDocument => {
    return {
      id: `cdrw_${Date.now()}`,
      name: projectTitle,
      version: '2025.1.0',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      pages,
      activePageId,
      objects,
      guidelines,
      snapSettings,
      colorPalette,
    };
  }, [projectTitle, pages, activePageId, objects, guidelines, snapSettings, colorPalette]);

  return (
    <CorelContext.Provider
      value={{
        suiteAppMode,
        setSuiteAppMode,
        projectTitle,
        setProjectTitle,
        pages,
        activePageId,
        activePage,
        addPage,
        deletePage,
        duplicatePage,
        reorderPages,
        setActivePageId,
        updateActivePage,
        objects,
        activeObjects,
        addObject,
        updateObject,
        updateSelectedObjects,
        deleteSelected,
        duplicateSelected,
        selectAll,
        selectedIds,
        setSelectedIds,
        toggleSelect,
        clearSelection,
        selectedObjects,
        primarySelectedObject,
        selectionBounds,
        activeTool,
        setActiveTool,
        activeFlyout,
        setActiveFlyout,
        viewMode,
        setViewMode,
        activeDockerTab,
        setActiveDockerTab,
        openDialog,
        setOpenDialog,
        zoom,
        setZoom,
        pan,
        setPan,
        resetZoom,
        zoomToFit,
        zoomToSelection,
        guidelines,
        addGuideline,
        removeGuideline,
        snapSettings,
        setSnapSettings,
        selectedNodeIds,
        setSelectedNodeIds,
        updateNode,
        convertToCurves,
        bringToFront,
        sendToBack,
        bringForward,
        sendBackward,
        groupSelected,
        ungroupSelected,
        alignSelected,
        applyBooleanOp,
        painterlySettings,
        setPainterlySettings,
        activeBrushPreset,
        setActiveBrushPreset,
        activeBrushWidth,
        setActiveBrushWidth,
        activeBrushAngle,
        setActiveBrushAngle,
        activeBrushSmoothing,
        setActiveBrushSmoothing,
        prepressSettings,
        setPrepressSettings,
        generateCutContour,
        triggerScreenCapture,
        colorPalette,
        setColorPalette,
        activeFillColor,
        setActiveFillColor,
        activeOutlineColor,
        setActiveOutlineColor,
        activeOutlineWidth,
        setActiveOutlineWidth,
        history,
        historyIndex,
        undo,
        redo,
        canUndo,
        canRedo,
        pushHistory,
        isOnline,
        isInstallable,
        promptInstall,
        loadProjectDocument,
        loadTemplate,
        getProjectDocument,
      }}
    >
      {children}
    </CorelContext.Provider>
  );
};

export const useCorel = () => {
  const context = useContext(CorelContext);
  if (!context) {
    throw new Error('useCorel must be used within a CorelProvider');
  }
  return context;
};
