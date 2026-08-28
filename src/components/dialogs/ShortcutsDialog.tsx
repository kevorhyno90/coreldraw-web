import React from 'react';
import { useCorel } from '../../context/CorelContext';
import { Keyboard, X } from 'lucide-react';

const SHORTCUTS = [
  { group: 'Tool Shortcuts', items: [
    { key: 'Space', desc: 'Pick Tool' },
    { key: 'F10', desc: 'Shape / Node Tool' },
    { key: 'F5', desc: 'Freehand Curve Tool' },
    { key: 'F6', desc: 'Rectangle Tool' },
    { key: 'F7', desc: 'Ellipse Tool' },
    { key: 'Y', desc: 'Polygon Tool' },
    { key: 'F8', desc: 'Text Tool' },
    { key: 'G', desc: 'Interactive Fill (Gradient) Tool' },
    { key: 'Z', desc: 'Zoom Tool' },
    { key: 'H', desc: 'Pan / Hand Tool' },
  ]},
  { group: 'Object & Curve Commands', items: [
    { key: 'Ctrl + Q', desc: 'Convert to Curves (Bézier Node Edit)' },
    { key: 'Ctrl + G', desc: 'Group Objects' },
    { key: 'Ctrl + U', desc: 'Ungroup Objects' },
    { key: 'Ctrl + D', desc: 'Duplicate Selection' },
    { key: 'Delete', desc: 'Delete Selected Objects' },
    { key: 'P', desc: 'Center to Page' },
    { key: 'Shift + PgUp', desc: 'Bring to Front of Layer' },
    { key: 'Shift + PgDn', desc: 'Send to Back of Layer' },
  ]},
  { group: 'Document & Edit', items: [
    { key: 'Ctrl + Z', desc: 'Undo' },
    { key: 'Ctrl + Y', desc: 'Redo' },
    { key: 'Ctrl + A', desc: 'Select All Objects' },
    { key: 'Ctrl + N', desc: 'New Document' },
    { key: 'Ctrl + S', desc: 'Save Project (.cdrw)' },
    { key: 'Ctrl + E', desc: 'Export Artwork (PNG/PDF/SVG)' },
    { key: 'F4', desc: 'Zoom to Fit Page' },
  ]},
];

export const ShortcutsDialog: React.FC = () => {
  const { openDialog, setOpenDialog } = useCorel();

  if (openDialog !== 'shortcuts') return null;

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4 select-none">
      <div className="bg-[#1f2430] border border-[#374151] rounded-xl shadow-2xl w-full max-w-xl overflow-hidden text-gray-200 text-xs">
        <div className="px-4 py-3 border-b border-[#2d3748] flex items-center justify-between bg-[#171b22]">
          <span className="font-bold text-white text-sm flex items-center">
            <Keyboard className="w-4 h-4 mr-2 text-indigo-400" /> CorelDRAW Keyboard Shortcuts
          </span>
          <button onClick={() => setOpenDialog(null)} className="text-gray-400 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-4 space-y-4 max-h-[70vh] overflow-y-auto">
          {SHORTCUTS.map((grp, i) => (
            <div key={i} className="space-y-2">
              <h4 className="font-bold text-emerald-400 text-xs uppercase tracking-wider">{grp.group}</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-1.5">
                {grp.items.map((item, j) => (
                  <div key={j} className="flex items-center justify-between bg-[#1b2029] px-2.5 py-1.5 rounded border border-[#2d3748]">
                    <span className="text-gray-300">{item.desc}</span>
                    <span className="bg-[#2d3748] text-white px-2 py-0.5 rounded font-mono font-bold text-[10px]">
                      {item.key}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
