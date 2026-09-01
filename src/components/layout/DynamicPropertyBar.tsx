import React from 'react';
import { useCorel } from '../../context/CorelContext';
import {
  Lock,
  Unlock,
  RotateCw,
  FlipHorizontal,
  FlipVertical,
  Scissors,
  Layers,
  Component,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  Bold,
  Italic,
  Underline,
  Strikethrough,
  Plus,
  Minus,
  Sparkles,
  Type,
  Maximize2,
  Circle,
  Square,
  Star,
  Hexagon,
  Palette,
  Pipette,
  Sliders,
  Trash2,
  Copy,
} from 'lucide-react';
import { BooleanOp } from '../../engine/booleanOps';
import { ARTISTIC_BRUSH_PRESETS } from '../../engine/artisticMediaEngine';
import { loadGoogleFont } from '../../engine/googleFontsLibrary';

const FONT_FAMILIES = [
  'Inter',
  'Montserrat',
  'Playfair Display',
  'Bebas Neue',
  'Outfit',
  'Cinzel',
  'Space Grotesk',
  'JetBrains Mono',
  'Oswald',
  'Lora',
  'Caveat',
  'Pacifico',
  'Syne',
  'Righteous',
  'Poppins',
  'Roboto',
  'sans-serif',
  'serif',
  'monospace',
];

const FONT_WEIGHTS = [
  { label: 'Thin (100)', value: 100 },
  { label: 'Light (300)', value: 300 },
  { label: 'Regular (400)', value: 400 },
  { label: 'Medium (500)', value: 500 },
  { label: 'Semi-Bold (600)', value: 600 },
  { label: 'Bold (700)', value: 700 },
  { label: 'Extra-Bold (800)', value: 800 },
  { label: 'Black (900)', value: 900 },
];

const STROKE_WIDTH_PRESETS = [
  { label: 'Hairline', value: 0.5 },
  { label: '1 pt', value: 1 },
  { label: '2 pt', value: 2 },
  { label: '4 pt', value: 4 },
  { label: '8 pt', value: 8 },
  { label: '16 pt', value: 16 },
];

export const DynamicPropertyBar: React.FC = () => {
  const {
    activePage,
    updateActivePage,
    activeTool,
    selectedObjects,
    primarySelectedObject,
    updateObject,
    updateSelectedObjects,
    convertToCurves,
    groupSelected,
    ungroupSelected,
    applyBooleanOp,
    alignSelected,
    bringToFront,
    sendToBack,
    selectionBounds,
    activeFillColor,
    setActiveFillColor,
    activeOutlineColor,
    setActiveOutlineColor,
    activeOutlineWidth,
    setActiveOutlineWidth,
    activeBrushPreset,
    setActiveBrushPreset,
    activeBrushWidth,
    setActiveBrushWidth,
    activeBrushAngle,
    setActiveBrushAngle,
    activeBrushSmoothing,
    setActiveBrushSmoothing,
    setActiveDockerTab,
    deleteSelected,
    duplicateSelected,
  } = useCorel();

  // Artistic Media Tool Ribbon
  if (activeTool === 'artistic-media') {
    const currentPreset = ARTISTIC_BRUSH_PRESETS.find(p => p.id === activeBrushPreset) || ARTISTIC_BRUSH_PRESETS[0];

    return (
      <div className="bg-[#1b2029] border-b border-[#2d3748] px-2 py-0.5 flex items-center space-x-3 text-xs select-none h-8 whitespace-nowrap overflow-x-auto scrollbar-none text-gray-300">
        <span className="font-semibold text-emerald-400 uppercase text-[10px] tracking-wider flex items-center">
          <Sparkles className="w-3.5 h-3.5 mr-1" /> Artistic Media:
        </span>

        {/* Preset Selector */}
        <div className="flex items-center space-x-1.5">
          <span className="text-gray-400">Brush Preset:</span>
          <select
            value={activeBrushPreset}
            onChange={e => {
              const selected = ARTISTIC_BRUSH_PRESETS.find(p => p.id === e.target.value);
              if (selected) {
                setActiveBrushPreset(selected.id);
                setActiveBrushWidth(selected.defaultWidth);
                if (selected.angle) setActiveBrushAngle(selected.angle);
                setActiveBrushSmoothing(selected.smoothing);
              }
            }}
            className="bg-[#262e3d] text-white px-2 py-1 rounded border border-[#374151] outline-none font-medium"
          >
            <optgroup label="✒️ Calligraphic & Presets">
              {ARTISTIC_BRUSH_PRESETS.filter(p => p.category === 'calligraphic' || p.category === 'preset').map(p => (
                <option key={p.id} value={p.id}>{p.previewIcon} {p.name}</option>
              ))}
            </optgroup>
            <optgroup label="🎨 Artistic & Paint Brushes">
              {ARTISTIC_BRUSH_PRESETS.filter(p => p.category === 'brush').map(p => (
                <option key={p.id} value={p.id}>{p.previewIcon} {p.name}</option>
              ))}
            </optgroup>
            <optgroup label="✨ Object Sprayers">
              {ARTISTIC_BRUSH_PRESETS.filter(p => p.category === 'sprayer').map(p => (
                <option key={p.id} value={p.id}>{p.previewIcon} {p.name}</option>
              ))}
            </optgroup>
          </select>
        </div>

        {/* Width */}
        <div className="flex items-center space-x-1">
          <span className="text-gray-400">Width:</span>
          <input
            type="number"
            value={activeBrushWidth}
            onChange={e => setActiveBrushWidth(Math.max(1, Number(e.target.value)))}
            className="w-12 bg-[#262e3d] text-white px-1.5 py-1 rounded border border-[#374151] outline-none text-right font-mono"
          />
          <span className="text-gray-400">px</span>
        </div>

        {/* Calligraphic Angle */}
        {currentPreset.category === 'calligraphic' && (
          <div className="flex items-center space-x-1">
            <span className="text-gray-400">Angle:</span>
            <input
              type="number"
              value={activeBrushAngle}
              onChange={e => setActiveBrushAngle(Number(e.target.value))}
              className="w-12 bg-[#262e3d] text-white px-1.5 py-1 rounded border border-[#374151] outline-none text-right font-mono"
            />
            <span className="text-gray-400">°</span>
          </div>
        )}

        {/* Smoothing */}
        <div className="flex items-center space-x-1">
          <span className="text-gray-400">Smoothing:</span>
          <input
            type="range"
            min={0}
            max={100}
            value={activeBrushSmoothing}
            onChange={e => setActiveBrushSmoothing(Number(e.target.value))}
            className="w-20 accent-emerald-500 h-1.5 bg-gray-700 rounded cursor-pointer"
          />
          <span className="text-gray-400 font-mono text-[10px]">{activeBrushSmoothing}%</span>
        </div>
      </div>
    );
  }

  // If no object is selected, show Page properties
  if (selectedObjects.length === 0 || !primarySelectedObject) {
    return (
      <div className="bg-[#1b2029] border-b border-[#2d3748] px-2 py-0.5 flex items-center space-x-3 text-xs select-none h-8 whitespace-nowrap overflow-x-auto scrollbar-none text-gray-300">
        <span className="font-semibold text-blue-400 uppercase text-[10px] tracking-wider">
          Page Setup:
        </span>

        {/* Page Name */}
        <div className="flex items-center space-x-1">
          <span className="text-gray-400">Name:</span>
          <input
            type="text"
            value={activePage.name}
            onChange={e => updateActivePage({ name: e.target.value })}
            className="w-24 bg-[#262e3d] text-white px-1.5 py-0.5 rounded border border-[#374151] outline-none"
          />
        </div>

        {/* Width & Height */}
        <div className="flex items-center space-x-1">
          <span className="text-gray-400 font-mono">W:</span>
          <input
            type="number"
            value={activePage.width}
            onChange={e => updateActivePage({ width: Math.max(50, Number(e.target.value)) })}
            className="w-16 bg-[#262e3d] text-white px-1.5 py-0.5 rounded border border-[#374151] outline-none text-right font-mono"
          />
          <span className="text-gray-400 font-mono">H:</span>
          <input
            type="number"
            value={activePage.height}
            onChange={e => updateActivePage({ height: Math.max(50, Number(e.target.value)) })}
            className="w-16 bg-[#262e3d] text-white px-1.5 py-0.5 rounded border border-[#374151] outline-none text-right font-mono"
          />
          <span className="text-gray-400">{activePage.unit}</span>
        </div>

        {/* Orientation Toggle */}
        <div className="flex items-center space-x-1 bg-[#262e3d] p-0.5 rounded border border-[#374151]">
          <button
            onClick={() => {
              if (activePage.orientation !== 'portrait') {
                updateActivePage({
                  orientation: 'portrait',
                  width: Math.min(activePage.width, activePage.height),
                  height: Math.max(activePage.width, activePage.height),
                });
              }
            }}
            title="Portrait Orientation"
            className={`p-1 rounded ${activePage.orientation === 'portrait' ? 'bg-[#3b82f6] text-white font-bold' : 'text-gray-400 hover:text-white'}`}
          >
            <Square className="w-3.5 h-3.5 rotate-90" />
          </button>
          <button
            onClick={() => {
              if (activePage.orientation !== 'landscape') {
                updateActivePage({
                  orientation: 'landscape',
                  width: Math.max(activePage.width, activePage.height),
                  height: Math.min(activePage.width, activePage.height),
                });
              }
            }}
            title="Landscape Orientation"
            className={`p-1 rounded ${activePage.orientation === 'landscape' ? 'bg-[#3b82f6] text-white font-bold' : 'text-gray-400 hover:text-white'}`}
          >
            <Square className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Background Color */}
        <div className="flex items-center space-x-1.5">
          <span className="text-gray-400">Page Color:</span>
          <input
            type="color"
            value={activePage.background || '#ffffff'}
            onChange={e => updateActivePage({ background: e.target.value })}
            className="w-6 h-6 rounded border border-[#374151] cursor-pointer bg-transparent"
          />
        </div>
      </div>
    );
  }

  // Selected Object Properties
  const primary = primarySelectedObject;
  const { x, y, width, height, rotation } = primary.transform;

  return (
    <div className="bg-[#1b2029] border-b border-[#2d3748] px-2 py-0.5 flex items-center space-x-2.5 text-xs select-none h-8 whitespace-nowrap overflow-x-auto scrollbar-none text-gray-300">
      {/* Position X / Y */}
      <div className="flex items-center space-x-1">
        <span className="text-gray-400 font-mono">X:</span>
        <input
          type="number"
          value={Math.round(x)}
          onChange={e => updateSelectedObjects({ transform: { ...primary.transform, x: Number(e.target.value) } })}
          className="w-14 bg-[#262e3d] text-white px-1 py-0.5 rounded border border-[#374151] outline-none text-right font-mono"
        />
        <span className="text-gray-400 font-mono">Y:</span>
        <input
          type="number"
          value={Math.round(y)}
          onChange={e => updateSelectedObjects({ transform: { ...primary.transform, y: Number(e.target.value) } })}
          className="w-14 bg-[#262e3d] text-white px-1 py-0.5 rounded border border-[#374151] outline-none text-right font-mono"
        />
      </div>

      <div className="h-4 w-[1px] bg-[#374151]" />

      {/* Size W / H */}
      <div className="flex items-center space-x-1">
        <span className="text-gray-400 font-mono">W:</span>
        <input
          type="number"
          value={Math.round(width)}
          onChange={e => updateSelectedObjects({ transform: { ...primary.transform, width: Math.max(1, Number(e.target.value)) } })}
          className="w-14 bg-[#262e3d] text-white px-1 py-0.5 rounded border border-[#374151] outline-none text-right font-mono"
        />
        <span className="text-gray-400 font-mono">H:</span>
        <input
          type="number"
          value={Math.round(height)}
          onChange={e => updateSelectedObjects({ transform: { ...primary.transform, height: Math.max(1, Number(e.target.value)) } })}
          className="w-14 bg-[#262e3d] text-white px-1 py-0.5 rounded border border-[#374151] outline-none text-right font-mono"
        />
      </div>

      <div className="h-4 w-[1px] bg-[#374151]" />

      {/* Rotation & Flip */}
      <div className="flex items-center space-x-1">
        <RotateCw className="w-3.5 h-3.5 text-gray-400" />
        <input
          type="number"
          value={Math.round(rotation || 0)}
          onChange={e => updateSelectedObjects({ transform: { ...primary.transform, rotation: Number(e.target.value) } })}
          className="w-12 bg-[#262e3d] text-white px-1 py-0.5 rounded border border-[#374151] outline-none text-right font-mono"
        />
        <span className="text-gray-400">°</span>
      </div>

      <div className="flex items-center space-x-0.5">
        <button
          onClick={() => updateSelectedObjects({ transform: { ...primary.transform, scaleX: (primary.transform.scaleX || 1) * -1 } })}
          title="Mirror Horizontally"
          className="p-1 hover:bg-[#2d3748] rounded text-gray-400 hover:text-white"
        >
          <FlipHorizontal className="w-3.5 h-3.5" />
        </button>
        <button
          onClick={() => updateSelectedObjects({ transform: { ...primary.transform, scaleY: (primary.transform.scaleY || 1) * -1 } })}
          title="Mirror Vertically"
          className="p-1 hover:bg-[#2d3748] rounded text-gray-400 hover:text-white"
        >
          <FlipVertical className="w-3.5 h-3.5" />
        </button>
      </div>

      <div className="h-4 w-[1px] bg-[#374151]" />

      {/* Live Fill & Outline Swatches */}
      <div className="flex items-center space-x-2 bg-[#262e3d] px-2 py-0.5 rounded border border-[#374151]">
        <div className="flex items-center space-x-1" title="Fill Color">
          <span className="text-[10px] text-gray-400 uppercase font-bold">Fill:</span>
          <input
            type="color"
            value={primary.fill.color !== 'none' ? primary.fill.color : '#ffffff'}
            onChange={e => {
              updateSelectedObjects({ fill: { ...primary.fill, type: 'solid', color: e.target.value } });
              setActiveFillColor(e.target.value);
            }}
            className="w-5 h-5 rounded border border-gray-600 cursor-pointer bg-transparent"
          />
        </div>

        <div className="flex items-center space-x-1" title="Outline Color & Width">
          <span className="text-[10px] text-gray-400 uppercase font-bold">Line:</span>
          <input
            type="color"
            value={primary.outline.color !== 'none' ? primary.outline.color : '#000000'}
            onChange={e => {
              updateSelectedObjects({ outline: { ...primary.outline, color: e.target.value } });
              setActiveOutlineColor(e.target.value);
            }}
            className="w-5 h-5 rounded border border-gray-600 cursor-pointer bg-transparent"
          />
          <select
            value={primary.outline.width || 1}
            onChange={e => {
              const w = Number(e.target.value);
              updateSelectedObjects({ outline: { ...primary.outline, width: w } });
              setActiveOutlineWidth(w);
            }}
            className="bg-[#1b2029] text-white px-1 py-0.5 rounded text-[10px] font-mono border border-gray-700 outline-none"
          >
            {STROKE_WIDTH_PRESETS.map(sw => (
              <option key={sw.value} value={sw.value}>{sw.label}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="h-4 w-[1px] bg-[#374151]" />

      {/* TYPOGRAPHY SPECIFIC CONTROLS */}
      {primary.type === 'text' && primary.textProps && (
        <div className="flex items-center space-x-2">
          {/* Direct Text String Editor */}
          <div className="flex items-center space-x-1 bg-[#262e3d] px-2 py-0.5 rounded border border-[#374151]">
            <span className="text-[10px] text-emerald-400 font-bold uppercase">Text:</span>
            <input
              type="text"
              value={primary.textProps.text}
              onChange={e => updateObject(primary.id, { textProps: { ...primary.textProps!, text: e.target.value } })}
              className="w-40 bg-[#1b2029] text-white px-1.5 py-0.5 rounded border border-gray-700 outline-none font-medium text-xs"
              placeholder="Edit text..."
            />
          </div>

          {/* Font Family Dropdown */}
          <select
            value={primary.textProps.fontFamily}
            onChange={e => {
              if (e.target.value === '__add_font__') {
                setActiveDockerTab('fontmanager');
                return;
              }
              loadGoogleFont(e.target.value);
              updateObject(primary.id, { textProps: { ...primary.textProps!, fontFamily: e.target.value } });
            }}
            className="bg-[#262e3d] text-white px-2 py-0.5 rounded border border-[#374151] outline-none font-medium text-xs"
          >
            <option value="__add_font__">➕ Add / Install Any Font...</option>
            {FONT_FAMILIES.map(font => (
              <option key={font} value={font}>{font}</option>
            ))}
          </select>

          {/* Quick Font Manager / Add Font Button */}
          <button
            onClick={() => setActiveDockerTab('fontmanager')}
            className="px-2 py-0.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white rounded font-semibold text-[11px] flex items-center gap-1 shadow-sm transition-all"
            title="Open Corel Font Manager 2025 (Add any font in the world, install .ttf/.otf, scan system fonts)"
          >
            <Type className="w-3 h-3" />
            <span>Font Manager</span>
          </button>

          {/* Font Size with Stepper */}
          <div className="flex items-center space-x-0.5 bg-[#262e3d] px-1 py-0.5 rounded border border-[#374151]">
            <input
              type="number"
              value={primary.textProps.fontSize}
              onChange={e => updateObject(primary.id, { textProps: { ...primary.textProps!, fontSize: Math.max(6, Number(e.target.value)) } })}
              className="w-12 bg-[#1b2029] text-white px-1 py-0.5 rounded border border-[#374151] outline-none text-right font-mono text-xs"
            />
            <span className="text-[10px] text-gray-400 font-mono px-0.5">pt</span>
          </div>

          {/* Font Weight Selector */}
          <select
            value={primary.textProps.fontWeight || 400}
            onChange={e => updateObject(primary.id, { textProps: { ...primary.textProps!, fontWeight: Number(e.target.value) } })}
            className="bg-[#262e3d] text-white px-1.5 py-0.5 rounded border border-[#374151] outline-none text-[11px]"
          >
            {FONT_WEIGHTS.map(fw => (
              <option key={fw.value} value={fw.value}>{fw.label}</option>
            ))}
          </select>

          {/* Bold / Italic / Underline / Strikethrough Buttons */}
          <div className="flex items-center bg-[#262e3d] p-0.5 rounded border border-[#374151]">
            <button
              onClick={() => updateObject(primary.id, { textProps: { ...primary.textProps!, fontWeight: Number(primary.textProps!.fontWeight || 400) >= 700 ? 400 : 700 } })}
              title="Bold"
              className={`p-1 rounded ${Number(primary.textProps.fontWeight) >= 700 ? 'bg-[#3b82f6] text-white' : 'text-gray-400 hover:text-white'}`}
            >
              <Bold className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => updateObject(primary.id, { textProps: { ...primary.textProps!, fontStyle: primary.textProps!.fontStyle === 'italic' ? 'normal' : 'italic' } })}
              title="Italic"
              className={`p-1 rounded ${primary.textProps.fontStyle === 'italic' ? 'bg-[#3b82f6] text-white' : 'text-gray-400 hover:text-white'}`}
            >
              <Italic className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => updateObject(primary.id, { textProps: { ...primary.textProps!, textDecoration: primary.textProps!.textDecoration === 'underline' ? 'none' : 'underline' } })}
              title="Underline"
              className={`p-1 rounded ${primary.textProps.textDecoration === 'underline' ? 'bg-[#3b82f6] text-white' : 'text-gray-400 hover:text-white'}`}
            >
              <Underline className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Text Alignment */}
          <div className="flex items-center bg-[#262e3d] p-0.5 rounded border border-[#374151]">
            <button
              onClick={() => updateObject(primary.id, { textProps: { ...primary.textProps!, textAlign: 'left' } })}
              title="Align Left"
              className={`p-1 rounded ${primary.textProps.textAlign === 'left' ? 'bg-[#3b82f6] text-white' : 'text-gray-400 hover:text-white'}`}
            >
              <AlignLeft className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => updateObject(primary.id, { textProps: { ...primary.textProps!, textAlign: 'center' } })}
              title="Align Center"
              className={`p-1 rounded ${primary.textProps.textAlign === 'center' ? 'bg-[#3b82f6] text-white' : 'text-gray-400 hover:text-white'}`}
            >
              <AlignCenter className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => updateObject(primary.id, { textProps: { ...primary.textProps!, textAlign: 'right' } })}
              title="Align Right"
              className={`p-1 rounded ${primary.textProps.textAlign === 'right' ? 'bg-[#3b82f6] text-white' : 'text-gray-400 hover:text-white'}`}
            >
              <AlignRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Letter Spacing Tracking */}
          <div className="flex items-center space-x-1 bg-[#262e3d] px-1.5 py-0.5 rounded border border-[#374151]">
            <span className="text-[10px] text-gray-400 font-mono">AV:</span>
            <input
              type="number"
              value={primary.textProps.letterSpacing || 0}
              onChange={e => updateObject(primary.id, { textProps: { ...primary.textProps!, letterSpacing: Number(e.target.value) } })}
              className="w-10 bg-[#1b2029] text-white px-1 py-0.5 rounded border border-[#374151] outline-none text-right font-mono text-xs"
            />
          </div>

          {/* Transform Case */}
          <div className="flex items-center space-x-0.5 bg-[#262e3d] p-0.5 rounded border border-[#374151]">
            <button
              onClick={() => updateObject(primary.id, { textProps: { ...primary.textProps!, text: primary.textProps!.text.toUpperCase() } })}
              title="Uppercase (ALL CAPS)"
              className="px-1.5 py-0.5 hover:bg-gray-700 text-gray-300 rounded font-bold text-[10px]"
            >
              AA
            </button>
            <button
              onClick={() => updateObject(primary.id, { textProps: { ...primary.textProps!, text: primary.textProps!.text.toLowerCase() } })}
              title="Lowercase"
              className="px-1.5 py-0.5 hover:bg-gray-700 text-gray-300 rounded font-medium text-[10px]"
            >
              aa
            </button>
          </div>
        </div>
      )}

      {/* Convert to Curves */}
      {primary.type !== 'path' && (
        <button
          onClick={() => convertToCurves(primary.id)}
          className="px-2 py-0.5 bg-emerald-600/30 hover:bg-emerald-600/50 text-emerald-300 border border-emerald-500/40 rounded font-medium flex items-center space-x-1 whitespace-nowrap shadow-sm"
          title="Convert to Curves (Ctrl+Q) for Node Editing"
        >
          <Sparkles className="w-3 h-3 text-emerald-400" />
          <span>Convert to Curves</span>
        </button>
      )}

      {/* Multiple Selection Tools (Booleans / Shaping) */}
      {selectedObjects.length >= 2 && (
        <div className="flex items-center space-x-1 bg-[#262e3d] px-2 py-0.5 rounded border border-[#374151]">
          <span className="text-[10px] uppercase font-bold text-gray-400 mr-1">Shaping:</span>
          <button
            onClick={() => applyBooleanOp('weld')}
            className="px-1.5 py-0.5 bg-[#3b82f6] hover:bg-blue-600 text-white rounded text-[11px] font-semibold"
            title="Weld (Union)"
          >
            Weld
          </button>
          <button
            onClick={() => applyBooleanOp('trim')}
            className="px-1.5 py-0.5 bg-[#475569] hover:bg-slate-600 text-white rounded text-[11px] font-semibold"
            title="Trim (Difference)"
          >
            Trim
          </button>
          <button
            onClick={() => applyBooleanOp('intersect')}
            className="px-1.5 py-0.5 bg-[#475569] hover:bg-slate-600 text-white rounded text-[11px] font-semibold"
            title="Intersect"
          >
            Intersect
          </button>
          <button
            onClick={groupSelected}
            className="px-1.5 py-0.5 bg-purple-600 hover:bg-purple-500 text-white rounded text-[11px] font-semibold ml-1"
            title="Group Objects (Ctrl+G)"
          >
            Group
          </button>
        </div>
      )}

      {primary.type === 'group' && (
        <button
          onClick={ungroupSelected}
          className="px-2 py-0.5 bg-amber-600/30 text-amber-300 border border-amber-500/40 rounded hover:bg-amber-600/50 font-medium"
          title="Ungroup (Ctrl+U)"
        >
          Ungroup
        </button>
      )}

      {/* Quick Edit Actions: Duplicate & Delete */}
      <div className="flex items-center space-x-1 pl-1 border-l border-gray-700 ml-auto">
        <button
          onClick={duplicateSelected}
          title="Duplicate Object (Ctrl+D)"
          className="px-2 py-0.5 bg-gray-800 hover:bg-gray-700 text-gray-200 rounded border border-gray-700 text-[11px] font-medium flex items-center space-x-1 transition-colors"
        >
          <Copy className="w-3 h-3 text-indigo-400" />
          <span className="hidden sm:inline">Duplicate</span>
        </button>
        <button
          onClick={deleteSelected}
          title="Delete Object (Delete / Backspace)"
          className="px-2 py-0.5 bg-rose-950/40 hover:bg-rose-900/60 text-rose-300 border border-rose-800/50 rounded text-[11px] font-medium flex items-center space-x-1 transition-colors"
        >
          <Trash2 className="w-3 h-3 text-rose-400" />
          <span className="hidden sm:inline">Delete</span>
        </button>
      </div>
    </div>
  );
};
