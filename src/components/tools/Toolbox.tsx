import React, { useState, useRef, useEffect } from 'react';
import { useCorel } from '../../context/CorelContext';
import { ActiveTool } from '../../types/coreldraw';
import {
  MousePointer,
  Sparkles,
  Crop,
  Search,
  Hand,
  PenTool,
  Paintbrush,
  Square,
  Circle,
  Hexagon,
  Star,
  Type,
  Ruler,
  Boxes,
  SunMedium,
  Pipette,
  PaintBucket,
  Layers,
  Scissors,
  Eraser,
  Wand2,
  Spline,
} from 'lucide-react';

interface ToolGroup {
  id: string;
  name: string;
  defaultTool: ActiveTool;
  tools: {
    id: ActiveTool;
    name: string;
    shortcut?: string;
    icon: React.ComponentType<{ className?: string }>;
  }[];
}

const TOOL_GROUPS: ToolGroup[] = [
  {
    id: 'pick_group',
    name: 'Pick Tool',
    defaultTool: 'pick',
    tools: [
      { id: 'pick', name: 'Pick Tool', shortcut: 'Space', icon: MousePointer },
      { id: 'freehand-pick', name: 'Freehand Pick', icon: MousePointer },
    ],
  },
  {
    id: 'shape_group',
    name: 'Shape Tool',
    defaultTool: 'shape',
    tools: [
      { id: 'shape', name: 'Shape / Node Edit', shortcut: 'F10', icon: Sparkles },
      { id: 'smooth', name: 'Smooth Tool', icon: Spline },
      { id: 'roughen', name: 'Roughen Tool', icon: Wand2 },
    ],
  },
  {
    id: 'crop_group',
    name: 'Crop & Knife',
    defaultTool: 'crop',
    tools: [
      { id: 'crop', name: 'Crop Tool', icon: Crop },
      { id: 'knife', name: 'Knife Tool', icon: Scissors },
      { id: 'eraser', name: 'Eraser Tool', icon: Eraser },
    ],
  },
  {
    id: 'zoom_group',
    name: 'Zoom & Pan',
    defaultTool: 'zoom',
    tools: [
      { id: 'zoom', name: 'Zoom Tool', shortcut: 'Z', icon: Search },
      { id: 'pan', name: 'Pan / Hand Tool', shortcut: 'H', icon: Hand },
    ],
  },
  {
    id: 'curve_group',
    name: 'Drawing Curves',
    defaultTool: 'freehand',
    tools: [
      { id: 'freehand', name: 'Freehand Tool', shortcut: 'F5', icon: PenTool },
      { id: 'pen', name: 'Pen Tool', icon: PenTool },
      { id: 'bezier', name: 'Bézier Curve Tool', icon: Spline },
      { id: '2point-line', name: '2-Point Line', icon: PenTool },
      { id: '3point-curve', name: '3-Point Curve', icon: Spline },
    ],
  },
  {
    id: 'artistic_group',
    name: 'Artistic Media',
    defaultTool: 'artistic-media',
    tools: [
      { id: 'artistic-media', name: 'Artistic Media Brush', shortcut: 'I', icon: Paintbrush },
    ],
  },
  {
    id: 'rect_group',
    name: 'Rectangle Tool',
    defaultTool: 'rectangle',
    tools: [
      { id: 'rectangle', name: 'Rectangle Tool', shortcut: 'F6', icon: Square },
      { id: '3point-rectangle', name: '3-Point Rectangle', icon: Square },
    ],
  },
  {
    id: 'ellipse_group',
    name: 'Ellipse Tool',
    defaultTool: 'ellipse',
    tools: [
      { id: 'ellipse', name: 'Ellipse Tool', shortcut: 'F7', icon: Circle },
      { id: '3point-ellipse', name: '3-Point Ellipse', icon: Circle },
    ],
  },
  {
    id: 'polygon_group',
    name: 'Polygon & Objects',
    defaultTool: 'polygon',
    tools: [
      { id: 'polygon', name: 'Polygon Tool', shortcut: 'Y', icon: Hexagon },
      { id: 'star', name: 'Star Tool', icon: Star },
      { id: 'spiral', name: 'Spiral Tool', icon: Spline },
    ],
  },
  {
    id: 'text_group',
    name: 'Text Tool',
    defaultTool: 'text',
    tools: [
      { id: 'text', name: 'Text Tool', shortcut: 'F8', icon: Type },
    ],
  },
  {
    id: 'dimension_group',
    name: 'Dimension Tool',
    defaultTool: 'dimension',
    tools: [
      { id: 'dimension', name: 'Parallel Dimension', icon: Ruler },
    ],
  },
  {
    id: 'effects_group',
    name: 'Interactive Effects',
    defaultTool: 'drop-shadow',
    tools: [
      { id: 'drop-shadow', name: 'Drop Shadow Tool', icon: SunMedium },
      { id: 'extrude', name: '3D Extrude Tool', icon: Boxes },
      { id: 'contour', name: 'Contour Tool', icon: Layers },
    ],
  },
  {
    id: 'fill_group',
    name: 'Interactive Fill',
    defaultTool: 'interactive-fill',
    tools: [
      { id: 'interactive-fill', name: 'Interactive Gradient Fill', shortcut: 'G', icon: PaintBucket },
      { id: 'smart-fill', name: 'Smart Flood Fill', icon: PaintBucket },
      { id: 'color-eyedropper', name: 'Color Eyedropper', icon: Pipette },
    ],
  },
];

export const Toolbox: React.FC = () => {
  const { activeTool, setActiveTool } = useCorel();
  const [openFlyoutId, setOpenFlyoutId] = useState<string | null>(null);
  const [selectedTools, setSelectedTools] = useState<Record<string, ActiveTool>>({
    pick_group: 'pick',
    shape_group: 'shape',
    crop_group: 'crop',
    zoom_group: 'zoom',
    curve_group: 'freehand',
    artistic_group: 'artistic-media',
    rect_group: 'rectangle',
    ellipse_group: 'ellipse',
    polygon_group: 'polygon',
    text_group: 'text',
    dimension_group: 'dimension',
    effects_group: 'drop-shadow',
    fill_group: 'interactive-fill',
  });

  const flyoutTimerRef = useRef<number | null>(null);

  // Close flyout on outside click
  useEffect(() => {
    const handleDocClick = (e: MouseEvent) => {
      if (!(e.target as HTMLElement).closest('.toolbox-container')) {
        setOpenFlyoutId(null);
      }
    };
    window.addEventListener('mousedown', handleDocClick);
    return () => window.removeEventListener('mousedown', handleDocClick);
  }, []);

  const handleToolClick = (groupId: string, toolId: ActiveTool) => {
    setSelectedTools(prev => ({ ...prev, [groupId]: toolId }));
    setActiveTool(toolId);
    setOpenFlyoutId(null);
  };

  const handleMouseDown = (groupId: string) => {
    flyoutTimerRef.current = window.setTimeout(() => {
      setOpenFlyoutId(groupId);
    }, 250); // Hold for 250ms to open flyout menu
  };

  const handleMouseUp = () => {
    if (flyoutTimerRef.current) {
      clearTimeout(flyoutTimerRef.current);
      flyoutTimerRef.current = null;
    }
  };

  return (
    <div className="toolbox-container w-10 bg-[#1f2430] border-r border-[#2d3748] flex flex-col items-center py-1.5 space-y-1 select-none z-40 relative">
      {TOOL_GROUPS.map(group => {
        const currentToolId = selectedTools[group.id] || group.defaultTool;
        const currentTool = group.tools.find(t => t.id === currentToolId) || group.tools[0];
        const isActive = activeTool === currentTool.id || group.tools.some(t => t.id === activeTool);
        const IconComponent = currentTool.icon;
        const hasMultiple = group.tools.length > 1;

        return (
          <div key={group.id} className="relative group/btn">
            <button
              onClick={() => handleToolClick(group.id, currentTool.id)}
              onMouseDown={() => handleMouseDown(group.id)}
              onMouseUp={handleMouseUp}
              onContextMenu={e => {
                e.preventDefault();
                setOpenFlyoutId(group.id);
              }}
              title={`${currentTool.name} ${currentTool.shortcut ? `(${currentTool.shortcut})` : ''}`}
              className={`w-8 h-8 rounded flex items-center justify-center relative transition ${
                isActive
                  ? 'bg-[#3b82f6] text-white shadow-md'
                  : 'hover:bg-[#2d3748] text-gray-400 hover:text-gray-100'
              }`}
            >
              <IconComponent className="w-4 h-4" />
              {/* Flyout indicator triangle (classic Corel style) */}
              {hasMultiple && (
                <span className="absolute bottom-0.5 right-0.5 w-0 h-0 border-solid border-t-0 border-l-transparent border-r-[4px] border-r-transparent border-b-[4px] border-b-gray-400" />
              )}
            </button>

            {/* Flyout Popup */}
            {openFlyoutId === group.id && (
              <div className="absolute left-full top-0 ml-1.5 bg-[#1f2430] border border-[#374151] rounded-md shadow-2xl py-1 z-50 flex flex-col min-w-[170px] text-xs">
                {group.tools.map(tool => {
                  const SubIcon = tool.icon;
                  const isSubActive = activeTool === tool.id;
                  return (
                    <button
                      key={tool.id}
                      onClick={() => handleToolClick(group.id, tool.id)}
                      className={`px-3 py-1.5 flex items-center justify-between text-left ${
                        isSubActive ? 'bg-[#2563eb] text-white font-medium' : 'text-gray-200 hover:bg-[#2d3748]'
                      }`}
                    >
                      <span className="flex items-center">
                        <SubIcon className="w-3.5 h-3.5 mr-2 text-emerald-400" />
                        {tool.name}
                      </span>
                      {tool.shortcut && <span className="text-gray-400 text-[10px] ml-2">{tool.shortcut}</span>}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};
