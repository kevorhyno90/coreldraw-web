import React from 'react';
import { useCorel } from '../../context/CorelContext';
import { History, Undo2, Redo2, Check } from 'lucide-react';

export const HistoryDocker: React.FC = () => {
  const { history, historyIndex, undo, redo, canUndo, canRedo } = useCorel();

  return (
    <div className="flex flex-col h-full text-xs select-none">
      <div className="p-2 border-b border-[#2d3748] flex items-center justify-between bg-[#1f2430]">
        <span className="font-semibold text-gray-300 flex items-center">
          <History className="w-3.5 h-3.5 mr-1.5 text-blue-400" /> Undo History ({history.length})
        </span>
        <div className="flex items-center space-x-1">
          <button
            disabled={!canUndo}
            onClick={undo}
            title="Undo"
            className={`p-1 rounded ${canUndo ? 'hover:bg-[#2d3748] text-gray-300 hover:text-white' : 'opacity-40 text-gray-600'}`}
          >
            <Undo2 className="w-3.5 h-3.5" />
          </button>
          <button
            disabled={!canRedo}
            onClick={redo}
            title="Redo"
            className={`p-1 rounded ${canRedo ? 'hover:bg-[#2d3748] text-gray-300 hover:text-white' : 'opacity-40 text-gray-600'}`}
          >
            <Redo2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-1 space-y-0.5">
        {history.map((step, idx) => {
          const isCurrent = idx === historyIndex;
          const isFuture = idx > historyIndex;

          return (
            <div
              key={step.id}
              className={`flex items-center justify-between px-2.5 py-1.5 rounded transition ${
                isCurrent
                  ? 'bg-[#2563eb] text-white font-bold'
                  : isFuture
                  ? 'text-gray-500 hover:bg-[#2d3748]/50'
                  : 'text-gray-300 hover:bg-[#2d3748]'
              }`}
            >
              <div className="flex items-center space-x-2 truncate">
                <span className="font-mono text-[10px] opacity-60">#{idx + 1}</span>
                <span className="truncate">{step.actionName}</span>
              </div>
              {isCurrent && <Check className="w-3.5 h-3.5 text-white" />}
            </div>
          );
        })}
      </div>
    </div>
  );
};
