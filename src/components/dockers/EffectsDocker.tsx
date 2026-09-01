import React, { useState } from 'react';
import { useCorel } from '../../context/CorelContext';
import { Boxes, SunMedium, Layers, Sparkles, Sliders, Scissors, Plus, Crop } from 'lucide-react';
import { computeVectorBlend, generateBlockShadowFacets } from '../../engine/proToolsEngine';

export const EffectsDocker: React.FC = () => {
  const {
    primarySelectedObject,
    selectedObjects,
    updateSelectedObjects,
    addObject,
    activePage,
  } = useCorel();

  const [blendSteps, setBlendSteps] = useState(8);
  const [blockShadowDepth, setBlockShadowDepth] = useState(25);
  const [blockShadowAngle, setBlockShadowAngle] = useState(45);
  const [blockShadowColor, setBlockShadowColor] = useState('#000000');

  const handleApplyBlend = () => {
    if (selectedObjects.length < 2) {
      alert("Please select at least 2 vector objects to generate a Vector Blend.");
      return;
    }
    const blendResult = computeVectorBlend(selectedObjects[0], selectedObjects[1], blendSteps);
    blendResult.forEach(step => {
      addObject({
        name: `Blend Step ${step.stepIndex}`,
        type: 'path',
        transform: step.transform,
        subpaths: step.subpaths,
        fill: { type: 'solid', color: step.fillColor },
        outline: { color: step.outlineColor, width: 1, style: 'solid', cap: 'round', join: 'round', startArrow: 'none', endArrow: 'none' },
        opacity: step.opacity,
      });
    });
  };

  const handleApplyBlockShadow = () => {
    if (!primarySelectedObject) return;
    const facets = generateBlockShadowFacets(primarySelectedObject, blockShadowDepth, blockShadowAngle, blockShadowColor);
    const subpaths: any[] = facets.map((f, idx) => ({
      isClosed: true,
      nodes: f.points.map((p, nIdx) => ({
        id: `bs_node_${idx}_${nIdx}`,
        x: p.x,
        y: p.y,
        type: 'cusp',
      })),
    }));

    addObject({
      name: `Block Shadow (${primarySelectedObject.name})`,
      type: 'path',
      transform: {
        ...primarySelectedObject.transform,
      },
      subpaths,
      fill: { type: 'solid', color: blockShadowColor },
      outline: { color: 'none', width: 0, style: 'solid', cap: 'square', join: 'miter', startArrow: 'none', endArrow: 'none' },
      zIndex: Math.max(0, primarySelectedObject.zIndex - 1),
    });
  };

  const obj = primarySelectedObject;

  return (
    <div className="flex-1 overflow-y-auto p-3 space-y-4 text-xs select-none text-gray-200 divide-y divide-gray-800/80">
      {/* Vector Blend Tool */}
      <div className="space-y-2.5 pt-1">
        <div className="flex items-center justify-between font-bold text-white">
          <span className="flex items-center text-cyan-400">
            <Sparkles className="w-4 h-4 mr-1.5" /> Vector Blend (Morph)
          </span>
          <span className="text-[10px] text-gray-400 font-mono">{blendSteps} steps</span>
        </div>

        <div className="bg-[#1b2029] p-2.5 rounded-xl border border-[#2d3748] space-y-2">
          <div className="flex justify-between text-[11px] text-gray-400">
            <span>Blend Steps</span>
            <span className="text-cyan-400 font-mono">{blendSteps}</span>
          </div>
          <input
            type="range"
            min={2}
            max={30}
            value={blendSteps}
            onChange={e => setBlendSteps(Number(e.target.value))}
            className="w-full accent-cyan-400 h-1.5 bg-gray-700 rounded-lg cursor-pointer"
          />
          <button
            onClick={handleApplyBlend}
            disabled={selectedObjects.length < 2}
            className={`w-full py-1.5 rounded-lg font-medium flex items-center justify-center gap-1.5 transition-all ${
              selectedObjects.length >= 2
                ? 'bg-cyan-600 hover:bg-cyan-500 text-white shadow'
                : 'bg-gray-800 text-gray-500 cursor-not-allowed'
            }`}
          >
            <Sparkles size={13} />
            <span>Generate Vector Blend</span>
          </button>
        </div>
      </div>

      {/* Block Shadow (Signage & Hot-Rod Shadow) */}
      <div className="space-y-2.5 pt-3">
        <div className="flex items-center justify-between font-bold text-white">
          <span className="flex items-center text-amber-400">
            <Layers className="w-4 h-4 mr-1.5" /> Block Shadow (Signage)
          </span>
        </div>

        <div className="bg-[#1b2029] p-2.5 rounded-xl border border-[#2d3748] space-y-2">
          <div className="flex justify-between text-[11px] text-gray-400">
            <span>Extrude Depth</span>
            <span className="text-amber-400 font-mono">{blockShadowDepth}px</span>
          </div>
          <input
            type="range"
            min={5}
            max={80}
            value={blockShadowDepth}
            onChange={e => setBlockShadowDepth(Number(e.target.value))}
            className="w-full accent-amber-400 h-1.5 bg-gray-700 rounded-lg cursor-pointer"
          />

          <div className="flex items-center justify-between pt-1">
            <span className="text-gray-400">Shadow Color:</span>
            <input
              type="color"
              value={blockShadowColor}
              onChange={e => setBlockShadowColor(e.target.value)}
              className="w-6 h-6 rounded border border-gray-600 cursor-pointer bg-transparent"
            />
          </div>

          <button
            onClick={handleApplyBlockShadow}
            disabled={!primarySelectedObject}
            className={`w-full py-1.5 rounded-lg font-medium flex items-center justify-center gap-1.5 transition-all ${
              primarySelectedObject
                ? 'bg-amber-600 hover:bg-amber-500 text-white shadow'
                : 'bg-gray-800 text-gray-500 cursor-not-allowed'
            }`}
          >
            <Plus size={13} />
            <span>Cast Block Shadow</span>
          </button>
        </div>
      </div>

      {/* 3D Extrusion Effect */}
      {obj && (
        <div className="bg-[#1b2029] p-3 rounded-xl border border-[#2d3748] space-y-3 pt-3">
          <div className="flex items-center justify-between font-bold text-white">
            <span className="flex items-center"><Boxes className="w-4 h-4 mr-1.5 text-blue-400" /> 3D Extrude</span>
            <input
              type="checkbox"
              checked={obj.extrude.enabled}
              onChange={e => updateSelectedObjects({ extrude: { ...obj.extrude, enabled: e.target.checked } })}
              className="w-4 h-4 rounded text-blue-600 cursor-pointer accent-blue-500"
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
            </div>
          )}
        </div>
      )}

      {/* Drop Shadow Effect */}
      {obj && (
        <div className="bg-[#1b2029] p-3 rounded-xl border border-[#2d3748] space-y-3 pt-3">
          <div className="flex items-center justify-between font-bold text-white">
            <span className="flex items-center"><SunMedium className="w-4 h-4 mr-1.5 text-amber-400" /> Drop Shadow</span>
            <input
              type="checkbox"
              checked={obj.shadow.enabled}
              onChange={e => updateSelectedObjects({ shadow: { ...obj.shadow, enabled: e.target.checked } })}
              className="w-4 h-4 rounded text-blue-600 cursor-pointer accent-amber-500"
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
            </div>
          )}
        </div>
      )}
    </div>
  );
};
