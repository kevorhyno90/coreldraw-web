import React, { useState } from 'react';
import { useCorel } from '../../context/CorelContext';
import { BezierNode, Point2D } from '../../types/coreldraw';

interface NodeEditGizmoProps {
  onStartNodeDrag: (nodeId: string, handleType: 'node' | 'handleIn' | 'handleOut', startPt: Point2D) => void;
}

export const NodeEditGizmo: React.FC<NodeEditGizmoProps> = ({ onStartNodeDrag }) => {
  const { primarySelectedObject, zoom, selectedNodeIds, setSelectedNodeIds } = useCorel();

  if (!primarySelectedObject || primarySelectedObject.type !== 'path') return null;

  const { x: objX, y: objY } = primarySelectedObject.transform;
  const nodeSize = 8 / zoom;
  const half = nodeSize / 2;

  const handleNodeMouseDown = (e: React.MouseEvent, node: BezierNode, handleType: 'node' | 'handleIn' | 'handleOut') => {
    e.stopPropagation();
    if (handleType === 'node') {
      if (e.shiftKey) {
        setSelectedNodeIds([...selectedNodeIds, node.id]);
      } else {
        setSelectedNodeIds([node.id]);
      }
    }
    onStartNodeDrag(node.id, handleType, { x: e.clientX, y: e.clientY });
  };

  return (
    <g className="node-edit-gizmo-layer select-none" transform={`translate(${objX}, ${objY})`}>
      {primarySelectedObject.subpaths.map((subpath, spIdx) => (
        <g key={`subpath_${spIdx}`}>
          {subpath.nodes.map(node => {
            const isSelected = selectedNodeIds.includes(node.id);

            return (
              <g key={node.id}>
                {/* Tangent Handle In */}
                {isSelected && node.handleIn && (
                  <>
                    <line
                      x1={node.x}
                      y1={node.y}
                      x2={node.handleIn.x}
                      y2={node.handleIn.y}
                      stroke="#06b6d4"
                      strokeWidth={1 / zoom}
                    />
                    <circle
                      cx={node.handleIn.x}
                      cy={node.handleIn.y}
                      r={nodeSize * 0.4}
                      fill="#06b6d4"
                      stroke="#ffffff"
                      strokeWidth={1 / zoom}
                      className="cursor-crosshair hover:fill-cyan-300"
                      onMouseDown={e => handleNodeMouseDown(e, node, 'handleIn')}
                    />
                  </>
                )}

                {/* Tangent Handle Out */}
                {isSelected && node.handleOut && (
                  <>
                    <line
                      x1={node.x}
                      y1={node.y}
                      x2={node.handleOut.x}
                      y2={node.handleOut.y}
                      stroke="#06b6d4"
                      strokeWidth={1 / zoom}
                    />
                    <circle
                      cx={node.handleOut.x}
                      cy={node.handleOut.y}
                      r={nodeSize * 0.4}
                      fill="#06b6d4"
                      stroke="#ffffff"
                      strokeWidth={1 / zoom}
                      className="cursor-crosshair hover:fill-cyan-300"
                      onMouseDown={e => handleNodeMouseDown(e, node, 'handleOut')}
                    />
                  </>
                )}

                {/* Node Box */}
                <rect
                  x={node.x - half}
                  y={node.y - half}
                  width={nodeSize}
                  height={nodeSize}
                  fill={isSelected ? '#3b82f6' : '#ffffff'}
                  stroke={node.type === 'cusp' ? '#ef4444' : '#10b981'}
                  strokeWidth={1.5 / zoom}
                  className="cursor-pointer hover:scale-125 transition-transform"
                  onMouseDown={e => handleNodeMouseDown(e, node, 'node')}
                />
              </g>
            );
          })}
        </g>
      ))}
    </g>
  );
};
