import React from 'react';
import { useCorel } from '../../context/CorelContext';
import { Point2D } from '../../types/coreldraw';

interface InteractiveGradientGizmoProps {
  onStartGradientDrag: (handle: 'start' | 'end', startPt: Point2D) => void;
}

export const InteractiveGradientGizmo: React.FC<InteractiveGradientGizmoProps> = ({ onStartGradientDrag }) => {
  const { primarySelectedObject, zoom } = useCorel();

  if (!primarySelectedObject || primarySelectedObject.fill.type !== 'linear' || !primarySelectedObject.fill.gradient) {
    return null;
  }

  const grad = primarySelectedObject.fill.gradient;
  const { x: objX, y: objY } = primarySelectedObject.transform;
  const handleSize = 10 / zoom;

  const startPt: Point2D = { x: objX + grad.start.x, y: objY + grad.start.y };
  const endPt: Point2D = { x: objX + grad.end.x, y: objY + grad.end.y };

  const startColor = grad.stops[0]?.color || '#ffffff';
  const endColor = grad.stops[grad.stops.length - 1]?.color || '#000000';

  return (
    <g className="gradient-gizmo-layer select-none">
      {/* Connecting Gradient Line */}
      <line
        x1={startPt.x}
        y1={startPt.y}
        x2={endPt.x}
        y2={endPt.y}
        stroke="#ffffff"
        strokeWidth={2 / zoom}
        strokeDasharray={`${3 / zoom},${3 / zoom}`}
      />
      <line
        x1={startPt.x}
        y1={startPt.y}
        x2={endPt.x}
        y2={endPt.y}
        stroke="#000000"
        strokeWidth={1 / zoom}
        strokeDasharray={`${3 / zoom},${3 / zoom}`}
      />

      {/* Start Color Handle */}
      <rect
        x={startPt.x - handleSize / 2}
        y={startPt.y - handleSize / 2}
        width={handleSize}
        height={handleSize}
        fill={startColor}
        stroke="#ffffff"
        strokeWidth={2 / zoom}
        className="cursor-move hover:scale-125 transition-transform"
        onMouseDown={e => {
          e.stopPropagation();
          onStartGradientDrag('start', { x: e.clientX, y: e.clientY });
        }}
      />

      {/* End Color Handle */}
      <rect
        x={endPt.x - handleSize / 2}
        y={endPt.y - handleSize / 2}
        width={handleSize}
        height={handleSize}
        fill={endColor}
        stroke="#ffffff"
        strokeWidth={2 / zoom}
        className="cursor-move hover:scale-125 transition-transform"
        onMouseDown={e => {
          e.stopPropagation();
          onStartGradientDrag('end', { x: e.clientX, y: e.clientY });
        }}
      />
    </g>
  );
};
