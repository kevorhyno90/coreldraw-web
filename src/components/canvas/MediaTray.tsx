import React from 'react';
import { useCorel } from '../../context/CorelContext';
import { PAINTERLY_PRESETS } from '../../engine/painterlyBrushEngine';
import { PainterlyMediaType } from '../../types/coreldraw';
import { Sliders, Sparkles, Feather, Droplets, Paintbrush, X } from 'lucide-react';

export const MediaTray: React.FC = () => {
  const {
    activeTool,
    painterlySettings,
    setPainterlySettings,
    activeFillColor,
    setActiveFillColor,
  } = useCorel();

  if (activeTool !== 'painterly-brush' && activeTool !== 'artistic-media') {
    return null;
  }

  const handleSelectPreset = (mediaType: PainterlyMediaType) => {
    const preset = PAINTERLY_PRESETS.find(p => p.mediaType === mediaType);
    if (preset) {
      setPainterlySettings(prev => ({
        ...prev,
        mediaType,
        size: preset.defaultSize,
        opacity: preset.defaultOpacity,
        wetness: preset.wetness,
        bleed: preset.bleed,
        bristleTexture: preset.bristleTexture,
      }));
    }
  };

  return (
    <div className="absolute bottom-16 left-1/2 -translate-x-1/2 z-40 bg-[#1e222d]/95 backdrop-blur-md border border-cyan-500/30 rounded-2xl shadow-2xl p-3 flex flex-col gap-3 min-w-[540px] text-gray-200 animate-in fade-in slide-in-from-bottom-4 duration-200">
      {/* Header & Mode info */}
      <div className="flex items-center justify-between border-b border-gray-800 pb-2 px-1">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-lg bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center text-xs shadow-md">
            🎨
          </div>
          <div>
            <span className="text-xs font-bold text-cyan-400 uppercase tracking-wider">
              2025 Painterly Brush Media Tray
            </span>
            <span className="text-[10px] text-gray-400 ml-2">Digital Simulation & Editable Vector Curves</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[10px] bg-cyan-950/80 text-cyan-300 border border-cyan-700/50 px-2 py-0.5 rounded-full font-mono">
            Tilt & Pressure Active
          </span>
        </div>
      </div>

      {/* Media Type Presets Selector */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
        {PAINTERLY_PRESETS.map(preset => {
          const isSelected = painterlySettings.mediaType === preset.mediaType;
          return (
            <button
              key={preset.mediaType}
              onClick={() => handleSelectPreset(preset.mediaType)}
              title={`${preset.name}: ${preset.description}`}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-medium transition-all whitespace-nowrap ${
                isSelected
                  ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-lg shadow-cyan-500/25 scale-[1.02]'
                  : 'bg-[#14171f] hover:bg-[#282d3c] text-gray-300 border border-gray-700/50'
              }`}
            >
              <span>{preset.icon}</span>
              <span>{preset.name.split(' ')[0]}</span>
            </button>
          );
        })}
      </div>

      {/* Sliders Grid */}
      <div className="grid grid-cols-4 gap-3 bg-[#14171f]/80 p-2.5 rounded-xl border border-gray-800/80">
        {/* Brush Size */}
        <div className="flex flex-col gap-1">
          <div className="flex justify-between text-[11px] text-gray-300 font-medium">
            <span>Size</span>
            <span className="text-cyan-400 font-mono">{painterlySettings.size}px</span>
          </div>
          <input
            type="range"
            min="4"
            max="120"
            value={painterlySettings.size}
            onChange={e => setPainterlySettings(p => ({ ...p, size: Number(e.target.value) }))}
            className="w-full accent-cyan-400 h-1.5 bg-gray-700 rounded-lg cursor-pointer"
          />
        </div>

        {/* Opacity */}
        <div className="flex flex-col gap-1">
          <div className="flex justify-between text-[11px] text-gray-300 font-medium">
            <span>Opacity</span>
            <span className="text-cyan-400 font-mono">{Math.round(painterlySettings.opacity * 100)}%</span>
          </div>
          <input
            type="range"
            min="0.1"
            max="1"
            step="0.05"
            value={painterlySettings.opacity}
            onChange={e => setPainterlySettings(p => ({ ...p, opacity: Number(e.target.value) }))}
            className="w-full accent-cyan-400 h-1.5 bg-gray-700 rounded-lg cursor-pointer"
          />
        </div>

        {/* Wetness / Blend */}
        <div className="flex flex-col gap-1">
          <div className="flex justify-between text-[11px] text-gray-300 font-medium">
            <span>Wetness</span>
            <span className="text-cyan-400 font-mono">{painterlySettings.wetness}%</span>
          </div>
          <input
            type="range"
            min="0"
            max="100"
            value={painterlySettings.wetness}
            onChange={e => setPainterlySettings(p => ({ ...p, wetness: Number(e.target.value) }))}
            className="w-full accent-cyan-400 h-1.5 bg-gray-700 rounded-lg cursor-pointer"
          />
        </div>

        {/* Bleed / Paper Grain */}
        <div className="flex flex-col gap-1">
          <div className="flex justify-between text-[11px] text-gray-300 font-medium">
            <span>Bleed Diffuse</span>
            <span className="text-cyan-400 font-mono">{painterlySettings.bleed}%</span>
          </div>
          <input
            type="range"
            min="0"
            max="100"
            value={painterlySettings.bleed}
            onChange={e => setPainterlySettings(p => ({ ...p, bleed: Number(e.target.value) }))}
            className="w-full accent-cyan-400 h-1.5 bg-gray-700 rounded-lg cursor-pointer"
          />
        </div>
      </div>

      {/* Color well & Quick Palette */}
      <div className="flex items-center justify-between pt-1">
        <div className="flex items-center gap-2">
          <span className="text-[11px] text-gray-400">Color:</span>
          <input
            type="color"
            value={activeFillColor.startsWith('#') ? activeFillColor : '#3b82f6'}
            onChange={e => setActiveFillColor(e.target.value)}
            className="w-6 h-6 rounded-md bg-transparent border-0 cursor-pointer p-0"
          />
          <div className="flex gap-1">
            {['#ef4444', '#f97316', '#eab308', '#22c55e', '#06b6d4', '#3b82f6', '#a855f7', '#ec4899', '#1e293b'].map(c => (
              <button
                key={c}
                onClick={() => setActiveFillColor(c)}
                className="w-5 h-5 rounded-md border border-gray-600/50 transition-transform hover:scale-110"
                style={{ backgroundColor: c }}
              />
            ))}
          </div>
        </div>

        <div className="text-[11px] text-gray-400 flex items-center gap-2">
          <span>Stylus Tilt:</span>
          <span className="text-emerald-400 font-medium font-mono">Dynamic</span>
        </div>
      </div>
    </div>
  );
};
