import React from 'react';
import { useCorel } from '../../context/CorelContext';
import {
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  Maximize2,
} from 'lucide-react';

export const AlignDocker: React.FC = () => {
  const { alignSelected, selectedObjects } = useCorel();

  return (
    <div className="flex-1 overflow-y-auto p-3 space-y-4 text-xs select-none text-gray-200">
      <div className="border-b border-[#2d3748] pb-2">
        <h3 className="font-bold text-white">Align & Distribute</h3>
        <p className="text-[11px] text-gray-400 mt-1">
          Align selection edges or center objects to the printable page.
        </p>
      </div>

      {/* Align to Selection */}
      <div className="space-y-2">
        <h4 className="font-semibold text-gray-300">Align Selection</h4>
        <div className="grid grid-cols-3 gap-1.5">
          <button
            onClick={() => alignSelected('left')}
            className="p-2 bg-[#1b2029] hover:bg-[#2563eb] rounded border border-[#2d3748] flex flex-col items-center justify-center space-y-1"
          >
            <AlignLeft className="w-4 h-4 text-blue-400" />
            <span className="text-[10px]">Left</span>
          </button>
          <button
            onClick={() => alignSelected('center')}
            className="p-2 bg-[#1b2029] hover:bg-[#2563eb] rounded border border-[#2d3748] flex flex-col items-center justify-center space-y-1"
          >
            <AlignCenter className="w-4 h-4 text-blue-400" />
            <span className="text-[10px]">Center</span>
          </button>
          <button
            onClick={() => alignSelected('right')}
            className="p-2 bg-[#1b2029] hover:bg-[#2563eb] rounded border border-[#2d3748] flex flex-col items-center justify-center space-y-1"
          >
            <AlignRight className="w-4 h-4 text-blue-400" />
            <span className="text-[10px]">Right</span>
          </button>
          <button
            onClick={() => alignSelected('top')}
            className="p-2 bg-[#1b2029] hover:bg-[#2563eb] rounded border border-[#2d3748] flex flex-col items-center justify-center space-y-1"
          >
            <span className="font-bold text-xs">⊤</span>
            <span className="text-[10px]">Top</span>
          </button>
          <button
            onClick={() => alignSelected('middle')}
            className="p-2 bg-[#1b2029] hover:bg-[#2563eb] rounded border border-[#2d3748] flex flex-col items-center justify-center space-y-1"
          >
            <span className="font-bold text-xs">⊞</span>
            <span className="text-[10px]">Middle</span>
          </button>
          <button
            onClick={() => alignSelected('bottom')}
            className="p-2 bg-[#1b2029] hover:bg-[#2563eb] rounded border border-[#2d3748] flex flex-col items-center justify-center space-y-1"
          >
            <span className="font-bold text-xs">⊥</span>
            <span className="text-[10px]">Bottom</span>
          </button>
        </div>
      </div>

      {/* Align to Page */}
      <div className="border-t border-[#2d3748] pt-3 space-y-2">
        <h4 className="font-semibold text-gray-300">Align to Page</h4>
        <button
          onClick={() => alignSelected('page-center')}
          className="w-full py-2 bg-[#2563eb] hover:bg-blue-600 text-white rounded font-bold flex items-center justify-center space-x-2"
        >
          <Maximize2 className="w-3.5 h-3.5" />
          <span>Center to Page (P)</span>
        </button>
      </div>
    </div>
  );
};
