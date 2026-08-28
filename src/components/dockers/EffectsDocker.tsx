import React from 'react';
import { useCorel } from '../../context/CorelContext';
import { Boxes, SunMedium, Layers, Sparkles } from 'lucide-react';

export const EffectsDocker: React.FC = () => {
  const { primarySelectedObject, updateSelectedObjects } = useCorel();

  if (!primarySelectedObject) {
    return (
      <div className="p-4 text-center text-gray-500 text-xs italic flex flex-col items-center justify-center h-48">
        <Boxes className="w-8 h-8 text-gray-600 mb-2" />
        Select an object to apply 3D Extrude, Drop Shadow, or Contour effects
      </div>
    );
  }

  const obj = primarySelectedObject;

  return (
    <div className="flex-1 overflow-y-auto p-3 space-y-4 text-xs select-none text-gray-200">
      {/* 3D Extrusion Effect */}
      <div className="bg-[#1b2029] p-3 rounded-lg border border-[#2d3748] space-y-3">
        <div className="flex items-center justify-between font-bold text-white">
          <span className="flex items-center"><Boxes className="w-4 h-4 mr-1.5 text-blue-400" /> 3D Extrude</span>
          <input
            type="checkbox"
            checked={obj.extrude.enabled}
            onChange={e => updateSelectedObjects({ extrude: { ...obj.extrude, enabled: e.target.checked } })}
            className="w-4 h-4 rounded text-blue-600 cursor-pointer"
          />
        </div>

        {obj.extrude.enabled && (
          <div className="space-y-2.5 pt-1">
            <div>
              <div className="flex justify-between text-[11px] text-gray-400 mb-1">
                <span>Extrusion Depth</span>
                <span className="font-mono">{obj.extrude.depth}px</span>
              </div>
              <input
                type="range"
                min={1}
                max={100}
                value={obj.extrude.depth}
                onChange={e => updateSelectedObjects({ extrude: { ...obj.extrude, depth: Number(e.target.value) } })}
                className="w-full h-1.5 bg-gray-600 rounded-lg cursor-pointer"
              />
            </div>

            <div>
              <div className="flex justify-between text-[11px] text-gray-400 mb-1">
                <span>Projection Angle</span>
                <span className="font-mono">{obj.extrude.angle}°</span>
              </div>
              <input
                type="range"
                min={0}
                max={360}
                value={obj.extrude.angle}
                onChange={e => updateSelectedObjects({ extrude: { ...obj.extrude, angle: Number(e.target.value) } })}
                className="w-full h-1.5 bg-gray-600 rounded-lg cursor-pointer"
              />
            </div>

            <div className="flex items-center justify-between pt-1">
              <span className="text-[11px] text-gray-400">Side Shading Color:</span>
              <input
                type="color"
                value={obj.extrude.sideColor || '#0f172a'}
                onChange={e => updateSelectedObjects({ extrude: { ...obj.extrude, sideColor: e.target.value } })}
                className="w-6 h-6 rounded border border-[#374151] cursor-pointer bg-transparent"
              />
            </div>
          </div>
        )}
      </div>

      {/* Drop Shadow Effect */}
      <div className="bg-[#1b2029] p-3 rounded-lg border border-[#2d3748] space-y-3">
        <div className="flex items-center justify-between font-bold text-white">
          <span className="flex items-center"><SunMedium className="w-4 h-4 mr-1.5 text-amber-400" /> Drop Shadow</span>
          <input
            type="checkbox"
            checked={obj.shadow.enabled}
            onChange={e => updateSelectedObjects({ shadow: { ...obj.shadow, enabled: e.target.checked } })}
            className="w-4 h-4 rounded text-blue-600 cursor-pointer"
          />
        </div>

        {obj.shadow.enabled && (
          <div className="space-y-2.5 pt-1">
            <div>
              <div className="flex justify-between text-[11px] text-gray-400 mb-1">
                <span>Shadow Blur</span>
                <span className="font-mono">{obj.shadow.blur}px</span>
              </div>
              <input
                type="range"
                min={0}
                max={40}
                value={obj.shadow.blur}
                onChange={e => updateSelectedObjects({ shadow: { ...obj.shadow, blur: Number(e.target.value) } })}
                className="w-full h-1.5 bg-gray-600 rounded-lg cursor-pointer"
              />
            </div>

            <div>
              <div className="flex justify-between text-[11px] text-gray-400 mb-1">
                <span>Shadow Opacity</span>
                <span className="font-mono">{Math.round(obj.shadow.opacity * 100)}%</span>
              </div>
              <input
                type="range"
                min={0.05}
                max={1}
                step={0.05}
                value={obj.shadow.opacity}
                onChange={e => updateSelectedObjects({ shadow: { ...obj.shadow, opacity: Number(e.target.value) } })}
                className="w-full h-1.5 bg-gray-600 rounded-lg cursor-pointer"
              />
            </div>

            <div className="flex items-center justify-between pt-1">
              <span className="text-[11px] text-gray-400">Shadow Color:</span>
              <input
                type="color"
                value={obj.shadow.color || '#000000'}
                onChange={e => updateSelectedObjects({ shadow: { ...obj.shadow, color: e.target.value } })}
                className="w-6 h-6 rounded border border-[#374151] cursor-pointer bg-transparent"
              />
            </div>
          </div>
        )}
      </div>

      {/* Contour Effect */}
      <div className="bg-[#1b2029] p-3 rounded-lg border border-[#2d3748] space-y-3">
        <div className="flex items-center justify-between font-bold text-white">
          <span className="flex items-center"><Layers className="w-4 h-4 mr-1.5 text-emerald-400" /> Contour (Offset)</span>
          <input
            type="checkbox"
            checked={obj.contour.enabled}
            onChange={e => updateSelectedObjects({ contour: { ...obj.contour, enabled: e.target.checked } })}
            className="w-4 h-4 rounded text-blue-600 cursor-pointer"
          />
        </div>

        {obj.contour.enabled && (
          <div className="space-y-2.5 pt-1">
            <div className="flex items-center justify-between">
              <span className="text-[11px] text-gray-400">Contour Type:</span>
              <select
                value={obj.contour.type}
                onChange={e => updateSelectedObjects({ contour: { ...obj.contour, type: e.target.value as any } })}
                className="bg-[#262e3d] text-white px-2 py-0.5 rounded border border-[#374151] outline-none"
              >
                <option value="outside">Outside Contour</option>
                <option value="inside">Inside Contour</option>
              </select>
            </div>

            <div>
              <div className="flex justify-between text-[11px] text-gray-400 mb-1">
                <span>Contour Steps</span>
                <span className="font-mono">{obj.contour.steps}</span>
              </div>
              <input
                type="range"
                min={1}
                max={6}
                value={obj.contour.steps}
                onChange={e => updateSelectedObjects({ contour: { ...obj.contour, steps: Number(e.target.value) } })}
                className="w-full h-1.5 bg-gray-600 rounded-lg cursor-pointer"
              />
            </div>

            <div className="flex items-center justify-between pt-1">
              <span className="text-[11px] text-gray-400">End Color:</span>
              <input
                type="color"
                value={obj.contour.endColor || '#ffffff'}
                onChange={e => updateSelectedObjects({ contour: { ...obj.contour, endColor: e.target.value } })}
                className="w-6 h-6 rounded border border-[#374151] cursor-pointer bg-transparent"
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
