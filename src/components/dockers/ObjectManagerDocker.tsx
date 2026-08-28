import React from 'react';
import { useCorel } from '../../context/CorelContext';
import {
  Layers,
  Eye,
  EyeOff,
  Lock,
  Unlock,
  Trash2,
  Copy,
  ChevronRight,
  Folder,
  Square,
  Circle,
  Star,
  Type,
  Ruler,
  Spline,
} from 'lucide-react';
import { ObjectType } from '../../types/coreldraw';

function getObjectIcon(type: ObjectType) {
  switch (type) {
    case 'rect': return Square;
    case 'ellipse': return Circle;
    case 'polygon':
    case 'star': return Star;
    case 'text': return Type;
    case 'dimension': return Ruler;
    case 'group': return Folder;
    default: return Spline;
  }
}

export const ObjectManagerDocker: React.FC = () => {
  const {
    activeObjects,
    selectedIds,
    setSelectedIds,
    toggleSelect,
    updateObject,
    deleteSelected,
    duplicateSelected,
  } = useCorel();

  // Reverse list so top of layer is at the top of the docker list
  const reversedObjects = [...activeObjects].reverse();

  return (
    <div className="flex flex-col h-full text-xs select-none">
      {/* Header toolbar */}
      <div className="p-2 border-b border-[#2d3748] flex items-center justify-between bg-[#1f2430]">
        <span className="font-semibold text-gray-300 flex items-center">
          <Layers className="w-3.5 h-3.5 mr-1.5 text-blue-400" /> Object Manager ({activeObjects.length})
        </span>
        <div className="flex items-center space-x-1">
          <button
            onClick={duplicateSelected}
            title="Duplicate Selected"
            className="p-1 hover:bg-[#2d3748] rounded text-gray-400 hover:text-white"
          >
            <Copy className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={deleteSelected}
            title="Delete Selected"
            className="p-1 hover:bg-red-500/20 rounded text-gray-400 hover:text-red-400"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Objects Tree List */}
      <div className="flex-1 overflow-y-auto p-1 space-y-0.5">
        {reversedObjects.map(obj => {
          const isSelected = selectedIds.includes(obj.id);
          const IconComponent = getObjectIcon(obj.type);

          return (
            <div
              key={obj.id}
              onClick={e => toggleSelect(obj.id, e.shiftKey)}
              className={`flex items-center justify-between px-2 py-1.5 rounded cursor-pointer transition ${
                isSelected
                  ? 'bg-[#2563eb] text-white font-medium shadow-sm'
                  : 'hover:bg-[#2d3748] text-gray-300'
              }`}
            >
              {/* Left icon and name */}
              <div className="flex items-center space-x-2 truncate">
                <IconComponent className="w-3.5 h-3.5 flex-shrink-0 text-emerald-400" />
                <span className="truncate text-[11px]">{obj.name}</span>
              </div>

              {/* Right toggles (Visibility & Lock) */}
              <div className="flex items-center space-x-1" onClick={e => e.stopPropagation()}>
                {/* Visibility */}
                <button
                  onClick={() => updateObject(obj.id, { visible: !obj.visible })}
                  title={obj.visible ? 'Hide Object' : 'Show Object'}
                  className="p-0.5 rounded hover:bg-black/20 text-gray-400 hover:text-white"
                >
                  {obj.visible ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5 text-gray-500" />}
                </button>

                {/* Lock */}
                <button
                  onClick={() => updateObject(obj.id, { locked: !obj.locked })}
                  title={obj.locked ? 'Unlock Object' : 'Lock Object'}
                  className="p-0.5 rounded hover:bg-black/20 text-gray-400 hover:text-white"
                >
                  {obj.locked ? <Lock className="w-3.5 h-3.5 text-amber-400" /> : <Unlock className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>
          );
        })}

        {activeObjects.length === 0 && (
          <div className="p-4 text-center text-gray-500 italic">No objects on this page</div>
        )}
      </div>
    </div>
  );
};
