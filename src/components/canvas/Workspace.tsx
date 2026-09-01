import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { useCorel } from '../../context/CorelContext';
import { CorelObject, Point2D, Subpath, BezierNode, PainterlyStrokePoint, CorelPage } from '../../types/coreldraw';
import { Rulers } from './Rulers';
import { GuidelinesOverlay } from './GuidelinesOverlay';
import { TransformGizmo } from './TransformGizmo';
import { NodeEditGizmo } from './NodeEditGizmo';
import { InteractiveGradientGizmo } from './InteractiveGradientGizmo';
import { MediaTray } from './MediaTray';
import { ContextMenu } from './ContextMenu';
import {
  subpathsToSvgPathData,
  rectToSubpaths,
  ellipseToSubpaths,
  polygonToSubpaths,
  starToSubpaths,
  distance,
} from '../../engine/vectorMath';
import { generate3DExtrusionFacets } from '../../engine/effectsEngine';
import {
  generatePainterlyPath,
  getPainterlyFilterId,
} from '../../engine/painterlyBrushEngine';
import { getSeparationFilteredColor } from '../../engine/prepressEngine';
import {
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  ChevronDown,
  Maximize2,
  Minimize2,
  Hand,
  Move,
  Check,
} from 'lucide-react';

const PAGE_GAP = 120; // Horizontal gap between multi-page spreads

export const Workspace: React.FC = () => {
  const {
    pages,
    activePageId,
    setActivePageId,
    activePage,
    objects,
    activeObjects,
    selectedIds,
    setSelectedIds,
    toggleSelect,
    clearSelection,
    activeTool,
    setActiveTool,
    viewMode,
    zoom,
    setZoom,
    pan,
    setPan,
    resetZoom,
    zoomToFit,
    addObject,
    updateObject,
    updateSelectedObjects,
    guidelines,
    snapSettings,
    primarySelectedObject,
    activeFillColor,
    activeOutlineColor,
    activeOutlineWidth,
    convertToCurves,
    painterlySettings,
    prepressSettings,
    setOpenDialog,
    deleteSelected,
    duplicateSelected,
    undo,
    redo,
    selectAll,
  } = useCorel();

  const containerRef = useRef<HTMLDivElement>(null);
  const inlineTextRef = useRef<HTMLTextAreaElement>(null);

  const [cursorPos, setCursorPos] = useState<Point2D>({ x: 0, y: 0 });

  // Spacebar tracking for hand pan
  const [isSpacePressed, setIsSpacePressed] = useState(false);

  // Dragging / Drawing state
  const [isPanning, setIsPanning] = useState(false);
  const [panStart, setPanStart] = useState<Point2D>({ x: 0, y: 0 });

  // Creation drag state
  const [isDrawing, setIsDrawing] = useState(false);
  const [drawStart, setDrawStart] = useState<Point2D>({ x: 0, y: 0 });
  const [freehandPoints, setFreehandPoints] = useState<Point2D[]>([]);
  const [painterlyPoints, setPainterlyPoints] = useState<PainterlyStrokePoint[]>([]);

  // Selection box drag
  const [isSelectingBox, setIsSelectingBox] = useState(false);
  const [selectionBox, setSelectionBox] = useState<{ start: Point2D; end: Point2D } | null>(null);

  // Live on-canvas text inline editing
  const [editingTextId, setEditingTextId] = useState<string | null>(null);
  const [contextMenuPos, setContextMenuPos] = useState<{ x: number; y: number } | null>(null);
  const [isShiftKeyHeld, setIsShiftKeyHeld] = useState(false);
  const [isCtrlKeyHeld, setIsCtrlKeyHeld] = useState(false);

  // Transform gizmo drag state
  const [transformMode, setTransformMode] = useState<'move' | 'resize' | 'rotate' | null>(null);
  const [transformHandle, setTransformHandle] = useState<string | undefined>();
  const [dragStartScreen, setDragStartScreen] = useState<Point2D>({ x: 0, y: 0 });
  const [initialTransforms, setInitialTransforms] = useState<Record<string, CorelObject['transform']>>({});

  // Node tool drag state
  const [draggedNodeId, setDraggedNodeId] = useState<string | null>(null);
  const [draggedHandleType, setDraggedHandleType] = useState<'node' | 'handleIn' | 'handleOut' | null>(null);

  // Gradient tool drag state
  const [draggedGradHandle, setDraggedGradHandle] = useState<'start' | 'end' | null>(null);

  // Multi-page layout positions
  const pagePositions = useMemo(() => {
    let currentX = 0;
    return pages.map((page, idx) => {
      const pos = {
        ...page,
        index: idx,
        offsetX: currentX,
        offsetY: 0,
      };
      currentX += page.width + PAGE_GAP;
      return pos;
    });
  }, [pages]);

  const activePagePos = useMemo(() => {
    return pagePositions.find(p => p.id === activePageId) || pagePositions[0];
  }, [pagePositions, activePageId]);

  // Global Keyboard Shortcuts (New Doc, Undo, Redo, Delete, Fit, F-keys)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      setIsShiftKeyHeld(e.shiftKey);
      setIsCtrlKeyHeld(e.ctrlKey || e.metaKey);

      const isInput = (e.target as HTMLElement).matches('input, textarea, select');
      if (isInput) return;

      if (e.code === 'Space') {
        setIsSpacePressed(true);
      } else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'n') {
        e.preventDefault();
        setOpenDialog('new');
      } else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'e') {
        e.preventDefault();
        setOpenDialog('export');
      } else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'd') {
        e.preventDefault();
        duplicateSelected();
      } else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'a') {
        e.preventDefault();
        selectAll();
      } else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'z') {
        e.preventDefault();
        if (e.shiftKey) redo();
        else undo();
      } else if (e.key === 'Delete' || e.key === 'Backspace') {
        deleteSelected();
      } else if (e.key === 'F4') {
        e.preventDefault();
        zoomToFit();
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
      } else if (e.key === 'F10') {
        e.preventDefault();
        setActiveTool('shape');
      } else if (e.key.toLowerCase() === 'b') {
        setActiveTool('painterly-brush');
      } else if (e.key === 'Escape') {
        setEditingTextId(null);
        clearSelection();
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      setIsShiftKeyHeld(e.shiftKey);
      setIsCtrlKeyHeld(e.ctrlKey || e.metaKey);
      if (e.code === 'Space') {
        setIsSpacePressed(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [setOpenDialog, deleteSelected, duplicateSelected, undo, redo, selectAll, zoomToFit, setActiveTool, clearSelection]);

  // Focus inline textarea on edit
  useEffect(() => {
    if (editingTextId && inlineTextRef.current) {
      inlineTextRef.current.focus();
      inlineTextRef.current.select();
    }
  }, [editingTextId]);

  // Convert Screen (Client) coords to Canvas space coords
  const screenToCanvas = useCallback(
    (clientX: number, clientY: number): Point2D => {
      if (!containerRef.current) return { x: 0, y: 0 };
      const rect = containerRef.current.getBoundingClientRect();
      const rawX = (clientX - rect.left - pan.x) / zoom;
      const rawY = (clientY - rect.top - pan.y) / zoom;

      let snX = rawX;
      let snY = rawY;

      // Snap to Grid
      if (snapSettings.snapToGrid) {
        const gs = snapSettings.gridSize;
        snX = Math.round(snX / gs) * gs;
        snY = Math.round(snY / gs) * gs;
      }

      // Snap to Guidelines
      if (snapSettings.snapToGuidelines && guidelines) {
        const th = snapSettings.snapThreshold / zoom;
        guidelines.forEach(gl => {
          if (gl.orientation === 'vertical' && Math.abs(gl.position - rawX) < th) {
            snX = gl.position;
          } else if (gl.orientation === 'horizontal' && Math.abs(gl.position - rawY) < th) {
            snY = gl.position;
          }
        });
      }

      return { x: snX, y: snY };
    },
    [pan, zoom, snapSettings, guidelines]
  );

  // Mouse wheel: Ctrl=Zoom, Shift=Horizontal Pan, Regular=Vertical/Horizontal Pan
  const handleWheel = (e: React.WheelEvent) => {
    if (e.ctrlKey || e.metaKey) {
      e.preventDefault();
      const zoomFactor = e.deltaY < 0 ? 1.15 : 0.85;
      const newZoom = Math.min(Math.max(zoom * zoomFactor, 0.05), 20);

      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        const mouseX = e.clientX - rect.left;
        const mouseY = e.clientY - rect.top;

        setPan(prev => ({
          x: mouseX - (mouseX - prev.x) * (newZoom / zoom),
          y: mouseY - (mouseY - prev.y) * (newZoom / zoom),
        }));
      }
      setZoom(newZoom);
    } else if (e.shiftKey) {
      setPan(prev => ({
        x: prev.x - (e.deltaY || e.deltaX),
        y: prev.y,
      }));
    } else {
      setPan(prev => ({
        x: prev.x - e.deltaX,
        y: prev.y - e.deltaY,
      }));
    }
  };

  // Mouse Down
  const handleMouseDown = (e: React.MouseEvent) => {
    // Exit inline text edit if clicking outside
    if (editingTextId && (e.target as HTMLElement).tagName !== 'TEXTAREA') {
      setEditingTextId(null);
    }

    // Pan mode (middle click, Space+Drag, Alt+Drag, or Pan Tool)
    if (e.button === 1 || activeTool === 'pan' || isSpacePressed || (e.button === 0 && e.altKey)) {
      setIsPanning(true);
      setPanStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
      return;
    }

    if (e.button !== 0) return; // Only left click for drawing/selection

    const canvasPt = screenToCanvas(e.clientX, e.clientY);
    setDrawStart(canvasPt);
    setIsDrawing(true);

    // Text Tool Click -> Instant on-canvas text creation and inline edit focus
    if (activeTool === 'text') {
      const currentOffsetX = activePagePos?.offsetX || 0;
      const newText = addObject({
        name: `Text ${activeObjects.length + 1}`,
        type: 'text',
        transform: {
          x: canvasPt.x - currentOffsetX,
          y: canvasPt.y - 20,
          width: 280,
          height: 50,
          rotation: 0,
          scaleX: 1,
          scaleY: 1,
          skewX: 0,
          skewY: 0,
        },
        textProps: {
          text: 'Type your text...',
          fontFamily: 'Montserrat',
          fontSize: 36,
          fontWeight: 700,
          fontStyle: 'normal',
          textDecoration: 'none',
          textAlign: 'left',
          letterSpacing: 0,
          lineHeight: 1.2,
        },
        fill: { type: 'solid', color: activeFillColor },
        outline: { color: 'none', width: 0, style: 'solid', cap: 'round', join: 'round', startArrow: 'none', endArrow: 'none' },
      });
      setSelectedIds([newText.id]);
      setEditingTextId(newText.id);
      setIsDrawing(false);
      return;
    }

    if (activeTool === 'freehand' || activeTool === 'artistic-media') {
      setFreehandPoints([canvasPt]);
    } else if (activeTool === 'painterly-brush') {
      setPainterlyPoints([{ x: canvasPt.x, y: canvasPt.y, pressure: 0.7, speed: 1 }]);
    } else if (activeTool === 'pick') {
      // Start marquee selection box if clicked on empty canvas area
      if ((e.target as HTMLElement).tagName === 'svg' || (e.target as HTMLElement).id === 'corel-main-canvas-svg' || (e.target as HTMLElement).classList.contains('canvas-page-sheet')) {
        setIsSelectingBox(true);
        setSelectionBox({ start: canvasPt, end: canvasPt });
        if (!e.shiftKey) {
          clearSelection();
        }
      }
    }
  };

  // Mouse Move
  const handleMouseMove = (e: React.MouseEvent) => {
    const canvasPt = screenToCanvas(e.clientX, e.clientY);
    setCursorPos(canvasPt);

    // Pan Mode
    if (isPanning) {
      setPan({
        x: e.clientX - panStart.x,
        y: e.clientY - panStart.y,
      });
      return;
    }

    // Active Gizmo Transformation (Move, Resize, Rotate)
    if (transformMode && dragStartScreen) {
      const dx = (e.clientX - dragStartScreen.x) / zoom;
      const dy = (e.clientY - dragStartScreen.y) / zoom;

      if (transformMode === 'move') {
        selectedIds.forEach(id => {
          const init = initialTransforms[id];
          if (init) {
            updateObject(id, {
              transform: {
                ...init,
                x: init.x + dx,
                y: init.y + dy,
              },
            }, false);
          }
        });
        return;
      }

      if (transformMode === 'resize') {
        selectedIds.forEach(id => {
          const init = initialTransforms[id];
          const obj = activeObjects.find(o => o.id === id);
          if (!init || !obj) return;

          let newX = init.x;
          let newY = init.y;
          let newW = init.width;
          let newH = init.height;

          switch (transformHandle) {
            case 'br':
              newW = Math.max(10, init.width + dx);
              newH = Math.max(10, init.height + dy);
              break;
            case 'bl':
              newW = Math.max(10, init.width - dx);
              newH = Math.max(10, init.height + dy);
              newX = init.x + (init.width - newW);
              break;
            case 'tr':
              newW = Math.max(10, init.width + dx);
              newH = Math.max(10, init.height - dy);
              newY = init.y + (init.height - newH);
              break;
            case 'tl':
              newW = Math.max(10, init.width - dx);
              newH = Math.max(10, init.height - dy);
              newX = init.x + (init.width - newW);
              newY = init.y + (init.height - newH);
              break;
            case 'mr':
              newW = Math.max(10, init.width + dx);
              break;
            case 'ml':
              newW = Math.max(10, init.width - dx);
              newX = init.x + (init.width - newW);
              break;
            case 'bc':
              newH = Math.max(10, init.height + dy);
              break;
            case 'tc':
              newH = Math.max(10, init.height - dy);
              newY = init.y + (init.height - newH);
              break;
          }

          // If text object, dynamically scale font size proportionally with box height
          let updatedTextProps = obj.textProps;
          if (obj.type === 'text' && obj.textProps) {
            const scale = newH / Math.max(1, init.height);
            const newFontSize = Math.max(8, Math.min(250, Math.round(obj.textProps.fontSize * scale)));
            updatedTextProps = {
              ...obj.textProps,
              fontSize: newFontSize,
            };
          }

          updateObject(id, {
            transform: {
              ...init,
              x: newX,
              y: newY,
              width: newW,
              height: newH,
            },
            textProps: updatedTextProps,
          }, false);
        });
        return;
      }

      if (transformMode === 'rotate' && primarySelectedObject) {
        const init = initialTransforms[primarySelectedObject.id];
        if (init) {
          const centerX = init.x + init.width / 2;
          const centerY = init.y + init.height / 2;
          const angleRad = Math.atan2(canvasPt.y - centerY, canvasPt.x - centerX);
          const angleDeg = Math.round((angleRad * 180) / Math.PI);
          updateObject(primarySelectedObject.id, {
            transform: {
              ...init,
              rotation: angleDeg,
            },
          }, false);
        }
        return;
      }
    }

    if (isSelectingBox && selectionBox) {
      setSelectionBox({ start: selectionBox.start, end: canvasPt });
      return;
    }

    if (isDrawing) {
      if (activeTool === 'freehand' || activeTool === 'artistic-media') {
        setFreehandPoints(prev => [...prev, canvasPt]);
      } else if (activeTool === 'painterly-brush') {
        const prev = painterlyPoints[painterlyPoints.length - 1];
        const dist = prev ? distance(prev, canvasPt) : 1;
        const dynamicPressure = Math.min(1.0, Math.max(0.3, 1.2 - dist / 40));
        setPainterlyPoints(p => [...p, { x: canvasPt.x, y: canvasPt.y, pressure: dynamicPressure, speed: dist }]);
      }
    }
  };

  // Mouse Up
  const handleMouseUp = (e: React.MouseEvent) => {
    if (isPanning) {
      setIsPanning(false);
      return;
    }

    // Finish Transform Mode
    if (transformMode) {
      setTransformMode(null);
      setTransformHandle(undefined);
      return;
    }

    const canvasPt = screenToCanvas(e.clientX, e.clientY);

    // End Marquee Selection
    if (isSelectingBox && selectionBox) {
      const minX = Math.min(selectionBox.start.x, selectionBox.end.x);
      const maxX = Math.max(selectionBox.start.x, selectionBox.end.x);
      const minY = Math.min(selectionBox.start.y, selectionBox.end.y);
      const maxY = Math.max(selectionBox.start.y, selectionBox.end.y);

      if (maxX - minX > 5 || maxY - minY > 5) {
        const found = activeObjects.filter(obj => {
          const t = obj.transform;
          const absX = (activePagePos?.offsetX || 0) + t.x;
          const absY = t.y;
          return absX < maxX && absX + t.width > minX && absY < maxY && absY + t.height > minY;
        });
        setSelectedIds(found.map(o => o.id));
      }
      setIsSelectingBox(false);
      setSelectionBox(null);
    }

    // End Object Drawing Creation
    if (isDrawing) {
      setIsDrawing(false);
      const currentOffsetX = activePagePos?.offsetX || 0;
      let width = Math.abs(canvasPt.x - drawStart.x);
      let height = Math.abs(canvasPt.y - drawStart.y);

      // Constraint: Ctrl key constrains to perfect square / circle 1:1 aspect ratio
      if (e.ctrlKey || e.metaKey) {
        const side = Math.max(width, height);
        width = side;
        height = side;
      }

      let minX = Math.min(drawStart.x, canvasPt.x) - currentOffsetX;
      let minY = Math.min(drawStart.y, canvasPt.y);

      // Constraint: Shift key draws centered from mouse origin
      if (e.shiftKey) {
        minX = drawStart.x - width - currentOffsetX;
        minY = drawStart.y - height;
        width = width * 2;
        height = height * 2;
      }

      // Painterly Brush Stroke 2025
      if (activeTool === 'painterly-brush' && painterlyPoints.length > 1) {
        let pMinX = Infinity, pMaxX = -Infinity, pMinY = Infinity, pMaxY = -Infinity;
        painterlyPoints.forEach(p => {
          pMinX = Math.min(pMinX, p.x);
          pMaxX = Math.max(pMaxX, p.x);
          pMinY = Math.min(pMinY, p.y);
          pMaxY = Math.max(pMaxY, p.y);
        });
        const strokeW = Math.max(20, pMaxX - pMinX);
        const strokeH = Math.max(20, pMaxY - pMinY);

        const localPoints = painterlyPoints.map(p => ({
          ...p,
          x: p.x - pMinX,
          y: p.y - pMinY,
        }));

        addObject({
          name: `2025 ${painterlySettings.mediaType.toUpperCase()} Stroke`,
          type: 'painterly-brush',
          transform: {
            x: pMinX - currentOffsetX,
            y: pMinY,
            width: strokeW,
            height: strokeH,
            rotation: 0,
            scaleX: 1,
            scaleY: 1,
            skewX: 0,
            skewY: 0,
          },
          subpaths: [],
          painterlyProps: {
            mediaType: painterlySettings.mediaType,
            points: localPoints,
            size: painterlySettings.size,
            opacity: painterlySettings.opacity,
            wetness: painterlySettings.wetness,
            bleed: painterlySettings.bleed,
            color: activeFillColor,
          },
          fill: { type: 'none', color: 'none' },
          outline: { color: activeFillColor, width: painterlySettings.size, style: 'solid', cap: 'round', join: 'round', startArrow: 'none', endArrow: 'none' },
          opacity: painterlySettings.opacity,
        });

        setPainterlyPoints([]);
      } else if (activeTool === 'rectangle' && width > 4 && height > 4) {
        addObject({
          name: `Rectangle ${activeObjects.length + 1}`,
          type: 'rect',
          transform: { x: minX, y: minY, width, height, rotation: 0, scaleX: 1, scaleY: 1, skewX: 0, skewY: 0 },
          subpaths: rectToSubpaths(width, height, [0, 0, 0, 0]),
          rectProps: { cornerRadii: [0, 0, 0, 0], isRoundedLinked: true },
          fill: { type: 'solid', color: activeFillColor },
          outline: { color: activeOutlineColor, width: activeOutlineWidth || 1.5, style: 'solid', cap: 'round', join: 'round', startArrow: 'none', endArrow: 'none' },
        });
        setActiveTool('pick');
      } else if (activeTool === 'ellipse' && width > 4 && height > 4) {
        addObject({
          name: `Ellipse ${activeObjects.length + 1}`,
          type: 'ellipse',
          transform: { x: minX, y: minY, width, height, rotation: 0, scaleX: 1, scaleY: 1, skewX: 0, skewY: 0 },
          subpaths: ellipseToSubpaths(width, height),
          ellipseProps: { kind: 'ellipse', startAngle: 0, endAngle: 360 },
          fill: { type: 'solid', color: activeFillColor },
          outline: { color: activeOutlineColor, width: activeOutlineWidth || 1.5, style: 'solid', cap: 'round', join: 'round', startArrow: 'none', endArrow: 'none' },
        });
        setActiveTool('pick');
      } else if (activeTool === 'polygon' && width > 4 && height > 4) {
        addObject({
          name: `Polygon ${activeObjects.length + 1}`,
          type: 'polygon',
          transform: { x: minX, y: minY, width, height, rotation: 0, scaleX: 1, scaleY: 1, skewX: 0, skewY: 0 },
          subpaths: polygonToSubpaths(width, height, 5),
          polygonProps: { sides: 5 },
          fill: { type: 'solid', color: activeFillColor },
          outline: { color: activeOutlineColor, width: activeOutlineWidth || 1.5, style: 'solid', cap: 'round', join: 'round', startArrow: 'none', endArrow: 'none' },
        });
        setActiveTool('pick');
      } else if (activeTool === 'star' && width > 4 && height > 4) {
        addObject({
          name: `Star ${activeObjects.length + 1}`,
          type: 'star',
          transform: { x: minX, y: minY, width, height, rotation: 0, scaleX: 1, scaleY: 1, skewX: 0, skewY: 0 },
          subpaths: starToSubpaths(width, height, 5, 0.5),
          starProps: { points: 5, sharpness: 0.5 },
          fill: { type: 'solid', color: activeFillColor },
          outline: { color: activeOutlineColor, width: activeOutlineWidth || 1.5, style: 'solid', cap: 'round', join: 'round', startArrow: 'none', endArrow: 'none' },
        });
        setActiveTool('pick');
      } else if (activeTool === 'freehand' && freehandPoints.length > 1) {
        const nodes: BezierNode[] = [];
        const step = Math.max(1, Math.floor(freehandPoints.length / 16));

        for (let i = 0; i < freehandPoints.length; i += step) {
          const pt = freehandPoints[i];
          nodes.push({
            id: `node_${i}`,
            x: pt.x - (minX + currentOffsetX),
            y: pt.y - minY,
            type: 'smooth',
          });
        }

        addObject({
          name: `Freehand Curve ${activeObjects.length + 1}`,
          type: 'path',
          transform: { x: minX, y: minY, width: Math.max(10, width), height: Math.max(10, height), rotation: 0, scaleX: 1, scaleY: 1, skewX: 0, skewY: 0 },
          subpaths: [{ isClosed: false, nodes }],
          fill: { type: 'none', color: 'none' },
          outline: { color: activeOutlineColor, width: activeOutlineWidth || 2, style: 'solid', cap: 'round', join: 'round', startArrow: 'none', endArrow: 'none' },
        });
        setFreehandPoints([]);
        setActiveTool('pick');
      }
    }
  };

  // Object Click / Selection
  const handleObjectClick = (e: React.MouseEvent, obj: CorelObject, pageId: string) => {
    e.stopPropagation();
    if (activePageId !== pageId) {
      setActivePageId(pageId);
    }

    if (activeTool === 'text') {
      setEditingTextId(obj.id);
      return;
    }

    if (activeTool === 'color-eyedropper') {
      alert(`Sampled Color: ${obj.fill.color}`);
      return;
    }

    if (activeTool === 'pick' || activeTool === 'freehand-pick' || activeTool === 'shape' || activeTool === 'interactive-fill') {
      toggleSelect(obj.id, e.shiftKey);
    }
  };

  // Start Gizmo Transformation
  const handleStartTransform = (type: 'move' | 'resize' | 'rotate' | 'skew', handle?: string, startPt?: Point2D) => {
    setTransformMode(type === 'skew' ? 'resize' : type);
    setTransformHandle(handle);
    setDragStartScreen(startPt || { x: 0, y: 0 });

    const transformsMap: Record<string, CorelObject['transform']> = {};
    selectedIds.forEach(id => {
      const obj = activeObjects.find(o => o.id === id);
      if (obj) transformsMap[id] = { ...obj.transform };
    });
    setInitialTransforms(transformsMap);
  };

  // Start Node Drag
  const handleStartNodeDrag = (nodeId: string, handleType: 'node' | 'handleIn' | 'handleOut', startPt: Point2D) => {
    setDraggedNodeId(nodeId);
    setDraggedHandleType(handleType);
  };

  // Quick Pan Actions
  const panLeft = () => setPan(p => ({ ...p, x: p.x + 200 }));
  const panRight = () => setPan(p => ({ ...p, x: p.x - 200 }));
  const panUp = () => setPan(p => ({ ...p, y: p.y + 200 }));
  const panDown = () => setPan(p => ({ ...p, y: p.y - 200 }));

  const editingObject = activeObjects.find(o => o.id === editingTextId && o.type === 'text');

  return (
    <div
      ref={containerRef}
      id="corel-viewport-container"
      onWheel={handleWheel}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      className={`flex-1 relative overflow-hidden bg-[#181a20] select-none ${
        isPanning || isSpacePressed ? 'cursor-grab active:cursor-grabbing' : ''
      }`}
    >
      {/* Rulers */}
      <Rulers cursorPos={cursorPos} />

      {/* Main Vector SVG Canvas */}
      <svg
        id="corel-main-canvas-svg"
        className="w-full h-full absolute top-0 left-0"
        style={{
          transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
          transformOrigin: '0 0',
        }}
      >
        <defs>
          <filter id="canvas-shadow" x="-50%" y="-50%" width="200%" height="200%">
            <feDropShadow dx="3" dy="3" stdDeviation="4" floodColor="#000000" floodOpacity="0.5" />
          </filter>

          {/* 2025 Painterly Brush Filters */}
          <filter id="filter-painterly-watercolor" x="-20%" y="-20%" width="140%" height="140%">
            <feTurbulence type="fractalNoise" baseFrequency="0.04" numOctaves="3" result="noise" />
            <feDisplacementMap in="SourceGraphic" in2="noise" scale="6" xChannelSelector="R" yChannelSelector="G" result="displaced" />
            <feGaussianBlur in="displaced" stdDeviation="1.2" result="blurred" />
            <feMerge>
              <feMergeNode in="blurred" />
              <feMergeNode in="SourceGraphic" opacity="0.6" />
            </feMerge>
          </filter>

          <filter id="filter-painterly-pastel" x="-10%" y="-10%" width="120%" height="120%">
            <feTurbulence type="fractalNoise" baseFrequency="0.18" numOctaves="2" result="grain" />
            <feComposite operator="in" in="SourceGraphic" in2="grain" result="textured" />
            <feMerge>
              <feMergeNode in="SourceGraphic" opacity="0.4" />
              <feMergeNode in="textured" />
            </feMerge>
          </filter>

          <filter id="filter-painterly-acrylic" x="-15%" y="-15%" width="130%" height="130%">
            <feTurbulence type="turbulence" baseFrequency="0.08" numOctaves="2" result="brushNoise" />
            <feDisplacementMap in="SourceGraphic" in2="brushNoise" scale="3" xChannelSelector="R" yChannelSelector="B" />
          </filter>

          <filter id="filter-painterly-oil" x="-15%" y="-15%" width="130%" height="130%">
            <feTurbulence type="fractalNoise" baseFrequency="0.05" numOctaves="3" result="oilNoise" />
            <feDisplacementMap in="SourceGraphic" in2="oilNoise" scale="4" xChannelSelector="G" yChannelSelector="R" />
          </filter>
        </defs>

        {/* Multi-Page Horizontal Spreads Rendering */}
        {pagePositions.map(page => {
          const isCurrentActive = page.id === activePageId;
          const pageObjs = objects[page.id] || [];

          return (
            <g
              key={page.id}
              transform={`translate(${page.offsetX}, 0)`}
              onClick={() => setActivePageId(page.id)}
            >
              {/* Page Title & Dimensions Header */}
              <text
                x={0}
                y={-14}
                fill={isCurrentActive ? '#38bdf8' : '#64748b'}
                fontSize="12"
                fontWeight={isCurrentActive ? 'bold' : 'normal'}
                fontFamily="Inter, sans-serif"
                className="select-none"
              >
                {page.name} ({page.width} × {page.height} {page.unit})
              </text>

              {/* Printable Page Sheet Background */}
              <rect
                id={`canvas-bg-${page.id}`}
                x={0}
                y={0}
                width={page.width}
                height={page.height}
                fill={page.background || '#ffffff'}
                stroke={isCurrentActive ? '#3b82f6' : '#334155'}
                strokeWidth={isCurrentActive ? 1.5 : 1}
                className="canvas-page-sheet shadow-2xl cursor-pointer"
              />

              {/* Bleed Lines Indicator (Prepress) */}
              {prepressSettings.bleedMm > 0 && (
                <rect
                  x={-prepressSettings.bleedMm * 3.78}
                  y={-prepressSettings.bleedMm * 3.78}
                  width={page.width + prepressSettings.bleedMm * 7.56}
                  height={page.height + prepressSettings.bleedMm * 7.56}
                  fill="none"
                  stroke="#f43f5e"
                  strokeWidth="0.8"
                  strokeDasharray="4,4"
                  opacity="0.7"
                />
              )}

              {/* Prepress Crop Marks */}
              {prepressSettings.cropMarks && (
                <g stroke="#000000" strokeWidth="0.75" opacity="0.8">
                  <line x1={-15} y1={0} x2={-3} y2={0} />
                  <line x1={0} y1={-15} x2={0} y2={-3} />
                  <line x1={page.width + 3} y1={0} x2={page.width + 15} y2={0} />
                  <line x1={page.width} y1={-15} x2={page.width} y2={-3} />
                  <line x1={-15} y1={page.height} x2={-3} y2={page.height} />
                  <line x1={0} y1={page.height + 3} x2={0} y2={page.height + 15} />
                  <line x1={page.width + 3} y1={page.height} x2={page.width + 15} y2={page.height} />
                  <line x1={page.width} y1={page.height + 3} x2={page.width} y2={page.height + 15} />
                </g>
              )}

              {/* Render Objects for this Page */}
              {pageObjs.map(obj => {
                if (!obj.visible) return null;
                const { x, y, width: w, height: h, rotation } = obj.transform;
                const transformAttr = rotation ? `rotate(${rotation} ${w / 2} ${h / 2})` : '';

                const isWireframe = viewMode === 'wireframe';
                const isSeparations = prepressSettings.mode === 'separations';
                const activePlate = prepressSettings.activeSeparationView === 'all' ? 'cyan' : prepressSettings.activeSeparationView || 'cyan';

                let fillAttr = isWireframe ? 'none' : obj.fill.color;
                if (!isWireframe && obj.fill.type === 'none') fillAttr = 'none';
                if (isSeparations && fillAttr !== 'none') {
                  fillAttr = getSeparationFilteredColor(obj.fill.color, activePlate as any, prepressSettings.invertPlates);
                }

                let strokeAttr = isWireframe ? '#00e676' : obj.outline.color;
                let strokeWidth = isWireframe ? 1 : obj.outline.width;
                if (isSeparations && strokeAttr !== 'none') {
                  strokeAttr = getSeparationFilteredColor(obj.outline.color, activePlate as any, prepressSettings.invertPlates);
                }

                const extrudeFacets = !isWireframe && obj.extrude?.enabled ? generate3DExtrusionFacets(obj, obj.extrude) : [];

                return (
                  <g
                    key={obj.id}
                    transform={`translate(${x}, ${y})`}
                    onClick={e => handleObjectClick(e, obj, page.id)}
                    onDoubleClick={e => {
                      e.stopPropagation();
                      if (obj.type === 'text') {
                        setEditingTextId(obj.id);
                      } else {
                        setActiveTool('shape');
                      }
                    }}
                    onContextMenu={e => {
                      e.preventDefault();
                      e.stopPropagation();
                      if (!selectedIds.includes(obj.id)) {
                        setSelectedIds([obj.id]);
                      }
                      setContextMenuPos({ x: e.clientX, y: e.clientY });
                    }}
                    className="cursor-pointer"
                  >
                    <g transform={transformAttr}>
                      {extrudeFacets.map((facet, fIdx) => (
                        <polygon
                          key={`facet_${fIdx}`}
                          points={facet.points.map(p => `${p.x},${p.y}`).join(' ')}
                          fill={facet.fill}
                          stroke={facet.stroke || 'none'}
                          opacity={facet.opacity}
                        />
                      ))}

                      {obj.type === 'painterly-brush' && obj.painterlyProps && (
                        <path
                          d={generatePainterlyPath(obj.painterlyProps.points, obj.painterlyProps.size)}
                          fill="none"
                          stroke={fillAttr !== 'none' ? fillAttr : obj.painterlyProps.color}
                          strokeWidth={obj.painterlyProps.size}
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          filter={`url(#${getPainterlyFilterId(obj.painterlyProps.mediaType)})`}
                          opacity={obj.painterlyProps.opacity}
                        />
                      )}

                      {/* 3D Extruded Layers for Typography */}
                      {obj.type === 'text' && obj.textProps && obj.extrude?.enabled && (
                        <g opacity="0.85">
                          {Array.from({ length: Math.min(15, Math.max(2, Math.floor(obj.extrude.depth / 2))) }).map((_, exIdx) => {
                            const rad = ((obj.extrude.angle || 45) * Math.PI) / 180;
                            const offsetStep = exIdx + 1;
                            const exX = Math.cos(rad) * offsetStep * 1.5;
                            const exY = Math.sin(rad) * offsetStep * 1.5;
                            return (
                              <text
                                key={`text_ex_${exIdx}`}
                                x={exX}
                                y={obj.textProps!.fontSize + exY}
                                fontFamily={obj.textProps!.fontFamily}
                                fontSize={obj.textProps!.fontSize}
                                fontWeight={obj.textProps!.fontWeight}
                                fontStyle={obj.textProps!.fontStyle}
                                fill={obj.extrude.sideColor || '#1e293b'}
                                stroke="none"
                                textAnchor={obj.textProps!.textAlign === 'center' ? 'middle' : obj.textProps!.textAlign === 'right' ? 'end' : 'start'}
                                letterSpacing={obj.textProps!.letterSpacing}
                              >
                                {obj.textProps!.text}
                              </text>
                            );
                          })}
                        </g>
                      )}

                      {/* Native SVG Text Element */}
                      {obj.type === 'text' && obj.textProps && obj.id !== editingTextId && (
                        <text
                          x={0}
                          y={obj.textProps.fontSize}
                          fontFamily={obj.textProps.fontFamily}
                          fontSize={obj.textProps.fontSize}
                          fontWeight={obj.textProps.fontWeight}
                          fontStyle={obj.textProps.fontStyle}
                          fill={fillAttr}
                          stroke={strokeAttr}
                          strokeWidth={strokeWidth}
                          textAnchor={obj.textProps.textAlign === 'center' ? 'middle' : obj.textProps.textAlign === 'right' ? 'end' : 'start'}
                          letterSpacing={obj.textProps.letterSpacing}
                          filter={obj.shadow?.enabled && !isWireframe ? 'url(#canvas-shadow)' : undefined}
                          onDoubleClick={e => {
                            e.stopPropagation();
                            setEditingTextId(obj.id);
                          }}
                        >
                          {obj.textProps.text}
                        </text>
                      )}

                      {obj.type === 'dimension' && obj.dimensionProps && (
                        <g>
                          <line
                            x1={obj.dimensionProps.start.x - x}
                            y1={obj.dimensionProps.start.y - y - obj.dimensionProps.offset}
                            x2={obj.dimensionProps.end.x - x}
                            y2={obj.dimensionProps.end.y - y - obj.dimensionProps.offset}
                            stroke={obj.outline.color}
                            strokeWidth={obj.outline.width}
                          />
                          <text
                            x={(obj.dimensionProps.start.x + obj.dimensionProps.end.x) / 2 - x}
                            y={(obj.dimensionProps.start.y + obj.dimensionProps.end.y) / 2 - y - obj.dimensionProps.offset - 4}
                            fill={obj.outline.color}
                            fontSize="12"
                            fontFamily="Inter, sans-serif"
                            textAnchor="middle"
                          >
                            {Math.round(distance(obj.dimensionProps.start, obj.dimensionProps.end))} {obj.dimensionProps.unit}
                          </text>
                        </g>
                      )}

                      {obj.type === 'image' && obj.imageProps && (
                        <image
                          href={obj.imageProps.src}
                          x={0}
                          y={0}
                          width={w}
                          height={h}
                          preserveAspectRatio="none"
                          style={{
                            filter: obj.imageProps.filter
                              ? `brightness(${obj.imageProps.filter.brightness}%) contrast(${obj.imageProps.filter.contrast}%) saturate(${obj.imageProps.filter.saturation}%) hue-rotate(${obj.imageProps.filter.hueRotate}deg) blur(${obj.imageProps.filter.blur}px) sepia(${obj.imageProps.filter.sepia}%) grayscale(${obj.imageProps.filter.grayscale}%)`
                              : undefined,
                          }}
                        />
                      )}

                      {obj.subpaths.length > 0 && (
                        <path
                          d={subpathsToSvgPathData(obj.subpaths)}
                          fill={fillAttr}
                          stroke={obj.outline.isCutContour ? '#ff007f' : strokeAttr}
                          strokeWidth={obj.outline.isCutContour ? 0.8 : strokeWidth}
                          strokeDasharray={obj.outline.isCutContour ? '3,2' : undefined}
                          opacity={obj.opacity}
                          filter={obj.shadow?.enabled && !isWireframe ? 'url(#canvas-shadow)' : undefined}
                        />
                      )}
                    </g>
                  </g>
                );
              })}
            </g>
          );
        })}

        {/* Realtime Painterly Brush Drawing Curve Preview */}
        {isDrawing && activeTool === 'painterly-brush' && painterlyPoints.length > 1 && (
          <path
            d={generatePainterlyPath(painterlyPoints, painterlySettings.size)}
            fill="none"
            stroke={activeFillColor}
            strokeWidth={painterlySettings.size}
            strokeLinecap="round"
            strokeLinejoin="round"
            filter={`url(#${getPainterlyFilterId(painterlySettings.mediaType)})`}
            opacity={painterlySettings.opacity}
          />
        )}

        {/* Realtime Drawing Wireframe Box for Rectangles / Ellipses */}
        {isDrawing && (activeTool === 'rectangle' || activeTool === 'ellipse') && (
          <rect
            x={Math.min(drawStart.x, cursorPos.x)}
            y={Math.min(drawStart.y, cursorPos.y)}
            width={Math.abs(cursorPos.x - drawStart.x)}
            height={Math.abs(cursorPos.y - drawStart.y)}
            fill="none"
            stroke="#38bdf8"
            strokeWidth={1.5 / zoom}
            strokeDasharray={`${4 / zoom},${4 / zoom}`}
          />
        )}

        {/* Freehand Realtime Drawing Curve Preview */}
        {isDrawing && activeTool === 'freehand' && freehandPoints.length > 1 && (
          <path
            d={freehandPoints.reduce((acc, pt, i) => (i === 0 ? `M ${pt.x} ${pt.y}` : `${acc} L ${pt.x} ${pt.y}`), '')}
            fill="none"
            stroke="#3b82f6"
            strokeWidth={activeOutlineWidth || 2}
            strokeDasharray="2,2"
            strokeLinecap="round"
            strokeLinejoin="round"
            opacity={0.8}
          />
        )}

        {/* Guidelines */}
        <GuidelinesOverlay />

        {/* Interactive Transform Gizmo (offset by active page position) */}
        {(activeTool === 'pick' || activeTool === 'freehand-pick') && !editingTextId && (
          <g transform={`translate(${activePagePos?.offsetX || 0}, 0)`}>
            <TransformGizmo onStartTransform={handleStartTransform} />
          </g>
        )}

        {/* Interactive Node Editing Gizmo */}
        {activeTool === 'shape' && (
          <g transform={`translate(${activePagePos?.offsetX || 0}, 0)`}>
            <NodeEditGizmo onStartNodeDrag={handleStartNodeDrag} />
          </g>
        )}

        {/* Interactive Gradient Gizmo */}
        {activeTool === 'interactive-fill' && (
          <g transform={`translate(${activePagePos?.offsetX || 0}, 0)`}>
            <InteractiveGradientGizmo
              onStartGradientDrag={(handle, startPt) => {
                setDraggedGradHandle(handle);
              }}
            />
          </g>
        )}

        {/* Selection Marquee Box */}
        {isSelectingBox && selectionBox && (
          <rect
            x={Math.min(selectionBox.start.x, selectionBox.end.x)}
            y={Math.min(selectionBox.start.y, selectionBox.end.y)}
            width={Math.abs(selectionBox.end.x - selectionBox.start.x)}
            height={Math.abs(selectionBox.end.y - selectionBox.start.y)}
            fill="rgba(59, 130, 246, 0.15)"
            stroke="#3b82f6"
            strokeWidth={1 / zoom}
            strokeDasharray={`${4 / zoom},${4 / zoom}`}
          />
        )}
      </svg>

      {/* Live In-Place On-Canvas Textarea Overlay */}
      {editingObject && editingObject.textProps && (
        <div
          className="absolute z-50 pointer-events-auto"
          style={{
            left: `${((activePagePos?.offsetX || 0) + editingObject.transform.x) * zoom + pan.x}px`,
            top: `${editingObject.transform.y * zoom + pan.y}px`,
          }}
        >
          <div className="relative">
            <textarea
              ref={inlineTextRef}
              value={editingObject.textProps.text}
              onChange={e => {
                updateObject(editingObject.id, {
                  textProps: { ...editingObject.textProps!, text: e.target.value },
                });
              }}
              onKeyDown={e => {
                if (e.key === 'Escape' || (e.key === 'Enter' && !e.shiftKey)) {
                  e.preventDefault();
                  setEditingTextId(null);
                }
              }}
              rows={Math.max(1, editingObject.textProps.text.split('\n').length)}
              style={{
                fontFamily: `"${editingObject.textProps.fontFamily}", sans-serif`,
                fontSize: `${editingObject.textProps.fontSize * zoom}px`,
                fontWeight: editingObject.textProps.fontWeight,
                color: editingObject.fill.color !== 'none' ? editingObject.fill.color : '#ffffff',
                lineHeight: editingObject.textProps.lineHeight || 1.2,
                minWidth: `${Math.max(150, editingObject.transform.width) * zoom}px`,
              }}
              className="bg-black/60 backdrop-blur-sm border-2 border-blue-500 rounded-lg px-2 py-1 outline-none text-white shadow-2xl resize-both overflow-hidden"
              placeholder="Type text..."
            />
            <div className="absolute -top-6 right-0 bg-blue-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow flex items-center gap-1">
              <span>Press Enter or Esc to finish</span>
              <Check size={10} />
            </div>
          </div>
        </div>
      )}

      {/* Floating Horizontal & Vertical Sideway Navigation Controls */}
      <div className="absolute bottom-3 left-4 z-40 flex items-center gap-1.5 bg-[#1e222d]/90 backdrop-blur-md border border-gray-700/60 rounded-xl p-1.5 shadow-2xl text-xs text-gray-300">
        <span className="text-[10px] font-bold text-cyan-400 uppercase tracking-wider px-1">
          Navigate:
        </span>
        <button
          onClick={panLeft}
          title="Move Sideways Left (Shift+Scroll or Space+Drag)"
          className="p-1.5 hover:bg-gray-700/80 active:bg-blue-600 rounded-lg text-gray-200 transition-colors flex items-center gap-1"
        >
          <ChevronLeft size={15} />
          <span className="text-[10px] font-medium hidden sm:inline">Left</span>
        </button>

        <button
          onClick={panRight}
          title="Move Sideways Right (Shift+Scroll or Space+Drag)"
          className="p-1.5 hover:bg-gray-700/80 active:bg-blue-600 rounded-lg text-gray-200 transition-colors flex items-center gap-1"
        >
          <span className="text-[10px] font-medium hidden sm:inline">Right</span>
          <ChevronRight size={15} />
        </button>

        <div className="h-4 w-[1px] bg-gray-700 mx-1" />

        <button
          onClick={panUp}
          title="Move Up"
          className="p-1.5 hover:bg-gray-700/80 rounded-lg text-gray-200"
        >
          <ChevronUp size={15} />
        </button>

        <button
          onClick={panDown}
          title="Move Down"
          className="p-1.5 hover:bg-gray-700/80 rounded-lg text-gray-200"
        >
          <ChevronDown size={15} />
        </button>

        <div className="h-4 w-[1px] bg-gray-700 mx-1" />

        <button
          onClick={zoomToFit}
          title="Fit All Pages (F4)"
          className="px-2 py-1 bg-blue-600/80 hover:bg-blue-600 text-white rounded-lg text-[10px] font-medium flex items-center gap-1 shadow-sm transition-all"
        >
          <Maximize2 size={12} />
          <span>Fit Pages</span>
        </button>

        <button
          onClick={resetZoom}
          title="Reset Zoom to 100%"
          className="px-2 py-1 bg-gray-800 hover:bg-gray-700 text-gray-200 rounded-lg text-[10px] font-mono transition-colors"
        >
          {Math.round(zoom * 100)}%
        </button>
      </div>

      {/* Floating On-Canvas Media Tray for 2025 Painterly Brushes */}
      <MediaTray />

      {/* Right-Click Object / Canvas Context Menu */}
      {contextMenuPos && (
        <ContextMenu
          x={contextMenuPos.x}
          y={contextMenuPos.y}
          onClose={() => setContextMenuPos(null)}
          onEditText={() => {
            if (primarySelectedObject?.type === 'text') {
              setEditingTextId(primarySelectedObject.id);
            }
          }}
        />
      )}
    </div>
  );
};
