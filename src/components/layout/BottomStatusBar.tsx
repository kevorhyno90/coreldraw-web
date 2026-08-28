import React from 'react';
import { useCorel } from '../../context/CorelContext';
import { DocumentPalette } from './DocumentPalette';
import { Plus, Trash2, ChevronLeft, ChevronRight, FileText } from 'lucide-react';

export const BottomStatusBar: React.FC = () => {
  const {
    pages,
    activePageId,
    setActivePageId,
    addPage,
    deletePage,
    activeObjects,
    selectedObjects,
    activeFillColor,
    activeOutlineColor,
    activeOutlineWidth,
    setActiveDockerTab,
  } = useCorel();

  const activePageIndex = pages.findIndex(p => p.id === activePageId);

  return (
    <div className="flex flex-col bg-[#1f2430] border-t border-[#2d3748] text-xs select-none z-30">
      {/* Palette Strip */}
      <DocumentPalette />

      {/* Main Status Bar */}
      <div className="h-7 px-2 flex items-center justify-between text-gray-400 bg-[#171b22]">
        {/* Left: Multi-Page Navigation Bar */}
        <div className="flex items-center space-x-1">
          {/* Page Prev/Next */}
          <button
            disabled={activePageIndex <= 0}
            onClick={() => activePageIndex > 0 && setActivePageId(pages[activePageIndex - 1].id)}
            className="p-1 hover:bg-[#2d3748] disabled:opacity-30 rounded text-gray-300"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
          </button>

          {/* Page Tabs */}
          <div className="flex items-center space-x-1">
            {pages.map((p, idx) => {
              const isActive = p.id === activePageId;
              return (
                <button
                  key={p.id}
                  onClick={() => setActivePageId(p.id)}
                  className={`px-2.5 py-0.5 rounded text-[11px] font-medium flex items-center space-x-1 transition ${
                    isActive
                      ? 'bg-[#3b82f6] text-white font-bold shadow-sm'
                      : 'bg-[#242b38] hover:bg-[#2d3748] text-gray-300'
                  }`}
                >
                  <FileText className="w-3 h-3 mr-1 opacity-70" />
                  <span>{p.name}</span>
                </button>
              );
            })}
          </div>

          <button
            disabled={activePageIndex >= pages.length - 1}
            onClick={() => activePageIndex < pages.length - 1 && setActivePageId(pages[activePageIndex + 1].id)}
            className="p-1 hover:bg-[#2d3748] disabled:opacity-30 rounded text-gray-300"
          >
            <ChevronRight className="w-3.5 h-3.5" />
          </button>

          {/* Add Page */}
          <button
            onClick={() => addPage()}
            title="Add New Page"
            className="p-1 bg-[#242b38] hover:bg-[#2d3748] text-emerald-400 rounded flex items-center"
          >
            <Plus className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Center: Selection Status info */}
        <div className="text-[11px] text-gray-300 hidden md:block">
          {selectedObjects.length === 0 ? (
            <span className="text-gray-500">{activeObjects.length} Objects on Current Page</span>
          ) : selectedObjects.length === 1 ? (
            <span>
              <span className="text-emerald-400 font-semibold">{selectedObjects[0].name}</span> selected (Layer 1)
            </span>
          ) : (
            <span className="font-semibold text-blue-400">{selectedObjects.length} Objects Selected</span>
          )}
        </div>

        {/* Right: Active Fill & Outline Indicators */}
        <div className="flex items-center space-x-3">
          <div
            className="flex items-center space-x-1.5 cursor-pointer hover:bg-[#242b38] px-1.5 py-0.5 rounded"
            onClick={() => setActiveDockerTab('properties')}
            title="Active Fill Color (Click to inspect)"
          >
            <div
              style={{ backgroundColor: activeFillColor === 'none' ? 'transparent' : activeFillColor }}
              className="w-3.5 h-3.5 rounded-sm border border-white/40 shadow-sm"
            />
            <span className="text-[10px] font-mono text-gray-300">Fill</span>
          </div>

          <div
            className="flex items-center space-x-1.5 cursor-pointer hover:bg-[#242b38] px-1.5 py-0.5 rounded"
            onClick={() => setActiveDockerTab('properties')}
            title="Active Outline Color (Click to inspect)"
          >
            <div
              style={{ backgroundColor: activeOutlineColor === 'none' ? 'transparent' : activeOutlineColor }}
              className="w-3.5 h-3.5 rounded-sm border border-white/40 shadow-sm"
            />
            <span className="text-[10px] font-mono text-gray-300">{activeOutlineWidth}px</span>
          </div>
        </div>
      </div>
    </div>
  );
};
