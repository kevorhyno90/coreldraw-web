import React from 'react';
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
  Bot,
  ChevronRight,
  X,
} from 'lucide-react';

interface DockerItem {
  id: DockerTab;
  title: string;
  icon: React.ComponentType<{ className?: string }>;
  component: React.ComponentType;
}

const DOCKERS: DockerItem[] = [
  { id: 'properties', title: 'Properties', icon: SlidersHorizontal, component: PropertiesDocker },
  { id: 'prepress', title: 'Prepress & Separations 2025', icon: Printer, component: PrepressDocker },
  { id: 'fontmanager', title: 'Corel Font Manager 2025', icon: Type, component: FontManagerDocker },
  { id: 'colors', title: 'Pantone 2025 & Palettes', icon: Palette, component: ColorPaletteDocker },
  { id: 'photo', title: 'PHOTO-PAINT Lab', icon: ImageIcon, component: PhotoEditingDocker },
  { id: 'objects', title: 'Objects & Layers', icon: Layers, component: ObjectManagerDocker },
  { id: 'effects', title: 'Effects & 3D', icon: Boxes, component: EffectsDocker },
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

  const activeDocker = DOCKERS.find(d => d.id === activeDockerTab);
  const ActiveComponent = activeDocker?.component;

  return (
    <div className="flex select-none z-40 bg-[#1b2029] border-l border-[#2d3748]">
      {/* Expanded Docker Panel Content */}
      {activeDockerTab && ActiveComponent && (
        <div className="w-80 bg-[#1f2430] border-r border-[#2d3748] flex flex-col h-full shadow-2xl animate-in slide-in-from-right-4 duration-150">
          {/* Header */}
          <div className="h-9 px-3 border-b border-[#2d3748] flex items-center justify-between bg-[#1a202c]">
            <span className="font-bold text-gray-200 text-xs flex items-center">
              {activeDocker.title}
            </span>
            <button
              onClick={() => setActiveDockerTab(null)}
              className="p-1 hover:bg-[#2d3748] text-gray-400 hover:text-white rounded-lg transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Docker Body */}
          <div className="flex-1 overflow-hidden flex flex-col">
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
