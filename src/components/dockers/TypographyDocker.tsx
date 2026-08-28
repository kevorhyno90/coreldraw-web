import React, { useState } from 'react';
import { useCorel } from '../../context/CorelContext';
import {
  Type,
  Bold,
  Italic,
  Underline,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  CaseSensitive,
  Sparkles,
} from 'lucide-react';

const FONT_LIBRARY = [
  { name: 'Outfit', category: 'Modern Geometric Sans' },
  { name: 'Inter', category: 'Precision UI Sans' },
  { name: 'Montserrat', category: 'Clean Editorial Sans' },
  { name: 'Bebas Neue', category: 'All-Caps Display Poster' },
  { name: 'Cinzel', category: 'Classical Roman Inscriptional' },
  { name: 'Playfair Display', category: 'High-Contrast Luxury Serif' },
  { name: 'Space Grotesk', category: 'Cyberpunk & Tech Sans' },
  { name: 'JetBrains Mono', category: 'Code & Technical Monospace' },
];

const GLYPHS = [
  '©', '®', '™', '•', '—', '–', '°', '★', '✦', '◆', '▲', '➔', '→', '✓', '✕', '§', '¶', '℃', '℉', '€', '£', '¥', '₿', '♥', '⚡', '∞',
];

export const TypographyDocker: React.FC = () => {
  const { primarySelectedObject, updateObject, addObject, activeFillColor } = useCorel();
  const [sampleText, setSampleText] = useState('Corel Typography');

  const textProps = primarySelectedObject?.textProps || {
    text: sampleText,
    fontFamily: 'Outfit',
    fontSize: 36,
    fontWeight: 700,
    fontStyle: 'normal',
    textDecoration: 'none',
    textAlign: 'left',
    letterSpacing: 1,
    lineHeight: 1.2,
  };

  const updateText = (patch: Partial<typeof textProps>) => {
    if (!primarySelectedObject || primarySelectedObject.type !== 'text') {
      // Create new text object if none selected
      addObject({
        name: 'Artistic Text',
        type: 'text',
        transform: {
          x: 150,
          y: 150,
          width: 300,
          height: 60,
          rotation: 0,
          scaleX: 1,
          scaleY: 1,
          skewX: 0,
          skewY: 0,
        },
        textProps: { ...textProps, ...patch },
        fill: { type: 'solid', color: activeFillColor },
        outline: { color: 'none', width: 0, style: 'solid', cap: 'round', join: 'round', startArrow: 'none', endArrow: 'none' },
      });
      return;
    }
    updateObject(primarySelectedObject.id, {
      textProps: { ...textProps, ...patch },
    });
  };

  const transformCase = (mode: 'upper' | 'lower' | 'title') => {
    if (!primarySelectedObject?.textProps) return;
    const current = primarySelectedObject.textProps.text;
    let converted = current;
    if (mode === 'upper') converted = current.toUpperCase();
    else if (mode === 'lower') converted = current.toLowerCase();
    else if (mode === 'title') {
      converted = current.replace(/\w\S*/g, txt => txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase());
    }
    updateText({ text: converted });
  };

  const insertGlyph = (g: string) => {
    if (primarySelectedObject?.textProps) {
      updateText({ text: primarySelectedObject.textProps.text + g });
    } else {
      updateText({ text: sampleText + g });
    }
  };

  return (
    <div className="p-3 space-y-4 text-xs select-none">
      {/* Header */}
      <div className="bg-[#171b22] p-2.5 rounded-lg border border-[#2d3748] space-y-1.5">
        <span className="font-bold text-white flex items-center">
          <Type className="w-4 h-4 mr-1.5 text-emerald-400" /> Typography & Font Manager
        </span>
        <p className="text-gray-400 text-[11px] leading-relaxed">
          Select, preview, and format Google vector typography, tracking, kerning, and special glyphs.
        </p>
      </div>

      {/* Font Family Catalog */}
      <div className="space-y-2">
        <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 block">
          Font Family Library
        </span>
        <div className="space-y-1 max-h-[160px] overflow-y-auto pr-1">
          {FONT_LIBRARY.map(font => {
            const isSelected = textProps.fontFamily.includes(font.name);
            return (
              <div
                key={font.name}
                onClick={() => updateText({ fontFamily: font.name })}
                className={`p-2 rounded-lg border cursor-pointer transition flex items-center justify-between ${
                  isSelected
                    ? 'bg-[#2563eb]/20 border-blue-500 text-white'
                    : 'bg-[#171b22] border-[#2d3748] hover:bg-[#242b38] text-gray-300'
                }`}
              >
                <div>
                  <div className="text-sm font-semibold" style={{ fontFamily: font.name }}>
                    {font.name}
                  </div>
                  <div className="text-[10px] text-gray-400">{font.category}</div>
                </div>
                {isSelected && <span className="text-emerald-400 text-xs font-bold">✓</span>}
              </div>
            );
          })}
        </div>
      </div>

      {/* Typography Controls */}
      <div className="space-y-3 bg-[#171b22] p-2.5 rounded-lg border border-[#2d3748]">
        <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 block">
          Character Formatting & Metrics
        </span>

        {/* Font Size & Weight */}
        <div className="grid grid-cols-2 gap-2">
          <div>
            <span className="text-gray-400 text-[11px] block mb-1">Font Size</span>
            <input
              type="number"
              min={6}
              max={200}
              value={textProps.fontSize}
              onChange={e => updateText({ fontSize: Number(e.target.value) })}
              className="w-full bg-[#262e3d] text-white px-2 py-1 rounded border border-[#374151] outline-none text-right font-mono"
            />
          </div>
          <div>
            <span className="text-gray-400 text-[11px] block mb-1">Tracking (Letter Spacing)</span>
            <input
              type="number"
              min={-5}
              max={50}
              step={0.5}
              value={textProps.letterSpacing}
              onChange={e => updateText({ letterSpacing: Number(e.target.value) })}
              className="w-full bg-[#262e3d] text-white px-2 py-1 rounded border border-[#374151] outline-none text-right font-mono"
            />
          </div>
        </div>

        {/* Text Alignment & Styles */}
        <div className="flex items-center justify-between pt-1">
          <div className="flex items-center space-x-1 bg-[#262e3d] p-0.5 rounded border border-[#374151]">
            <button
              onClick={() => updateText({ fontWeight: textProps.fontWeight === 800 ? 400 : 800 })}
              className={`p-1 rounded ${textProps.fontWeight === 800 ? 'bg-[#3b82f6] text-white' : 'text-gray-400 hover:text-white'}`}
              title="Bold"
            >
              <Bold className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => updateText({ fontStyle: textProps.fontStyle === 'italic' ? 'normal' : 'italic' })}
              className={`p-1 rounded ${textProps.fontStyle === 'italic' ? 'bg-[#3b82f6] text-white' : 'text-gray-400 hover:text-white'}`}
              title="Italic"
            >
              <Italic className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="flex items-center space-x-1 bg-[#262e3d] p-0.5 rounded border border-[#374151]">
            <button
              onClick={() => updateText({ textAlign: 'left' })}
              className={`p-1 rounded ${textProps.textAlign === 'left' ? 'bg-[#3b82f6] text-white' : 'text-gray-400 hover:text-white'}`}
            >
              <AlignLeft className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => updateText({ textAlign: 'center' })}
              className={`p-1 rounded ${textProps.textAlign === 'center' ? 'bg-[#3b82f6] text-white' : 'text-gray-400 hover:text-white'}`}
            >
              <AlignCenter className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => updateText({ textAlign: 'right' })}
              className={`p-1 rounded ${textProps.textAlign === 'right' ? 'bg-[#3b82f6] text-white' : 'text-gray-400 hover:text-white'}`}
            >
              <AlignRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Case Transformer */}
        <div className="pt-2 border-t border-[#2d3748]">
          <span className="text-gray-400 text-[10px] uppercase font-bold block mb-1.5">Change Case</span>
          <div className="grid grid-cols-3 gap-1">
            <button
              onClick={() => transformCase('upper')}
              className="px-2 py-1 bg-[#242b38] hover:bg-[#323c4d] text-white rounded text-[10px] font-bold border border-[#374151]"
            >
              UPPERCASE
            </button>
            <button
              onClick={() => transformCase('lower')}
              className="px-2 py-1 bg-[#242b38] hover:bg-[#323c4d] text-white rounded text-[10px] font-bold border border-[#374151]"
            >
              lowercase
            </button>
            <button
              onClick={() => transformCase('title')}
              className="px-2 py-1 bg-[#242b38] hover:bg-[#323c4d] text-white rounded text-[10px] font-bold border border-[#374151]"
            >
              Title Case
            </button>
          </div>
        </div>
      </div>

      {/* Special Character & Glyphs Palette */}
      <div className="space-y-1.5 bg-[#171b22] p-2.5 rounded-lg border border-[#2d3748]">
        <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 block">
          Quick Glyphs & Symbols
        </span>
        <div className="grid grid-cols-8 gap-1">
          {GLYPHS.map(g => (
            <button
              key={g}
              onClick={() => insertGlyph(g)}
              title={`Insert ${g}`}
              className="w-7 h-7 bg-[#242b38] hover:bg-[#3b82f6] hover:text-white text-gray-300 rounded flex items-center justify-center text-xs font-mono font-bold transition border border-[#374151]"
            >
              {g}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
