import React, { useState } from 'react';
import { useCorel } from '../../context/CorelContext';
import { Point2D } from '../../types/coreldraw';

interface TransformGizmoProps {
  onStartTransform: (type: 'move' | 'resize' | 'rotate' | 'skew', handle?: string, startPt?: Point2D) => void;
}

export const TransformGizmo: React.FC<TransformGizmoProps> = ({ onStartTransform }) => {
  const { selectionBounds, primarySelectedObject, zoom } = useCorel();
  const [isRotateMode, setIsRotateMode] = useState(false);

  if (!selectionBounds || !primarySelectedObject) return null;

  const { minX, minY, maxX, maxY, width, height, centerX, centerY } = selectionBounds;
  const handleSize = 8 / zoom;
  const halfHandle = handleSize / 2;

  const handleMouseDown = (e: React.MouseEvent, type: 'move' | 'resize' | 'rotate' | 'skew', handle?: string) => {
    e.stopPropagation();
    onStartTransform(type, handle, { x: e.clientX, y: e.clientY });
  };

  return (
    <g className="transform-gizmo-layer select-none">
      {/* Selection Bounding Box Outline */}
      <rect
        x={minX}
        y={minY}
        width={width}
        height={height}
        fill="none"
        stroke="#3b82f6"
        strokeWidth={1.5 / zoom}
        strokeDasharray={isRotateMode ? `${4 / zoom},${4 / zoom}` : 'none'}
        className="cursor-move"
        onMouseDown={e => handleMouseDown(e, 'move')}
        onClick={() => setIsRotateMode(!isRotateMode)}
      />

      {/* Rotation Mode vs Scale Mode Handles */}
      {!isRotateMode ? (
        <>
          {/* 8 Bounding Box Scale Handles */}
          {/* Top-Left */}
          <rect
            x={minX - halfHandle}
            y={minY - halfHandle}
            width={handleSize}
            height={handleSize}
            fill="#ffffff"
            stroke="#000000"
            strokeWidth={1 / zoom}
            className="cursor-nwse-resize hover:fill-blue-500"
            onMouseDown={e => handleMouseDown(e, 'resize', 'tl')}
          />
          {/* Top-Center */}
          <rect
            x={centerX - halfHandle}
            y={minY - halfHandle}
            width={handleSize}
            height={handleSize}
            fill="#ffffff"
            stroke="#000000"
            strokeWidth={1 / zoom}
            className="cursor-ns-resize hover:fill-blue-500"
            onMouseDown={e => handleMouseDown(e, 'resize', 'tc')}
          />
          {/* Top-Right */}
          <rect
            x={maxX - halfHandle}
            y={minY - halfHandle}
            width={handleSize}
            height={handleSize}
            fill="#ffffff"
            stroke="#000000"
            strokeWidth={1 / zoom}
            className="cursor-nesw-resize hover:fill-blue-500"
            onMouseDown={e => handleMouseDown(e, 'resize', 'tr')}
          />
          {/* Middle-Left */}
          <rect
            x={minX - halfHandle}
            y={centerY - halfHandle}
            width={handleSize}
            height={handleSize}
            fill="#ffffff"
            stroke="#000000"
            strokeWidth={1 / zoom}
            className="cursor-ew-resize hover:fill-blue-500"
            onMouseDown={e => handleMouseDown(e, 'resize', 'ml')}
          />
          {/* Middle-Right */}
          <rect
            x={maxX - halfHandle}
            y={centerY - halfHandle}
            width={handleSize}
            height={handleSize}
            fill="#ffffff"
            stroke="#000000"
            strokeWidth={1 / zoom}
            className="cursor-ew-resize hover:fill-blue-500"
            onMouseDown={e => handleMouseDown(e, 'resize', 'mr')}
          />
          {/* Bottom-Left */}
          <rect
            x={minX - halfHandle}
            y={maxY - halfHandle}
            width={handleSize}
            height={handleSize}
            fill="#ffffff"
            stroke="#000000"
            strokeWidth={1 / zoom}
            className="cursor-nesw-resize hover:fill-blue-500"
            onMouseDown={e => handleMouseDown(e, 'resize', 'bl')}
          />
          {/* Bottom-Center */}
          <rect
            x={centerX - halfHandle}
            y={maxY - halfHandle}
            width={handleSize}
            height={handleSize}
            fill="#ffffff"
            stroke="#000000"
            strokeWidth={1 / zoom}
            className="cursor-ns-resize hover:fill-blue-500"
            onMouseDown={e => handleMouseDown(e, 'resize', 'bc')}
          />
          {/* Bottom-Right */}
          <rect
            x={maxX - halfHandle}
            y={maxY - halfHandle}
            width={handleSize}
            height={handleSize}
            fill="#ffffff"
            stroke="#000000"
            strokeWidth={1 / zoom}
            className="cursor-nwse-resize hover:fill-blue-500"
            onMouseDown={e => handleMouseDown(e, 'resize', 'br')}
          />
        </>
      ) : (
        <>
          {/* 4 Corner Rotation Curved Handles */}
          <circle
            cx={minX}
            cy={minY}
            r={handleSize * 0.7}
            fill="#3b82f6"
            stroke="#ffffff"
            strokeWidth={1.5 / zoom}
            className="cursor-crosshair hover:fill-amber-400"
            onMouseDown={e => handleMouseDown(e, 'rotate', 'tl')}
          />
          <circle
            cx={maxX}
            cy={minY}
            r={handleSize * 0.7}
            fill="#3b82f6"
            stroke="#ffffff"
            strokeWidth={1.5 / zoom}
            className="cursor-crosshair hover:fill-amber-400"
            onMouseDown={e => handleMouseDown(e, 'rotate', 'tr')}
          />
          <circle
            cx={maxX}
            cy={maxY}
            r={handleSize * 0.7}
            fill="#3b82f6"
            stroke="#ffffff"
            strokeWidth={1.5 / zoom}
            className="cursor-crosshair hover:fill-amber-400"
            onMouseDown={e => handleMouseDown(e, 'rotate', 'br')}
          />
          <circle
            cx={minX}
            cy={maxY}
            r={handleSize * 0.7}
            fill="#3b82f6"
            stroke="#ffffff"
            strokeWidth={1.5 / zoom}
            className="cursor-crosshair hover:fill-amber-400"
            onMouseDown={e => handleMouseDown(e, 'rotate', 'bl')}
          />

          {/* Center Rotation Pivot */}
          <circle
            cx={centerX}
            cy={centerY}
            r={handleSize * 0.5}
            fill="#ef4444"
            stroke="#ffffff"
            strokeWidth={1 / zoom}
            className="cursor-move"
          />
          <line
            x1={centerX - handleSize}
            y1={centerY}
            x2={centerX + handleSize}
            y2={centerY}
            stroke="#ffffff"
            strokeWidth={1 / zoom}
          />
          <line
            x1={centerX}
            y1={centerY - handleSize}
            x2={centerX}
            y2={centerY + handleSize}
            stroke="#ffffff"
            strokeWidth={1 / zoom}
          />
        </>
      )}
    </g>
  );
};
