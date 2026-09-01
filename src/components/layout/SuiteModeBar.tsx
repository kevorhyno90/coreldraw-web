import React from 'react';
import { useCorel } from '../../context/CorelContext';
import { SuiteAppMode } from '../../types/coreldraw';
import {
  Sparkles,
  Camera,
  Layers,
  Type,
  Image as ImageIcon,
  Cloud,
  Maximize2,
  Sliders,
  Scissors,
  Check,
} from 'lucide-react';

interface SuiteAppItem {
  id: SuiteAppMode;
  name: string;
  badge: string;
  icon: string;
  desc: string;
  color: string;
}

const SUITE_APPS: SuiteAppItem[] = [
  {
    id: 'coreldraw',
    name: 'CorelDRAW 2025',
    badge: 'Vector & Layout',
    icon: '📐',
    desc: 'Vector illustration, branding design, precision geometry & multi-page catalog layout',
    color: 'from-blue-600 to-cyan-500',
  },
  {
    id: 'photopaint',
    name: 'PHOTO-PAINT',
    badge: 'Pixel & Retouch',
    icon: '🎨',
    desc: 'Photo editing, Levels/Curves, spot healing, retouching & non-destructive bitmap filters',
    color: 'from-purple-600 to-pink-500',
  },
  {
    id: 'fontmanager',
    name: 'Font Manager',
    badge: '300+ Google Fonts',
    icon: '🔤',
    desc: 'Typography catalog, 300+ Google Fonts, variable font weight/slant sliders & glyph preview',
    color: 'from-emerald-600 to-teal-500',
  },
  {
    id: 'powertrace',
    name: 'PowerTRACE',
    badge: 'AI Vector Tracing',
    icon: '⚡',
    desc: 'AI bitmap-to-vector engine converting PNG/JPG images into editable Bézier paths',
    color: 'from-amber-500 to-orange-600',
  },
  {
    id: 'capture',
    name: 'CAPTURE',
    badge: 'Screen Snip',
    icon: '📸',
    desc: 'Screen capture, region snipping & canvas viewport snapshots directly into document layers',
    color: 'from-rose-600 to-red-500',
  },
  {
    id: 'cloud',
    name: 'Cloud Web Hub',
    badge: 'Cross-Platform',
    icon: '☁️',
    desc: 'Cross-platform cloud sync, multi-device backup, CDR/PDF/SVG format exchange',
    color: 'from-sky-600 to-blue-500',
  },
];

interface SuiteModeBarProps {
  onToggleCollapse?: () => void;
}

export const SuiteModeBar: React.FC<SuiteModeBarProps> = ({ onToggleCollapse }) => {
  const {
    suiteAppMode,
    setSuiteAppMode,
    setActiveDockerTab,
    triggerScreenCapture,
    setOpenDialog,
  } = useCorel();

  const handleSwitchMode = (mode: SuiteAppMode) => {
    setSuiteAppMode(mode);
    if (mode === 'photopaint') {
      setActiveDockerTab('photo');
    } else if (mode === 'fontmanager') {
      setActiveDockerTab('fontmanager');
    } else if (mode === 'powertrace') {
      setOpenDialog('trace');
    } else if (mode === 'capture') {
      triggerScreenCapture('canvas');
    } else if (mode === 'cloud') {
      setActiveDockerTab('cloud');
    }
  };

  return (
    <div className="h-7 bg-[#111318] border-b border-gray-800 flex items-center justify-between px-2 text-xs select-none whitespace-nowrap overflow-x-auto scrollbar-none">
      {/* Left Suite branding and App Switcher pills */}
      <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none">
        <div className="flex items-center gap-1 pr-2 border-r border-gray-800">
          <span className="font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500 text-[10px] tracking-wider uppercase">
            Corel Suite 2025
          </span>
        </div>

        <div className="flex items-center gap-1">
          {SUITE_APPS.map(app => {
            const isActive = suiteAppMode === app.id;
            return (
              <button
                key={app.id}
                onClick={() => handleSwitchMode(app.id)}
                title={app.desc}
                className={`flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-medium transition-all ${
                  isActive
                    ? `bg-gradient-to-r ${app.color} text-white shadow-md shadow-cyan-500/20 scale-[1.02]`
                    : 'text-gray-400 hover:text-gray-200 hover:bg-gray-800/60'
                }`}
              >
                <span>{app.icon}</span>
                <span>{app.name}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Right Quick Actions (Screen Snip, Prepress & Collapse) */}
      <div className="flex items-center gap-1.5">
        <button
          onClick={() => triggerScreenCapture('canvas')}
          title="Capture Canvas Snapshot"
          className="flex items-center gap-1 text-[9px] bg-rose-950/40 hover:bg-rose-900/60 text-rose-300 border border-rose-800/50 px-1.5 py-0.5 rounded transition-colors"
        >
          <Camera size={11} />
          <span>CAPTURE</span>
        </button>

        <button
          onClick={() => setActiveDockerTab('prepress')}
          title="Prepress & CMYK Separations 2025"
          className="flex items-center gap-1 text-[9px] bg-blue-950/40 hover:bg-blue-900/60 text-blue-300 border border-blue-800/50 px-1.5 py-0.5 rounded transition-colors"
        >
          <span>🖨️ Prepress</span>
        </button>

        {onToggleCollapse && (
          <button
            onClick={onToggleCollapse}
            title="Collapse Suite Bar (Compact Screen Mode)"
            className="p-1 hover:bg-gray-800 text-gray-500 hover:text-gray-300 rounded text-[10px]"
          >
            ✕
          </button>
        )}
      </div>
    </div>
  );
};
