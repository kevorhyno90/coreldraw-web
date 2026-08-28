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
  { id: 'objects', title: 'Objects & Layers', icon: Layers, component: ObjectManagerDocker },
  { id: 'typography', title: 'Typography Manager', icon: Type, component: TypographyDocker },
  { id: 'photo', title: 'Photo & Bitmap Lab', icon: ImageIcon, component: PhotoEditingDocker },
  { id: 'ai', title: 'AI Vector Studio', icon: Bot, component: AiAssistantDocker },
  { id: 'effects', title: 'Effects & 3D', icon: Boxes, component: EffectsDocker },
  { id: 'shaping', title: 'Shaping & Booleans', icon: Shapes, component: ShapingDocker },
  { id: 'colors', title: 'Color Harmonies', icon: Palette, component: ColorPaletteDocker },
  { id: 'trace', title: 'PowerTRACE', icon: Sparkles, component: AutoTraceDocker },
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
        <div className="w-72 bg-[#1f2430] border-r border-[#2d3748] flex flex-col h-full shadow-2xl">
          {/* Header */}
          <div className="h-8 px-3 border-b border-[#2d3748] flex items-center justify-between bg-[#1a202c]">
            <span className="font-bold text-gray-200 text-xs flex items-center">
              {activeDocker.title}
            </span>
            <button
              onClick={() => setActiveDockerTab(null)}
              className="p-1 hover:bg-[#2d3748] text-gray-400 hover:text-white rounded"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Docker Body */}
          <div className="flex-1 overflow-hidden flex flex-col">
            <ActiveComponent />
          </div>
        </div>
      )}

      {/* Right vertical strip with docker icons */}
      <div className="w-9 bg-[#1b2029] flex flex-col items-center py-2 space-y-1">
        {DOCKERS.map(d => {
          const Icon = d.icon;
          const isActive = activeDockerTab === d.id;

          return (
            <button
              key={d.id}
              onClick={() => setActiveDockerTab(isActive ? null : d.id)}
              title={d.title}
              className={`w-7 h-7 rounded flex items-center justify-center transition ${
                isActive
                  ? 'bg-[#3b82f6] text-white shadow-md'
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
