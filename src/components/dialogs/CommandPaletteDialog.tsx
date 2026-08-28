import React, { useState, useEffect, useRef } from 'react';
import { useCorel } from '../../context/CorelContext';
import {
  Search,
  Sparkles,
  Command,
  Sliders,
  Layers,
  Shapes,
  Palette,
  Boxes,
  FileText,
  Download,
  Printer,
  X,
  Type,
  Image as ImageIcon,
  Bot,
} from 'lucide-react';

interface CommandItem {
  id: string;
  title: string;
  category: 'Tools' | 'Dockers' | 'Operations' | 'Export' | 'Templates';
  shortcut?: string;
  icon: React.ComponentType<{ className?: string }>;
  run: () => void;
}

export const CommandPaletteDialog: React.FC = () => {
  const {
    openDialog,
    setOpenDialog,
    setActiveTool,
    setActiveDockerTab,
    convertToCurves,
    primarySelectedObject,
    applyBooleanOp,
    groupSelected,
    ungroupSelected,
    bringToFront,
    sendToBack,
    loadTemplate,
    zoomToFit,
  } = useCorel();

  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  const COMMANDS: CommandItem[] = [
    // Tools
    { id: 't_pick', title: 'Pick Tool', category: 'Tools', shortcut: 'Space', icon: Command, run: () => setActiveTool('pick') },
    { id: 't_shape', title: 'Shape / Node Edit Tool (F10)', category: 'Tools', shortcut: 'F10', icon: Sparkles, run: () => setActiveTool('shape') },
    { id: 't_brush', title: 'Artistic Media Brush Tool', category: 'Tools', shortcut: 'I', icon: Sparkles, run: () => setActiveTool('artistic-media') },
    { id: 't_rect', title: 'Rectangle Tool', category: 'Tools', shortcut: 'F6', icon: Shapes, run: () => setActiveTool('rectangle') },
    { id: 't_ellipse', title: 'Ellipse Tool', category: 'Tools', shortcut: 'F7', icon: Shapes, run: () => setActiveTool('ellipse') },
    { id: 't_poly', title: 'Polygon / Star Tool', category: 'Tools', shortcut: 'Y', icon: Shapes, run: () => setActiveTool('polygon') },
    { id: 't_text', title: 'Text Tool', category: 'Tools', shortcut: 'F8', icon: Type, run: () => setActiveTool('text') },
    { id: 't_fill', title: 'Interactive Gradient Fill', category: 'Tools', shortcut: 'G', icon: Palette, run: () => setActiveTool('interactive-fill') },

    // Operations
    {
      id: 'op_curves',
      title: 'Convert to Curves (Ctrl+Q)',
      category: 'Operations',
      shortcut: 'Ctrl+Q',
      icon: Sparkles,
      run: () => primarySelectedObject && convertToCurves(primarySelectedObject.id),
    },
    { id: 'op_weld', title: 'Shaping: Weld (Union)', category: 'Operations', icon: Shapes, run: () => applyBooleanOp('weld') },
    { id: 'op_trim', title: 'Shaping: Trim (Difference)', category: 'Operations', icon: Shapes, run: () => applyBooleanOp('trim') },
    { id: 'op_intersect', title: 'Shaping: Intersect', category: 'Operations', icon: Shapes, run: () => applyBooleanOp('intersect') },
    { id: 'op_group', title: 'Group Selected Objects', category: 'Operations', shortcut: 'Ctrl+G', icon: Layers, run: groupSelected },
    { id: 'op_ungroup', title: 'Ungroup Objects', category: 'Operations', shortcut: 'Ctrl+U', icon: Layers, run: ungroupSelected },
    { id: 'op_front', title: 'Bring to Front', category: 'Operations', shortcut: 'Shift+PgUp', icon: Layers, run: bringToFront },
    { id: 'op_back', title: 'Send to Back', category: 'Operations', shortcut: 'Shift+PgDn', icon: Layers, run: sendToBack },
    { id: 'op_fit', title: 'Zoom to Fit Page', category: 'Operations', shortcut: 'F4', icon: Command, run: zoomToFit },

    // Dockers
    { id: 'd_typo', title: 'Open Typography & Font Manager', category: 'Dockers', icon: Type, run: () => setActiveDockerTab('typography') },
    { id: 'd_photo', title: 'Open Photo & Bitmap Lab', category: 'Dockers', icon: ImageIcon, run: () => setActiveDockerTab('photo') },
    { id: 'd_ai', title: 'Open AI Vector Design Studio', category: 'Dockers', icon: Bot, run: () => setActiveDockerTab('ai') },
    { id: 'd_props', title: 'Open Object Properties Docker', category: 'Dockers', icon: Sliders, run: () => setActiveDockerTab('properties') },
    { id: 'd_layers', title: 'Open Objects & Layers Docker', category: 'Dockers', icon: Layers, run: () => setActiveDockerTab('objects') },
    { id: 'd_effects', title: 'Open 3D Extrude & Effects Docker', category: 'Dockers', icon: Boxes, run: () => setActiveDockerTab('effects') },
    { id: 'd_trace', title: 'Open PowerTRACE Auto-Trace Docker', category: 'Dockers', icon: Sparkles, run: () => setActiveDockerTab('trace') },

    // Templates
    { id: 'tpl_balloon', title: 'Load Template: Iconic Corel Balloon', category: 'Templates', icon: FileText, run: () => loadTemplate('corel-classic-balloon') },
    { id: 'tpl_cyber', title: 'Load Template: Cyberpunk Emblem', category: 'Templates', icon: FileText, run: () => loadTemplate('cyberpunk-badge') },
    { id: 'tpl_esports', title: 'Load Template: Esports Gaming Crest', category: 'Templates', icon: FileText, run: () => loadTemplate('esports-crest') },
    { id: 'tpl_cert', title: 'Load Template: Certificate of Excellence', category: 'Templates', icon: FileText, run: () => loadTemplate('certificate-diploma') },

    // Export
    { id: 'exp_dialog', title: 'Open Export Dialog (PNG/PDF/SVG/JPG)', category: 'Export', shortcut: 'Ctrl+E', icon: Download, run: () => setOpenDialog('export') },
  ];

  const filtered = COMMANDS.filter(cmd =>
    cmd.title.toLowerCase().includes(query.toLowerCase()) || cmd.category.toLowerCase().includes(query.toLowerCase())
  );

  useEffect(() => {
    if (openDialog === ('command' as any)) {
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [openDialog]);

  // Global Ctrl+K listener
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setOpenDialog(openDialog === ('command' as any) ? null : ('command' as any));
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [openDialog, setOpenDialog]);

  if (openDialog !== ('command' as any)) return null;

  const executeCommand = (cmd: CommandItem) => {
    cmd.run();
    setOpenDialog(null);
    setQuery('');
  };

  return (
    <div className="fixed inset-0 bg-black/75 backdrop-blur-sm z-50 flex items-start justify-center pt-20 p-4 select-none">
      <div className="bg-[#1f2430] border border-[#374151] rounded-xl shadow-2xl w-full max-w-xl overflow-hidden text-gray-200 text-xs">
        {/* Search Input */}
        <div className="px-4 py-3 border-b border-[#2d3748] flex items-center bg-[#171b22] space-x-2">
          <Search className="w-4 h-4 text-emerald-400" />
          <input
            ref={inputRef}
            type="text"
            placeholder="Type a command, tool, docker, template, or action..."
            value={query}
            onChange={e => { setQuery(e.target.value); setSelectedIndex(0); }}
            onKeyDown={e => {
              if (e.key === 'ArrowDown') {
                e.preventDefault();
                setSelectedIndex(i => (i + 1) % Math.max(1, filtered.length));
              } else if (e.key === 'ArrowUp') {
                e.preventDefault();
                setSelectedIndex(i => (i - 1 + filtered.length) % Math.max(1, filtered.length));
              } else if (e.key === 'Enter' && filtered[selectedIndex]) {
                e.preventDefault();
                executeCommand(filtered[selectedIndex]);
              } else if (e.key === 'Escape') {
                setOpenDialog(null);
              }
            }}
            className="flex-1 bg-transparent text-white placeholder-gray-500 outline-none text-sm font-medium"
          />
          <kbd className="px-1.5 py-0.5 bg-[#2d3748] text-gray-400 rounded text-[10px] font-mono border border-gray-600">
            ESC
          </kbd>
        </div>

        {/* Results List */}
        <div className="max-h-80 overflow-y-auto p-2 space-y-1">
          {filtered.length === 0 ? (
            <div className="py-8 text-center text-gray-500">
              No matching commands or actions found.
            </div>
          ) : (
            filtered.map((cmd, idx) => {
              const Icon = cmd.icon;
              const isSelected = idx === selectedIndex;
              return (
                <div
                  key={cmd.id}
                  onClick={() => executeCommand(cmd)}
                  onMouseEnter={() => setSelectedIndex(idx)}
                  className={`px-3 py-2 rounded-lg flex items-center justify-between cursor-pointer transition ${
                    isSelected ? 'bg-[#2563eb] text-white font-semibold shadow' : 'text-gray-300 hover:bg-[#242b38]'
                  }`}
                >
                  <div className="flex items-center space-x-2.5">
                    <Icon className={`w-4 h-4 ${isSelected ? 'text-white' : 'text-emerald-400'}`} />
                    <span>{cmd.title}</span>
                    <span className={`text-[10px] px-1.5 py-0.2 rounded font-mono ${
                      isSelected ? 'bg-blue-700 text-blue-100' : 'bg-[#171b22] text-gray-400 border border-[#2d3748]'
                    }`}>
                      {cmd.category}
                    </span>
                  </div>
                  {cmd.shortcut && (
                    <span className={`text-[10px] font-mono ${isSelected ? 'text-blue-200' : 'text-gray-500'}`}>
                      {cmd.shortcut}
                    </span>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="px-4 py-2 border-t border-[#2d3748] bg-[#171b22] text-[11px] text-gray-500 flex items-center justify-between">
          <span>Navigate with <kbd className="px-1 bg-[#262e3d] text-gray-300 rounded">↑</kbd> <kbd className="px-1 bg-[#262e3d] text-gray-300 rounded">↓</kbd> • Execute with <kbd className="px-1 bg-[#262e3d] text-gray-300 rounded">Enter</kbd></span>
          <span className="text-emerald-400 font-mono">Devin's CorelDRAW 2026</span>
        </div>
      </div>
    </div>
  );
};
