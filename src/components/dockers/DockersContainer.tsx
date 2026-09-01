import React, { useState, useRef, useEffect } from 'react';
import { useCorel } from '../../context/CorelContext';
import { DockerTab } from '../../types/coreldraw';
import { ObjectManagerDocker } from './ObjectManagerDocker';
import { PropertiesDocker } from './PropertiesDocker';
import { TransformDocker } from './TransformDocker';
import { ShapingDocker } from './ShapingDocker';
import { ColorPaletteDocker } from './ColorPaletteDocker';
import { EffectsDocker } from './EffectsDocker';
import { AutoTraceDocker } from './AutoTraceDocker';
import { HistoryDocker } from './HistoryDocker';
import { AlignDocker } from './AlignDocker';
import { PhotoEditingDocker } from './PhotoEditingDocker';
import { TypographyDocker } from './TypographyDocker';
import { FontManagerDocker } from './FontManagerDocker';
import { PrepressDocker } from './PrepressDocker';
import { CloudHubDocker } from './CloudHubDocker';
import { BarcodeDocker } from './BarcodeDocker';
import { AiAssistantDocker } from './AiAssistantDocker';
import {
  SlidersHorizontal,
  Layers,
  Move,
  Shapes,
  Palette,
  Boxes,
  Sparkles,
  History,
  AlignLeft,
  Image as ImageIcon,
  Type,
  Printer,
  Cloud,
  QrCode,
  Bot,
  ChevronRight,
  ChevronLeft,
  Maximize2,
  Minimize2,
  X,
  GripVertical,
} from 'lucide-react';

interface DockerItem {
  id: DockerTab;
  title: string;
  icon: React.ComponentType<{ className?: string }>;
  component: React.ComponentType;
}

const DOCKERS: DockerItem[] = [
  { id: 'properties', title: 'Properties', icon: SlidersHorizontal, component: PropertiesDocker },
  { id: 'fontmanager', title: 'Corel Font Manager 2025', icon: Type, component: FontManagerDocker },
  { id: 'prepress', title: 'Prepress & Separations 2025', icon: Printer, component: PrepressDocker },
  { id: 'effects', title: 'Effects & 3D (Blend, Shadow)', icon: Boxes, component: EffectsDocker },
  { id: 'colors', title: 'Pantone 2025 & Palettes', icon: Palette, component: ColorPaletteDocker },
  { id: 'barcode', title: 'Barcode & QR Code Wizard', icon: QrCode, component: BarcodeDocker },
  { id: 'photo', title: 'PHOTO-PAINT Lab', icon: ImageIcon, component: PhotoEditingDocker },
  { id: 'objects', title: 'Objects & Layers', icon: Layers, component: ObjectManagerDocker },
  { id: 'shaping', title: 'Shaping & Booleans', icon: Shapes, component: ShapingDocker },
  { id: 'trace', title: 'PowerTRACE 2025', icon: Sparkles, component: AutoTraceDocker },
  { id: 'cloud', title: 'CorelDRAW Cloud Hub', icon: Cloud, component: CloudHubDocker },
  { id: 'ai', title: 'AI Vector Studio', icon: Bot, component: AiAssistantDocker },
  { id: 'transform', title: 'Transform', icon: Move, component: TransformDocker },
  { id: 'align', title: 'Align & Distribute', icon: AlignLeft, component: AlignDocker },
  { id: 'history', title: 'History', icon: History, component: HistoryDocker },
];

export const DockersContainer: React.FC = () => {
  const { activeDockerTab, setActiveDockerTab } = useCorel();

  // Dynamic resizable width state (defaults to 340px, can expand up to 750px)
  const [dockerWidth, setDockerWidth] = useState<number>(360);
  const [isResizing, setIsResizing] = useState(false);
  const resizeStartX = useRef<number>(0);
  const initialWidthRef = useRef<number>(360);

  const activeDocker = DOCKERS.find(d => d.id === activeDockerTab);
  const ActiveComponent = activeDocker?.component;

  // Handle Drag Resizing Sideways
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isResizing) return;
      const deltaX = resizeStartX.current - e.clientX;
      const newWidth = Math.min(800, Math.max(280, initialWidthRef.current + deltaX));
      setDockerWidth(newWidth);
    };

    const handleMouseUp = () => {
      setIsResizing(false);
    };

    if (isResizing) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    }
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isResizing]);

  const handleStartResize = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsResizing(true);
    resizeStartX.current = e.clientX;
    initialWidthRef.current = dockerWidth;
  };

  const toggleWideView = () => {
    if (dockerWidth < 500) {
      setDockerWidth(560);
    } else {
      setDockerWidth(360);
    }
  };

  return (
    <div className="flex select-none z-40 bg-[#1b2029] border-l border-[#2d3748] relative">
      {/* Expanded Docker Panel Content */}
      {activeDockerTab && ActiveComponent && (
        <div
          style={{ width: `${dockerWidth}px` }}
          className="bg-[#1f2430] border-r border-[#2d3748] flex flex-col h-full shadow-2xl relative transition-[width] duration-75 ease-out"
        >
          {/* Left Resize Drag Handle */}
          <div
            onMouseDown={handleStartResize}
            title="Drag sideways to resize panel width"
            className="absolute left-0 top-0 bottom-0 w-2 -ml-1 cursor-ew-resize hover:bg-blue-500/50 transition-colors z-50 flex items-center justify-center group"
          >
            <div className="w-[2px] h-8 bg-gray-600 group-hover:bg-blue-400 rounded" />
          </div>

          {/* Header with Sideways Width & Expand Controls */}
          <div className="h-9 px-3 border-b border-[#2d3748] flex items-center justify-between bg-[#1a202c]">
            <span className="font-bold text-gray-200 text-xs flex items-center gap-1.5 truncate">
              {activeDocker.title}
            </span>

            <div className="flex items-center space-x-1">
              {/* Quick Width Preset Pills */}
              <div className="hidden sm:flex items-center space-x-0.5 bg-gray-900/90 rounded-lg p-0.5 border border-gray-700/60 mr-1">
                <button
                  onClick={() => setDockerWidth(320)}
                  title="Standard Width (320px)"
                  className={`px-1.5 py-0.5 text-[9px] font-mono rounded ${
                    dockerWidth <= 340 ? 'bg-blue-600 text-white font-bold' : 'text-gray-400 hover:text-gray-200'
                  }`}
                >
                  S
                </button>
                <button
                  onClick={() => setDockerWidth(480)}
                  title="Medium Width (480px)"
                  className={`px-1.5 py-0.5 text-[9px] font-mono rounded ${
                    dockerWidth > 340 && dockerWidth <= 520 ? 'bg-blue-600 text-white font-bold' : 'text-gray-400 hover:text-gray-200'
                  }`}
                >
                  M
                </button>
                <button
                  onClick={() => setDockerWidth(660)}
                  title="Wide Spread Width (660px)"
                  className={`px-1.5 py-0.5 text-[9px] font-mono rounded ${
                    dockerWidth > 520 ? 'bg-blue-600 text-white font-bold' : 'text-gray-400 hover:text-gray-200'
                  }`}
                >
                  L
                </button>
              </div>

              {/* Wide Mode Toggle */}
              <button
                onClick={toggleWideView}
                title={dockerWidth >= 500 ? 'Narrow View' : 'Expand Wide View'}
                className="p-1 hover:bg-[#2d3748] text-gray-400 hover:text-white rounded-lg transition-colors"
              >
                {dockerWidth >= 500 ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
              </button>

              <button
                onClick={() => setActiveDockerTab(null)}
                className="p-1 hover:bg-[#2d3748] text-gray-400 hover:text-white rounded-lg transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Docker Body with Horizontal & Vertical Overflow */}
          <div className="flex-1 overflow-x-auto overflow-y-auto flex flex-col">
            <ActiveComponent />
          </div>
        </div>
      )}

      {/* Right vertical strip with docker icons */}
      <div className="w-10 bg-[#1b2029] flex flex-col items-center py-2 space-y-1 overflow-y-auto scrollbar-none">
        {DOCKERS.map(d => {
          const Icon = d.icon;
          const isActive = activeDockerTab === d.id;

          return (
            <button
              key={d.id}
              onClick={() => setActiveDockerTab(isActive ? null : d.id)}
              title={d.title}
              className={`w-8 h-8 rounded-xl flex items-center justify-center transition-all ${
                isActive
                  ? 'bg-gradient-to-tr from-blue-600 to-cyan-500 text-white shadow-lg shadow-blue-500/30 scale-105'
                  : 'hover:bg-[#2d3748] text-gray-400 hover:text-gray-200'
              }`}
            >
              <Icon className="w-4 h-4" />
            </button>
          );
        })}
      </div>
    </div>
  );
};
