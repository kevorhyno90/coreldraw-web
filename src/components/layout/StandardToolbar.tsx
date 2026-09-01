import React, { useRef } from 'react';
import { useCorel } from '../../context/CorelContext';
import {
  FilePlus,
  FolderOpen,
  Save,
  Printer,
  Copy,
  Scissors,
  Clipboard,
  Undo2,
  Redo2,
  Download,
  Upload,
  ZoomIn,
  ZoomOut,
  Maximize,
  Magnet,
  Grid,
  Sparkles,
  Layers,
  SlidersHorizontal,
  Type,
  Trash2,
} from 'lucide-react';
import { exportToCorelJson } from '../../engine/exportEngine';
import { parseSvgToCorelObjects } from '../../engine/svgEngine';

export const StandardToolbar: React.FC = () => {
  const {
    projectTitle,
    setOpenDialog,
    canUndo,
    canRedo,
    undo,
    redo,
    duplicateSelected,
    deleteSelected,
    zoom,
    setZoom,
    zoomToFit,
    resetZoom,
    snapSettings,
    setSnapSettings,
    getProjectDocument,
    loadProjectDocument,
    addObject,
    activeDockerTab,
    setActiveDockerTab,
  } = useCorel();

  const fileInputRef = useRef<HTMLInputElement>(null);

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
        alert('Could not parse file.');
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="bg-[#242b38] border-b border-[#2d3748] px-2 py-0.5 flex items-center justify-between text-xs select-none h-8 whitespace-nowrap overflow-x-auto scrollbar-none">
      <input
        type="file"
        ref={fileInputRef}
        className="hidden"
        accept=".cdrw,.json,.svg"
        onChange={handleOpenLocalProject}
      />

      <div className="flex items-center space-x-1 overflow-x-auto">
        {/* Document group */}
        <button
          onClick={() => setOpenDialog('new')}
          title="New Document (Ctrl+N)"
          className="p-1 hover:bg-[#323c4d] text-gray-300 hover:text-white rounded"
        >
          <FilePlus className="w-4 h-4 text-emerald-400" />
        </button>
        <button
          onClick={() => fileInputRef.current?.click()}
          title="Open Project / SVG (Ctrl+O)"
          className="p-1 hover:bg-[#323c4d] text-gray-300 hover:text-white rounded"
        >
          <FolderOpen className="w-4 h-4 text-blue-400" />
        </button>
        <button
          onClick={() => exportToCorelJson(getProjectDocument(), projectTitle)}
          title="Save Project (.cdrw) (Ctrl+S)"
          className="p-1 hover:bg-[#323c4d] text-gray-300 hover:text-white rounded"
        >
          <Save className="w-4 h-4 text-purple-400" />
        </button>
        <button
          onClick={() => setOpenDialog('export')}
          title="Export PNG/SVG/PDF (Ctrl+E)"
          className="p-1 hover:bg-[#323c4d] text-gray-300 hover:text-white rounded"
        >
          <Download className="w-4 h-4 text-teal-400" />
        </button>
        <button
          onClick={() => setOpenDialog('command' as any)}
          title="Quick Command Search (Ctrl+K)"
          className="p-1 hover:bg-[#323c4d] text-emerald-400 hover:text-emerald-300 rounded flex items-center space-x-1"
        >
          <Sparkles className="w-4 h-4" />
          <span className="text-[10px] hidden lg:inline font-mono">Ctrl+K</span>
        </button>

        {/* Corel Font Manager Quick Button */}
        <button
          onClick={() => setActiveDockerTab('fontmanager')}
          title="Corel Font Manager 2025 (Universal Fonts & Local Font Installer)"
          className="px-2 py-1 bg-gradient-to-r from-emerald-600/30 to-teal-600/30 hover:from-emerald-600/60 hover:to-teal-600/60 text-emerald-300 border border-emerald-500/40 rounded flex items-center space-x-1 font-semibold text-[11px] transition-all"
        >
          <Type className="w-3.5 h-3.5 text-emerald-400" />
          <span>Font Manager</span>
        </button>

        <div className="h-4 w-[1px] bg-[#374151] mx-1" />

        {/* Edit group */}
        <button
          onClick={duplicateSelected}
          title="Duplicate Selection (Ctrl+D)"
          className="p-1 hover:bg-[#323c4d] text-gray-300 hover:text-white rounded"
        >
          <Copy className="w-4 h-4 text-indigo-400" />
        </button>
        <button
          onClick={deleteSelected}
          title="Delete Selected Objects (Delete / Backspace)"
          className="p-1 hover:bg-rose-950/60 hover:text-rose-400 text-gray-400 rounded transition-colors"
        >
          <Trash2 className="w-4 h-4 text-rose-400" />
        </button>
        <button
          disabled={!canUndo}
          onClick={undo}
          title="Undo (Ctrl+Z)"
          className={`p-1 rounded ${canUndo ? 'hover:bg-[#323c4d] text-gray-300 hover:text-white' : 'opacity-30 text-gray-600 cursor-not-allowed'}`}
        >
          <Undo2 className="w-4 h-4 text-blue-400" />
        </button>
        <button
          disabled={!canRedo}
          onClick={redo}
          title="Redo (Ctrl+Y)"
          className={`p-1 rounded ${canRedo ? 'hover:bg-[#323c4d] text-gray-300 hover:text-white' : 'opacity-30 text-gray-600 cursor-not-allowed'}`}
        >
          <Redo2 className="w-4 h-4 text-blue-400" />
        </button>

        <div className="h-4 w-[1px] bg-[#374151] mx-1" />

        {/* Zoom selector */}
        <div className="flex items-center space-x-0.5 bg-[#1a202c] px-1.5 py-0.5 rounded border border-[#374151]">
          <button onClick={() => setZoom(z => Math.max(0.1, z * 0.8))} title="Zoom Out" className="p-0.5 hover:text-white text-gray-400">
            <ZoomOut className="w-3.5 h-3.5" />
          </button>
          <select
            value={Math.round(zoom * 100)}
            onChange={e => setZoom(Number(e.target.value) / 100)}
            className="bg-transparent text-gray-200 text-[11px] font-medium outline-none cursor-pointer text-center"
          >
            <option value={25} className="bg-[#1a202c]">25%</option>
            <option value={50} className="bg-[#1a202c]">50%</option>
            <option value={75} className="bg-[#1a202c]">75%</option>
            <option value={100} className="bg-[#1a202c]">100%</option>
            <option value={150} className="bg-[#1a202c]">150%</option>
            <option value={200} className="bg-[#1a202c]">200%</option>
            <option value={400} className="bg-[#1a202c]">400%</option>
          </select>
          <button onClick={() => setZoom(z => Math.min(8, z * 1.25))} title="Zoom In" className="p-0.5 hover:text-white text-gray-400">
            <ZoomIn className="w-3.5 h-3.5" />
          </button>
        </div>

        <button
          onClick={zoomToFit}
          title="Zoom to Fit Page (F4)"
          className="p-1 hover:bg-[#323c4d] text-gray-300 hover:text-white rounded"
        >
          <Maximize className="w-4 h-4 text-amber-400" />
        </button>

        <div className="h-4 w-[1px] bg-[#374151] mx-1" />

        {/* Snap Toggles */}
        <button
          onClick={() => setSnapSettings(s => ({ ...s, snapToGrid: !s.snapToGrid }))}
          title="Toggle Snap to Grid"
          className={`p-1 rounded flex items-center space-x-1 ${snapSettings.snapToGrid ? 'bg-emerald-600/30 text-emerald-300 border border-emerald-500/40' : 'hover:bg-[#323c4d] text-gray-400'}`}
        >
          <Grid className="w-3.5 h-3.5" />
          <span className="text-[10px] hidden sm:inline">Grid</span>
        </button>
        <button
          onClick={() => setSnapSettings(s => ({ ...s, snapToGuidelines: !s.snapToGuidelines }))}
          title="Toggle Snap to Guidelines"
          className={`p-1 rounded flex items-center space-x-1 ${snapSettings.snapToGuidelines ? 'bg-cyan-600/30 text-cyan-300 border border-cyan-500/40' : 'hover:bg-[#323c4d] text-gray-400'}`}
        >
          <Magnet className="w-3.5 h-3.5" />
          <span className="text-[10px] hidden sm:inline">Guidelines</span>
        </button>
      </div>

      {/* Right Docker toggles */}
      <div className="flex items-center space-x-1">
        <button
          onClick={() => setActiveDockerTab(activeDockerTab === 'properties' ? null : 'properties')}
          title="Object Properties"
          className={`px-2 py-0.5 rounded text-xs flex items-center space-x-1 ${activeDockerTab === 'properties' ? 'bg-[#3b82f6] text-white' : 'hover:bg-[#323c4d] text-gray-300'}`}
        >
          <SlidersHorizontal className="w-3 h-3" />
          <span>Properties</span>
        </button>
        <button
          onClick={() => setActiveDockerTab(activeDockerTab === 'objects' ? null : 'objects')}
          title="Object Manager / Layers"
          className={`px-2 py-0.5 rounded text-xs flex items-center space-x-1 ${activeDockerTab === 'objects' ? 'bg-[#3b82f6] text-white' : 'hover:bg-[#323c4d] text-gray-300'}`}
        >
          <Layers className="w-3 h-3" />
          <span>Layers</span>
        </button>
      </div>
    </div>
  );
};
