import React, { useState, useRef, useEffect } from 'react';
import { useCorel } from '../../context/CorelContext';
import {
  FileText,
  FolderOpen,
  Save,
  Download,
  Printer,
  Sparkles,
  Undo2,
  Redo2,
  Copy,
  Trash2,
  Eye,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Layers,
  Sliders,
  Maximize,
  HelpCircle,
  Keyboard,
  Shapes,
  Palette,
  Image as ImageIcon,
  Type,
  Grid,
} from 'lucide-react';
import { exportToCorelJson, exportToSvgFile, printDocument } from '../../engine/exportEngine';
import { parseSvgToCorelObjects } from '../../engine/svgEngine';

export const MenuBar: React.FC = () => {
  const {
    projectTitle,
    setProjectTitle,
    pages,
    activePage,
    activeObjects,
    setOpenDialog,
    undo,
    redo,
    canUndo,
    canRedo,
    duplicateSelected,
    deleteSelected,
    selectAll,
    groupSelected,
    ungroupSelected,
    bringToFront,
    sendToBack,
    bringForward,
    sendBackward,
    convertToCurves,
    primarySelectedObject,
    applyBooleanOp,
    viewMode,
    setViewMode,
    zoom,
    setZoom,
    resetZoom,
    zoomToFit,
    zoomToSelection,
    snapSettings,
    setSnapSettings,
    activeDockerTab,
    setActiveDockerTab,
    getProjectDocument,
    loadProjectDocument,
    addObject,
    isOnline,
    isInstallable,
    promptInstall,
  } = useCorel();

  const [activeMenu, setActiveMenu] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Close menus on outside click
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (!(e.target as HTMLElement).closest('.menu-dropdown-container')) {
        setActiveMenu(null);
      }
    };
    window.addEventListener('mousedown', handleOutsideClick);
    return () => window.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  const handleOpenLocalProject = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = evt => {
      try {
        const text = evt.target?.result as string;
        if (file.name.endsWith('.cdrw') || file.name.endsWith('.json')) {
          const doc = JSON.parse(text);
          loadProjectDocument(doc);
        } else if (file.name.endsWith('.svg')) {
          const imported = parseSvgToCorelObjects(text);
          imported.forEach(obj => addObject(obj));
        }
      } catch (err) {
        alert('Could not parse file format.');
      }
    };
    reader.readAsText(file);
    setActiveMenu(null);
  };

  const handleSaveCdrw = () => {
    exportToCorelJson(getProjectDocument(), projectTitle);
    setActiveMenu(null);
  };

  const handlePrint = () => {
    printDocument(activePage, activeObjects);
    setActiveMenu(null);
  };

  return (
    <div className="bg-[#1f2430] border-b border-[#2d3748] text-xs select-none flex items-center justify-between px-2 h-8 relative z-50">
      <input
        type="file"
        ref={fileInputRef}
        className="hidden"
        accept=".cdrw,.json,.svg"
        onChange={handleOpenLocalProject}
      />

      {/* Left branding and menus */}
      <div className="flex items-center space-x-1">
        {/* Corel Icon */}
        <div
          className="flex items-center space-x-1.5 px-2 py-0.5 rounded hover:bg-[#2d3748] cursor-pointer"
          onClick={() => setOpenDialog('about')}
        >
          <div className="w-5 h-5 rounded-full bg-gradient-to-tr from-emerald-500 via-cyan-400 to-indigo-600 flex items-center justify-center text-[10px] font-black text-white shadow-sm">
            D
          </div>
          <span className="font-bold tracking-tight text-white hidden sm:inline">Devin's CorelDRAW</span>
          <span className="text-[10px] px-1.5 py-0.2 bg-emerald-500/20 text-emerald-400 rounded font-semibold border border-emerald-500/30 flex items-center">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mr-1 animate-pulse" />
            Offline Ready
          </span>
        </div>

        {/* Menu Items */}
        <div className="flex items-center menu-dropdown-container">
          {/* File Menu */}
          <div className="relative">
            <button
              onClick={() => setActiveMenu(activeMenu === 'file' ? null : 'file')}
              onMouseEnter={() => activeMenu && setActiveMenu('file')}
              className={`px-2 py-1 rounded hover:bg-[#2d3748] ${
                activeMenu === 'file' ? 'bg-[#2d3748] text-emerald-400 font-semibold' : 'text-gray-300'
              }`}
            >
              File
            </button>
            {activeMenu === 'file' && (
              <div className="absolute left-0 top-full mt-0.5 w-56 bg-[#1f2430] border border-[#374151] rounded-md shadow-2xl py-1 z-50 text-gray-200">
                <button
                  onClick={() => { setOpenDialog('new'); setActiveMenu(null); }}
                  className="w-full text-left px-3 py-1.5 hover:bg-[#2563eb] hover:text-white flex items-center justify-between"
                >
                  <span className="flex items-center"><FileText className="w-3.5 h-3.5 mr-2 text-emerald-400" /> New Document...</span>
                  <span className="text-gray-500 text-[10px]">Ctrl+N</span>
                </button>
                <button
                  onClick={() => { setOpenDialog('templates'); setActiveMenu(null); }}
                  className="w-full text-left px-3 py-1.5 hover:bg-[#2563eb] hover:text-white flex items-center justify-between"
                >
                  <span className="flex items-center"><Sparkles className="w-3.5 h-3.5 mr-2 text-amber-400" /> New from Template...</span>
                  <span className="text-gray-500 text-[10px]">Ctrl+T</span>
                </button>
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full text-left px-3 py-1.5 hover:bg-[#2563eb] hover:text-white flex items-center justify-between"
                >
                  <span className="flex items-center"><FolderOpen className="w-3.5 h-3.5 mr-2 text-blue-400" /> Open (.cdrw / .svg)...</span>
                  <span className="text-gray-500 text-[10px]">Ctrl+O</span>
                </button>
                <div className="border-t border-[#374151] my-1" />
                <button
                  onClick={handleSaveCdrw}
                  className="w-full text-left px-3 py-1.5 hover:bg-[#2563eb] hover:text-white flex items-center justify-between"
                >
                  <span className="flex items-center"><Save className="w-3.5 h-3.5 mr-2 text-purple-400" /> Save Project (.cdrw)</span>
                  <span className="text-gray-500 text-[10px]">Ctrl+S</span>
                </button>
                <button
                  onClick={() => { setOpenDialog('export'); setActiveMenu(null); }}
                  className="w-full text-left px-3 py-1.5 hover:bg-[#2563eb] hover:text-white flex items-center justify-between font-medium text-emerald-300"
                >
                  <span className="flex items-center"><Download className="w-3.5 h-3.5 mr-2 text-emerald-400" /> Export (PNG/PDF/SVG)...</span>
                  <span className="text-gray-500 text-[10px]">Ctrl+E</span>
                </button>
                <div className="border-t border-[#374151] my-1" />
                <button
                  onClick={() => { promptInstall(); setActiveMenu(null); }}
                  className="w-full text-left px-3 py-1.5 hover:bg-[#2563eb] hover:text-white flex items-center justify-between font-medium text-cyan-300"
                >
                  <span className="flex items-center"><Download className="w-3.5 h-3.5 mr-2 text-cyan-400" /> Install Desktop App (PWA)</span>
                  <span className="text-gray-500 text-[10px]">Offline</span>
                </button>
                <button
                  onClick={handlePrint}
                  className="w-full text-left px-3 py-1.5 hover:bg-[#2563eb] hover:text-white flex items-center justify-between"
                >
                  <span className="flex items-center"><Printer className="w-3.5 h-3.5 mr-2 text-gray-400" /> Print Document...</span>
                  <span className="text-gray-500 text-[10px]">Ctrl+P</span>
                </button>
              </div>
            )}
          </div>

          {/* Edit Menu */}
          <div className="relative">
            <button
              onClick={() => setActiveMenu(activeMenu === 'edit' ? null : 'edit')}
              onMouseEnter={() => activeMenu && setActiveMenu('edit')}
              className={`px-2 py-1 rounded hover:bg-[#2d3748] ${
                activeMenu === 'edit' ? 'bg-[#2d3748] text-emerald-400 font-semibold' : 'text-gray-300'
              }`}
            >
              Edit
            </button>
            {activeMenu === 'edit' && (
              <div className="absolute left-0 top-full mt-0.5 w-52 bg-[#1f2430] border border-[#374151] rounded-md shadow-2xl py-1 z-50 text-gray-200">
                <button
                  disabled={!canUndo}
                  onClick={() => { undo(); setActiveMenu(null); }}
                  className={`w-full text-left px-3 py-1.5 flex items-center justify-between ${
                    canUndo ? 'hover:bg-[#2563eb] hover:text-white' : 'opacity-40 cursor-not-allowed'
                  }`}
                >
                  <span className="flex items-center"><Undo2 className="w-3.5 h-3.5 mr-2 text-blue-400" /> Undo</span>
                  <span className="text-gray-500 text-[10px]">Ctrl+Z</span>
                </button>
                <button
                  disabled={!canRedo}
                  onClick={() => { redo(); setActiveMenu(null); }}
                  className={`w-full text-left px-3 py-1.5 flex items-center justify-between ${
                    canRedo ? 'hover:bg-[#2563eb] hover:text-white' : 'opacity-40 cursor-not-allowed'
                  }`}
                >
                  <span className="flex items-center"><Redo2 className="w-3.5 h-3.5 mr-2 text-blue-400" /> Redo</span>
                  <span className="text-gray-500 text-[10px]">Ctrl+Y</span>
                </button>
                <div className="border-t border-[#374151] my-1" />
                <button
                  onClick={() => { duplicateSelected(); setActiveMenu(null); }}
                  className="w-full text-left px-3 py-1.5 hover:bg-[#2563eb] hover:text-white flex items-center justify-between"
                >
                  <span className="flex items-center"><Copy className="w-3.5 h-3.5 mr-2 text-emerald-400" /> Duplicate</span>
                  <span className="text-gray-500 text-[10px]">Ctrl+D</span>
                </button>
                <button
                  onClick={() => { deleteSelected(); setActiveMenu(null); }}
                  className="w-full text-left px-3 py-1.5 hover:bg-red-600 hover:text-white flex items-center justify-between text-red-400"
                >
                  <span className="flex items-center"><Trash2 className="w-3.5 h-3.5 mr-2" /> Delete</span>
                  <span className="text-gray-500 text-[10px]">Del</span>
                </button>
                <div className="border-t border-[#374151] my-1" />
                <button
                  onClick={() => { selectAll(); setActiveMenu(null); }}
                  className="w-full text-left px-3 py-1.5 hover:bg-[#2563eb] hover:text-white flex items-center justify-between"
                >
                  <span>Select All</span>
                  <span className="text-gray-500 text-[10px]">Ctrl+A</span>
                </button>
              </div>
            )}
          </div>

          {/* View Menu */}
          <div className="relative">
            <button
              onClick={() => setActiveMenu(activeMenu === 'view' ? null : 'view')}
              onMouseEnter={() => activeMenu && setActiveMenu('view')}
              className={`px-2 py-1 rounded hover:bg-[#2d3748] ${
                activeMenu === 'view' ? 'bg-[#2d3748] text-emerald-400 font-semibold' : 'text-gray-300'
              }`}
            >
              View
            </button>
            {activeMenu === 'view' && (
              <div className="absolute left-0 top-full mt-0.5 w-52 bg-[#1f2430] border border-[#374151] rounded-md shadow-2xl py-1 z-50 text-gray-200">
                <button
                  onClick={() => { setViewMode('enhanced'); setActiveMenu(null); }}
                  className="w-full text-left px-3 py-1.5 hover:bg-[#2563eb] hover:text-white flex items-center justify-between"
                >
                  <span>Enhanced (Anti-Aliased)</span>
                  {viewMode === 'enhanced' && <span className="text-emerald-400">✓</span>}
                </button>
                <button
                  onClick={() => { setViewMode('wireframe'); setActiveMenu(null); }}
                  className="w-full text-left px-3 py-1.5 hover:bg-[#2563eb] hover:text-white flex items-center justify-between"
                >
                  <span>Wireframe (Outlines)</span>
                  {viewMode === 'wireframe' && <span className="text-emerald-400">✓</span>}
                </button>
                <div className="border-t border-[#374151] my-1" />
                <button
                  onClick={() => { setZoom(z => Math.min(8, z * 1.25)); setActiveMenu(null); }}
                  className="w-full text-left px-3 py-1.5 hover:bg-[#2563eb] hover:text-white flex items-center justify-between"
                >
                  <span className="flex items-center"><ZoomIn className="w-3.5 h-3.5 mr-2 text-cyan-400" /> Zoom In</span>
                  <span className="text-gray-500 text-[10px]">Ctrl++</span>
                </button>
                <button
                  onClick={() => { setZoom(z => Math.max(0.1, z * 0.8)); setActiveMenu(null); }}
                  className="w-full text-left px-3 py-1.5 hover:bg-[#2563eb] hover:text-white flex items-center justify-between"
                >
                  <span className="flex items-center"><ZoomOut className="w-3.5 h-3.5 mr-2 text-cyan-400" /> Zoom Out</span>
                  <span className="text-gray-500 text-[10px]">Ctrl+-</span>
                </button>
                <button
                  onClick={() => { zoomToFit(); setActiveMenu(null); }}
                  className="w-full text-left px-3 py-1.5 hover:bg-[#2563eb] hover:text-white flex items-center justify-between"
                >
                  <span className="flex items-center"><Maximize className="w-3.5 h-3.5 mr-2 text-amber-400" /> Zoom to Fit Page</span>
                  <span className="text-gray-500 text-[10px]">F4</span>
                </button>
                <button
                  onClick={() => { zoomToSelection(); setActiveMenu(null); }}
                  className="w-full text-left px-3 py-1.5 hover:bg-[#2563eb] hover:text-white flex items-center justify-between"
                >
                  <span className="flex items-center"><Maximize2 className="w-3.5 h-3.5 mr-2 text-purple-400" /> Zoom to Selection</span>
                  <span className="text-gray-500 text-[10px]">Shift+F2</span>
                </button>
                <div className="border-t border-[#374151] my-1" />
                <button
                  onClick={() => {
                    setSnapSettings(s => ({ ...s, snapToGrid: !s.snapToGrid }));
                    setActiveMenu(null);
                  }}
                  className="w-full text-left px-3 py-1.5 hover:bg-[#2563eb] hover:text-white flex items-center justify-between"
                >
                  <span>Snap to Grid</span>
                  {snapSettings.snapToGrid && <span className="text-emerald-400">✓</span>}
                </button>
                <button
                  onClick={() => {
                    setSnapSettings(s => ({ ...s, snapToGuidelines: !s.snapToGuidelines }));
                    setActiveMenu(null);
                  }}
                  className="w-full text-left px-3 py-1.5 hover:bg-[#2563eb] hover:text-white flex items-center justify-between"
                >
                  <span>Snap to Guidelines</span>
                  {snapSettings.snapToGuidelines && <span className="text-emerald-400">✓</span>}
                </button>
                <button
                  onClick={() => {
                    setSnapSettings(s => ({ ...s, snapToObjects: !s.snapToObjects }));
                    setActiveMenu(null);
                  }}
                  className="w-full text-left px-3 py-1.5 hover:bg-[#2563eb] hover:text-white flex items-center justify-between"
                >
                  <span>Snap to Objects</span>
                  {snapSettings.snapToObjects && <span className="text-emerald-400">✓</span>}
                </button>
              </div>
            )}
          </div>

          {/* Object Menu */}
          <div className="relative">
            <button
              onClick={() => setActiveMenu(activeMenu === 'object' ? null : 'object')}
              onMouseEnter={() => activeMenu && setActiveMenu('object')}
              className={`px-2 py-1 rounded hover:bg-[#2d3748] ${
                activeMenu === 'object' ? 'bg-[#2d3748] text-emerald-400 font-semibold' : 'text-gray-300'
              }`}
            >
              Object
            </button>
            {activeMenu === 'object' && (
              <div className="absolute left-0 top-full mt-0.5 w-60 bg-[#1f2430] border border-[#374151] rounded-md shadow-2xl py-1 z-50 text-gray-200">
                <button
                  onClick={() => {
                    if (primarySelectedObject) convertToCurves(primarySelectedObject.id);
                    setActiveMenu(null);
                  }}
                  className="w-full text-left px-3 py-1.5 hover:bg-[#2563eb] hover:text-white flex items-center justify-between font-medium text-emerald-300"
                >
                  <span>Convert to Curves</span>
                  <span className="text-gray-500 text-[10px]">Ctrl+Q</span>
                </button>
                <div className="border-t border-[#374151] my-1" />
                <button
                  onClick={() => { groupSelected(); setActiveMenu(null); }}
                  className="w-full text-left px-3 py-1.5 hover:bg-[#2563eb] hover:text-white flex items-center justify-between"
                >
                  <span>Group Objects</span>
                  <span className="text-gray-500 text-[10px]">Ctrl+G</span>
                </button>
                <button
                  onClick={() => { ungroupSelected(); setActiveMenu(null); }}
                  className="w-full text-left px-3 py-1.5 hover:bg-[#2563eb] hover:text-white flex items-center justify-between"
                >
                  <span>Ungroup Objects</span>
                  <span className="text-gray-500 text-[10px]">Ctrl+U</span>
                </button>
                <div className="border-t border-[#374151] my-1" />
                <div className="px-3 py-1 text-[10px] uppercase font-bold text-gray-500 tracking-wider">Shaping & Booleans</div>
                <button
                  onClick={() => { applyBooleanOp('weld'); setActiveMenu(null); }}
                  className="w-full text-left px-3 py-1.5 hover:bg-[#2563eb] hover:text-white flex items-center justify-between"
                >
                  <span>Weld (Union)</span>
                  <span className="text-xs">⚡</span>
                </button>
                <button
                  onClick={() => { applyBooleanOp('trim'); setActiveMenu(null); }}
                  className="w-full text-left px-3 py-1.5 hover:bg-[#2563eb] hover:text-white flex items-center justify-between"
                >
                  <span>Trim (Difference)</span>
                  <span className="text-xs">✂️</span>
                </button>
                <button
                  onClick={() => { applyBooleanOp('intersect'); setActiveMenu(null); }}
                  className="w-full text-left px-3 py-1.5 hover:bg-[#2563eb] hover:text-white flex items-center justify-between"
                >
                  <span>Intersect</span>
                  <span className="text-xs">∩</span>
                </button>
                <div className="border-t border-[#374151] my-1" />
                <div className="px-3 py-1 text-[10px] uppercase font-bold text-gray-500 tracking-wider">Z-Order</div>
                <button
                  onClick={() => { bringToFront(); setActiveMenu(null); }}
                  className="w-full text-left px-3 py-1.5 hover:bg-[#2563eb] hover:text-white flex items-center justify-between"
                >
                  <span>To Front of Layer</span>
                  <span className="text-gray-500 text-[10px]">Shift+PgUp</span>
                </button>
                <button
                  onClick={() => { sendToBack(); setActiveMenu(null); }}
                  className="w-full text-left px-3 py-1.5 hover:bg-[#2563eb] hover:text-white flex items-center justify-between"
                >
                  <span>To Back of Layer</span>
                  <span className="text-gray-500 text-[10px]">Shift+PgDn</span>
                </button>
              </div>
            )}
          </div>

          {/* Effects Menu */}
          <div className="relative">
            <button
              onClick={() => setActiveMenu(activeMenu === 'effects' ? null : 'effects')}
              onMouseEnter={() => activeMenu && setActiveMenu('effects')}
              className={`px-2 py-1 rounded hover:bg-[#2d3748] ${
                activeMenu === 'effects' ? 'bg-[#2d3748] text-emerald-400 font-semibold' : 'text-gray-300'
              }`}
            >
              Effects
            </button>
            {activeMenu === 'effects' && (
              <div className="absolute left-0 top-full mt-0.5 w-52 bg-[#1f2430] border border-[#374151] rounded-md shadow-2xl py-1 z-50 text-gray-200">
                <button
                  onClick={() => { setActiveDockerTab('effects'); setActiveMenu(null); }}
                  className="w-full text-left px-3 py-1.5 hover:bg-[#2563eb] hover:text-white flex items-center justify-between"
                >
                  <span>3D Extrude (Depth & Light)</span>
                  <span className="text-xs">🎲</span>
                </button>
                <button
                  onClick={() => { setActiveDockerTab('effects'); setActiveMenu(null); }}
                  className="w-full text-left px-3 py-1.5 hover:bg-[#2563eb] hover:text-white flex items-center justify-between"
                >
                  <span>Drop Shadow & Glow</span>
                  <span className="text-xs">🌫️</span>
                </button>
                <button
                  onClick={() => { setActiveDockerTab('effects'); setActiveMenu(null); }}
                  className="w-full text-left px-3 py-1.5 hover:bg-[#2563eb] hover:text-white flex items-center justify-between"
                >
                  <span>Contour (Offset Steps)</span>
                  <span className="text-xs">🎯</span>
                </button>
              </div>
            )}
          </div>

          {/* Bitmaps / Auto-Trace Menu */}
          <div className="relative">
            <button
              onClick={() => setActiveMenu(activeMenu === 'bitmaps' ? null : 'bitmaps')}
              onMouseEnter={() => activeMenu && setActiveMenu('bitmaps')}
              className={`px-2 py-1 rounded hover:bg-[#2d3748] ${
                activeMenu === 'bitmaps' ? 'bg-[#2d3748] text-emerald-400 font-semibold' : 'text-gray-300'
              }`}
            >
              Bitmaps
            </button>
            {activeMenu === 'bitmaps' && (
              <div className="absolute left-0 top-full mt-0.5 w-60 bg-[#1f2430] border border-[#374151] rounded-md shadow-2xl py-1 z-50 text-gray-200">
                <button
                  onClick={() => { setActiveDockerTab('trace'); setActiveMenu(null); }}
                  className="w-full text-left px-3 py-1.5 hover:bg-[#2563eb] hover:text-white flex items-center justify-between font-semibold text-emerald-400"
                >
                  <span className="flex items-center"><Sparkles className="w-3.5 h-3.5 mr-2 text-emerald-400" /> PowerTRACE (Auto-Trace)...</span>
                  <span className="text-xs">⚡</span>
                </button>
              </div>
            )}
          </div>

          {/* Window / Dockers Menu */}
          <div className="relative">
            <button
              onClick={() => setActiveMenu(activeMenu === 'window' ? null : 'window')}
              onMouseEnter={() => activeMenu && setActiveMenu('window')}
              className={`px-2 py-1 rounded hover:bg-[#2d3748] ${
                activeMenu === 'window' ? 'bg-[#2d3748] text-emerald-400 font-semibold' : 'text-gray-300'
              }`}
            >
              Window
            </button>
            {activeMenu === 'window' && (
              <div className="absolute left-0 top-full mt-0.5 w-56 bg-[#1f2430] border border-[#374151] rounded-md shadow-2xl py-1 z-50 text-gray-200">
                <div className="px-3 py-1 text-[10px] uppercase font-bold text-gray-500 tracking-wider">Inspectors & Dockers</div>
                <button
                  onClick={() => { setActiveDockerTab('typography'); setActiveMenu(null); }}
                  className="w-full text-left px-3 py-1.5 hover:bg-[#2563eb] hover:text-white flex items-center justify-between font-medium text-amber-300"
                >
                  <span>Typography & Font Manager</span>
                  {activeDockerTab === 'typography' && <span className="text-emerald-400">✓</span>}
                </button>
                <button
                  onClick={() => { setActiveDockerTab('photo'); setActiveMenu(null); }}
                  className="w-full text-left px-3 py-1.5 hover:bg-[#2563eb] hover:text-white flex items-center justify-between font-medium text-cyan-300"
                >
                  <span>Photo & Bitmap Lab</span>
                  {activeDockerTab === 'photo' && <span className="text-emerald-400">✓</span>}
                </button>
                <button
                  onClick={() => { setActiveDockerTab('ai'); setActiveMenu(null); }}
                  className="w-full text-left px-3 py-1.5 hover:bg-[#2563eb] hover:text-white flex items-center justify-between font-medium text-purple-300"
                >
                  <span>AI Vector Design Studio</span>
                  {activeDockerTab === 'ai' && <span className="text-emerald-400">✓</span>}
                </button>
                <div className="border-t border-[#374151] my-1" />
                <button
                  onClick={() => { setActiveDockerTab('properties'); setActiveMenu(null); }}
                  className="w-full text-left px-3 py-1.5 hover:bg-[#2563eb] hover:text-white flex items-center justify-between"
                >
                  <span>Properties Docker</span>
                  {activeDockerTab === 'properties' && <span className="text-emerald-400">✓</span>}
                </button>
                <button
                  onClick={() => { setActiveDockerTab('objects'); setActiveMenu(null); }}
                  className="w-full text-left px-3 py-1.5 hover:bg-[#2563eb] hover:text-white flex items-center justify-between"
                >
                  <span>Object Manager / Layers</span>
                  {activeDockerTab === 'objects' && <span className="text-emerald-400">✓</span>}
                </button>
                <button
                  onClick={() => { setActiveDockerTab('shaping'); setActiveMenu(null); }}
                  className="w-full text-left px-3 py-1.5 hover:bg-[#2563eb] hover:text-white flex items-center justify-between"
                >
                  <span>Shaping Docker</span>
                  {activeDockerTab === 'shaping' && <span className="text-emerald-400">✓</span>}
                </button>
                <button
                  onClick={() => { setActiveDockerTab('colors'); setActiveMenu(null); }}
                  className="w-full text-left px-3 py-1.5 hover:bg-[#2563eb] hover:text-white flex items-center justify-between"
                >
                  <span>Color Palettes & Harmonies</span>
                  {activeDockerTab === 'colors' && <span className="text-emerald-400">✓</span>}
                </button>
                <button
                  onClick={() => { setActiveDockerTab('effects'); setActiveMenu(null); }}
                  className="w-full text-left px-3 py-1.5 hover:bg-[#2563eb] hover:text-white flex items-center justify-between"
                >
                  <span>Effects Docker (3D / Shadow)</span>
                  {activeDockerTab === 'effects' && <span className="text-emerald-400">✓</span>}
                </button>
                <button
                  onClick={() => { setActiveDockerTab('trace'); setActiveMenu(null); }}
                  className="w-full text-left px-3 py-1.5 hover:bg-[#2563eb] hover:text-white flex items-center justify-between"
                >
                  <span>Auto-Trace Bitmap Docker</span>
                  {activeDockerTab === 'trace' && <span className="text-emerald-400">✓</span>}
                </button>
                <button
                  onClick={() => { setActiveDockerTab('history'); setActiveMenu(null); }}
                  className="w-full text-left px-3 py-1.5 hover:bg-[#2563eb] hover:text-white flex items-center justify-between"
                >
                  <span>History / Undo Steps</span>
                  {activeDockerTab === 'history' && <span className="text-emerald-400">✓</span>}
                </button>
              </div>
            )}
          </div>

          {/* Help Menu */}
          <div className="relative">
            <button
              onClick={() => setActiveMenu(activeMenu === 'help' ? null : 'help')}
              onMouseEnter={() => activeMenu && setActiveMenu('help')}
              className={`px-2 py-1 rounded hover:bg-[#2d3748] ${
                activeMenu === 'help' ? 'bg-[#2d3748] text-emerald-400 font-semibold' : 'text-gray-300'
              }`}
            >
              Help
            </button>
            {activeMenu === 'help' && (
              <div className="absolute left-0 top-full mt-0.5 w-56 bg-[#1f2430] border border-[#374151] rounded-md shadow-2xl py-1 z-50 text-gray-200">
                <button
                  onClick={() => { setOpenDialog('shortcuts'); setActiveMenu(null); }}
                  className="w-full text-left px-3 py-1.5 hover:bg-[#2563eb] hover:text-white flex items-center justify-between"
                >
                  <span className="flex items-center"><Keyboard className="w-3.5 h-3.5 mr-2 text-indigo-400" /> Keyboard Shortcuts</span>
                  <span className="text-gray-500 text-[10px]">F1</span>
                </button>
                <button
                  onClick={() => { setOpenDialog('about'); setActiveMenu(null); }}
                  className="w-full text-left px-3 py-1.5 hover:bg-[#2563eb] hover:text-white flex items-center"
                >
                  <HelpCircle className="w-3.5 h-3.5 mr-2 text-emerald-400" /> About CorelDRAW Web
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Center Project Name & Status */}
      <div className="flex items-center space-x-2">
        <input
          type="text"
          value={projectTitle}
          onChange={e => setProjectTitle(e.target.value)}
          className="bg-transparent hover:bg-[#2d3748] focus:bg-[#2d3748] text-gray-200 font-medium px-2 py-0.5 rounded border border-transparent focus:border-emerald-500/50 outline-none text-center max-w-[200px] text-xs transition"
          title="Click to rename document"
        />
        <span className="text-gray-500 text-[11px] hidden md:inline">
          [{activePage.width} × {activePage.height} {activePage.unit}]
        </span>
      </div>

      {/* Right Quick Action: Export / Share */}
      <div className="flex items-center space-x-2">
        <button
          onClick={() => setOpenDialog('templates')}
          className="px-2 py-0.5 bg-amber-500/20 text-amber-300 border border-amber-500/30 hover:bg-amber-500/30 rounded font-medium flex items-center text-xs transition"
        >
          <Sparkles className="w-3 h-3 mr-1 text-amber-400" /> Templates
        </button>
        <button
          onClick={() => setOpenDialog('export')}
          className="px-2.5 py-0.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white rounded font-medium flex items-center text-xs shadow transition"
        >
          <Download className="w-3 h-3 mr-1" /> Export
        </button>
      </div>
    </div>
  );
};
