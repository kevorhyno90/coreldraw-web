import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useCorel } from '../../context/CorelContext';
import { CorelObject, Point2D, Subpath, BezierNode } from '../../types/coreldraw';
import { Rulers } from './Rulers';
import { GuidelinesOverlay } from './GuidelinesOverlay';
import { TransformGizmo } from './TransformGizmo';
import { NodeEditGizmo } from './NodeEditGizmo';
import { InteractiveGradientGizmo } from './InteractiveGradientGizmo';
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
  generateCalligraphicStroke,
  generateSprayerParticles,
  ARTISTIC_BRUSH_PRESETS,
} from '../../engine/artisticMediaEngine';

export const Workspace: React.FC = () => {
  const {
    activePage,
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
    activeBrushPreset,
    activeBrushWidth,
    activeBrushAngle,
    activeBrushSmoothing,
  } = useCorel();

  const containerRef = useRef<HTMLDivElement>(null);
  const [cursorPos, setCursorPos] = useState<Point2D>({ x: 0, y: 0 });

  // Dragging / Drawing state
  const [isPanning, setIsPanning] = useState(false);
  const [panStart, setPanStart] = useState<Point2D>({ x: 0, y: 0 });

  // Creation drag state
  const [isDrawing, setIsDrawing] = useState(false);
  const [drawStart, setDrawStart] = useState<Point2D>({ x: 0, y: 0 });
  const [freehandPoints, setFreehandPoints] = useState<Point2D[]>([]);

  // Selection box drag
  const [isSelectingBox, setIsSelectingBox] = useState(false);
  const [selectionBox, setSelectionBox] = useState<{ start: Point2D; end: Point2D } | null>(null);

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

  // Snapping guide line indicator
  const [activeSnapGuide, setActiveSnapGuide] = useState<{ x?: number; y?: number } | null>(null);

  // Convert Screen (Client) coords to Page Canvas space coords
  const screenToPage = useCallback(
    (clientX: number, clientY: number): Point2D => {
      if (!containerRef.current) return { x: 0, y: 0 };
      const rect = containerRef.current.getBoundingClientRect();
      const rawX = (clientX - rect.left - pan.x) / zoom;
      const rawY = (clientY - rect.top - pan.y) / zoom;

      let snX = rawX;
      let snY = rawY;
      let guideSnap: { x?: number; y?: number } | null = null;

      // Snap to Grid
      if (snapSettings.snapToGrid) {
        snX = Math.round(rawX / snapSettings.gridSize) * snapSettings.gridSize;
        snY = Math.round(rawY / snapSettings.gridSize) * snapSettings.gridSize;
      }

      // Snap to Guidelines
      if (snapSettings.snapToGuidelines) {
        for (const g of guidelines) {
          if (g.orientation === 'vertical' && Math.abs(rawX - g.position) < snapSettings.snapThreshold / zoom) {
            snX = g.position;
            guideSnap = { ...(guideSnap || {}), x: g.position };
          }
          if (g.orientation === 'horizontal' && Math.abs(rawY - g.position) < snapSettings.snapThreshold / zoom) {
            snY = g.position;
            guideSnap = { ...(guideSnap || {}), y: g.position };
          }
        }
      }

      setActiveSnapGuide(guideSnap);
      return { x: snX, y: snY };
    },
    [pan, zoom, snapSettings, guidelines]
  );

  // Mouse Wheel (Zoom & Pan)
  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    if (e.ctrlKey || e.metaKey) {
      // Zoom towards cursor
      const zoomFactor = e.deltaY < 0 ? 1.15 : 0.87;
      const newZoom = Math.min(10, Math.max(0.1, zoom * zoomFactor));

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
    } else {
      // Pan viewport
      setPan(prev => ({
        x: prev.x - e.deltaX,
        y: prev.y - e.deltaY,
      }));
    }
  };

  // Mouse Down
  const handleMouseDown = (e: React.MouseEvent) => {
    // Middle click or Pan Tool
    if (e.button === 1 || activeTool === 'pan') {
      setIsPanning(true);
      setPanStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
      return;
    }

    if (e.button !== 0) return; // Left click only

    const pagePt = screenToPage(e.clientX, e.clientY);
    setDrawStart(pagePt);

    // Pick tool on empty canvas: Start selection marquee
    if (activeTool === 'pick' || activeTool === 'freehand-pick') {
      if (!e.shiftKey) {
        clearSelection();
      }
      setIsSelectingBox(true);
      setSelectionBox({ start: pagePt, end: pagePt });
      return;
    }

    // Shape & Brush Drawing tools
    if (
      [
        'freehand',
        'artistic-media',
        'rectangle',
        '3point-rectangle',
        'ellipse',
        '3point-ellipse',
        'polygon',
        'star',
        'dimension',
        'interactive-fill',
      ].includes(activeTool)
    ) {
      setIsDrawing(true);
      if (activeTool === 'freehand' || activeTool === 'artistic-media') {
        setFreehandPoints([pagePt]);
      }
      return;
    }

    // Text tool: click to create text
    if (activeTool === 'text') {
      const newText = addObject({
        name: 'Artistic Text',
        type: 'text',
        transform: {
          x: pagePt.x,
          y: pagePt.y,
          width: 250,
          height: 50,
          rotation: 0,
          scaleX: 1,
          scaleY: 1,
          skewX: 0,
          skewY: 0,
        },
        textProps: {
          text: 'CorelDRAW Vector',
          fontFamily: 'Outfit, sans-serif',
          fontSize: 36,
          fontWeight: 700,
          fontStyle: 'normal',
          textDecoration: 'none',
          textAlign: 'left',
          letterSpacing: 1,
          lineHeight: 1.1,
        },
        fill: { type: 'solid', color: activeFillColor },
        outline: { color: 'none', width: 0, style: 'solid', cap: 'round', join: 'round', startArrow: 'none', endArrow: 'none' },
      });
      setActiveTool('pick');
      setSelectedIds([newText.id]);
    }
  };

  // Mouse Move
  const handleMouseMove = (e: React.MouseEvent) => {
    const pagePt = screenToPage(e.clientX, e.clientY);
    setCursorPos(pagePt);

    // Viewport Panning
    if (isPanning) {
      setPan({
        x: e.clientX - panStart.x,
        y: e.clientY - panStart.y,
      });
      return;
    }

    // Selection Marquee Box
    if (isSelectingBox && selectionBox) {
      setSelectionBox(prev => (prev ? { ...prev, end: pagePt } : null));

      // Calculate enclosed objects
      const boxMinX = Math.min(selectionBox.start.x, pagePt.x);
      const boxMaxX = Math.max(selectionBox.start.x, pagePt.x);
      const boxMinY = Math.min(selectionBox.start.y, pagePt.y);
      const boxMaxY = Math.max(selectionBox.start.y, pagePt.y);

      const enclosed = activeObjects.filter(obj => {
        const { x, y, width, height } = obj.transform;
        return x >= boxMinX && x + width <= boxMaxX && y >= boxMinY && y + height <= boxMaxY;
      });

      setSelectedIds(enclosed.map(o => o.id));
      return;
    }

    // Transform Gizmo Dragging (Move / Scale / Rotate)
    if (transformMode && primarySelectedObject) {
      const dx = (e.clientX - dragStartScreen.x) / zoom;
      const dy = (e.clientY - dragStartScreen.y) / zoom;

      if (transformMode === 'move') {
        selectedIds.forEach(id => {
          const init = initialTransforms[id];
          if (init) {
            updateObject(id, { transform: { ...init, x: init.x + dx, y: init.y + dy } }, false);
          }
        });
      } else if (transformMode === 'resize' && transformHandle) {
        const init = initialTransforms[primarySelectedObject.id];
        if (init) {
          let nw = init.width;
          let nh = init.height;
          let nx = init.x;
          let ny = init.y;

          if (transformHandle.includes('r')) nw = Math.max(5, init.width + dx);
          if (transformHandle.includes('b')) nh = Math.max(5, init.height + dy);
          if (transformHandle.includes('l')) {
            nw = Math.max(5, init.width - dx);
            nx = init.x + dx;
          }
          if (transformHandle.includes('t')) {
            nh = Math.max(5, init.height - dy);
            ny = init.y + dy;
          }

          updateObject(primarySelectedObject.id, { transform: { ...init, x: nx, y: ny, width: nw, height: nh } }, false);
        }
      } else if (transformMode === 'rotate') {
        const init = initialTransforms[primarySelectedObject.id];
        if (init) {
          const center = { x: init.x + init.width / 2, y: init.y + init.height / 2 };
          const angle = (Math.atan2(pagePt.y - center.y, pagePt.x - center.x) * 180) / Math.PI;
          updateObject(primarySelectedObject.id, { transform: { ...init, rotation: Math.round(angle) } }, false);
        }
      }
      return;
    }

    // Node Edit Dragging
    if (draggedNodeId && primarySelectedObject && primarySelectedObject.type === 'path') {
      const objOrigin = { x: primarySelectedObject.transform.x, y: primarySelectedObject.transform.y };
      const localPt = { x: pagePt.x - objOrigin.x, y: pagePt.y - objOrigin.y };

      const newSubpaths = primarySelectedObject.subpaths.map(sp => ({
        ...sp,
        nodes: sp.nodes.map(n => {
          if (n.id !== draggedNodeId) return n;
          if (draggedHandleType === 'node') {
            const shiftX = localPt.x - n.x;
            const shiftY = localPt.y - n.y;
            return {
              ...n,
              x: localPt.x,
              y: localPt.y,
              handleIn: n.handleIn ? { x: n.handleIn.x + shiftX, y: n.handleIn.y + shiftY } : null,
              handleOut: n.handleOut ? { x: n.handleOut.x + shiftX, y: n.handleOut.y + shiftY } : null,
            };
          } else if (draggedHandleType === 'handleIn') {
            return { ...n, handleIn: localPt };
          } else if (draggedHandleType === 'handleOut') {
            return { ...n, handleOut: localPt };
          }
          return n;
        }),
      }));

      updateObject(primarySelectedObject.id, { subpaths: newSubpaths }, false);
      return;
    }

    // Freehand & Artistic Media Drawing stream
    if (isDrawing && (activeTool === 'freehand' || activeTool === 'artistic-media')) {
      setFreehandPoints(prev => [...prev, pagePt]);
    }
  };

  // Mouse Up
  const handleMouseUp = (e: React.MouseEvent) => {
    if (isPanning) {
      setIsPanning(false);
      return;
    }

    if (isSelectingBox) {
      setIsSelectingBox(false);
      setSelectionBox(null);
      return;
    }

    if (transformMode) {
      setTransformMode(null);
      setTransformHandle(undefined);
      return;
    }

    if (draggedNodeId) {
      setDraggedNodeId(null);
      setDraggedHandleType(null);
      return;
    }

    if (isDrawing) {
      setIsDrawing(false);
      const pagePt = screenToPage(e.clientX, e.clientY);
      const minX = Math.min(drawStart.x, pagePt.x);
      const minY = Math.min(drawStart.y, pagePt.y);
      const width = Math.max(10, Math.abs(pagePt.x - drawStart.x));
      const height = Math.max(10, Math.abs(pagePt.y - drawStart.y));

      // Create Shapes based on active tool
      if (activeTool === 'rectangle' || activeTool === '3point-rectangle') {
        const subpaths = rectToSubpaths(width, height);
        addObject({
          name: `Rectangle ${activeObjects.length + 1}`,
          type: 'rect',
          transform: { x: minX, y: minY, width, height, rotation: 0, scaleX: 1, scaleY: 1, skewX: 0, skewY: 0 },
          rectProps: { cornerRadii: [0, 0, 0, 0], isRoundedLinked: true },
          subpaths,
          fill: { type: 'solid', color: activeFillColor },
          outline: { color: activeOutlineColor, width: activeOutlineWidth, style: 'solid', cap: 'round', join: 'round', startArrow: 'none', endArrow: 'none' },
        });
        setActiveTool('pick');
      } else if (activeTool === 'ellipse' || activeTool === '3point-ellipse') {
        const subpaths = ellipseToSubpaths(width, height);
        addObject({
          name: `Ellipse ${activeObjects.length + 1}`,
          type: 'ellipse',
          transform: { x: minX, y: minY, width, height, rotation: 0, scaleX: 1, scaleY: 1, skewX: 0, skewY: 0 },
          ellipseProps: { kind: 'ellipse', startAngle: 0, endAngle: 360 },
          subpaths,
          fill: { type: 'solid', color: activeFillColor },
          outline: { color: activeOutlineColor, width: activeOutlineWidth, style: 'solid', cap: 'round', join: 'round', startArrow: 'none', endArrow: 'none' },
        });
        setActiveTool('pick');
      } else if (activeTool === 'polygon') {
        const subpaths = polygonToSubpaths(width, height, 5);
        addObject({
          name: `Polygon ${activeObjects.length + 1}`,
          type: 'polygon',
          transform: { x: minX, y: minY, width, height, rotation: 0, scaleX: 1, scaleY: 1, skewX: 0, skewY: 0 },
          polygonProps: { sides: 5 },
          subpaths,
          fill: { type: 'solid', color: activeFillColor },
          outline: { color: activeOutlineColor, width: activeOutlineWidth, style: 'solid', cap: 'round', join: 'round', startArrow: 'none', endArrow: 'none' },
        });
        setActiveTool('pick');
      } else if (activeTool === 'star') {
        const subpaths = starToSubpaths(width, height, 5, 0.5);
        addObject({
          name: `Star ${activeObjects.length + 1}`,
          type: 'star',
          transform: { x: minX, y: minY, width, height, rotation: 0, scaleX: 1, scaleY: 1, skewX: 0, skewY: 0 },
          starProps: { points: 5, sharpness: 0.5 },
          subpaths,
          fill: { type: 'solid', color: activeFillColor },
          outline: { color: activeOutlineColor, width: activeOutlineWidth, style: 'solid', cap: 'round', join: 'round', startArrow: 'none', endArrow: 'none' },
        });
        setActiveTool('pick');
      } else if (activeTool === 'dimension') {
        addObject({
          name: `Dimension Line ${activeObjects.length + 1}`,
          type: 'dimension',
          transform: { x: minX, y: minY, width, height, rotation: 0, scaleX: 1, scaleY: 1, skewX: 0, skewY: 0 },
          subpaths: [],
          dimensionProps: {
            start: drawStart,
            end: pagePt,
            offset: 25,
            unit: 'px',
            decimalPlaces: 1,
            showUnits: true,
          },
          fill: { type: 'none', color: '#000000' },
          outline: { color: '#38bdf8', width: 2, style: 'solid', cap: 'round', join: 'round', startArrow: 'arrow', endArrow: 'arrow' },
        });
        setActiveTool('pick');
      } else if (activeTool === 'artistic-media' && freehandPoints.length > 1) {
        const currentPreset = ARTISTIC_BRUSH_PRESETS.find(p => p.id === activeBrushPreset) || ARTISTIC_BRUSH_PRESETS[0];

        if (currentPreset.category === 'sprayer') {
          // Object Sprayer: generate scattered vector elements along path
          const particles = generateSprayerParticles(freehandPoints, currentPreset, activeFillColor);
          particles.forEach(p => addObject(p));
        } else if (currentPreset.category === 'calligraphic') {
          // Calligraphic Ribbon: generate 45-degree chisel subpaths
          const calliSubpaths = generateCalligraphicStroke(freehandPoints, activeBrushWidth, activeBrushAngle);
          // Shift coordinates relative to minX, minY
          const relSubpaths = calliSubpaths.map(sp => ({
            ...sp,
            nodes: sp.nodes.map(n => ({ ...n, x: n.x - minX, y: n.y - minY })),
          }));

          addObject({
            name: `Calligraphy Stroke ${activeObjects.length + 1}`,
            type: 'path',
            transform: { x: minX, y: minY, width, height, rotation: 0, scaleX: 1, scaleY: 1, skewX: 0, skewY: 0 },
            subpaths: relSubpaths,
            fill: { type: 'solid', color: activeFillColor },
            outline: { color: 'none', width: 0, style: 'solid', cap: 'round', join: 'round', startArrow: 'none', endArrow: 'none' },
            shadow: { enabled: false, color: '#000', blur: 0, offsetX: 0, offsetY: 0, opacity: 0 },
          });
        } else {
          // Artistic & Paint Brushes (Watercolor, Neon, Charcoal, Oil)
          const nodes: BezierNode[] = [];
          const step = Math.max(1, Math.floor(freehandPoints.length / 20));

          for (let i = 0; i < freehandPoints.length; i += step) {
            const pt = freehandPoints[i];
            nodes.push({
              id: `art_node_${i}`,
              x: pt.x - minX,
              y: pt.y - minY,
              type: 'smooth',
            });
          }

          const isNeon = currentPreset.id === 'neon_glow';
          const isWatercolor = currentPreset.id === 'watercolor_wash';

          addObject({
            name: `${currentPreset.name} ${activeObjects.length + 1}`,
            type: 'path',
            transform: { x: minX, y: minY, width, height, rotation: 0, scaleX: 1, scaleY: 1, skewX: 0, skewY: 0 },
            subpaths: [{ isClosed: false, nodes }],
            fill: { type: 'none', color: '#000' },
            outline: {
              color: isNeon ? '#38bdf8' : activeFillColor,
              width: activeBrushWidth,
              style: currentPreset.id === 'charcoal_rough' ? 'dashed' : 'solid',
              cap: 'round',
              join: 'round',
              startArrow: 'none',
              endArrow: 'none',
            },
            shadow: {
              enabled: isNeon,
              color: isNeon ? activeFillColor : '#000000',
              blur: isNeon ? 12 : 0,
              offsetX: 0,
              offsetY: 0,
              opacity: isNeon ? 0.9 : 0,
            },
            opacity: isWatercolor ? 0.65 : currentPreset.opacity,
          });
        }

        setFreehandPoints([]);
        setActiveTool('pick');
      } else if (activeTool === 'freehand' && freehandPoints.length > 1) {
        // Downsample and smooth freehand path to bezier
        const nodes: BezierNode[] = [];
        const step = Math.max(1, Math.floor(freehandPoints.length / 16));

        for (let i = 0; i < freehandPoints.length; i += step) {
          const pt = freehandPoints[i];
          const localX = pt.x - minX;
          const localY = pt.y - minY;
          nodes.push({
            id: `node_${i}`,
            x: localX,
            y: localY,
            type: 'smooth',
          });
        }

        addObject({
          name: `Freehand Curve ${activeObjects.length + 1}`,
          type: 'path',
          transform: { x: minX, y: minY, width, height, rotation: 0, scaleX: 1, scaleY: 1, skewX: 0, skewY: 0 },
          subpaths: [{ isClosed: false, nodes }],
          fill: { type: 'none', color: activeFillColor },
          outline: { color: activeOutlineColor, width: activeOutlineWidth || 2, style: 'solid', cap: 'round', join: 'round', startArrow: 'none', endArrow: 'none' },
        });
        setFreehandPoints([]);
        setActiveTool('pick');
      } else if (activeTool === 'interactive-fill' && primarySelectedObject) {
        // Assign linear gradient to selected object
        const objOrigin = { x: primarySelectedObject.transform.x, y: primarySelectedObject.transform.y };
        updateObject(primarySelectedObject.id, {
          fill: {
            type: 'linear',
            color: activeFillColor,
            gradient: {
              type: 'linear',
              start: { x: drawStart.x - objOrigin.x, y: drawStart.y - objOrigin.y },
              end: { x: pagePt.x - objOrigin.x, y: pagePt.y - objOrigin.y },
              stops: [
                { offset: 0, color: '#ffffff' },
                { offset: 1, color: activeFillColor },
              ],
            },
          },
        });
      }
    }
  };

  // Object Click / Selection
  const handleObjectClick = (e: React.MouseEvent, obj: CorelObject) => {
    e.stopPropagation();

    if (activeTool === 'color-eyedropper') {
      // Sample object color
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

  return (
    <div
      ref={containerRef}
      onWheel={handleWheel}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      className={`flex-1 relative overflow-hidden bg-[#181a20] select-none ${
        isPanning ? 'cursor-grab active:cursor-grabbing' : ''
      }`}
    >
      {/* Rulers */}
      <Rulers cursorPos={cursorPos} />

      {/* Main Vector SVG Canvas */}
      <svg
        className="w-full h-full absolute top-0 left-0"
        style={{
          transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
          transformOrigin: '0 0',
        }}
      >
        <defs>
          {/* Drop shadow filter for canvas render */}
          <filter id="canvas-shadow" x="-50%" y="-50%" width="200%" height="200%">
            <feDropShadow dx="3" dy="3" stdDeviation="4" floodColor="#000000" floodOpacity="0.5" />
          </filter>
        </defs>

        {/* Printable Page Sheet Background */}
        <rect
          x={0}
          y={0}
          width={activePage.width}
          height={activePage.height}
          fill={activePage.background || '#ffffff'}
          stroke="#3b82f6"
          strokeWidth="1"
          className="shadow-2xl"
        />

        {/* Render Vector Objects */}
        {activeObjects.map(obj => {
          if (!obj.visible) return null;
          const { x, y, width: w, height: h, rotation } = obj.transform;
          const transformAttr = rotation ? `rotate(${rotation} ${w / 2} ${h / 2})` : '';

          const isWireframe = viewMode === 'wireframe';
          const isSelected = selectedIds.includes(obj.id);

          // Fill calculation
          let fillAttr = isWireframe ? 'none' : obj.fill.color;
          if (!isWireframe && obj.fill.type === 'none') fillAttr = 'none';

          // Stroke calculation
          let strokeAttr = isWireframe ? '#00e676' : obj.outline.color;
          let strokeWidth = isWireframe ? 1 : obj.outline.width;

          // 3D Extrusion Facets behind
          const extrudeFacets = !isWireframe && obj.extrude?.enabled ? generate3DExtrusionFacets(obj, obj.extrude) : [];

          return (
            <g
              key={obj.id}
              transform={`translate(${x}, ${y})`}
              onClick={e => handleObjectClick(e, obj)}
              className="cursor-pointer"
            >
              <g transform={transformAttr}>
                {/* 3D Extrusion Polygons */}
                {extrudeFacets.map((facet, fIdx) => {
                  const ptsStr = facet.points.map(p => `${p.x},${p.y}`).join(' ');
                  return (
                    <polygon
                      key={`facet_${fIdx}`}
                      points={ptsStr}
                      fill={facet.fill}
                      stroke={facet.stroke || 'none'}
                      opacity={facet.opacity}
                    />
                  );
                })}

                {/* Text Shape */}
                {obj.type === 'text' && obj.textProps && (
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
                  >
                    {obj.textProps.text}
                  </text>
                )}

                {/* Dimension Shape */}
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

                {/* Bitmap / Photo Image Object with Filters */}
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

                {/* Vector Paths & Shapes */}
                {obj.subpaths.length > 0 && (
                  <path
                    d={subpathsToSvgPathData(obj.subpaths)}
                    fill={fillAttr}
                    stroke={strokeAttr}
                    strokeWidth={strokeWidth}
                    opacity={obj.opacity}
                    filter={obj.shadow?.enabled && !isWireframe ? 'url(#canvas-shadow)' : undefined}
                  />
                )}
              </g>
            </g>
          );
        })}

        {/* Freehand & Artistic Media Realtime Drawing Curve Preview */}
        {isDrawing && (activeTool === 'freehand' || activeTool === 'artistic-media') && freehandPoints.length > 1 && (
          <path
            d={freehandPoints.reduce((acc, pt, i) => (i === 0 ? `M ${pt.x} ${pt.y}` : `${acc} L ${pt.x} ${pt.y}`), '')}
            fill="none"
            stroke={activeTool === 'artistic-media' ? activeFillColor : '#3b82f6'}
            strokeWidth={activeTool === 'artistic-media' ? activeBrushWidth : activeOutlineWidth || 2}
            strokeDasharray={activeTool === 'artistic-media' ? undefined : '2,2'}
            strokeLinecap="round"
            strokeLinejoin="round"
            opacity={0.8}
          />
        )}

        {/* Guidelines */}
        <GuidelinesOverlay />

        {/* Interactive Transform Gizmo (Pick tool active) */}
        {(activeTool === 'pick' || activeTool === 'freehand-pick') && (
          <TransformGizmo onStartTransform={handleStartTransform} />
        )}

        {/* Interactive Node Editing Gizmo (Shape tool F10 active) */}
        {activeTool === 'shape' && (
          <NodeEditGizmo onStartNodeDrag={handleStartNodeDrag} />
        )}

        {/* Interactive Gradient Gizmo (Interactive fill G active) */}
        {activeTool === 'interactive-fill' && (
          <InteractiveGradientGizmo
            onStartGradientDrag={(handle, startPt) => {
              setDraggedGradHandle(handle);
            }}
          />
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
    </div>
  );
};
