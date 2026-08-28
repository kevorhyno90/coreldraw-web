import React from 'react';
import { useCorel } from '../../context/CorelContext';

interface RulersProps {
  cursorPos: { x: number; y: number };
}

export const Rulers: React.FC<RulersProps> = ({ cursorPos }) => {
  const { activePage, zoom, pan, addGuideline } = useCorel();

  const handleTopRulerMouseDown = (e: React.MouseEvent) => {
    // Calculate page Y position from ruler click
    const pageY = (e.clientY - 70 - pan.y) / zoom;
    addGuideline('horizontal', Math.round(pageY));
  };

  const handleLeftRulerMouseDown = (e: React.MouseEvent) => {
    // Calculate page X position from ruler click
    const pageX = (e.clientX - 40 - pan.x) / zoom;
    addGuideline('vertical', Math.round(pageX));
  };

  // Convert cursor position to screen coordinates on rulers
  const cursorScreenX = pan.x + cursorPos.x * zoom + 40;
  const cursorScreenY = pan.y + cursorPos.y * zoom + 70;

  return (
    <>
      {/* Top-Left Corner Block */}
      <div className="absolute top-0 left-0 w-6 h-6 bg-[#1f2430] border-r border-b border-[#2d3748] z-30 flex items-center justify-center text-[9px] font-mono text-gray-400">
        px
      </div>

      {/* Top Horizontal Ruler */}
      <div
        onMouseDown={handleTopRulerMouseDown}
        className="absolute top-0 left-6 right-0 h-6 bg-[#1b2029] border-b border-[#2d3748] z-20 select-none overflow-hidden cursor-row-resize"
        title="Click and drag down to create Horizontal Guideline"
      >
        <svg className="w-full h-full">
          {/* Tick marks */}
          {Array.from({ length: 80 }).map((_, i) => {
            const pageX = (i - 20) * 50;
            const screenX = pan.x + pageX * zoom;
            if (screenX < -50 || screenX > 2500) return null;
            const isMajor = pageX % 100 === 0;

            return (
              <g key={`top_tick_${i}`}>
                <line
                  x1={screenX}
                  y1={isMajor ? 12 : 18}
                  x2={screenX}
                  y2={24}
                  stroke="#475569"
                  strokeWidth="1"
                />
                {isMajor && (
                  <text x={screenX + 2} y={10} fill="#94a3b8" fontSize="9" fontFamily="monospace">
                    {pageX}
                  </text>
                )}
              </g>
            );
          })}

          {/* Page Boundary Indicators */}
          <line
            x1={pan.x}
            y1={0}
            x2={pan.x}
            y2={24}
            stroke="#00e676"
            strokeWidth="2"
          />
          <line
            x1={pan.x + activePage.width * zoom}
            y1={0}
            x2={pan.x + activePage.width * zoom}
            y2={24}
            stroke="#00e676"
            strokeWidth="2"
          />

          {/* Cursor indicator line */}
          <line
            x1={cursorScreenX - 40}
            y1={0}
            x2={cursorScreenX - 40}
            y2={24}
            stroke="#ef4444"
            strokeWidth="1.5"
          />
        </svg>
      </div>

      {/* Left Vertical Ruler */}
      <div
        onMouseDown={handleLeftRulerMouseDown}
        className="absolute top-6 left-0 bottom-0 w-6 bg-[#1b2029] border-r border-[#2d3748] z-20 select-none overflow-hidden cursor-col-resize"
        title="Click and drag right to create Vertical Guideline"
      >
        <svg className="w-full h-full">
          {/* Tick marks */}
          {Array.from({ length: 80 }).map((_, i) => {
            const pageY = (i - 20) * 50;
            const screenY = pan.y + pageY * zoom;
            if (screenY < -50 || screenY > 2000) return null;
            const isMajor = pageY % 100 === 0;

            return (
              <g key={`left_tick_${i}`}>
                <line
                  x1={isMajor ? 12 : 18}
                  y1={screenY}
                  x2={24}
                  y2={screenY}
                  stroke="#475569"
                  strokeWidth="1"
                />
                {isMajor && (
                  <text
                    x={2}
                    y={screenY - 2}
                    fill="#94a3b8"
                    fontSize="8"
                    fontFamily="monospace"
                    transform={`rotate(-90 8 ${screenY})`}
                  >
                    {pageY}
                  </text>
                )}
              </g>
            );
          })}

          {/* Page Boundary Indicators */}
          <line
            x1={0}
            y1={pan.y}
            x2={24}
            y2={pan.y}
            stroke="#00e676"
            strokeWidth="2"
          />
          <line
            x1={0}
            y1={pan.y + activePage.height * zoom}
            x2={24}
            y2={pan.y + activePage.height * zoom}
            stroke="#00e676"
            strokeWidth="2"
          />

          {/* Cursor indicator line */}
          <line
            x1={0}
            y1={cursorScreenY - 70}
            x2={24}
            y2={cursorScreenY - 70}
            stroke="#ef4444"
            strokeWidth="1.5"
          />
        </svg>
      </div>
    </>
  );
};
