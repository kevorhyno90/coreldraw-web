import React from 'react';
import { useCorel } from '../../context/CorelContext';
import { Plus, Copy, Trash2, BookOpen, FileText, ChevronLeft, ChevronRight } from 'lucide-react';

export const MultiPageBar: React.FC = () => {
  const {
    pages,
    activePageId,
    setActivePageId,
    addPage,
    duplicatePage,
    deletePage,
    activePage,
    updateActivePage,
  } = useCorel();

  return (
    <div className="h-7 bg-[#14171f] border-t border-gray-800/80 flex items-center justify-between px-3 text-[11px] select-none text-gray-300">
      {/* Left Page tabs */}
      <div className="flex items-center gap-1 overflow-x-auto scrollbar-none py-0.5">
        <span className="text-gray-500 font-medium mr-1 flex items-center gap-1">
          <BookOpen size={12} className="text-cyan-400" />
          <span>Pages:</span>
        </span>

        {pages.map((page, idx) => {
          const isActive = page.id === activePageId;
          return (
            <div
              key={page.id}
              onClick={() => setActivePageId(page.id)}
              className={`flex items-center gap-1.5 px-2.5 py-0.5 rounded-lg font-medium cursor-pointer transition-all ${
                isActive
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'bg-gray-800/80 hover:bg-gray-700 text-gray-300'
              }`}
            >
              <span>{page.name}</span>
              {pages.length > 1 && isActive && (
                <button
                  onClick={e => {
                    e.stopPropagation();
                    deletePage(page.id);
                  }}
                  title="Delete Page"
                  className="hover:text-red-300 p-0.5 rounded"
                >
                  <Trash2 size={10} />
                </button>
              )}
            </div>
          );
        })}

        {/* Add Page Button */}
        <button
          onClick={() => addPage()}
          title="Add New Page"
          className="p-1 hover:bg-gray-800 text-cyan-400 hover:text-cyan-300 rounded-lg flex items-center gap-1 font-semibold transition-colors"
        >
          <Plus size={13} />
          <span className="text-[10px]">Add Page</span>
        </button>

        {/* Duplicate Page Button */}
        <button
          onClick={() => duplicatePage(activePageId)}
          title="Duplicate Current Page"
          className="p-1 hover:bg-gray-800 text-gray-400 hover:text-gray-200 rounded-lg flex items-center gap-1 transition-colors"
        >
          <Copy size={11} />
        </button>
      </div>

      {/* Right: Active Page Dimensions & Orientation */}
      <div className="flex items-center gap-3 text-gray-400 text-[10px]">
        <div className="flex items-center gap-1">
          <span>Preset:</span>
          <span className="text-gray-200 font-mono">{activePage.preset}</span>
        </div>
        <div className="flex items-center gap-1 font-mono">
          <span className="text-gray-200">{activePage.width}</span> × <span className="text-gray-200">{activePage.height}</span> {activePage.unit}
        </div>
        <button
          onClick={() => {
            const nextOrientation = activePage.orientation === 'landscape' ? 'portrait' : 'landscape';
            updateActivePage({
              orientation: nextOrientation,
              width: activePage.height,
              height: activePage.width,
            });
          }}
          className="px-1.5 py-0.5 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded font-mono uppercase text-[9px] transition-colors"
          title="Toggle Portrait / Landscape Orientation"
        >
          {activePage.orientation}
        </button>
      </div>
    </div>
  );
};
