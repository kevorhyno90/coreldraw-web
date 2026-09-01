import React, { useState } from 'react';
import { useCorel } from '../../context/CorelContext';
import { PANTONE_DUALITIES_2025, hexToCmyk } from '../../engine/pantoneDualities';
import { Palette, Plus, Search, Sparkles, Check } from 'lucide-react';

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

  const [activeTab, setActiveTab] = useState<'dualities' | 'document' | 'pms' | 'metallics'>('dualities');
  const [searchQuery, setSearchQuery] = useState('');
  const [newColorHex, setNewColorHex] = useState('#ff007f');

  const filteredPantone = PANTONE_DUALITIES_2025.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) || p.code.toLowerCase().includes(searchQuery.toLowerCase());
    if (activeTab === 'dualities') return matchesSearch && p.category === 'Dualities 2025';
    if (activeTab === 'pms') return matchesSearch && p.category === 'PMS Solid';
    if (activeTab === 'metallics') return matchesSearch && p.category === 'Metallics';
    return matchesSearch;
  });

  const handleApplyColor = (hex: string, pantoneInfo?: any) => {
    setActiveFillColor(hex);
    updateSelectedObjects({
      fill: {
        type: 'solid',
        color: hex,
        pantoneSpot: pantoneInfo ? {
          code: pantoneInfo.code,
          name: pantoneInfo.name,
          cmyk: pantoneInfo.cmyk,
        } : undefined,
      },
    });
  };

  const handleApplyOutline = (hex: string) => {
    setActiveOutlineColor(hex);
    updateSelectedObjects({
      outline: {
        color: hex,
      } as any,
    });
  };

  const activeCmyk = hexToCmyk(activeFillColor.startsWith('#') ? activeFillColor : '#3b82f6');

  return (
    <div className="flex-1 overflow-y-auto p-3 space-y-3 text-xs select-none text-gray-200">
      {/* Header */}
      <div className="border-b border-[#2d3748] pb-2 flex items-center justify-between">
        <h3 className="font-bold text-white flex items-center">
          <Palette className="w-4 h-4 mr-1.5 text-pink-400" />
          <span>Pantone Dualities 2025 & Palettes</span>
        </h3>
        <span className="text-[10px] text-pink-400 font-mono">175 Spot Shades</span>
      </div>

      {/* Active Fill & Outline Indicators + CMYK Breakdown */}
      <div className="grid grid-cols-2 gap-2 bg-[#1b2029] p-2.5 rounded-xl border border-[#2d3748]">
        <div className="flex items-center space-x-2">
          <div
            style={{ backgroundColor: activeFillColor }}
            className="w-7 h-7 rounded-lg border border-white/30 shadow-md"
          />
          <div>
            <div className="text-[10px] text-gray-400">Fill (CMYK)</div>
            <div className="font-mono text-[10px] text-cyan-300 font-bold">
              C:{activeCmyk[0]} M:{activeCmyk[1]} Y:{activeCmyk[2]} K:{activeCmyk[3]}
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <div
            style={{ backgroundColor: activeOutlineColor }}
            className="w-7 h-7 rounded-lg border border-white/30 shadow-md"
          />
          <div>
            <div className="text-[10px] text-gray-400">Outline</div>
            <div className="font-mono text-[11px] font-bold text-gray-200">{activeOutlineColor}</div>
          </div>
        </div>
      </div>

      {/* Library Tabs */}
      <div className="flex gap-1 bg-[#14171f] p-1 rounded-xl border border-gray-800">
        <button
          onClick={() => setActiveTab('dualities')}
          className={`flex-1 py-1 text-[10px] font-medium rounded-lg transition-all ${
            activeTab === 'dualities' ? 'bg-pink-600 text-white shadow' : 'text-gray-400 hover:text-gray-200'
          }`}
        >
          ✨ Dualities 2025
        </button>
        <button
          onClick={() => setActiveTab('pms')}
          className={`flex-1 py-1 text-[10px] font-medium rounded-lg transition-all ${
            activeTab === 'pms' ? 'bg-pink-600 text-white shadow' : 'text-gray-400 hover:text-gray-200'
          }`}
        >
          PMS Solid
        </button>
        <button
          onClick={() => setActiveTab('metallics')}
          className={`flex-1 py-1 text-[10px] font-medium rounded-lg transition-all ${
            activeTab === 'metallics' ? 'bg-pink-600 text-white shadow' : 'text-gray-400 hover:text-gray-200'
          }`}
        >
          Metallics
        </button>
        <button
          onClick={() => setActiveTab('document')}
          className={`flex-1 py-1 text-[10px] font-medium rounded-lg transition-all ${
            activeTab === 'document' ? 'bg-pink-600 text-white shadow' : 'text-gray-400 hover:text-gray-200'
          }`}
        >
          Document
        </button>
      </div>

      {/* Search Spot Colors */}
      {activeTab !== 'document' && (
        <div className="relative">
          <Search size={13} className="absolute left-2.5 top-2.5 text-gray-400" />
          <input
            type="text"
            placeholder="Search Pantone shades (e.g. Cobalt, Gold)..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 bg-[#1b2029] border border-gray-700/80 rounded-xl text-gray-200 text-xs outline-none focus:border-pink-500"
          />
        </div>
      )}

      {/* Pantone Spot Color List */}
      {activeTab !== 'document' ? (
        <div className="max-h-72 overflow-y-auto space-y-1.5 pr-1">
          {filteredPantone.map(p => (
            <div
              key={p.code}
              onClick={() => handleApplyColor(p.hex, p)}
              onContextMenu={e => {
                e.preventDefault();
                handleApplyOutline(p.hex);
              }}
              className="flex items-center justify-between p-2 rounded-xl bg-[#1b2029]/80 hover:bg-[#252d3a] border border-gray-800/80 cursor-pointer transition-all hover:scale-[1.01]"
              title={`${p.name} (${p.code}) - Left Click: Fill, Right Click: Outline`}
            >
              <div className="flex items-center gap-2.5">
                <div
                  className="w-6 h-6 rounded-lg border border-white/20 shadow-sm"
                  style={{ backgroundColor: p.hex }}
                />
                <div>
                  <div className="font-semibold text-gray-200 text-[11px]">{p.name}</div>
                  <div className="text-[10px] text-pink-400 font-mono">{p.code}</div>
                </div>
              </div>
              <div className="text-[9px] text-gray-500 font-mono text-right">
                C:{p.cmyk[0]} M:{p.cmyk[1]}<br />Y:{p.cmyk[2]} K:{p.cmyk[3]}
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* Document Swatches Grid */
        <div>
          <div className="text-[11px] text-gray-400 mb-1.5 flex justify-between">
            <span>Palette Swatches:</span>
            <span className="text-[10px] text-gray-500">Left: Fill, Right: Outline</span>
          </div>
          <div className="grid grid-cols-7 gap-1 bg-[#1b2029] p-2 rounded-xl border border-[#2d3748]">
            {colorPalette.map((col, idx) => (
              <button
                key={idx}
                onClick={() => handleApplyColor(col)}
                onContextMenu={e => {
                  e.preventDefault();
                  handleApplyOutline(col);
                }}
                style={{ backgroundColor: col }}
                className="w-6 h-6 rounded-md border border-[#374151] hover:scale-110 transition-transform"
                title={`${col}`}
              />
            ))}
          </div>

          {/* Add custom color */}
          <div className="pt-3 flex items-center space-x-2">
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
              className="bg-[#262e3d] text-white px-2 py-1 rounded-lg border border-[#374151] font-mono text-xs flex-1 outline-none"
            />
            <button
              onClick={() => {
                if (!colorPalette.includes(newColorHex)) {
                  setColorPalette([...colorPalette, newColorHex]);
                }
              }}
              className="p-1.5 bg-pink-600 hover:bg-pink-500 text-white rounded-lg font-medium flex items-center"
            >
              <Plus className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
