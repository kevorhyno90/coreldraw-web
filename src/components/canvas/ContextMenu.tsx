import React, { useEffect, useRef } from 'react';
import { useCorel } from '../../context/CorelContext';
import {
  Trash2,
  Copy,
  Scissors,
  Clipboard,
  Sparkles,
  Layers,
  ArrowUp,
  ArrowDown,
  Type,
  Maximize2,
  Lock,
  Unlock,
  Eye,
  Sliders,
  Download,
} from 'lucide-react';

interface ContextMenuProps {
  x: number;
  y: number;
  onClose: () => void;
  onEditText?: () => void;
}

export const ContextMenu: React.FC<ContextMenuProps> = ({ x, y, onClose, onEditText }) => {
  const {
    primarySelectedObject,
    selectedObjects,
    deleteSelected,
    duplicateSelected,
    convertToCurves,
    groupSelected,
    ungroupSelected,
    bringToFront,
    sendToBack,
    setActiveDockerTab,
    setOpenDialog,
    setActiveTool,
  } = useCorel();

  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleDocClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as HTMLElement)) {
        onClose();
      }
    };
    window.addEventListener('mousedown', handleDocClick);
    return () => window.removeEventListener('mousedown', handleDocClick);
  }, [onClose]);

  if (!primarySelectedObject && selectedObjects.length === 0) return null;

  return (
    <div
      ref={menuRef}
      style={{ left: Math.min(window.innerWidth - 220, x), top: Math.min(window.innerHeight - 340, y) }}
      className="fixed z-50 w-56 bg-[#1b2029] border border-[#374151] rounded-xl shadow-2xl py-1 text-xs text-gray-200 select-none animate-in fade-in zoom-in-95 duration-100 divide-y divide-gray-800/60"
    >
      {/* Primary Edit Actions */}
      <div className="p-1 space-y-0.5">
        {primarySelectedObject?.type === 'text' && (
          <>
            <button
              onClick={() => {
                onEditText?.();
                onClose();
              }}
              className="w-full text-left px-2.5 py-1.5 hover:bg-blue-600 hover:text-white rounded-lg flex items-center justify-between font-semibold text-emerald-400"
            >
              <span className="flex items-center"><Type className="w-3.5 h-3.5 mr-2" /> Edit Text</span>
              <span className="text-[10px] opacity-60">Double Click</span>
            </button>
            <button
              onClick={() => {
                setActiveDockerTab('fontmanager');
                onClose();
              }}
              className="w-full text-left px-2.5 py-1.5 hover:bg-blue-600 hover:text-white rounded-lg flex items-center justify-between"
            >
              <span className="flex items-center"><Type className="w-3.5 h-3.5 mr-2 text-emerald-400" /> Open Font Manager</span>
            </button>
          </>
        )}

        <button
          onClick={() => {
            setActiveTool('shape');
            onClose();
          }}
          className="w-full text-left px-2.5 py-1.5 hover:bg-blue-600 hover:text-white rounded-lg flex items-center justify-between"
        >
          <span className="flex items-center"><Sparkles className="w-3.5 h-3.5 mr-2 text-cyan-400" /> Shape / Node Edit</span>
          <span className="text-gray-500 font-mono text-[10px]">F10</span>
        </button>

        {primarySelectedObject && primarySelectedObject.type !== 'path' && (
          <button
            onClick={() => {
              convertToCurves(primarySelectedObject.id);
              onClose();
            }}
            className="w-full text-left px-2.5 py-1.5 hover:bg-blue-600 hover:text-white rounded-lg flex items-center justify-between"
          >
            <span className="flex items-center"><Sparkles className="w-3.5 h-3.5 mr-2 text-amber-400" /> Convert to Curves</span>
            <span className="text-gray-500 font-mono text-[10px]">Ctrl+Q</span>
          </button>
        )}
      </div>

      {/* Clipboard & Duplicate */}
      <div className="p-1 space-y-0.5">
        <button
          onClick={() => {
            duplicateSelected();
            onClose();
          }}
          className="w-full text-left px-2.5 py-1.5 hover:bg-blue-600 hover:text-white rounded-lg flex items-center justify-between"
        >
          <span className="flex items-center"><Copy className="w-3.5 h-3.5 mr-2 text-indigo-400" /> Duplicate</span>
          <span className="text-gray-500 font-mono text-[10px]">Ctrl+D</span>
        </button>

        {selectedObjects.length >= 2 && (
          <button
            onClick={() => {
              groupSelected();
              onClose();
            }}
            className="w-full text-left px-2.5 py-1.5 hover:bg-blue-600 hover:text-white rounded-lg flex items-center justify-between"
          >
            <span className="flex items-center"><Layers className="w-3.5 h-3.5 mr-2 text-purple-400" /> Group Objects</span>
            <span className="text-gray-500 font-mono text-[10px]">Ctrl+G</span>
          </button>
        )}

        {primarySelectedObject?.type === 'group' && (
          <button
            onClick={() => {
              ungroupSelected();
              onClose();
            }}
            className="w-full text-left px-2.5 py-1.5 hover:bg-blue-600 hover:text-white rounded-lg flex items-center justify-between"
          >
            <span className="flex items-center"><Layers className="w-3.5 h-3.5 mr-2 text-amber-400" /> Ungroup Objects</span>
            <span className="text-gray-500 font-mono text-[10px]">Ctrl+U</span>
          </button>
        )}
      </div>

      {/* Order & Z-Index */}
      <div className="p-1 space-y-0.5">
        {primarySelectedObject && (
          <>
            <button
              onClick={() => {
                bringToFront();
                onClose();
              }}
              className="w-full text-left px-2.5 py-1.5 hover:bg-blue-600 hover:text-white rounded-lg flex items-center justify-between"
            >
              <span className="flex items-center"><ArrowUp className="w-3.5 h-3.5 mr-2 text-blue-400" /> Bring to Front</span>
              <span className="text-gray-500 font-mono text-[10px]">Shift+PgUp</span>
            </button>
            <button
              onClick={() => {
                sendToBack();
                onClose();
              }}
              className="w-full text-left px-2.5 py-1.5 hover:bg-blue-600 hover:text-white rounded-lg flex items-center justify-between"
            >
              <span className="flex items-center"><ArrowDown className="w-3.5 h-3.5 mr-2 text-blue-400" /> Send to Back</span>
              <span className="text-gray-500 font-mono text-[10px]">Shift+PgDn</span>
            </button>
          </>
        )}
      </div>

      {/* Delete Selection */}
      <div className="p-1">
        <button
          onClick={() => {
            deleteSelected();
            onClose();
          }}
          className="w-full text-left px-2.5 py-1.5 hover:bg-rose-600 hover:text-white rounded-lg flex items-center justify-between font-semibold text-rose-400 transition-colors"
        >
          <span className="flex items-center"><Trash2 className="w-3.5 h-3.5 mr-2" /> Delete Object</span>
          <span className="text-gray-400 font-mono text-[10px]">Del</span>
        </button>
      </div>
    </div>
  );
};
