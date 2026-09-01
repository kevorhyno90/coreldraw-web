import React, { useState, useMemo } from 'react';
import { useCorel } from '../../context/CorelContext';
import { GOOGLE_FONTS_CATALOG, loadGoogleFont } from '../../engine/googleFontsLibrary';
import { Type, Search, Sliders, Star, Download, Sparkles, Check } from 'lucide-react';

export const FontManagerDocker: React.FC = () => {
  const {
    primarySelectedObject,
    updateObject,
    addObject,
    activePage,
  } = useCorel();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [activeFont, setActiveFont] = useState<string>('Inter');
  const [previewText, setPreviewText] = useState('CorelDRAW 2025');
  const [fontSize, setFontSize] = useState(24);
  const [variableWeight, setVariableWeight] = useState(400);
  const [variableSlant, setVariableSlant] = useState(0);

  const filteredFonts = useMemo(() => {
    return GOOGLE_FONTS_CATALOG.filter(f => {
      const matchSearch = f.family.toLowerCase().includes(searchQuery.toLowerCase());
      const matchCat = selectedCategory === 'all' || f.category === selectedCategory || (selectedCategory === 'variable' && f.isVariable);
      return matchSearch && matchCat;
    });
  }, [searchQuery, selectedCategory]);

  const handleApplyFont = (fontFamily: string) => {
    loadGoogleFont(fontFamily);
    setActiveFont(fontFamily);

    if (primarySelectedObject && primarySelectedObject.type === 'text') {
      updateObject(primarySelectedObject.id, {
        textProps: {
          ...primarySelectedObject.textProps!,
          fontFamily,
          fontWeight: variableWeight,
          variableWeight,
          variableSlant,
        },
      });
    } else {
      // Create new text sample on canvas
      addObject({
        name: `Typography (${fontFamily})`,
        type: 'text',
        transform: {
          x: activePage.width / 2 - 150,
          y: activePage.height / 2 - 30,
          width: 300,
          height: 60,
          rotation: 0,
          scaleX: 1,
          scaleY: 1,
          skewX: 0,
          skewY: 0,
        },
        textProps: {
          text: previewText || 'CorelDRAW 2025',
          fontFamily,
          fontSize: 32,
          fontWeight: variableWeight,
          fontStyle: 'normal',
          textDecoration: 'none',
          textAlign: 'center',
          letterSpacing: 0,
          lineHeight: 1.2,
          variableWeight,
          variableSlant,
        },
      });
    }
  };

  return (
    <div className="flex flex-col h-full bg-[#181a20] text-gray-200 text-xs overflow-hidden divide-y divide-gray-800">
      {/* Header */}
      <div className="p-3 bg-gradient-to-r from-emerald-950/40 via-teal-950/30 to-blue-950/40 border-b border-gray-800">
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-emerald-500/20 text-emerald-400 rounded-lg">
            <Type size={16} />
          </div>
          <div>
            <div className="font-bold text-gray-100 uppercase tracking-wider text-[11px]">
              Corel Font Manager 2025
            </div>
            <div className="text-[10px] text-gray-400">
              300+ Google Fonts & Variable Font Studio
            </div>
          </div>
        </div>
      </div>

      {/* Search and Category Filter */}
      <div className="p-3 flex flex-col gap-2 bg-[#14171f]/80">
        <div className="relative">
          <Search size={14} className="absolute left-2.5 top-2.5 text-gray-400" />
          <input
            type="text"
            placeholder="Search fonts (e.g. Montserrat, Playfair)..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 bg-gray-900 border border-gray-700/80 rounded-xl text-gray-200 text-xs outline-none focus:border-emerald-500 transition-colors"
          />
        </div>

        {/* Category Pills */}
        <div className="flex gap-1 overflow-x-auto pb-1 scrollbar-none">
          {[
            { id: 'all', label: 'All' },
            { id: 'sans-serif', label: 'Sans-Serif' },
            { id: 'serif', label: 'Serif' },
            { id: 'display', label: 'Display' },
            { id: 'handwriting', label: 'Script' },
            { id: 'monospace', label: 'Monospace' },
            { id: 'variable', label: '✨ Variable' },
          ].map(cat => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-2.5 py-1 rounded-lg text-[10px] font-medium whitespace-nowrap transition-all ${
                selectedCategory === cat.id
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'bg-gray-800/80 text-gray-400 hover:text-gray-200'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Variable Font Dynamic Controls */}
      <div className="p-3 flex flex-col gap-2 bg-gray-900/40">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">
            Variable Font Controls
          </span>
          <span className="text-[10px] text-emerald-400 font-mono">
            {activeFont}
          </span>
        </div>

        <div className="grid grid-cols-2 gap-2">
          {/* Weight Slider */}
          <div className="flex flex-col gap-1 bg-gray-900 p-2 rounded-xl border border-gray-800">
            <div className="flex justify-between text-[10px] text-gray-400">
              <span>Weight</span>
              <span className="text-emerald-400 font-mono">{variableWeight}</span>
            </div>
            <input
              type="range"
              min="100"
              max="900"
              step="50"
              value={variableWeight}
              onChange={e => {
                const w = Number(e.target.value);
                setVariableWeight(w);
                if (primarySelectedObject?.type === 'text') {
                  updateObject(primarySelectedObject.id, {
                    textProps: { ...primarySelectedObject.textProps!, fontWeight: w, variableWeight: w },
                  });
                }
              }}
              className="w-full accent-emerald-500 h-1.5 bg-gray-700 rounded-lg cursor-pointer"
            />
          </div>

          {/* Slant Slider */}
          <div className="flex flex-col gap-1 bg-gray-900 p-2 rounded-xl border border-gray-800">
            <div className="flex justify-between text-[10px] text-gray-400">
              <span>Slant</span>
              <span className="text-emerald-400 font-mono">{variableSlant}°</span>
            </div>
            <input
              type="range"
              min="-10"
              max="20"
              value={variableSlant}
              onChange={e => {
                const s = Number(e.target.value);
                setVariableSlant(s);
                if (primarySelectedObject?.type === 'text') {
                  updateObject(primarySelectedObject.id, {
                    textProps: { ...primarySelectedObject.textProps!, variableSlant: s },
                  });
                }
              }}
              className="w-full accent-emerald-500 h-1.5 bg-gray-700 rounded-lg cursor-pointer"
            />
          </div>
        </div>
      </div>

      {/* Font List */}
      <div className="flex-1 overflow-y-auto p-2 flex flex-col gap-2">
        {filteredFonts.map(font => {
          const isSelected = activeFont === font.family;
          return (
            <div
              key={font.family}
              onClick={() => handleApplyFont(font.family)}
              onMouseEnter={() => loadGoogleFont(font.family)}
              className={`p-2.5 rounded-xl border cursor-pointer transition-all flex flex-col gap-1.5 ${
                isSelected
                  ? 'bg-emerald-950/40 border-emerald-500/60 shadow-md shadow-emerald-950/30'
                  : 'bg-gray-900/60 hover:bg-gray-800/80 border-gray-800/80'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-gray-200">{font.family}</span>
                  {font.isVariable && (
                    <span className="text-[9px] bg-emerald-900/60 text-emerald-300 border border-emerald-700/50 px-1.5 py-0.2 rounded">
                      VAR
                    </span>
                  )}
                </div>
                <span className="text-[10px] text-gray-500 capitalize">{font.category}</span>
              </div>

              {/* Live Preview Text */}
              <div
                className="text-gray-100 text-base overflow-hidden text-ellipsis whitespace-nowrap py-1"
                style={{
                  fontFamily: `"${font.family}", sans-serif`,
                  fontWeight: variableWeight,
                }}
              >
                {previewText || 'CorelDRAW 2025'}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
