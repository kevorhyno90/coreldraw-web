import React from 'react';
import { useCorel } from '../../context/CorelContext';
import { Shapes, Sparkles, Layers, Scissors, Check } from 'lucide-react';
import { BooleanOp } from '../../engine/booleanOps';

export const ShapingDocker: React.FC = () => {
  const {
    selectedObjects,
    applyBooleanOp,
    groupSelected,
    ungroupSelected,
    convertToCurves,
    primarySelectedObject,
  } = useCorel();

  const isMulti = selectedObjects.length >= 2;

  return (
    <div className="flex-1 overflow-y-auto p-3 space-y-4 text-xs select-none text-gray-200">
      {/* Header Info */}
      <div className="border-b border-[#2d3748] pb-2">
        <h3 className="font-bold text-white flex items-center">
          <Shapes className="w-4 h-4 mr-1.5 text-amber-400" /> Shaping & Booleans
        </h3>
        <p className="text-[11px] text-gray-400 mt-1">
          Combine, cut, and trim overlapping vector paths. Select 2 or more objects.
        </p>
      </div>

      {/* Boolean Operation Buttons */}
      <div className="space-y-2">
        {/* Weld */}
        <button
          disabled={!isMulti}
          onClick={() => applyBooleanOp('weld')}
          className={`w-full p-2.5 rounded-lg border flex items-center justify-between transition ${
            isMulti
              ? 'bg-[#1b2029] border-[#3b82f6]/50 hover:bg-[#2563eb] hover:border-blue-500 text-white shadow-sm'
              : 'bg-[#181a20] border-[#2d3748] text-gray-600 cursor-not-allowed'
          }`}
        >
          <div className="flex items-center space-x-2">
            <span className="text-base">⚡</span>
            <div className="text-left">
              <div className="font-bold text-[12px]">Weld (Union)</div>
              <div className="text-[10px] text-gray-400">Merges objects into a single cohesive path</div>
            </div>
          </div>
        </button>

        {/* Trim */}
        <button
          disabled={!isMulti}
          onClick={() => applyBooleanOp('trim')}
          className={`w-full p-2.5 rounded-lg border flex items-center justify-between transition ${
            isMulti
              ? 'bg-[#1b2029] border-emerald-500/50 hover:bg-emerald-600 hover:border-emerald-500 text-white shadow-sm'
              : 'bg-[#181a20] border-[#2d3748] text-gray-600 cursor-not-allowed'
          }`}
        >
          <div className="flex items-center space-x-2">
            <span className="text-base">✂️</span>
            <div className="text-left">
              <div className="font-bold text-[12px]">Trim (Cut)</div>
              <div className="text-[10px] text-gray-400">Cuts out the shape of overlapping object</div>
            </div>
          </div>
        </button>

        {/* Intersect */}
        <button
          disabled={!isMulti}
          onClick={() => applyBooleanOp('intersect')}
          className={`w-full p-2.5 rounded-lg border flex items-center justify-between transition ${
            isMulti
              ? 'bg-[#1b2029] border-purple-500/50 hover:bg-purple-600 hover:border-purple-500 text-white shadow-sm'
              : 'bg-[#181a20] border-[#2d3748] text-gray-600 cursor-not-allowed'
          }`}
        >
          <div className="flex items-center space-x-2">
            <span className="text-base">∩</span>
            <div className="text-left">
              <div className="font-bold text-[12px]">Intersect</div>
              <div className="text-[10px] text-gray-400">Keeps only the overlapping intersection area</div>
            </div>
          </div>
        </button>

        {/* Front Minus Back */}
        <button
          disabled={!isMulti}
          onClick={() => applyBooleanOp('frontMinusBack')}
          className={`w-full p-2.5 rounded-lg border flex items-center justify-between transition ${
            isMulti
              ? 'bg-[#1b2029] border-cyan-500/50 hover:bg-cyan-600 hover:border-cyan-500 text-white shadow-sm'
              : 'bg-[#181a20] border-[#2d3748] text-gray-600 cursor-not-allowed'
          }`}
        >
          <div className="flex items-center space-x-2">
            <span className="text-base">◧</span>
            <div className="text-left">
              <div className="font-bold text-[12px]">Front Minus Back</div>
              <div className="text-[10px] text-gray-400">Subtracts back object from the front</div>
            </div>
          </div>
        </button>
      </div>

      {/* Curve Conversions */}
      <div className="border-t border-[#2d3748] pt-3 space-y-2">
        <h4 className="font-semibold text-gray-300">Curve Management</h4>

        <button
          disabled={!primarySelectedObject}
          onClick={() => primarySelectedObject && convertToCurves(primarySelectedObject.id)}
          className={`w-full py-2 px-3 rounded-lg border flex items-center justify-center space-x-2 font-medium ${
            primarySelectedObject
              ? 'bg-emerald-600/20 border-emerald-500/40 text-emerald-300 hover:bg-emerald-600/30'
              : 'bg-[#181a20] border-[#2d3748] text-gray-600 cursor-not-allowed'
          }`}
        >
          <Sparkles className="w-4 h-4 text-emerald-400" />
          <span>Convert to Curves (Ctrl+Q)</span>
        </button>
      </div>
    </div>
  );
};
