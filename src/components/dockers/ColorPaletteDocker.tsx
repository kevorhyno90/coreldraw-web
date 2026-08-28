import React, { useState } from 'react';
import { useCorel } from '../../context/CorelContext';
import { Palette, Plus, Pipette } from 'lucide-react';

export const ColorPaletteDocker: React.FC = () => {
  const {
    colorPalette,
    setColorPalette,
    activeFillColor,
    setActiveFillColor,
    activeOutlineColor,
    setActiveOutlineColor,
    updateSelectedObjects,
  } = useCorel();

  const [newColorHex, setNewColorHex] = useState('#ff007f');

  const handleAddColor = () => {
    if (!colorPalette.includes(newColorHex)) {
      setColorPalette([...colorPalette, newColorHex]);
    }
  };

  return (
    <div className="flex-1 overflow-y-auto p-3 space-y-4 text-xs select-none text-gray-200">
      <div className="border-b border-[#2d3748] pb-2 flex items-center justify-between">
        <h3 className="font-bold text-white flex items-center">
          <Palette className="w-4 h-4 mr-1.5 text-pink-400" /> Color Harmonies & Palettes
        </h3>
        <span className="text-[10px] text-gray-400 font-mono">{colorPalette.length} swatches</span>
      </div>

      {/* Active Fill & Outline Indicators */}
      <div className="grid grid-cols-2 gap-2 bg-[#1b2029] p-2.5 rounded-lg border border-[#2d3748]">
        <div className="flex items-center space-x-2">
          <div
            style={{ backgroundColor: activeFillColor }}
            className="w-6 h-6 rounded border border-white/40 shadow-sm"
          />
          <div>
            <div className="text-[10px] text-gray-400">Active Fill</div>
            <div className="font-mono text-[11px] font-bold">{activeFillColor}</div>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <div
            style={{ backgroundColor: activeOutlineColor }}
            className="w-6 h-6 rounded border border-white/40 shadow-sm"
          />
          <div>
            <div className="text-[10px] text-gray-400">Active Outline</div>
            <div className="font-mono text-[11px] font-bold">{activeOutlineColor}</div>
          </div>
        </div>
      </div>

      {/* Swatches Grid */}
      <div>
        <div className="text-[11px] text-gray-400 mb-1.5 flex justify-between">
          <span>Document Swatches:</span>
          <span className="text-[10px] text-gray-500">Left-click = Fill, Right-click = Outline</span>
        </div>
        <div className="grid grid-cols-7 gap-1 bg-[#1b2029] p-2 rounded-lg border border-[#2d3748]">
          {colorPalette.map((col, idx) => (
            <button
              key={idx}
              onClick={() => {
                setActiveFillColor(col);
                updateSelectedObjects({ fill: { type: 'solid', color: col } });
              }}
              onContextMenu={e => {
                e.preventDefault();
                setActiveOutlineColor(col);
                updateSelectedObjects({ outline: { color: col } as any });
              }}
              style={{ backgroundColor: col }}
              className="w-6 h-6 rounded-sm border border-[#374151] hover:scale-115 transition-transform"
              title={`${col} (Left: Fill, Right: Outline)`}
            />
          ))}
        </div>
      </div>

      {/* Add Custom Swatch */}
      <div className="border-t border-[#2d3748] pt-3 space-y-2">
        <span className="text-[11px] text-gray-400">Add to Palette:</span>
        <div className="flex items-center space-x-2">
          <input
            type="color"
            value={newColorHex}
            onChange={e => setNewColorHex(e.target.value)}
            className="w-7 h-7 rounded border border-[#374151] cursor-pointer bg-transparent"
          />
          <input
            type="text"
            value={newColorHex}
            onChange={e => setNewColorHex(e.target.value)}
            className="bg-[#262e3d] text-white px-2 py-1 rounded border border-[#374151] font-mono text-xs flex-1 outline-none"
          />
          <button
            onClick={handleAddColor}
            className="p-1.5 bg-[#2563eb] hover:bg-blue-600 text-white rounded font-medium flex items-center"
          >
            <Plus className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
