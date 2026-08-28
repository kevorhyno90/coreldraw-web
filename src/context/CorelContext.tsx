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
} from '../types/coreldraw';
import { PRESET_TEMPLATES } from '../engine/presetTemplates';
import { getSelectionBounds, rectToSubpaths, ellipseToSubpaths, polygonToSubpaths, starToSubpaths } from '../engine/vectorMath';
import { BooleanOp, performBooleanOperation } from '../engine/booleanOps';

const DEFAULT_PAGE: CorelPage = {
  id: 'page_1',
  name: 'Page 1',
  width: 1000,
  height: 750,
  unit: 'px',
  preset: 'A4 Standard',
  orientation: 'landscape',
  background: '#ffffff',
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

interface CorelContextType {
  // Document & Pages
  projectTitle: string;
  setProjectTitle: (t: string) => void;
  pages: CorelPage[];
  activePageId: string;
  activePage: CorelPage;
  addPage: (preset?: string) => void;
  deletePage: (id: string) => void;
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
  openDialog: 'new' | 'export' | 'templates' | 'shortcuts' | 'about' | 'trace' | null;
  setOpenDialog: (d: 'new' | 'export' | 'templates' | 'shortcuts' | 'about' | 'trace' | null) => void;

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
  const [projectTitle, setProjectTitle] = useState("Devin's CorelDRAW Artwork 1");
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
  const [openDialog, setOpenDialog] = useState<'new' | 'export' | 'templates' | 'shortcuts' | 'about' | 'trace' | null>(null);

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
          setProjectTitle(saved.name || "Devin's CorelDRAW Artwork 1");
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
      alert("Devin's CorelDRAW is already installed or your browser doesn't support install prompts. It runs 100% offline automatically!");
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

  // Node editing state
  const [selectedNodeIds, setSelectedNodeIds] = useState<string[]>([]);

  // Colors & Palettes
  const [colorPalette, setColorPalette] = useState<string[]>(DEFAULT_PALETTE);
  const [activeFillColor, setActiveFillColor] = useState<string>('#3b82f6');
  const [activeOutlineColor, setActiveOutlineColor] = useState<string>('#000000');
  const [activeOutlineWidth, setActiveOutlineWidth] = useState<number>(2);

  // History Stack
  const [history, setHistory] = useState<HistoryStep[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const isHistoryActionRef = useRef(false);

  // Active page accessor
  const activePage = useMemo(() => {
    return pages.find(p => p.id === activePageId) || pages[0] || DEFAULT_PAGE;
  }, [pages, activePageId]);

  // Current active page objects
  const activeObjects = useMemo(() => {
    return objects[activePageId] || [];
  }, [objects, activePageId]);

  // Selected objects
  const selectedObjects = useMemo(() => {
    return activeObjects.filter(o => selectedIds.includes(o.id));
  }, [activeObjects, selectedIds]);

  const primarySelectedObject = selectedObjects[0] || null;

  const selectionBounds = useMemo(() => {
    return getSelectionBounds(selectedObjects);
  }, [selectedObjects]);

  // Push to history helper
  const pushHistory = useCallback((actionName: string) => {
    if (isHistoryActionRef.current) return;

    setObjects(prevObjs => {
      setPages(prevPages => {
        setSelectedIds(prevSelected => {
          setGuidelines(prevGuides => {
            const step: HistoryStep = {
              id: `step_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
              actionName,
              timestamp: Date.now(),
              snapshot: {
                pages: JSON.parse(JSON.stringify(prevPages)),
                activePageId,
                objects: JSON.parse(JSON.stringify(prevObjs)),
                selectedIds: [...prevSelected],
                guidelines: JSON.parse(JSON.stringify(prevGuides)),
              },
            };

            setHistory(prevHist => {
              const sliced = prevHist.slice(0, historyIndex + 1);
              return [...sliced, step].slice(-50); // Keep last 50 steps
            });
            setHistoryIndex(prev => Math.min(prev + 1, 49));

            return prevGuides;
          });
          return prevSelected;
        });
        return prevPages;
      });
      return prevObjs;
    });
  }, [activePageId, historyIndex]);

  // Initial history snapshot
  useEffect(() => {
    if (history.length === 0) {
      pushHistory('Initial State');
    }
  }, [history.length, pushHistory]);

  // Undo / Redo
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
          fill: patch.fill ? { ...o.fill, ...patch.fill } : o.fill,
          outline: patch.outline ? { ...o.outline, ...patch.outline } : o.outline,
          shadow: patch.shadow ? { ...o.shadow, ...patch.shadow } : o.shadow,
          extrude: patch.extrude ? { ...o.extrude, ...patch.extrude } : o.extrude,
          contour: patch.contour ? { ...o.contour, ...patch.contour } : o.contour,
          transform: patch.transform ? { ...o.transform, ...patch.transform } : o.transform,
        };
      });
      return { ...prev, [activePageId]: updated };
    });

    if (recordHistory) {
      pushHistory('Update Selection Properties');
    }
  }, [selectedIds, activePageId, pushHistory]);

  // Delete selected objects
  const deleteSelected = useCallback(() => {
    if (selectedIds.length === 0) return;

    setObjects(prev => {
      const pageObjs = prev[activePageId] || [];
      const filtered = pageObjs.filter(o => !selectedIds.includes(o.id));
      return { ...prev, [activePageId]: filtered };
    });

    setSelectedIds([]);
    pushHistory('Delete Objects');
  }, [selectedIds, activePageId, pushHistory]);

  // Duplicate selected objects
  const duplicateSelected = useCallback(() => {
    if (selectedObjects.length === 0) return;

    const duplicates: CorelObject[] = selectedObjects.map(obj => ({
      ...JSON.parse(JSON.stringify(obj)),
      id: `obj_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      name: `${obj.name} Copy`,
      transform: {
        ...obj.transform,
        x: obj.transform.x + 20,
        y: obj.transform.y + 20,
      },
    }));

    setObjects(prev => ({
      ...prev,
      [activePageId]: [...(prev[activePageId] || []), ...duplicates],
    }));

    setSelectedIds(duplicates.map(d => d.id));
    pushHistory('Duplicate Objects');
  }, [selectedObjects, activePageId, pushHistory]);

  // Selection helpers
  const toggleSelect = useCallback((id: string, multi: boolean = false) => {
    if (multi) {
      setSelectedIds(prev => (prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]));
    } else {
      setSelectedIds([id]);
    }
  }, []);

  const clearSelection = useCallback(() => {
    setSelectedIds([]);
    setSelectedNodeIds([]);
  }, []);

  const selectAll = useCallback(() => {
    setSelectedIds(activeObjects.map(o => o.id));
  }, [activeObjects]);

  // Pages management
  const addPage = useCallback((preset: string = 'A4 Standard') => {
    const newPageId = `page_${Date.now()}`;
    const newPage: CorelPage = {
      id: newPageId,
      name: `Page ${pages.length + 1}`,
      width: activePage.width,
      height: activePage.height,
      unit: activePage.unit,
      preset,
      orientation: activePage.orientation,
      background: '#ffffff',
    };

    setPages(prev => [...prev, newPage]);
    setObjects(prev => ({ ...prev, [newPageId]: [] }));
    setActivePageId(newPageId);
    setSelectedIds([]);
    pushHistory('Add New Page');
  }, [pages.length, activePage, pushHistory]);

  const deletePage = useCallback((id: string) => {
    if (pages.length <= 1) return; // Keep at least one page

    const remainingPages = pages.filter(p => p.id !== id);
    setPages(remainingPages);
    if (activePageId === id) {
      setActivePageId(remainingPages[0].id);
    }
    pushHistory('Delete Page');
  }, [pages, activePageId, pushHistory]);

  const updateActivePage = useCallback((patch: Partial<CorelPage>) => {
    setPages(prev => prev.map(p => (p.id === activePageId ? { ...p, ...patch } : p)));
    pushHistory('Update Page Setup');
  }, [activePageId, pushHistory]);

  // Guidelines management
  const addGuideline = useCallback((orientation: 'horizontal' | 'vertical', pos: number) => {
    const newGuide: Guideline = {
      id: `guide_${Date.now()}`,
      orientation,
      position: pos,
      color: '#06b6d4',
    };
    setGuidelines(prev => [...prev, newGuide]);
    pushHistory('Add Guideline');
  }, [pushHistory]);

  const removeGuideline = useCallback((id: string) => {
    setGuidelines(prev => prev.filter(g => g.id !== id));
    pushHistory('Remove Guideline');
  }, [pushHistory]);

  // Convert Parametric Shape to Curves (F10 Node Editable)
  const convertToCurves = useCallback((objId: string) => {
    const obj = activeObjects.find(o => o.id === objId);
    if (!obj) return;

    let subpaths: Subpath[] = obj.subpaths;
    const { width: w, height: h } = obj.transform;

    if (subpaths.length === 0) {
      if (obj.type === 'rect') {
        subpaths = rectToSubpaths(w, h, obj.rectProps?.cornerRadii);
      } else if (obj.type === 'ellipse') {
        subpaths = ellipseToSubpaths(w, h, obj.ellipseProps?.kind, obj.ellipseProps?.startAngle, obj.ellipseProps?.endAngle);
      } else if (obj.type === 'polygon') {
        subpaths = polygonToSubpaths(w, h, obj.polygonProps?.sides);
      } else if (obj.type === 'star') {
        subpaths = starToSubpaths(w, h, obj.starProps?.points, obj.starProps?.sharpness);
      }
    }

    updateObject(objId, {
      type: 'path',
      subpaths,
      rectProps: undefined,
      ellipseProps: undefined,
      polygonProps: undefined,
      starProps: undefined,
    });
    pushHistory('Convert to Curves (Ctrl+Q)');
  }, [activeObjects, updateObject, pushHistory]);

  // Node updates
  const updateNode = useCallback((objId: string, nodeId: string, patch: Partial<BezierNode>) => {
    const obj = activeObjects.find(o => o.id === objId);
    if (!obj) return;

    const newSubpaths = obj.subpaths.map(sp => ({
      ...sp,
      nodes: sp.nodes.map(n => (n.id === nodeId ? { ...n, ...patch } : n)),
    }));

    updateObject(objId, { subpaths: newSubpaths }, false);
  }, [activeObjects, updateObject]);

  // Z-Order Operations
  const bringToFront = useCallback(() => {
    if (selectedIds.length === 0) return;
    setObjects(prev => {
      const pageObjs = [...(prev[activePageId] || [])];
      const selected = pageObjs.filter(o => selectedIds.includes(o.id));
      const unselected = pageObjs.filter(o => !selectedIds.includes(o.id));
      return { ...prev, [activePageId]: [...unselected, ...selected] };
    });
    pushHistory('Bring to Front (Shift+PageUp)');
  }, [selectedIds, activePageId, pushHistory]);

  const sendToBack = useCallback(() => {
    if (selectedIds.length === 0) return;
    setObjects(prev => {
      const pageObjs = [...(prev[activePageId] || [])];
      const selected = pageObjs.filter(o => selectedIds.includes(o.id));
      const unselected = pageObjs.filter(o => !selectedIds.includes(o.id));
      return { ...prev, [activePageId]: [...selected, ...unselected] };
    });
    pushHistory('Send to Back (Shift+PageDown)');
  }, [selectedIds, activePageId, pushHistory]);

  const bringForward = useCallback(() => {
    if (selectedIds.length === 0) return;
    setObjects(prev => {
      const list = [...(prev[activePageId] || [])];
      for (let i = list.length - 2; i >= 0; i--) {
        if (selectedIds.includes(list[i].id) && !selectedIds.includes(list[i + 1].id)) {
          const temp = list[i];
          list[i] = list[i + 1];
          list[i + 1] = temp;
        }
      }
      return { ...prev, [activePageId]: list };
    });
    pushHistory('Bring Forward (Ctrl+PageUp)');
  }, [selectedIds, activePageId, pushHistory]);

  const sendBackward = useCallback(() => {
    if (selectedIds.length === 0) return;
    setObjects(prev => {
      const list = [...(prev[activePageId] || [])];
      for (let i = 1; i < list.length; i++) {
        if (selectedIds.includes(list[i].id) && !selectedIds.includes(list[i - 1].id)) {
          const temp = list[i];
          list[i] = list[i - 1];
          list[i - 1] = temp;
        }
      }
      return { ...prev, [activePageId]: list };
    });
    pushHistory('Send Backward (Ctrl+PageDown)');
  }, [selectedIds, activePageId, pushHistory]);

  // Grouping
  const groupSelected = useCallback(() => {
    if (selectedObjects.length < 2) return;
    const groupObj: CorelObject = {
      id: `group_${Date.now()}`,
      name: `Group (${selectedObjects.length} objects)`,
      type: 'group',
      transform: {
        x: selectionBounds?.minX || 0,
        y: selectionBounds?.minY || 0,
        width: selectionBounds?.width || 100,
        height: selectionBounds?.height || 100,
        rotation: 0,
        scaleX: 1,
        scaleY: 1,
        skewX: 0,
        skewY: 0,
      },
      groupProps: {
        childrenIds: selectedObjects.map(o => o.id),
      },
      subpaths: [],
      fill: { type: 'none', color: '#000' },
      outline: { color: 'none', width: 0, style: 'solid', cap: 'round', join: 'round', startArrow: 'none', endArrow: 'none' },
      shadow: { enabled: false, color: '#000', blur: 0, offsetX: 0, offsetY: 0, opacity: 0 },
      extrude: { enabled: false, depth: 0, angle: 0, vanishingPoint: { x: 0, y: 0 }, bevel: 0, lightIntensity: 0.8 },
      contour: { enabled: false, type: 'outside', steps: 1, offset: 5, endColor: '#fff' },
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
    pushHistory('Group Objects (Ctrl+G)');
  }, [selectedObjects, selectionBounds, activeObjects.length, activePageId, pushHistory]);

  const ungroupSelected = useCallback(() => {
    const groups = selectedObjects.filter(o => o.type === 'group' && o.groupProps?.childrenIds);
    if (groups.length === 0) return;

    const groupIds = groups.map(g => g.id);
    const childIds = groups.flatMap(g => g.groupProps!.childrenIds);

    setObjects(prev => {
      const pageObjs = (prev[activePageId] || []).filter(o => !groupIds.includes(o.id));
      return { ...prev, [activePageId]: pageObjs };
    });

    setSelectedIds(childIds);
    pushHistory('Ungroup Objects (Ctrl+U)');
  }, [selectedObjects, activePageId, pushHistory]);

  // Alignment
  const alignSelected = useCallback((type: 'left' | 'center' | 'right' | 'top' | 'middle' | 'bottom' | 'page-center') => {
    if (selectedObjects.length === 0) return;
    const bounds = selectionBounds;
    if (!bounds && type !== 'page-center') return;

    setObjects(prev => {
      const pageObjs = prev[activePageId] || [];
      const updated = pageObjs.map(obj => {
        if (!selectedIds.includes(obj.id)) return obj;

        let nx = obj.transform.x;
        let ny = obj.transform.y;

        switch (type) {
          case 'left':
            nx = bounds!.minX;
            break;
          case 'center':
            nx = bounds!.centerX - obj.transform.width / 2;
            break;
          case 'right':
            nx = bounds!.maxX - obj.transform.width;
            break;
          case 'top':
            ny = bounds!.minY;
            break;
          case 'middle':
            ny = bounds!.centerY - obj.transform.height / 2;
            break;
          case 'bottom':
            ny = bounds!.maxY - obj.transform.height;
            break;
          case 'page-center':
            nx = activePage.width / 2 - obj.transform.width / 2;
            ny = activePage.height / 2 - obj.transform.height / 2;
            break;
        }

        return {
          ...obj,
          transform: {
            ...obj.transform,
            x: nx,
            y: ny,
          },
        };
      });

      return { ...prev, [activePageId]: updated };
    });

    pushHistory(`Align ${type}`);
  }, [selectedObjects.length, selectionBounds, selectedIds, activePageId, activePage.width, activePage.height, pushHistory]);

  // Boolean Shaping Operations
  const applyBooleanOp = useCallback((op: BooleanOp) => {
    if (selectedObjects.length < 2) return;

    // Convert parametric objects to curves first if needed
    const preparedObjects = selectedObjects.map(obj => {
      if (obj.subpaths.length > 0) return obj;
      let sp: Subpath[] = [];
      const { width: w, height: h } = obj.transform;
      if (obj.type === 'rect') sp = rectToSubpaths(w, h, obj.rectProps?.cornerRadii);
      else if (obj.type === 'ellipse') sp = ellipseToSubpaths(w, h, obj.ellipseProps?.kind, obj.ellipseProps?.startAngle, obj.ellipseProps?.endAngle);
      else if (obj.type === 'polygon') sp = polygonToSubpaths(w, h, obj.polygonProps?.sides);
      else if (obj.type === 'star') sp = starToSubpaths(w, h, obj.starProps?.points, obj.starProps?.sharpness);
      return { ...obj, subpaths: sp };
    });

    const res = performBooleanOperation(preparedObjects, op);
    if (!res) {
      alert('Boolean operation could not be completed on the selected paths.');
      return;
    }

    setObjects(prev => {
      const pageObjs = (prev[activePageId] || []).filter(o => !res.removedIds.includes(o.id));
      return { ...prev, [activePageId]: [...pageObjs, res.newObject] };
    });

    setSelectedIds([res.newObject.id]);
    pushHistory(`Shaping: ${op.toUpperCase()}`);
  }, [selectedObjects, activePageId, pushHistory]);

  // Zoom controls
  const resetZoom = useCallback(() => {
    setZoom(1);
    setPan({ x: 80, y: 40 });
  }, []);

  const zoomToFit = useCallback(() => {
    const containerW = window.innerWidth - 380;
    const containerH = window.innerHeight - 140;
    const scale = Math.min(containerW / activePage.width, containerH / activePage.height) * 0.85;
    const clampedScale = Math.min(4, Math.max(0.2, scale));
    setZoom(clampedScale);
    setPan({
      x: (containerW - activePage.width * clampedScale) / 2 + 50,
      y: (containerH - activePage.height * clampedScale) / 2 + 20,
    });
  }, [activePage.width, activePage.height]);

  const zoomToSelection = useCallback(() => {
    if (!selectionBounds) return;
    const containerW = window.innerWidth - 380;
    const containerH = window.innerHeight - 140;
    const scale = Math.min(containerW / selectionBounds.width, containerH / selectionBounds.height) * 0.7;
    const clampedScale = Math.min(6, Math.max(0.3, scale));
    setZoom(clampedScale);
    setPan({
      x: containerW / 2 - selectionBounds.centerX * clampedScale,
      y: containerH / 2 - selectionBounds.centerY * clampedScale,
    });
  }, [selectionBounds]);

  // Template & Project Loaders
  const loadTemplate = useCallback((templateId: string) => {
    const tpl = PRESET_TEMPLATES.find(t => t.id === templateId);
    if (!tpl) return;

    setProjectTitle(tpl.title);
    setPages([tpl.page]);
    setActivePageId(tpl.page.id);
    setObjects({ [tpl.page.id]: JSON.parse(JSON.stringify(tpl.objects)) });
    setSelectedIds([]);
    pushHistory(`Load Template: ${tpl.title}`);
  }, [pushHistory]);

  const loadProjectDocument = useCallback((doc: ProjectDocument) => {
    setProjectTitle(doc.name || 'Imported CorelDRAW Project');
    setPages(doc.pages || [DEFAULT_PAGE]);
    setActivePageId(doc.activePageId || doc.pages[0]?.id || 'page_1');
    setObjects(doc.objects || {});
    setGuidelines(doc.guidelines || []);
    if (doc.snapSettings) setSnapSettings(doc.snapSettings);
    if (doc.colorPalette) setColorPalette(doc.colorPalette);
    setSelectedIds([]);
    pushHistory('Load Project Document');
  }, [pushHistory]);

  const getProjectDocument = useCallback((): ProjectDocument => {
    return {
      id: `cdrw_${Date.now()}`,
      name: projectTitle,
      version: '2026.1',
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

  // Global Keyboard Shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't intercept if user is typing in an input or textarea
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes((e.target as HTMLElement)?.tagName)) {
        return;
      }

      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'z') {
        e.preventDefault();
        if (e.shiftKey) redo();
        else undo();
      } else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'y') {
        e.preventDefault();
        redo();
      } else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'd') {
        e.preventDefault();
        duplicateSelected();
      } else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'a') {
        e.preventDefault();
        selectAll();
      } else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'g') {
        e.preventDefault();
        if (e.shiftKey) ungroupSelected();
        else groupSelected();
      } else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'u') {
        e.preventDefault();
        ungroupSelected();
      } else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'q') {
        e.preventDefault();
        if (primarySelectedObject) convertToCurves(primarySelectedObject.id);
      } else if (e.key === 'Delete' || e.key === 'Backspace') {
        deleteSelected();
      } else if (e.key === 'F10') {
        e.preventDefault();
        setActiveTool('shape');
      } else if (e.key === 'F5') {
        e.preventDefault();
        setActiveTool('freehand');
      } else if (e.key === 'F6') {
        e.preventDefault();
        setActiveTool('rectangle');
      } else if (e.key === 'F7') {
        e.preventDefault();
        setActiveTool('ellipse');
      } else if (e.key === 'F8') {
        e.preventDefault();
        setActiveTool('text');
      } else if (e.key.toLowerCase() === 'y' && !e.ctrlKey) {
        setActiveTool('polygon');
      } else if (e.key.toLowerCase() === 'g' && !e.ctrlKey) {
        setActiveTool('interactive-fill');
      } else if (e.key.toLowerCase() === 'p' && !e.ctrlKey && !e.ctrlKey) {
        alignSelected('page-center');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [
    undo,
    redo,
    duplicateSelected,
    selectAll,
    groupSelected,
    ungroupSelected,
    deleteSelected,
    primarySelectedObject,
    convertToCurves,
    alignSelected,
  ]);

  // Debounced Autosave to localStorage for 100% offline resilience
  useEffect(() => {
    const timer = setTimeout(() => {
      try {
        const doc = getProjectDocument();
        localStorage.setItem('devins_coreldraw_autosave', JSON.stringify(doc));
      } catch (e) {
        // Storage quota full or disabled
      }
    }, 600);
    return () => clearTimeout(timer);
  }, [getProjectDocument]);

  return (
    <CorelContext.Provider
      value={{
        projectTitle,
        setProjectTitle,
        pages,
        activePageId,
        activePage,
        addPage,
        deletePage,
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
