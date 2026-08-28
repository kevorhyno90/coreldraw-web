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
  Plus,
  Minus,
  Sparkles,
  Type,
  Maximize2,
  Circle,
  Square,
  Star,
  Hexagon,
} from 'lucide-react';
import { BooleanOp } from '../../engine/booleanOps';

const FONT_FAMILIES = [
  'Inter',
  'Outfit',
  'Montserrat',
  'Bebas Neue',
  'Cinzel',
  'Playfair Display',
  'Space Grotesk',
  'JetBrains Mono',
  'sans-serif',
  'serif',
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
  } = useCorel();

  // Page Property Bar (When nothing is selected)
  if (selectedObjects.length === 0) {
    return (
      <div className="bg-[#1b2029] border-b border-[#2d3748] px-3 py-1 flex items-center space-x-4 text-xs select-none min-h-[36px] overflow-x-auto text-gray-300">
        <span className="font-semibold text-gray-400 uppercase text-[10px] tracking-wider">Page Setup:</span>
        
        {/* Preset */}
        <div className="flex items-center space-x-1">
          <span className="text-gray-400">Preset:</span>
          <select
            value={activePage.preset}
            onChange={e => {
              const val = e.target.value;
              let w = activePage.width;
              let h = activePage.height;
              if (val === 'A4 Standard') { w = 1000; h = 750; }
              else if (val === 'A3 Poster') { w = 1400; h = 990; }
              else if (val === '1080p FHD') { w = 1920; h = 1080; }
              else if (val === 'Business Card') { w = 1050; h = 600; }
              else if (val === 'Square Post') { w = 800; h = 800; }
              updateActivePage({ preset: val, width: w, height: h });
            }}
            className="bg-[#262e3d] text-white px-2 py-0.5 rounded border border-[#374151] outline-none"
          >
            <option value="A4 Standard">A4 Standard (1000 × 750)</option>
            <option value="A3 Poster">A3 Poster (1400 × 990)</option>
            <option value="1080p FHD">1080p Full HD (1920 × 1080)</option>
            <option value="Business Card">Business Card (1050 × 600)</option>
            <option value="Square Post">Square Emblem (800 × 800)</option>
            <option value="Custom">Custom Size</option>
          </select>
        </div>

        {/* Width & Height */}
        <div className="flex items-center space-x-1">
          <span className="text-gray-400">W:</span>
          <input
            type="number"
            value={activePage.width}
            onChange={e => updateActivePage({ width: Math.max(100, Number(e.target.value)), preset: 'Custom' })}
            className="w-16 bg-[#262e3d] text-white px-1.5 py-0.5 rounded border border-[#374151] outline-none text-right font-mono"
          />
          <span className="text-gray-400">H:</span>
          <input
            type="number"
            value={activePage.height}
            onChange={e => updateActivePage({ height: Math.max(100, Number(e.target.value)), preset: 'Custom' })}
            className="w-16 bg-[#262e3d] text-white px-1.5 py-0.5 rounded border border-[#374151] outline-none text-right font-mono"
          />
          <span className="text-gray-500">{activePage.unit}</span>
        </div>

        {/* Orientation */}
        <div className="flex items-center space-x-1 bg-[#262e3d] p-0.5 rounded border border-[#374151]">
          <button
            onClick={() => {
              if (activePage.orientation !== 'portrait') {
                updateActivePage({
                  orientation: 'portrait',
                  width: activePage.height,
                  height: activePage.width,
                });
              }
            }}
            className={`px-2 py-0.5 rounded ${activePage.orientation === 'portrait' ? 'bg-[#3b82f6] text-white font-bold' : 'text-gray-400 hover:text-white'}`}
          >
            Portrait
          </button>
          <button
            onClick={() => {
              if (activePage.orientation !== 'landscape') {
                updateActivePage({
                  orientation: 'landscape',
                  width: activePage.height,
                  height: activePage.width,
                });
              }
            }}
            className={`px-2 py-0.5 rounded ${activePage.orientation === 'landscape' ? 'bg-[#3b82f6] text-white font-bold' : 'text-gray-400 hover:text-white'}`}
          >
            Landscape
          </button>
        </div>

        {/* Background Color */}
        <div className="flex items-center space-x-1.5">
          <span className="text-gray-400">Page Color:</span>
          <input
            type="color"
            value={activePage.background.startsWith('#') ? activePage.background : '#ffffff'}
            onChange={e => updateActivePage({ background: e.target.value })}
            className="w-6 h-6 rounded border border-[#374151] cursor-pointer bg-transparent"
          />
        </div>
      </div>
    );
  }

  const primary = primarySelectedObject!;
  const { x, y, width, height, rotation } = primary.transform;

  return (
    <div className="bg-[#1b2029] border-b border-[#2d3748] px-2 py-1 flex items-center space-x-3 text-xs select-none min-h-[36px] overflow-x-auto text-gray-200">
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

      {/* Rotation */}
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

      {/* Flip Horizontal / Vertical */}
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

      {/* Shape-Specific Dynamic Properties */}
      {primary.type === 'rect' && (
        <div className="flex items-center space-x-1.5 bg-[#262e3d] px-2 py-0.5 rounded border border-[#374151]">
          <span className="text-[11px] text-gray-400">Corner Radius:</span>
          <input
            type="number"
            value={primary.rectProps?.cornerRadii[0] || 0}
            onChange={e => {
              const r = Math.max(0, Number(e.target.value));
              updateObject(primary.id, { rectProps: { cornerRadii: [r, r, r, r], isRoundedLinked: true } });
            }}
            className="w-12 bg-[#1b2029] text-white px-1 py-0.5 rounded border border-[#374151] outline-none text-right font-mono"
          />
        </div>
      )}

      {primary.type === 'polygon' && (
        <div className="flex items-center space-x-1.5 bg-[#262e3d] px-2 py-0.5 rounded border border-[#374151]">
          <Hexagon className="w-3.5 h-3.5 text-cyan-400" />
          <span className="text-[11px] text-gray-400">Sides:</span>
          <input
            type="number"
            min={3}
            max={32}
            value={primary.polygonProps?.sides || 5}
            onChange={e => {
              const sides = Math.min(32, Math.max(3, Number(e.target.value)));
              updateObject(primary.id, { polygonProps: { sides } });
            }}
            className="w-10 bg-[#1b2029] text-white px-1 py-0.5 rounded border border-[#374151] outline-none text-right font-mono"
          />
        </div>
      )}

      {primary.type === 'star' && (
        <div className="flex items-center space-x-2 bg-[#262e3d] px-2 py-0.5 rounded border border-[#374151]">
          <Star className="w-3.5 h-3.5 text-amber-400" />
          <span className="text-[11px] text-gray-400">Points:</span>
          <input
            type="number"
            min={3}
            max={32}
            value={primary.starProps?.points || 5}
            onChange={e => updateObject(primary.id, { starProps: { ...primary.starProps!, points: Number(e.target.value) } })}
            className="w-10 bg-[#1b2029] text-white px-1 py-0.5 rounded border border-[#374151] outline-none text-right font-mono"
          />
          <span className="text-[11px] text-gray-400">Depth:</span>
          <input
            type="range"
            min={0.1}
            max={0.9}
            step={0.05}
            value={primary.starProps?.sharpness || 0.5}
            onChange={e => updateObject(primary.id, { starProps: { ...primary.starProps!, sharpness: Number(e.target.value) } })}
            className="w-16 h-1 bg-gray-600 rounded-lg cursor-pointer"
          />
        </div>
      )}

      {/* Typography Properties */}
      {primary.type === 'text' && primary.textProps && (
        <div className="flex items-center space-x-1.5">
          <select
            value={primary.textProps.fontFamily}
            onChange={e => updateObject(primary.id, { textProps: { ...primary.textProps!, fontFamily: e.target.value } })}
            className="bg-[#262e3d] text-white px-2 py-0.5 rounded border border-[#374151] outline-none font-medium"
          >
            {FONT_FAMILIES.map(font => (
              <option key={font} value={font}>{font}</option>
            ))}
          </select>
          <input
            type="number"
            value={primary.textProps.fontSize}
            onChange={e => updateObject(primary.id, { textProps: { ...primary.textProps!, fontSize: Math.max(6, Number(e.target.value)) } })}
            className="w-12 bg-[#262e3d] text-white px-1 py-0.5 rounded border border-[#374151] outline-none text-right font-mono"
          />
          <div className="flex items-center bg-[#262e3d] p-0.5 rounded border border-[#374151]">
            <button
              onClick={() => updateObject(primary.id, { textProps: { ...primary.textProps!, fontWeight: primary.textProps!.fontWeight === 800 ? 400 : 800 } })}
              className={`p-1 rounded ${primary.textProps.fontWeight === 800 ? 'bg-[#3b82f6] text-white' : 'text-gray-400 hover:text-white'}`}
            >
              <Bold className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => updateObject(primary.id, { textProps: { ...primary.textProps!, fontStyle: primary.textProps!.fontStyle === 'italic' ? 'normal' : 'italic' } })}
              className={`p-1 rounded ${primary.textProps.fontStyle === 'italic' ? 'bg-[#3b82f6] text-white' : 'text-gray-400 hover:text-white'}`}
            >
              <Italic className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* Convert to Curves */}
      {primary.type !== 'path' && (
        <button
          onClick={() => convertToCurves(primary.id)}
          className="px-2 py-0.5 bg-emerald-600/30 hover:bg-emerald-600/50 text-emerald-300 border border-emerald-500/40 rounded font-medium flex items-center space-x-1"
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
    </div>
  );
};
