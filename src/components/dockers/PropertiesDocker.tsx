import React from 'react';
import { useCorel } from '../../context/CorelContext';
import { Sliders, PaintBucket, Circle, Square, Minus, Sparkles } from 'lucide-react';
import { StrokeStyle, StrokeCap, StrokeJoin } from '../../types/coreldraw';

export const PropertiesDocker: React.FC = () => {
  const {
    primarySelectedObject,
    updateSelectedObjects,
    colorPalette,
    activeFillColor,
    setActiveFillColor,
    activeOutlineColor,
    setActiveOutlineColor,
  } = useCorel();

  if (!primarySelectedObject) {
    return (
      <div className="p-4 text-center text-gray-500 text-xs italic flex flex-col items-center justify-center h-48">
        <Sliders className="w-8 h-8 text-gray-600 mb-2" />
        Select an object to inspect and edit its vector properties
      </div>
    );
  }

  const obj = primarySelectedObject;

  return (
    <div className="flex-1 overflow-y-auto p-3 space-y-4 text-xs select-none text-gray-200">
      {/* Object Title & Type */}
      <div className="flex items-center justify-between border-b border-[#2d3748] pb-2">
        <input
          type="text"
          value={obj.name}
          onChange={e => updateSelectedObjects({ name: e.target.value })}
          className="bg-transparent font-bold text-white text-sm outline-none border-b border-transparent focus:border-blue-500"
        />
        <span className="text-[10px] px-1.5 py-0.5 bg-blue-500/20 text-blue-400 rounded uppercase font-semibold">
          {obj.type}
        </span>
      </div>

      {/* Fill Section */}
      <div className="space-y-2">
        <div className="flex items-center justify-between font-semibold text-gray-300">
          <span className="flex items-center"><PaintBucket className="w-3.5 h-3.5 mr-1.5 text-blue-400" /> Fill Properties</span>
          <select
            value={obj.fill.type}
            onChange={e => updateSelectedObjects({ fill: { ...obj.fill, type: e.target.value as any } })}
            className="bg-[#262e3d] text-white px-2 py-0.5 rounded border border-[#374151] outline-none text-[11px]"
          >
            <option value="none">No Fill</option>
            <option value="solid">Uniform Fill (Solid)</option>
            <option value="linear">Fountain Fill (Linear)</option>
            <option value="radial">Fountain Fill (Radial)</option>
          </select>
        </div>

        {obj.fill.type === 'solid' && (
          <div className="flex items-center space-x-2 bg-[#1b2029] p-2 rounded border border-[#2d3748]">
            <input
              type="color"
              value={obj.fill.color.startsWith('#') ? obj.fill.color : '#3b82f6'}
              onChange={e => {
                updateSelectedObjects({ fill: { type: 'solid', color: e.target.value } });
                setActiveFillColor(e.target.value);
              }}
              className="w-7 h-7 rounded border border-[#374151] cursor-pointer bg-transparent"
            />
            <input
              type="text"
              value={obj.fill.color}
              onChange={e => updateSelectedObjects({ fill: { type: 'solid', color: e.target.value } })}
              className="bg-[#262e3d] text-white px-2 py-1 rounded border border-[#374151] font-mono text-xs flex-1 outline-none"
            />
          </div>
        )}

        {/* Quick Swatches */}
        <div className="grid grid-cols-8 gap-1 pt-1">
          {colorPalette.slice(0, 16).map((color, i) => (
            <button
              key={i}
              onClick={() => {
                updateSelectedObjects({ fill: { type: 'solid', color } });
                setActiveFillColor(color);
              }}
              style={{ backgroundColor: color }}
              className="w-5 h-5 rounded-sm border border-[#374151] hover:scale-110 transition-transform"
              title={`Apply ${color}`}
            />
          ))}
        </div>
      </div>

      {/* Outline / Stroke Section */}
      <div className="space-y-2 border-t border-[#2d3748] pt-3">
        <div className="font-semibold text-gray-300 flex items-center justify-between">
          <span className="flex items-center"><Minus className="w-3.5 h-3.5 mr-1.5 text-emerald-400" /> Outline / Stroke</span>
          <span className="text-gray-400 font-mono text-[11px]">{obj.outline.width} px</span>
        </div>

        <div className="flex items-center space-x-2 bg-[#1b2029] p-2 rounded border border-[#2d3748]">
          <input
            type="color"
            value={obj.outline.color.startsWith('#') ? obj.outline.color : '#000000'}
            onChange={e => {
              updateSelectedObjects({ outline: { ...obj.outline, color: e.target.value } });
              setActiveOutlineColor(e.target.value);
            }}
            className="w-7 h-7 rounded border border-[#374151] cursor-pointer bg-transparent"
          />
          <div className="flex-1 space-y-1">
            <input
              type="range"
              min={0}
              max={24}
              value={obj.outline.width}
              onChange={e => updateSelectedObjects({ outline: { ...obj.outline, width: Number(e.target.value) } })}
              className="w-full h-1.5 bg-gray-600 rounded-lg cursor-pointer"
            />
          </div>
        </div>

        {/* Outline Style & Caps */}
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="text-[10px] text-gray-400">Dash Style</label>
            <select
              value={obj.outline.style}
              onChange={e => updateSelectedObjects({ outline: { ...obj.outline, style: e.target.value as StrokeStyle } })}
              className="w-full bg-[#262e3d] text-white px-2 py-1 rounded border border-[#374151] outline-none text-[11px] mt-0.5"
            >
              <option value="solid">Solid Line ───</option>
              <option value="dashed">Dashed ─ ─ ─</option>
              <option value="dotted">Dotted • • •</option>
              <option value="dash-dot">Dash-Dot ─ • ─</option>
            </select>
          </div>

          <div>
            <label className="text-[10px] text-gray-400">Line Cap</label>
            <select
              value={obj.outline.cap}
              onChange={e => updateSelectedObjects({ outline: { ...obj.outline, cap: e.target.value as StrokeCap } })}
              className="w-full bg-[#262e3d] text-white px-2 py-1 rounded border border-[#374151] outline-none text-[11px] mt-0.5"
            >
              <option value="round">Round Cap</option>
              <option value="square">Square Cap</option>
              <option value="butt">Flat Butt Cap</option>
            </select>
          </div>
        </div>
      </div>

      {/* Opacity Section */}
      <div className="space-y-2 border-t border-[#2d3748] pt-3">
        <div className="flex items-center justify-between font-semibold text-gray-300">
          <span>Uniform Transparency</span>
          <span className="text-gray-400 font-mono text-[11px]">{Math.round(obj.opacity * 100)}%</span>
        </div>
        <input
          type="range"
          min={0}
          max={1}
          step={0.05}
          value={obj.opacity}
          onChange={e => updateSelectedObjects({ opacity: Number(e.target.value) })}
          className="w-full h-1.5 bg-gray-600 rounded-lg cursor-pointer"
        />
      </div>
    </div>
  );
};
