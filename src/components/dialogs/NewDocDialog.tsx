import React, { useState } from 'react';
import { useCorel } from '../../context/CorelContext';
import { FilePlus, X, Check } from 'lucide-react';

const PRESETS = [
  { id: 'a4', name: 'A4 Standard (Print)', width: 1000, height: 750, unit: 'px' },
  { id: 'a3', name: 'A3 Poster', width: 1400, height: 990, unit: 'px' },
  { id: '1080p', name: 'Full HD Graphic (1080p)', width: 1920, height: 1080, unit: 'px' },
  { id: 'business_card', name: 'Business Card (3.5 × 2 in)', width: 1050, height: 600, unit: 'px' },
  { id: 'square', name: 'Square Emblem / Logo', width: 800, height: 800, unit: 'px' },
];

export const NewDocDialog: React.FC = () => {
  const { openDialog, setOpenDialog, createNewDocument } = useCorel();
  const [title, setTitle] = useState('New Graphic 1');
  const [selectedPreset, setSelectedPreset] = useState(PRESETS[0]);
  const [width, setWidth] = useState(PRESETS[0].width);
  const [height, setHeight] = useState(PRESETS[0].height);
  const [orientation, setOrientation] = useState<'portrait' | 'landscape'>('landscape');
  const [bgColor, setBgColor] = useState('#ffffff');

  if (openDialog !== 'new') return null;

  const handleCreate = () => {
    const finalW = orientation === 'landscape' ? Math.max(width, height) : Math.min(width, height);
    const finalH = orientation === 'landscape' ? Math.min(width, height) : Math.max(width, height);

    createNewDocument({
      title: title || 'New Graphic 1',
      preset: selectedPreset.name,
      width: finalW,
      height: finalH,
      orientation,
      background: bgColor,
    });
    setOpenDialog(null);
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4 select-none">
      <div className="bg-[#1f2430] border border-[#374151] rounded-xl shadow-2xl w-full max-w-md overflow-hidden text-gray-200 text-xs">
        {/* Header */}
        <div className="px-4 py-3 border-b border-[#2d3748] flex items-center justify-between bg-[#171b22]">
          <span className="font-bold text-white text-sm flex items-center">
            <FilePlus className="w-4 h-4 mr-2 text-emerald-400" /> Create New Document
          </span>
          <button onClick={() => setOpenDialog(null)} className="text-gray-400 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <div className="p-4 space-y-3">
          <div>
            <label className="text-[11px] text-gray-400">Document Title</label>
            <input
              type="text"
              value={title}
              onChange={e => setTitle(e.target.value)}
              className="w-full bg-[#262e3d] text-white px-2.5 py-1.5 rounded border border-[#374151] mt-1 outline-none text-xs"
            />
          </div>

          <div>
            <label className="text-[11px] text-gray-400">Page Presets</label>
            <div className="grid grid-cols-1 gap-1.5 mt-1">
              {PRESETS.map(p => (
                <button
                  key={p.id}
                  onClick={() => {
                    setSelectedPreset(p);
                    setWidth(p.width);
                    setHeight(p.height);
                  }}
                  className={`px-3 py-2 rounded-lg border text-left flex items-center justify-between transition ${
                    selectedPreset.id === p.id
                      ? 'bg-[#2563eb] border-blue-500 text-white font-bold'
                      : 'bg-[#1b2029] border-[#2d3748] text-gray-300 hover:bg-[#262e3d]'
                  }`}
                >
                  <span>{p.name}</span>
                  <span className="font-mono text-[10px] opacity-70">
                    {p.width} × {p.height} {p.unit}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Orientation & Background */}
          <div className="grid grid-cols-2 gap-3 pt-1">
            <div>
              <label className="text-[11px] text-gray-400">Orientation</label>
              <div className="flex space-x-1 mt-1 bg-[#1b2029] p-1 rounded border border-[#2d3748]">
                <button
                  onClick={() => setOrientation('landscape')}
                  className={`flex-1 py-1 rounded ${orientation === 'landscape' ? 'bg-[#3b82f6] text-white font-bold' : 'text-gray-400'}`}
                >
                  Landscape
                </button>
                <button
                  onClick={() => setOrientation('portrait')}
                  className={`flex-1 py-1 rounded ${orientation === 'portrait' ? 'bg-[#3b82f6] text-white font-bold' : 'text-gray-400'}`}
                >
                  Portrait
                </button>
              </div>
            </div>

            <div>
              <label className="text-[11px] text-gray-400">Background Color</label>
              <div className="flex items-center space-x-2 mt-1 bg-[#1b2029] p-1 rounded border border-[#2d3748]">
                <input
                  type="color"
                  value={bgColor}
                  onChange={e => setBgColor(e.target.value)}
                  className="w-6 h-6 rounded border border-[#374151] cursor-pointer bg-transparent"
                />
                <span className="font-mono text-gray-300">{bgColor}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-4 py-3 border-t border-[#2d3748] flex items-center justify-end space-x-2 bg-[#171b22]">
          <button
            onClick={() => setOpenDialog(null)}
            className="px-3 py-1.5 rounded hover:bg-[#2d3748] text-gray-300"
          >
            Cancel
          </button>
          <button
            onClick={handleCreate}
            className="px-4 py-1.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white rounded font-bold shadow"
          >
            Create Document
          </button>
        </div>
      </div>
    </div>
  );
};
