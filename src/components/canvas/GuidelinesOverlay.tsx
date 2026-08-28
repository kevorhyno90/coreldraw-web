import React from 'react';
import { useCorel } from '../../context/CorelContext';

export const GuidelinesOverlay: React.FC = () => {
  const { guidelines, removeGuideline } = useCorel();

  return (
    <g className="guidelines-layer">
      {guidelines.map(guide => {
        const isHoriz = guide.orientation === 'horizontal';

        return (
          <g key={guide.id} className="group/guide cursor-pointer">
            {isHoriz ? (
              <line
                x1={-5000}
                y1={guide.position}
                x2={5000}
                y2={guide.position}
                stroke={guide.color}
                strokeWidth="1"
                strokeDasharray="4,4"
                className="group-hover/guide:stroke-rose-400 group-hover/guide:stroke-[2px] transition"
                onDoubleClick={() => removeGuideline(guide.id)}
              />
            ) : (
              <line
                x1={guide.position}
                y1={-5000}
                x2={guide.position}
                y2={5000}
                stroke={guide.color}
                strokeWidth="1"
                strokeDasharray="4,4"
                className="group-hover/guide:stroke-rose-400 group-hover/guide:stroke-[2px] transition"
                onDoubleClick={() => removeGuideline(guide.id)}
              />
            )}
          </g>
        );
      })}
    </g>
  );
};
