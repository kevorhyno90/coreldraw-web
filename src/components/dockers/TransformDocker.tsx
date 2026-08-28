import React, { useState } from 'react';
import { useCorel } from '../../context/CorelContext';
import { Move, RotateCw, Scaling, FlipHorizontal, FlipVertical } from 'lucide-react';

export const TransformDocker: React.FC = () => {
  const { primarySelectedObject, updateSelectedObjects } = useCorel();
  const [activeTab, setActiveTab] = useState<'position' | 'rotate' | 'scale' | 'size'>('position');

  if (!primarySelectedObject) {
    return (
      <div className="p-4 text-center text-gray-500 text-xs italic flex flex-col items-center justify-center h-48">
        <Move className="w-8 h-8 text-gray-600 mb-2" />
        Select an object to perform precise numerical transformations
      </div>
    );
  }

  const { x, y, width, height, rotation, scaleX, scaleY } = primarySelectedObject.transform;

  return (
    <div className="flex-1 overflow-y-auto p-3 space-y-4 text-xs select-none text-gray-200">
      <div className="border-b border-[#2d3748] pb-2">
        <h3 className="font-bold text-white flex items-center">
          <Move className="w-4 h-4 mr-1.5 text-cyan-400" /> Transform Docker
        </h3>
      </div>

      {/* Tabs */}
      <div className="grid grid-cols-4 gap-1 bg-[#1b2029] p-1 rounded-lg border border-[#2d3748]">
        <button
          onClick={() => setActiveTab('position')}
          className={`py-1 rounded font-medium text-[11px] ${activeTab === 'position' ? 'bg-[#3b82f6] text-white' : 'text-gray-400 hover:text-white'}`}
        >
          Position
        </button>
        <button
          onClick={() => setActiveTab('rotate')}
          className={`py-1 rounded font-medium text-[11px] ${activeTab === 'rotate' ? 'bg-[#3b82f6] text-white' : 'text-gray-400 hover:text-white'}`}
        >
          Rotate
        </button>
        <button
          onClick={() => setActiveTab('scale')}
          className={`py-1 rounded font-medium text-[11px] ${activeTab === 'scale' ? 'bg-[#3b82f6] text-white' : 'text-gray-400 hover:text-white'}`}
        >
          Scale
        </button>
        <button
          onClick={() => setActiveTab('size')}
          className={`py-1 rounded font-medium text-[11px] ${activeTab === 'size' ? 'bg-[#3b82f6] text-white' : 'text-gray-400 hover:text-white'}`}
        >
          Size
        </button>
      </div>

      {/* Tab Panels */}
      {activeTab === 'position' && (
        <div className="space-y-3 bg-[#1b2029] p-3 rounded-lg border border-[#2d3748]">
          <div>
            <label className="text-[10px] text-gray-400">Position X (px)</label>
            <input
              type="number"
              value={Math.round(x)}
              onChange={e => updateSelectedObjects({ transform: { ...primarySelectedObject.transform, x: Number(e.target.value) } })}
              className="w-full bg-[#262e3d] text-white px-2 py-1 rounded border border-[#374151] font-mono mt-0.5 outline-none"
            />
          </div>
          <div>
            <label className="text-[10px] text-gray-400">Position Y (px)</label>
            <input
              type="number"
              value={Math.round(y)}
              onChange={e => updateSelectedObjects({ transform: { ...primarySelectedObject.transform, y: Number(e.target.value) } })}
              className="w-full bg-[#262e3d] text-white px-2 py-1 rounded border border-[#374151] font-mono mt-0.5 outline-none"
            />
          </div>
        </div>
      )}

      {activeTab === 'rotate' && (
        <div className="space-y-3 bg-[#1b2029] p-3 rounded-lg border border-[#2d3748]">
          <div>
            <label className="text-[10px] text-gray-400">Angle (Degrees)</label>
            <input
              type="number"
              value={Math.round(rotation || 0)}
              onChange={e => updateSelectedObjects({ transform: { ...primarySelectedObject.transform, rotation: Number(e.target.value) } })}
              className="w-full bg-[#262e3d] text-white px-2 py-1 rounded border border-[#374151] font-mono mt-0.5 outline-none"
            />
          </div>
          <div className="flex space-x-2">
            <button
              onClick={() => updateSelectedObjects({ transform: { ...primarySelectedObject.transform, rotation: (rotation || 0) - 90 } })}
              className="flex-1 py-1 bg-[#262e3d] hover:bg-[#323c4d] rounded border border-[#374151]"
            >
              -90°
            </button>
            <button
              onClick={() => updateSelectedObjects({ transform: { ...primarySelectedObject.transform, rotation: (rotation || 0) + 90 } })}
              className="flex-1 py-1 bg-[#262e3d] hover:bg-[#323c4d] rounded border border-[#374151]"
            >
              +90°
            </button>
          </div>
        </div>
      )}

      {activeTab === 'size' && (
        <div className="space-y-3 bg-[#1b2029] p-3 rounded-lg border border-[#2d3748]">
          <div>
            <label className="text-[10px] text-gray-400">Width (px)</label>
            <input
              type="number"
              value={Math.round(width)}
              onChange={e => updateSelectedObjects({ transform: { ...primarySelectedObject.transform, width: Math.max(1, Number(e.target.value)) } })}
              className="w-full bg-[#262e3d] text-white px-2 py-1 rounded border border-[#374151] font-mono mt-0.5 outline-none"
            />
          </div>
          <div>
            <label className="text-[10px] text-gray-400">Height (px)</label>
            <input
              type="number"
              value={Math.round(height)}
              onChange={e => updateSelectedObjects({ transform: { ...primarySelectedObject.transform, height: Math.max(1, Number(e.target.value)) } })}
              className="w-full bg-[#262e3d] text-white px-2 py-1 rounded border border-[#374151] font-mono mt-0.5 outline-none"
            />
          </div>
        </div>
      )}
    </div>
  );
};
