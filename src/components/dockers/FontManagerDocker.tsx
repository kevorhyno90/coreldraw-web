import React, { useState, useMemo, useRef } from 'react';
import { useCorel } from '../../context/CorelContext';
import { GOOGLE_FONTS_CATALOG, loadGoogleFont } from '../../engine/googleFontsLibrary';
import {
  Type,
  Search,
  Sliders,
  Star,
  Download,
  Sparkles,
  Check,
  ChevronLeft,
  ChevronRight,
  Grid,
  List,
  Layers,
  FileText,
  Plus,
} from 'lucide-react';

const COMMON_GLYPHS = [
  'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z',
  'a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z',
  '0', '1', '2', '3', '4', '5', '6', '7', '8', '9',
  '!', '@', '#', '$', '%', '^', '&', '*', '(', ')', '_', '+', '=', '{', '}', '[', ']', ':', ';', '"', '\'', '<', '>', ',', '.', '?', '/',
  '€', '£', '¥', '©', '®', '™', '°', '±', '×', '÷', '→', '←', '↑', '↓', '★', '♥', '✔', '⚡', '✦', '▲', '●', '◆'
];

const WATERFALL_SIZES = [14, 18, 24, 32, 48, 64];

export const FontManagerDocker: React.FC = () => {
  const {
    primarySelectedObject,
    updateObject,
    addObject,
    activePage,
  } = useCorel();

  const [activeTab, setActiveTab] = useState<'catalog' | 'variable' | 'glyphs' | 'waterfall'>('catalog');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [activeFont, setActiveFont] = useState<string>('Montserrat');
  const [previewText, setPreviewText] = useState('CorelDRAW 2025');
  const [layoutMode, setLayoutMode] = useState<'list' | 'grid'>('list');
  const [variableWeight, setVariableWeight] = useState(700);
  const [variableSlant, setVariableSlant] = useState(0);

  const categoryScrollRef = useRef<HTMLDivElement>(null);

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
          fontSize: 36,
          fontWeight: variableWeight,
          fontStyle: 'normal',
          textDecoration: 'none',
          textAlign: 'center',
          letterSpacing: 0,
          lineHeight: 1.2,
          variableWeight,
          variableSlant,
        },
        fill: { type: 'solid', color: '#ffffff' },
        outline: { color: 'none', width: 0, style: 'solid', cap: 'round', join: 'round', startArrow: 'none', endArrow: 'none' },
      });
    }
  };

  const handleInsertGlyph = (glyph: string) => {
    if (primarySelectedObject && primarySelectedObject.type === 'text') {
      updateObject(primarySelectedObject.id, {
        textProps: {
          ...primarySelectedObject.textProps!,
          text: primarySelectedObject.textProps!.text + glyph,
        },
      });
    } else {
      addObject({
        name: `Glyph (${glyph})`,
        type: 'text',
        transform: {
          x: activePage.width / 2 - 30,
          y: activePage.height / 2 - 30,
          width: 60,
          height: 60,
          rotation: 0,
          scaleX: 1,
          scaleY: 1,
          skewX: 0,
          skewY: 0,
        },
        textProps: {
          text: glyph,
          fontFamily: activeFont,
          fontSize: 48,
          fontWeight: variableWeight,
          fontStyle: 'normal',
          textDecoration: 'none',
          textAlign: 'center',
          letterSpacing: 0,
          lineHeight: 1,
        },
        fill: { type: 'solid', color: '#ffffff' },
        outline: { color: 'none', width: 0, style: 'solid', cap: 'round', join: 'round', startArrow: 'none', endArrow: 'none' },
      });
    }
  };

  const scrollCategory = (dir: 'left' | 'right') => {
    if (categoryScrollRef.current) {
      categoryScrollRef.current.scrollBy({
        left: dir === 'left' ? -120 : 120,
        behavior: 'smooth',
      });
    }
  };

  return (
    <div className="flex flex-col h-full bg-[#181a20] text-gray-200 text-xs overflow-hidden divide-y divide-gray-800">
      {/* Header */}
      <div className="p-3 bg-gradient-to-r from-emerald-950/40 via-teal-950/30 to-blue-950/40 border-b border-gray-800 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-emerald-500/20 text-emerald-400 rounded-lg">
            <Type size={16} />
          </div>
          <div>
            <div className="font-bold text-gray-100 uppercase tracking-wider text-[11px]">
              Corel Font Manager 2025
            </div>
            <div className="text-[10px] text-gray-400">
              300+ Google Fonts & Glyphs
            </div>
          </div>
        </div>

        {/* Top View Mode Switcher Pills */}
        <div className="flex items-center space-x-0.5 bg-gray-900/90 rounded-lg p-0.5 border border-gray-700/60">
          <button
            onClick={() => setLayoutMode('list')}
            title="List View"
            className={`p-1 rounded ${layoutMode === 'list' ? 'bg-emerald-600 text-white' : 'text-gray-400'}`}
          >
            <List size={12} />
          </button>
          <button
            onClick={() => setLayoutMode('grid')}
            title="Side-by-Side Grid View"
            className={`p-1 rounded ${layoutMode === 'grid' ? 'bg-emerald-600 text-white' : 'text-gray-400'}`}
          >
            <Grid size={12} />
          </button>
        </div>
      </div>

      {/* Sideways Navigation Tabs (Catalog, Variable Studio, Glyphs, Waterfall) */}
      <div className="flex items-center bg-[#13161c] px-2 py-1 gap-1 border-b border-gray-800 overflow-x-auto scrollbar-none">
        {[
          { id: 'catalog', label: 'Catalog', icon: Type },
          { id: 'variable', label: 'Variable Studio', icon: Sliders },
          { id: 'glyphs', label: 'Glyph Map', icon: Sparkles },
          { id: 'waterfall', label: 'Waterfall', icon: FileText },
        ].map(tab => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-medium flex items-center gap-1.5 transition-all whitespace-nowrap ${
                isActive
                  ? 'bg-emerald-600 text-white shadow-sm font-semibold'
                  : 'text-gray-400 hover:text-gray-200 hover:bg-gray-800/60'
              }`}
            >
              <Icon size={12} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* TAB 1: CATALOG */}
      {activeTab === 'catalog' && (
        <div className="flex-1 flex flex-col overflow-hidden divide-y divide-gray-800">
          {/* Search and Category Filter with Sideways Arrows */}
          <div className="p-3 flex flex-col gap-2 bg-[#14171f]/80">
            <div className="relative">
              <Search size={14} className="absolute left-2.5 top-2.5 text-gray-400" />
              <input
                type="text"
                placeholder="Search 300+ fonts (Montserrat, Playfair, Bebas)..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 bg-gray-900 border border-gray-700/80 rounded-xl text-gray-200 text-xs outline-none focus:border-emerald-500 transition-colors"
              />
            </div>

            {/* Custom Sample Text Input */}
            <div className="flex items-center gap-1.5 bg-gray-900/60 px-2 py-1 rounded-lg border border-gray-800">
              <span className="text-[10px] text-gray-400 font-bold uppercase">Sample:</span>
              <input
                type="text"
                value={previewText}
                onChange={e => setPreviewText(e.target.value)}
                className="w-full bg-transparent text-gray-200 outline-none text-xs"
                placeholder="Type preview text..."
              />
            </div>

            {/* Category Pills with Left / Right Navigation */}
            <div className="relative flex items-center">
              <button
                onClick={() => scrollCategory('left')}
                className="p-1 hover:bg-gray-800 text-gray-400 hover:text-white rounded-l"
                title="Scroll categories left"
              >
                <ChevronLeft size={13} />
              </button>

              <div
                ref={categoryScrollRef}
                className="flex-1 flex gap-1 overflow-x-auto py-0.5 scrollbar-none px-1"
              >
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

              <button
                onClick={() => scrollCategory('right')}
                className="p-1 hover:bg-gray-800 text-gray-400 hover:text-white rounded-r"
                title="Scroll categories right"
              >
                <ChevronRight size={13} />
              </button>
            </div>
          </div>

          {/* Font Cards List / Grid */}
          <div className="flex-1 overflow-y-auto overflow-x-hidden p-2.5">
            <div className={`grid gap-2 ${layoutMode === 'grid' ? 'grid-cols-1 md:grid-cols-2' : 'grid-cols-1'}`}>
              {filteredFonts.map(font => {
                const isSelected = activeFont === font.family;
                return (
                  <div
                    key={font.family}
                    onClick={() => handleApplyFont(font.family)}
                    onMouseEnter={() => loadGoogleFont(font.family)}
                    className={`p-2.5 rounded-xl border cursor-pointer transition-all flex flex-col gap-1 ${
                      isSelected
                        ? 'bg-emerald-950/40 border-emerald-500/60 shadow-md shadow-emerald-950/30'
                        : 'bg-gray-900/60 hover:bg-gray-800/80 border-gray-800/80'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5 truncate">
                        <span className="font-semibold text-gray-200 truncate">{font.family}</span>
                        {font.isVariable && (
                          <span className="text-[8px] bg-emerald-900/60 text-emerald-300 border border-emerald-700/50 px-1 py-0.2 rounded font-mono">
                            VAR
                          </span>
                        )}
                      </div>
                      <span className="text-[9px] text-gray-500 capitalize">{font.category}</span>
                    </div>

                    {/* Live Preview Specimen */}
                    <div
                      className="text-gray-100 text-lg overflow-hidden text-ellipsis whitespace-nowrap py-1"
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
        </div>
      )}

      {/* TAB 2: VARIABLE STUDIO */}
      {activeTab === 'variable' && (
        <div className="flex-1 overflow-y-auto p-3 flex flex-col gap-4">
          <div className="flex items-center justify-between bg-emerald-950/30 p-2.5 rounded-xl border border-emerald-800/40">
            <div>
              <div className="text-[10px] text-gray-400 uppercase font-bold">Active Typeface</div>
              <div className="text-sm font-bold text-emerald-400">{activeFont}</div>
            </div>
            <span className="text-[10px] bg-emerald-900/60 text-emerald-300 px-2 py-0.5 rounded font-mono">
              Variable Axes
            </span>
          </div>

          {/* Weight Slider */}
          <div className="flex flex-col gap-1.5 bg-gray-900 p-3 rounded-xl border border-gray-800">
            <div className="flex justify-between text-xs">
              <span className="text-gray-300 font-medium">Weight Axis (wght)</span>
              <span className="text-emerald-400 font-mono font-bold">{variableWeight}</span>
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
              className="w-full accent-emerald-500 h-2 bg-gray-700 rounded-lg cursor-pointer"
            />
            <div className="flex justify-between text-[9px] text-gray-500 font-mono">
              <span>Thin (100)</span>
              <span>Regular (400)</span>
              <span>Black (900)</span>
            </div>
          </div>

          {/* Slant / Oblique Slider */}
          <div className="flex flex-col gap-1.5 bg-gray-900 p-3 rounded-xl border border-gray-800">
            <div className="flex justify-between text-xs">
              <span className="text-gray-300 font-medium">Slant Axis (slnt)</span>
              <span className="text-emerald-400 font-mono font-bold">{variableSlant}°</span>
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
              className="w-full accent-emerald-500 h-2 bg-gray-700 rounded-lg cursor-pointer"
            />
            <div className="flex justify-between text-[9px] text-gray-500 font-mono">
              <span>Backslant (-10°)</span>
              <span>Upright (0°)</span>
              <span>Italic (+20°)</span>
            </div>
          </div>

          {/* Live Specimen Preview */}
          <div className="bg-black/40 p-4 rounded-xl border border-gray-800 text-center">
            <div
              className="text-2xl text-white py-2"
              style={{
                fontFamily: `"${activeFont}", sans-serif`,
                fontWeight: variableWeight,
                fontStyle: variableSlant !== 0 ? 'italic' : 'normal',
              }}
            >
              {previewText || 'CorelDRAW 2025'}
            </div>
            <p className="text-[10px] text-gray-500 mt-2 font-mono">
              font-family: "{activeFont}"; font-weight: {variableWeight};
            </p>
          </div>
        </div>
      )}

      {/* TAB 3: GLYPH MAP & CHARACTER INSPECTOR */}
      {activeTab === 'glyphs' && (
        <div className="flex-1 overflow-y-auto p-3 flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-gray-400 uppercase">
              Unicode Glyphs & Symbols ({COMMON_GLYPHS.length})
            </span>
            <span className="text-[10px] text-emerald-400">{activeFont}</span>
          </div>

          <div className="grid grid-cols-6 sm:grid-cols-8 gap-1.5 bg-gray-900/60 p-2 rounded-xl border border-gray-800">
            {COMMON_GLYPHS.map((g, idx) => (
              <button
                key={idx}
                onClick={() => handleInsertGlyph(g)}
                title={`Insert glyph: ${g}`}
                style={{ fontFamily: `"${activeFont}", sans-serif` }}
                className="h-10 rounded-lg bg-gray-800/80 hover:bg-emerald-600 hover:text-white text-gray-200 text-base font-semibold flex items-center justify-center transition-all shadow-sm active:scale-95"
              >
                {g}
              </button>
            ))}
          </div>
          <p className="text-[10px] text-gray-500 italic text-center">
            Click any character or symbol to insert it directly onto your canvas or active text.
          </p>
        </div>
      )}

      {/* TAB 4: WATERFALL SPECIMEN */}
      {activeTab === 'waterfall' && (
        <div className="flex-1 overflow-y-auto p-3 flex flex-col gap-3 divide-y divide-gray-800/60">
          <div className="flex items-center justify-between pb-2">
            <span className="text-[10px] font-bold text-gray-400 uppercase">
              Waterfall Type Scale Specimen
            </span>
            <span className="text-emerald-400 font-bold">{activeFont}</span>
          </div>

          {WATERFALL_SIZES.map(sz => (
            <div key={sz} className="pt-2 flex flex-col gap-0.5">
              <span className="text-[9px] text-gray-500 font-mono">{sz}px</span>
              <div
                style={{
                  fontFamily: `"${activeFont}", sans-serif`,
                  fontSize: `${sz}px`,
                  fontWeight: variableWeight,
                  lineHeight: 1.2,
                }}
                className="text-gray-100 overflow-hidden text-ellipsis whitespace-nowrap"
              >
                {previewText || 'CorelDRAW 2025 Graphics Suite'}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
