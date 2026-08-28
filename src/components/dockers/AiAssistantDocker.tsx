import React, { useState } from 'react';
import { useCorel } from '../../context/CorelContext';
import {
  Bot,
  Sparkles,
  Wand2,
  Palette,
  LayoutGrid,
  Zap,
  CheckCircle2,
  Flame,
} from 'lucide-react';
import { rectToSubpaths, starToSubpaths, polygonToSubpaths } from '../../engine/vectorMath';

interface PromptPreset {
  title: string;
  category: string;
  generate: (addObject: any, activePage: any) => void;
}

export const AiAssistantDocker: React.FC = () => {
  const {
    activePage,
    addObject,
    setColorPalette,
    primarySelectedObject,
    updateObject,
    alignSelected,
  } = useCorel();

  const [customPrompt, setCustomPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [lastAction, setLastAction] = useState<string | null>(null);

  const PROMPT_PRESETS: PromptPreset[] = [
    {
      title: '⚡ Cyberpunk Neon Crest',
      category: 'Badges & Emblems',
      generate: (add, page) => {
        const cx = page.width / 2 - 100;
        const cy = page.height / 2 - 100;
        // Outer Hexagon
        add({
          name: 'AI Cyberpunk Outer Hex',
          type: 'polygon',
          transform: { x: cx, y: cy, width: 200, height: 200, rotation: 0, scaleX: 1, scaleY: 1, skewX: 0, skewY: 0 },
          polygonProps: { sides: 6 },
          subpaths: polygonToSubpaths(200, 200, 6),
          fill: { type: 'solid', color: '#0f172a' },
          outline: { color: '#06b6d4', width: 4, style: 'solid', cap: 'round', join: 'round', startArrow: 'none', endArrow: 'none' },
          shadow: { enabled: true, color: '#06b6d4', blur: 14, offsetX: 0, offsetY: 0, opacity: 0.8 },
        });
        // Inner Star
        add({
          name: 'AI Cyberpunk Star Core',
          type: 'star',
          transform: { x: cx + 35, y: cy + 35, width: 130, height: 130, rotation: 0, scaleX: 1, scaleY: 1, skewX: 0, skewY: 0 },
          starProps: { points: 8, sharpness: 0.6 },
          subpaths: starToSubpaths(130, 130, 8, 0.6),
          fill: { type: 'solid', color: '#ec4899' },
          outline: { color: '#ffffff', width: 2, style: 'solid', cap: 'round', join: 'round', startArrow: 'none', endArrow: 'none' },
          shadow: { enabled: true, color: '#ec4899', blur: 12, offsetX: 0, offsetY: 0, opacity: 0.9 },
        });
      },
    },
    {
      title: '🏆 Golden Luxury Seal',
      category: 'Seals & Awards',
      generate: (add, page) => {
        const cx = page.width / 2 - 90;
        const cy = page.height / 2 - 90;
        // 16-point Star Rosette
        add({
          name: 'AI Gold Seal Rosette',
          type: 'star',
          transform: { x: cx, y: cy, width: 180, height: 180, rotation: 0, scaleX: 1, scaleY: 1, skewX: 0, skewY: 0 },
          starProps: { points: 16, sharpness: 0.85 },
          subpaths: starToSubpaths(180, 180, 16, 0.85),
          fill: { type: 'solid', color: '#d97706' },
          outline: { color: '#fef08a', width: 3, style: 'solid', cap: 'round', join: 'round', startArrow: 'none', endArrow: 'none' },
          shadow: { enabled: true, color: '#000000', blur: 10, offsetX: 4, offsetY: 4, opacity: 0.5 },
        });
        // Inner Emblem Text
        add({
          name: 'AI Gold Seal Typography',
          type: 'text',
          transform: { x: cx + 25, y: cy + 70, width: 130, height: 40, rotation: 0, scaleX: 1, scaleY: 1, skewX: 0, skewY: 0 },
          textProps: {
            text: 'PREMIUM',
            fontFamily: 'Cinzel',
            fontSize: 20,
            fontWeight: 800,
            fontStyle: 'normal',
            textDecoration: 'none',
            textAlign: 'center',
            letterSpacing: 3,
            lineHeight: 1.1,
          },
          fill: { type: 'solid', color: '#ffffff' },
          outline: { color: 'none', width: 0, style: 'solid', cap: 'round', join: 'round', startArrow: 'none', endArrow: 'none' },
        });
      },
    },
    {
      title: '🌐 Modern Tech Shield',
      category: 'Logos & Icons',
      generate: (add, page) => {
        const cx = page.width / 2 - 80;
        const cy = page.height / 2 - 80;
        add({
          name: 'AI Tech Shield',
          type: 'polygon',
          transform: { x: cx, y: cy, width: 160, height: 160, rotation: 0, scaleX: 1, scaleY: 1, skewX: 0, skewY: 0 },
          polygonProps: { sides: 3 },
          subpaths: polygonToSubpaths(160, 160, 3),
          fill: { type: 'solid', color: '#3b82f6' },
          outline: { color: '#60a5fa', width: 3, style: 'solid', cap: 'round', join: 'round', startArrow: 'none', endArrow: 'none' },
          extrude: { enabled: true, depth: 20, angle: 45, vanishingPoint: { x: 0, y: 0 }, bevel: 0, lightIntensity: 0.9, sideColor: '#1d4ed8' },
        });
      },
    },
  ];

  const handleGenerateAI = (preset?: PromptPreset) => {
    setIsGenerating(true);
    setTimeout(() => {
      if (preset) {
        preset.generate(addObject, activePage);
        setLastAction(`Generated "${preset.title}" on canvas`);
      } else {
        // Generate from prompt
        const promptToRun = customPrompt.toLowerCase();
        const cx = activePage.width / 2 - 85;
        const cy = activePage.height / 2 - 85;

        if (promptToRun.includes('star') || promptToRun.includes('badge')) {
          addObject({
            name: 'AI Generated Star Badge',
            type: 'star',
            transform: { x: cx, y: cy, width: 170, height: 170, rotation: 0, scaleX: 1, scaleY: 1, skewX: 0, skewY: 0 },
            starProps: { points: 12, sharpness: 0.7 },
            subpaths: starToSubpaths(170, 170, 12, 0.7),
            fill: { type: 'solid', color: '#8b5cf6' },
            outline: { color: '#c4b5fd', width: 3, style: 'solid', cap: 'round', join: 'round', startArrow: 'none', endArrow: 'none' },
            shadow: { enabled: true, color: '#8b5cf6', blur: 10, offsetX: 0, offsetY: 0, opacity: 0.8 },
          });
        } else {
          // Default futuristic vector icon
          addObject({
            name: `AI Vector: ${customPrompt || 'Shield Concept'}`,
            type: 'polygon',
            transform: { x: cx, y: cy, width: 170, height: 170, rotation: 0, scaleX: 1, scaleY: 1, skewX: 0, skewY: 0 },
            polygonProps: { sides: 6 },
            subpaths: polygonToSubpaths(170, 170, 6),
            fill: { type: 'solid', color: '#10b981' },
            outline: { color: '#6ee7b7', width: 3, style: 'solid', cap: 'round', join: 'round', startArrow: 'none', endArrow: 'none' },
            extrude: { enabled: true, depth: 15, angle: 45, vanishingPoint: { x: 0, y: 0 }, bevel: 0, lightIntensity: 0.85, sideColor: '#047857' },
          });
        }
        setLastAction(`Generated vector design from prompt: "${customPrompt}"`);
        setCustomPrompt('');
      }
      setIsGenerating(false);
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
    <div className="p-3 space-y-4 text-xs select-none">
      {/* Header */}
      <div className="bg-[#171b22] p-2.5 rounded-lg border border-[#2d3748] space-y-1.5">
        <span className="font-bold text-white flex items-center">
          <Bot className="w-4 h-4 mr-1.5 text-purple-400" /> AI Vector Design Studio
        </span>
        <p className="text-gray-400 text-[11px] leading-relaxed">
          Generate precision vector emblems, harmonize color palettes, and optimize Bézier curves with intelligent algorithms.
        </p>
      </div>

      {/* AI Vector Prompt Generator */}
      <div className="space-y-2 bg-[#171b22] p-2.5 rounded-lg border border-[#2d3748]">
        <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 block">
          AI Prompt-to-Vector Generator
        </span>
        <div className="space-y-1.5">
          <input
            type="text"
            placeholder="e.g. Cyberpunk shield, Luxury gold crest, Neon badge..."
            value={customPrompt}
            onChange={e => setCustomPrompt(e.target.value)}
            className="w-full bg-[#262e3d] text-white px-2 py-1.5 rounded border border-[#374151] outline-none text-xs focus:border-purple-500"
          />
          <button
            disabled={isGenerating}
            onClick={() => handleGenerateAI()}
            className="w-full py-1.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white rounded font-bold flex items-center justify-center space-x-1 transition shadow"
          >
            <Sparkles className="w-3.5 h-3.5 mr-1 text-purple-200" />
            <span>{isGenerating ? 'Synthesizing Vectors...' : 'Generate Vector Artwork'}</span>
          </button>
        </div>
      </div>

      {/* AI Template Suggestions */}
      <div className="space-y-2">
        <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 block">
          One-Click AI Vector Presets
        </span>
        <div className="space-y-1.5">
          {PROMPT_PRESETS.map((preset, idx) => (
            <div
              key={idx}
              onClick={() => handleGenerateAI(preset)}
              className="p-2 bg-[#171b22] hover:bg-[#242b38] border border-[#2d3748] hover:border-purple-500/50 rounded-lg cursor-pointer flex items-center justify-between transition"
            >
              <div>
                <div className="font-semibold text-white text-[11px]">{preset.title}</div>
                <div className="text-[10px] text-gray-400">{preset.category}</div>
              </div>
              <Wand2 className="w-3.5 h-3.5 text-purple-400" />
            </div>
          ))}
        </div>
      </div>

      {/* AI Color Harmonies */}
      <div className="space-y-2 bg-[#171b22] p-2.5 rounded-lg border border-[#2d3748]">
        <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 block flex items-center">
          <Palette className="w-3.5 h-3.5 mr-1 text-emerald-400" /> AI Palette Harmonizer
        </span>
        <div className="grid grid-cols-2 gap-1.5">
          <button
            onClick={() => handleHarmonizePalette('cyberpunk')}
            className="px-2 py-1.5 bg-[#242b38] hover:bg-[#323c4d] text-cyan-300 rounded text-[10px] font-bold border border-[#374151] flex items-center justify-center"
          >
            ⚡ Cyberpunk Neon
          </button>
          <button
            onClick={() => handleHarmonizePalette('luxury')}
            className="px-2 py-1.5 bg-[#242b38] hover:bg-[#323c4d] text-amber-300 rounded text-[10px] font-bold border border-[#374151] flex items-center justify-center"
          >
            👑 Luxury Gold
          </button>
          <button
            onClick={() => handleHarmonizePalette('nature')}
            className="px-2 py-1.5 bg-[#242b38] hover:bg-[#323c4d] text-emerald-300 rounded text-[10px] font-bold border border-[#374151] flex items-center justify-center"
          >
            🌿 Nature Lush
          </button>
          <button
            onClick={() => handleHarmonizePalette('sunset')}
            className="px-2 py-1.5 bg-[#242b38] hover:bg-[#323c4d] text-rose-300 rounded text-[10px] font-bold border border-[#374151] flex items-center justify-center"
          >
            🌇 Sunset Fire
          </button>
        </div>
      </div>

      {/* Status Feedback */}
      {lastAction && (
        <div className="p-2 bg-emerald-500/10 border border-emerald-500/30 rounded text-emerald-300 text-[11px] flex items-center space-x-1.5">
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
          <span>{lastAction}</span>
        </div>
      )}
    </div>
  );
};
