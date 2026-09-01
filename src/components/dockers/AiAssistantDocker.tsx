import React, { useState } from 'react';
import { useCorel } from '../../context/CorelContext';
import {
  Bot,
  Sparkles,
  Wand2,
  Palette,
  Type,
  Flame,
  Layers,
  Crown,
  Zap,
  Rocket,
  Sun,
  Shield,
  Plus,
  Check,
  CheckCircle2,
  Copy,
  ChevronRight,
} from 'lucide-react';
import { rectToSubpaths, starToSubpaths, polygonToSubpaths } from '../../engine/vectorMath';
import { loadGoogleFont } from '../../engine/googleFontsLibrary';
import { CorelObject } from '../../types/coreldraw';

interface WordStylePreset {
  id: string;
  name: string;
  category: string;
  icon: string;
  fontFamily: string;
  fontSize: number;
  fontWeight: number;
  letterSpacing: number;
  fillColor: string;
  outlineColor: string;
  outlineWidth: number;
  shadowColor?: string;
  shadowBlur?: number;
  extrudeDepth?: number;
  extrudeAngle?: number;
  extrudeColor?: string;
  hasBadge?: boolean;
  badgeShape?: 'hex' | 'rect' | 'star' | 'circle';
  badgeFill?: string;
  badgeStroke?: string;
  previewBg: string;
}

const AI_WORD_STYLES: WordStylePreset[] = [
  {
    id: 'cyberpunk',
    name: '3D Chrome Cyberpunk',
    category: 'Futuristic & Sci-Fi',
    icon: '⚡',
    fontFamily: 'Orbitron',
    fontSize: 54,
    fontWeight: 900,
    letterSpacing: 4,
    fillColor: '#06b6d4',
    outlineColor: '#ec4899',
    outlineWidth: 2,
    shadowColor: '#06b6d4',
    shadowBlur: 16,
    extrudeDepth: 24,
    extrudeAngle: 45,
    extrudeColor: '#1e1b4b',
    hasBadge: true,
    badgeShape: 'hex',
    badgeFill: '#0f172a',
    badgeStroke: '#06b6d4',
    previewBg: 'from-cyan-950 via-slate-900 to-pink-950',
  },
  {
    id: 'luxury-gold',
    name: 'Royal Gold & Foil',
    category: 'Elegance & Luxury',
    icon: '👑',
    fontFamily: 'Cinzel',
    fontSize: 48,
    fontWeight: 800,
    letterSpacing: 6,
    fillColor: '#fef08a',
    outlineColor: '#d97706',
    outlineWidth: 1.5,
    shadowColor: '#000000',
    shadowBlur: 12,
    extrudeDepth: 18,
    extrudeAngle: 60,
    extrudeColor: '#78350f',
    hasBadge: true,
    badgeShape: 'rect',
    badgeFill: '#1c1917',
    badgeStroke: '#d97706',
    previewBg: 'from-amber-950 via-stone-900 to-yellow-950',
  },
  {
    id: 'retro-hotrod',
    name: 'Vintage Hot Rod Block Shadow',
    category: 'Retro & Badge',
    icon: '🏎️',
    fontFamily: 'Alfa Slab One',
    fontSize: 50,
    fontWeight: 700,
    letterSpacing: 2,
    fillColor: '#f97316',
    outlineColor: '#ffffff',
    outlineWidth: 3,
    shadowColor: '#000000',
    shadowBlur: 4,
    extrudeDepth: 28,
    extrudeAngle: 120,
    extrudeColor: '#991b1b',
    hasBadge: true,
    badgeShape: 'rect',
    badgeFill: '#18181b',
    badgeStroke: '#f97316',
    previewBg: 'from-red-950 via-neutral-900 to-orange-950',
  },
  {
    id: 'synthwave-neon',
    name: 'Synthwave Glow 80s',
    category: 'Vaporwave & Neon',
    icon: '🌸',
    fontFamily: 'Righteous',
    fontSize: 52,
    fontWeight: 700,
    letterSpacing: 3,
    fillColor: '#ec4899',
    outlineColor: '#38bdf8',
    outlineWidth: 2.5,
    shadowColor: '#ec4899',
    shadowBlur: 20,
    extrudeDepth: 16,
    extrudeAngle: 45,
    extrudeColor: '#312e81',
    hasBadge: true,
    badgeShape: 'circle',
    badgeFill: '#1e1b4b',
    badgeStroke: '#ec4899',
    previewBg: 'from-pink-950 via-indigo-950 to-purple-950',
  },
  {
    id: 'street-graffiti',
    name: 'Urban Streetwear & Comic',
    category: 'Graffiti & Posters',
    icon: '🔥',
    fontFamily: 'Bangers',
    fontSize: 56,
    fontWeight: 700,
    letterSpacing: 2,
    fillColor: '#facc15',
    outlineColor: '#000000',
    outlineWidth: 4,
    shadowColor: '#ef4444',
    shadowBlur: 8,
    extrudeDepth: 22,
    extrudeAngle: 45,
    extrudeColor: '#000000',
    hasBadge: true,
    badgeShape: 'star',
    badgeFill: '#000000',
    badgeStroke: '#facc15',
    previewBg: 'from-yellow-950 via-zinc-900 to-red-950',
  },
  {
    id: 'editorial-chic',
    name: 'Editorial Chic & Vogue',
    category: 'Fashion & Minimal',
    icon: '✨',
    fontFamily: 'Playfair Display',
    fontSize: 48,
    fontWeight: 800,
    letterSpacing: 5,
    fillColor: '#ffffff',
    outlineColor: '#e2e8f0',
    outlineWidth: 1,
    shadowColor: '#000000',
    shadowBlur: 10,
    extrudeDepth: 10,
    extrudeAngle: 45,
    extrudeColor: '#334155',
    hasBadge: true,
    badgeShape: 'rect',
    badgeFill: '#0f172a',
    badgeStroke: '#64748b',
    previewBg: 'from-slate-950 via-gray-900 to-zinc-950',
  },
];

export const AiAssistantDocker: React.FC = () => {
  const {
    activePage,
    addObject,
    setColorPalette,
    primarySelectedObject,
    updateObject,
  } = useCorel();

  const [activeSubTab, setActiveSubTab] = useState<'words' | 'emblems' | 'colors'>('words');
  const [inputWord, setInputWord] = useState('CYBERPUNK');
  const [customAiPrompt, setCustomAiPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [lastAction, setLastAction] = useState<string | null>(null);

  // Generate Styled Word Art onto Canvas
  const handleInsertWordArt = (preset: WordStylePreset) => {
    loadGoogleFont(preset.fontFamily);
    const wordText = inputWord.trim() || 'CORELDRAW';
    const textWidth = Math.max(260, wordText.length * (preset.fontSize * 0.7));
    const textHeight = preset.fontSize * 1.5;
    const cx = activePage.width / 2 - textWidth / 2;
    const cy = activePage.height / 2 - textHeight / 2;

    // 1. Optional Decorative AI Badge Backdrop
    if (preset.hasBadge) {
      const pad = 40;
      const bW = textWidth + pad * 2;
      const bH = textHeight + pad * 2;
      const bX = cx - pad;
      const bY = cy - pad;

      if (preset.badgeShape === 'hex') {
        addObject({
          name: `AI Backdrop (${preset.name})`,
          type: 'polygon',
          transform: { x: bX, y: bY, width: bW, height: bH, rotation: 0, scaleX: 1, scaleY: 1, skewX: 0, skewY: 0 },
          polygonProps: { sides: 6 },
          subpaths: polygonToSubpaths(bW, bH, 6),
          fill: { type: 'solid', color: preset.badgeFill || '#0f172a' },
          outline: { color: preset.badgeStroke || '#06b6d4', width: 3, style: 'solid', cap: 'round', join: 'round', startArrow: 'none', endArrow: 'none' },
          shadow: { enabled: true, color: preset.shadowColor || '#000000', blur: 16, offsetX: 0, offsetY: 0, opacity: 0.7 },
        });
      } else if (preset.badgeShape === 'star') {
        addObject({
          name: `AI Backdrop (${preset.name})`,
          type: 'star',
          transform: { x: bX, y: bY, width: bW, height: bH, rotation: 0, scaleX: 1, scaleY: 1, skewX: 0, skewY: 0 },
          starProps: { points: 12, sharpness: 0.8 },
          subpaths: starToSubpaths(bW, bH, 12, 0.8),
          fill: { type: 'solid', color: preset.badgeFill || '#000000' },
          outline: { color: preset.badgeStroke || '#facc15', width: 3, style: 'solid', cap: 'round', join: 'round', startArrow: 'none', endArrow: 'none' },
        });
      } else {
        addObject({
          name: `AI Backdrop (${preset.name})`,
          type: 'rect',
          transform: { x: bX, y: bY, width: bW, height: bH, rotation: 0, scaleX: 1, scaleY: 1, skewX: 0, skewY: 0 },
          rectProps: { cornerRadii: [12, 12, 12, 12], isRoundedLinked: true },
          subpaths: rectToSubpaths(bW, bH, [12, 12, 12, 12]),
          fill: { type: 'solid', color: preset.badgeFill || '#18181b' },
          outline: { color: preset.badgeStroke || '#d97706', width: 2, style: 'solid', cap: 'round', join: 'round', startArrow: 'none', endArrow: 'none' },
          shadow: { enabled: true, color: '#000000', blur: 14, offsetX: 4, offsetY: 4, opacity: 0.6 },
        });
      }
    }

    // 2. Main Styled Word Art Object
    addObject({
      name: `AI Word: "${wordText}"`,
      type: 'text',
      transform: {
        x: cx,
        y: cy,
        width: textWidth,
        height: textHeight,
        rotation: 0,
        scaleX: 1,
        scaleY: 1,
        skewX: 0,
        skewY: 0,
      },
      textProps: {
        text: wordText,
        fontFamily: preset.fontFamily,
        fontSize: preset.fontSize,
        fontWeight: preset.fontWeight,
        fontStyle: 'normal',
        textDecoration: 'none',
        textAlign: 'center',
        letterSpacing: preset.letterSpacing,
        lineHeight: 1.2,
      },
      fill: { type: 'solid', color: preset.fillColor },
      outline: {
        color: preset.outlineColor,
        width: preset.outlineWidth,
        style: 'solid',
        cap: 'round',
        join: 'round',
        startArrow: 'none',
        endArrow: 'none',
      },
      shadow: preset.shadowColor
        ? {
            enabled: true,
            color: preset.shadowColor,
            blur: preset.shadowBlur || 12,
            offsetX: 0,
            offsetY: 0,
            opacity: 0.85,
          }
        : undefined,
      extrude: preset.extrudeDepth
        ? {
            enabled: true,
            depth: preset.extrudeDepth,
            angle: preset.extrudeAngle || 45,
            vanishingPoint: { x: 0, y: 0 },
            bevel: 0,
            lightIntensity: 0.9,
            sideColor: preset.extrudeColor || '#1e1b4b',
          }
        : undefined,
    });

    setLastAction(`Generated AI Word Art "${wordText}" (${preset.name}) on canvas!`);
  };

  // AI Prompt Synthesizer
  const handleSynthesizeCustomPrompt = () => {
    if (!customAiPrompt.trim()) return;
    setIsGenerating(true);

    setTimeout(() => {
      const p = customAiPrompt.toLowerCase();
      let chosenPreset = AI_WORD_STYLES[0];

      if (p.includes('gold') || p.includes('luxury') || p.includes('royal') || p.includes('wedding')) {
        chosenPreset = AI_WORD_STYLES[1];
      } else if (p.includes('vintage') || p.includes('retro') || p.includes('hot rod') || p.includes('car')) {
        chosenPreset = AI_WORD_STYLES[2];
      } else if (p.includes('neon') || p.includes('synth') || p.includes('80s') || p.includes('pink')) {
        chosenPreset = AI_WORD_STYLES[3];
      } else if (p.includes('street') || p.includes('graffiti') || p.includes('comic') || p.includes('urban')) {
        chosenPreset = AI_WORD_STYLES[4];
      } else if (p.includes('fashion') || p.includes('chic') || p.includes('minimal') || p.includes('modern')) {
        chosenPreset = AI_WORD_STYLES[5];
      }

      handleInsertWordArt(chosenPreset);
      setIsGenerating(false);
      setCustomAiPrompt('');
    }, 450);
  };

  const handleHarmonizePalette = (scheme: 'cyberpunk' | 'luxury' | 'nature' | 'sunset') => {
    let colors: string[] = [];
    if (scheme === 'cyberpunk') colors = ['#0f172a', '#06b6d4', '#ec4899', '#8b5cf6', '#3b82f6', '#10b981', '#facc15'];
    else if (scheme === 'luxury') colors = ['#000000', '#1c1917', '#d97706', '#f59e0b', '#fde68a', '#78716c', '#ffffff'];
    else if (scheme === 'nature') colors = ['#064e3b', '#047857', '#10b981', '#84cc16', '#a3e635', '#fef08a', '#78350f'];
    else if (scheme === 'sunset') colors = ['#4c0519', '#be123c', '#f43f5e', '#fb923c', '#fbbf24', '#fde047', '#fffbeb'];

    setColorPalette(colors);
    setLastAction(`Applied ${scheme.toUpperCase()} AI Color Harmony palette.`);
  };

  return (
    <div className="flex flex-col h-full bg-[#181a20] text-gray-200 text-xs overflow-hidden divide-y divide-gray-800">
      {/* Header */}
      <div className="p-3 bg-gradient-to-r from-purple-950/40 via-indigo-950/30 to-blue-950/40 border-b border-gray-800 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-purple-500/20 text-purple-400 rounded-lg">
            <Bot size={16} />
          </div>
          <div>
            <div className="font-bold text-gray-100 uppercase tracking-wider text-[11px]">
              AI Design Studio 2025
            </div>
            <div className="text-[10px] text-gray-400">
              AI Typography, Word Crafter & Vector Emblems
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="flex items-center bg-[#13161c] px-2 py-1 gap-1 border-b border-gray-800">
        {[
          { id: 'words', label: '🔤 AI Word Crafter', icon: Type },
          { id: 'emblems', label: '🛡️ AI Vector Emblems', icon: Shield },
          { id: 'colors', label: '🎨 Palette AI', icon: Palette },
        ].map(tab => {
          const isActive = activeSubTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveSubTab(tab.id as any)}
              className={`px-3 py-1 rounded-lg text-[11px] font-medium flex items-center gap-1.5 transition-all ${
                isActive
                  ? 'bg-purple-600 text-white shadow-sm font-semibold'
                  : 'text-gray-400 hover:text-gray-200 hover:bg-gray-800/60'
              }`}
            >
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* TAB 1: AI WORD CRAFTER & TYPOGRAPHY DESIGNER */}
      {activeSubTab === 'words' && (
        <div className="flex-1 overflow-y-auto p-3 space-y-4">
          {/* Word Input Box */}
          <div className="bg-gray-900 p-3 rounded-xl border border-gray-800 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-wider text-purple-400 flex items-center gap-1">
                <Sparkles size={13} /> Enter Words to Design
              </span>
              <span className="text-[10px] text-gray-500 font-mono">Real-time Vector AI</span>
            </div>

            <div className="flex gap-2">
              <input
                type="text"
                value={inputWord}
                onChange={e => setInputWord(e.target.value)}
                placeholder="e.g. CYBERPUNK, LUXURY, HOT ROD..."
                className="flex-1 px-3 py-2 bg-gray-950 border border-gray-700 rounded-xl text-white font-bold text-sm outline-none focus:border-purple-500 tracking-wider uppercase"
              />
            </div>

            {/* Quick Word Suggestions */}
            <div className="flex flex-wrap gap-1 pt-1">
              {['CYBERPUNK', 'GOLDEN LUXE', 'HOT ROD 1980', 'NEON NIGHTS', 'VINTAGE MOTORS', 'TITAN STUDIO'].map(w => (
                <button
                  key={w}
                  onClick={() => setInputWord(w)}
                  className="px-2 py-0.5 bg-gray-800 hover:bg-gray-700 text-gray-300 hover:text-white rounded-md text-[10px] font-medium transition-colors"
                >
                  {w}
                </button>
              ))}
            </div>
          </div>

          {/* Custom AI Prompt Box */}
          <div className="bg-gray-900 p-3 rounded-xl border border-gray-800 space-y-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 block">
              Describe Any Style (AI Prompt)
            </span>
            <div className="flex gap-2">
              <input
                type="text"
                value={customAiPrompt}
                onChange={e => setCustomAiPrompt(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleSynthesizeCustomPrompt()}
                placeholder="e.g. 1980s retro racing logo with fiery orange gradient..."
                className="flex-1 px-2.5 py-1.5 bg-gray-950 border border-gray-700 rounded-xl text-gray-200 text-xs outline-none focus:border-purple-500"
              />
              <button
                disabled={isGenerating}
                onClick={handleSynthesizeCustomPrompt}
                className="px-3 py-1.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold rounded-xl text-xs flex items-center gap-1 shadow"
              >
                <Wand2 size={13} />
                <span>{isGenerating ? 'Designing...' : 'Generate'}</span>
              </button>
            </div>
          </div>

          {/* AI Typography Style Gallery */}
          <div className="space-y-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 block">
              AI Typography Style Presets (Click to Insert)
            </span>

            <div className="grid grid-cols-1 gap-2.5">
              {AI_WORD_STYLES.map(style => (
                <div
                  key={style.id}
                  onClick={() => handleInsertWordArt(style)}
                  className={`p-3 rounded-xl border border-gray-700/80 bg-gradient-to-br ${style.previewBg} hover:border-purple-400 cursor-pointer transition-all shadow-md group hover:scale-[1.01]`}
                >
                  <div className="flex items-center justify-between pb-1.5 border-b border-white/10">
                    <div className="flex items-center gap-1.5">
                      <span className="text-sm">{style.icon}</span>
                      <span className="font-bold text-white text-xs">{style.name}</span>
                    </div>
                    <span className="text-[10px] bg-black/40 text-purple-300 px-2 py-0.5 rounded-full font-mono">
                      {style.fontFamily}
                    </span>
                  </div>

                  {/* Specimen Typography Preview */}
                  <div className="py-3 text-center">
                    <div
                      style={{
                        fontFamily: `"${style.fontFamily}", sans-serif`,
                        fontSize: '22px',
                        fontWeight: style.fontWeight,
                        color: style.fillColor,
                        letterSpacing: `${style.letterSpacing}px`,
                        textShadow: style.shadowColor ? `0 0 12px ${style.shadowColor}` : 'none',
                        WebkitTextStroke: `${style.outlineWidth}px ${style.outlineColor}`,
                      }}
                      className="truncate uppercase tracking-wider drop-shadow"
                    >
                      {inputWord.trim() || 'CORELDRAW'}
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-[10px] text-gray-300 pt-1 border-t border-white/10">
                    <span>Includes 3D Extrusion + Badge Backdrop</span>
                    <span className="text-purple-300 font-bold group-hover:underline flex items-center gap-0.5">
                      Insert on Canvas <ChevronRight size={12} />
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: AI VECTOR EMBLEMS */}
      {activeSubTab === 'emblems' && (
        <div className="flex-1 overflow-y-auto p-3 space-y-3">
          <div className="bg-gray-900 p-3 rounded-xl border border-gray-800 space-y-1.5">
            <span className="font-bold text-white text-xs flex items-center gap-1.5">
              <Shield size={15} className="text-cyan-400" /> Vector Crest & Emblem Synthesizer
            </span>
            <p className="text-[11px] text-gray-400">
              Generates multi-layer geometric seals, ribbons, awards, and shield backdrops with 1 click.
            </p>
          </div>

          <div className="space-y-2">
            {[
              {
                title: '⚡ Cyberpunk Neon Crest',
                desc: 'Hexagonal futuristic badge with glowing neon star core',
                action: () => {
                  const cx = activePage.width / 2 - 100;
                  const cy = activePage.height / 2 - 100;
                  addObject({
                    name: 'AI Cyberpunk Outer Hex',
                    type: 'polygon',
                    transform: { x: cx, y: cy, width: 200, height: 200, rotation: 0, scaleX: 1, scaleY: 1, skewX: 0, skewY: 0 },
                    polygonProps: { sides: 6 },
                    subpaths: polygonToSubpaths(200, 200, 6),
                    fill: { type: 'solid', color: '#0f172a' },
                    outline: { color: '#06b6d4', width: 4, style: 'solid', cap: 'round', join: 'round', startArrow: 'none', endArrow: 'none' },
                    shadow: { enabled: true, color: '#06b6d4', blur: 14, offsetX: 0, offsetY: 0, opacity: 0.8 },
                  });
                  addObject({
                    name: 'AI Cyberpunk Star Core',
                    type: 'star',
                    transform: { x: cx + 35, y: cy + 35, width: 130, height: 130, rotation: 0, scaleX: 1, scaleY: 1, skewX: 0, skewY: 0 },
                    starProps: { points: 8, sharpness: 0.6 },
                    subpaths: starToSubpaths(130, 130, 8, 0.6),
                    fill: { type: 'solid', color: '#ec4899' },
                    outline: { color: '#ffffff', width: 2, style: 'solid', cap: 'round', join: 'round', startArrow: 'none', endArrow: 'none' },
                    shadow: { enabled: true, color: '#ec4899', blur: 12, offsetX: 0, offsetY: 0, opacity: 0.9 },
                  });
                  setLastAction('Inserted Cyberpunk Neon Crest on canvas');
                },
              },
              {
                title: '🏆 Golden Luxury Seal',
                desc: '16-point gold rosette award with serif typography',
                action: () => {
                  const cx = activePage.width / 2 - 90;
                  const cy = activePage.height / 2 - 90;
                  addObject({
                    name: 'AI Gold Seal Rosette',
                    type: 'star',
                    transform: { x: cx, y: cy, width: 180, height: 180, rotation: 0, scaleX: 1, scaleY: 1, skewX: 0, skewY: 0 },
                    starProps: { points: 16, sharpness: 0.85 },
                    subpaths: starToSubpaths(180, 180, 16, 0.85),
                    fill: { type: 'solid', color: '#d97706' },
                    outline: { color: '#fef08a', width: 3, style: 'solid', cap: 'round', join: 'round', startArrow: 'none', endArrow: 'none' },
                    shadow: { enabled: true, color: '#000000', blur: 10, offsetX: 4, offsetY: 4, opacity: 0.5 },
                  });
                  setLastAction('Inserted Golden Luxury Seal on canvas');
                },
              },
            ].map((emblem, idx) => (
              <div
                key={idx}
                onClick={emblem.action}
                className="p-3 bg-gray-900 hover:bg-gray-800/80 border border-gray-800 hover:border-purple-500 rounded-xl cursor-pointer transition flex items-center justify-between"
              >
                <div>
                  <div className="font-semibold text-white text-xs">{emblem.title}</div>
                  <div className="text-[10px] text-gray-400">{emblem.desc}</div>
                </div>
                <Wand2 size={16} className="text-purple-400" />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: PALETTE AI */}
      {activeSubTab === 'colors' && (
        <div className="flex-1 overflow-y-auto p-3 space-y-3">
          <div className="bg-gray-900 p-3 rounded-xl border border-gray-800 space-y-1.5">
            <span className="font-bold text-white text-xs flex items-center gap-1.5">
              <Palette size={15} className="text-emerald-400" /> Intelligent Color Harmony Harmonizer
            </span>
            <p className="text-[11px] text-gray-400">
              Generates cohesive color palettes mapped across Pantone and CMYK print profiles.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-2">
            {[
              { id: 'cyberpunk', name: '⚡ Cyberpunk Neon', color: 'text-cyan-300' },
              { id: 'luxury', name: '👑 Luxury Gold', color: 'text-amber-300' },
              { id: 'nature', name: '🌿 Nature Lush', color: 'text-emerald-300' },
              { id: 'sunset', name: '🌇 Sunset Fire', color: 'text-rose-300' },
            ].map(pal => (
              <button
                key={pal.id}
                onClick={() => handleHarmonizePalette(pal.id as any)}
                className="p-2.5 bg-gray-900 hover:bg-gray-800 rounded-xl border border-gray-800 text-xs font-bold transition flex items-center justify-center"
              >
                <span className={pal.color}>{pal.name}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Feedback Banner */}
      {lastAction && (
        <div className="p-2.5 bg-emerald-950/60 border-t border-emerald-800/40 text-emerald-300 text-[11px] flex items-center gap-2">
          <CheckCircle2 size={14} className="text-emerald-400 flex-shrink-0" />
          <span className="truncate">{lastAction}</span>
        </div>
      )}
    </div>
  );
};
