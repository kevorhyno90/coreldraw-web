import React, { useRef } from 'react';
import { useCorel } from '../../context/CorelContext';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export const DocumentPalette: React.FC = () => {
  const {
    colorPalette,
    setActiveFillColor,
    setActiveOutlineColor,
    updateSelectedObjects,
  } = useCorel();

  const scrollRef = useRef<HTMLDivElement>(null);

  const scrollLeft = () => {
    if (scrollRef.current) scrollRef.current.scrollBy({ left: -150, behavior: 'smooth' });
  };

  const scrollRight = () => {
    if (scrollRef.current) scrollRef.current.scrollBy({ left: 150, behavior: 'smooth' });
  };

  const handleColorClick = (e: React.MouseEvent, color: string) => {
    e.preventDefault();
    if (e.button === 0) {
      // Left Click = Set Fill
      setActiveFillColor(color);
      updateSelectedObjects({ fill: { type: 'solid', color } });
    }
  };

  const handleContextMenu = (e: React.MouseEvent, color: string) => {
    e.preventDefault();
    // Right Click = Set Outline
    setActiveOutlineColor(color);
    updateSelectedObjects({ outline: { color } as any });
  };

  return (
    <div className="h-6 bg-[#1b2029] border-t border-[#2d3748] flex items-center px-1 select-none z-30">
      {/* Scroll Left */}
      <button
        onClick={scrollLeft}
        className="h-4 w-4 flex items-center justify-center hover:bg-[#2d3748] text-gray-400 rounded"
      >
        <ChevronLeft className="w-3.5 h-3.5" />
      </button>

      {/* Swatches Bar */}
      <div
        ref={scrollRef}
        className="flex-1 flex items-center space-x-1 overflow-x-hidden px-1 h-full"
      >
        {/* None / Transparent Swatch */}
        <button
          onClick={() => {
            setActiveFillColor('none');
            updateSelectedObjects({ fill: { type: 'none', color: '#000000' } });
          }}
          onContextMenu={e => {
            e.preventDefault();
            setActiveOutlineColor('none');
            updateSelectedObjects({ outline: { color: 'none' } as any });
          }}
          className="w-4 h-4 bg-white border border-[#475569] rounded-sm flex items-center justify-center relative flex-shrink-0"
          title="No Color (Left: None Fill, Right: None Outline)"
        >
          <span className="w-[1px] h-4 bg-red-600 rotate-45 absolute" />
        </button>

        {colorPalette.map((col, idx) => (
          <button
            key={idx}
            onClick={e => handleColorClick(e, col)}
            onContextMenu={e => handleContextMenu(e, col)}
            style={{ backgroundColor: col }}
            className="w-4 h-4 rounded-sm border border-[#374151] flex-shrink-0 hover:scale-125 transition-transform"
            title={`${col} (Left-click: Fill, Right-click: Outline)`}
          />
        ))}
      </div>

      {/* Scroll Right */}
      <button
        onClick={scrollRight}
        className="h-4 w-4 flex items-center justify-center hover:bg-[#2d3748] text-gray-400 rounded"
      >
        <ChevronRight className="w-3.5 h-3.5" />
      </button>
    </div>
  );
};
