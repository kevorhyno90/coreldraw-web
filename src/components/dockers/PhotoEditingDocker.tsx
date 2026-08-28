import React from 'react';
import { useCorel } from '../../context/CorelContext';
import {
  Image as ImageIcon,
  Sliders,
  Sparkles,
  Sun,
  Contrast,
  Palette,
  RotateCw,
  Upload,
  RefreshCw,
} from 'lucide-react';

export const PhotoEditingDocker: React.FC = () => {
  const { primarySelectedObject, updateObject, addObject, activeObjects } = useCorel();

  const handleUploadImage = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = evt => {
      const src = evt.target?.result as string;
      const img = new Image();
      img.onload = () => {
        const maxWidth = 350;
        const scale = maxWidth / img.naturalWidth;
        const width = maxWidth;
        const height = img.naturalHeight * scale;

        addObject({
          name: `Bitmap (${file.name.slice(0, 15)})`,
          type: 'image',
          transform: {
            x: 100,
            y: 100,
            width,
            height,
            rotation: 0,
            scaleX: 1,
            scaleY: 1,
            skewX: 0,
            skewY: 0,
          },
          subpaths: [],
          imageProps: {
            src,
            naturalWidth: img.naturalWidth,
            naturalHeight: img.naturalHeight,
            filter: {
              brightness: 100,
              contrast: 100,
              saturation: 100,
              hueRotate: 0,
              blur: 0,
              sepia: 0,
              grayscale: 0,
              invert: false,
            },
          },
          fill: { type: 'none', color: 'transparent' },
          outline: { color: 'none', width: 0, style: 'solid', cap: 'round', join: 'round', startArrow: 'none', endArrow: 'none' },
          shadow: { enabled: true, color: '#000000', blur: 8, offsetX: 3, offsetY: 3, opacity: 0.4 },
        });
      };
      img.src = src;
    };
    reader.readAsDataURL(file);
  };

  const currentFilters = primarySelectedObject?.imageProps?.filter || {
    brightness: 100,
    contrast: 100,
    saturation: 100,
    hueRotate: 0,
    blur: 0,
    sepia: 0,
    grayscale: 0,
    invert: false,
  };

  const setFilter = (key: keyof typeof currentFilters, val: any) => {
    if (!primarySelectedObject) return;
    const newFilters = { ...currentFilters, [key]: val };
    updateObject(primarySelectedObject.id, {
      imageProps: {
        ...(primarySelectedObject.imageProps || { src: '', naturalWidth: 100, naturalHeight: 100 }),
        filter: newFilters,
      },
    });
  };

  const applyPreset = (preset: 'vivid' | 'noir' | 'retro' | 'cyberpunk' | 'warm') => {
    if (!primarySelectedObject) return;
    let patch = { ...currentFilters };
    if (preset === 'vivid') {
      patch = { ...patch, brightness: 110, contrast: 125, saturation: 150, blur: 0, grayscale: 0, sepia: 0, hueRotate: 0 };
    } else if (preset === 'noir') {
      patch = { ...patch, brightness: 105, contrast: 140, saturation: 0, grayscale: 100, sepia: 0 };
    } else if (preset === 'retro') {
      patch = { ...patch, brightness: 105, contrast: 90, saturation: 90, sepia: 40, hueRotate: 15 };
    } else if (preset === 'cyberpunk') {
      patch = { ...patch, brightness: 115, contrast: 135, saturation: 160, hueRotate: 280 };
    } else if (preset === 'warm') {
      patch = { ...patch, brightness: 108, contrast: 105, saturation: 120, sepia: 20, hueRotate: 10 };
    }
    updateObject(primarySelectedObject.id, {
      imageProps: {
        ...(primarySelectedObject.imageProps || { src: '', naturalWidth: 100, naturalHeight: 100 }),
        filter: patch,
      },
    });
  };

  return (
    <div className="p-3 space-y-4 text-xs select-none">
      {/* Header & Image Uploader */}
      <div className="bg-[#171b22] p-2.5 rounded-lg border border-[#2d3748] space-y-2">
        <div className="flex items-center justify-between">
          <span className="font-bold text-white flex items-center">
            <ImageIcon className="w-4 h-4 mr-1.5 text-emerald-400" /> Photo & Bitmap Lab
          </span>
        </div>
        <p className="text-gray-400 text-[11px] leading-relaxed">
          Import photos and apply real-time non-destructive tone curves, saturation, and filters.
        </p>
        <label className="w-full py-1.5 bg-[#2563eb] hover:bg-blue-600 text-white rounded font-bold text-center flex items-center justify-center cursor-pointer transition">
          <Upload className="w-3.5 h-3.5 mr-1.5" /> Import Photo / Bitmap...
          <input type="file" accept="image/*" className="hidden" onChange={handleUploadImage} />
        </label>
      </div>

      {!primarySelectedObject || primarySelectedObject.type !== 'image' ? (
        <div className="text-center py-6 text-gray-500 space-y-1">
          <ImageIcon className="w-8 h-8 mx-auto opacity-30 text-gray-400" />
          <div>Select an imported bitmap image to adjust its photo filters.</div>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Quick Filter Presets */}
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-1.5 block">
              Tone & Color Presets
            </span>
            <div className="grid grid-cols-3 gap-1.5">
              <button
                onClick={() => applyPreset('vivid')}
                className="px-2 py-1 bg-[#242b38] hover:bg-[#323c4d] text-emerald-300 rounded text-[11px] font-semibold border border-[#374151]"
              >
                🌈 Vivid
              </button>
              <button
                onClick={() => applyPreset('noir')}
                className="px-2 py-1 bg-[#242b38] hover:bg-[#323c4d] text-gray-200 rounded text-[11px] font-semibold border border-[#374151]"
              >
                🎞️ B&W Noir
              </button>
              <button
                onClick={() => applyPreset('retro')}
                className="px-2 py-1 bg-[#242b38] hover:bg-[#323c4d] text-amber-300 rounded text-[11px] font-semibold border border-[#374151]"
              >
                📻 Vintage
              </button>
              <button
                onClick={() => applyPreset('cyberpunk')}
                className="px-2 py-1 bg-[#242b38] hover:bg-[#323c4d] text-cyan-300 rounded text-[11px] font-semibold border border-[#374151]"
              >
                ⚡ Neon
              </button>
              <button
                onClick={() => applyPreset('warm')}
                className="px-2 py-1 bg-[#242b38] hover:bg-[#323c4d] text-orange-300 rounded text-[11px] font-semibold border border-[#374151]"
              >
                ☀️ Warm Tone
              </button>
              <button
                onClick={() =>
                  updateObject(primarySelectedObject.id, {
                    imageProps: {
                      ...primarySelectedObject.imageProps!,
                      filter: {
                        brightness: 100,
                        contrast: 100,
                        saturation: 100,
                        hueRotate: 0,
                        blur: 0,
                        sepia: 0,
                        grayscale: 0,
                        invert: false,
                      },
                    },
                  })
                }
                className="px-2 py-1 bg-[#242b38] hover:bg-[#323c4d] text-gray-400 rounded text-[11px] font-semibold border border-[#374151]"
              >
                ↺ Reset
              </button>
            </div>
          </div>

          {/* Photo Adjustments Sliders */}
          <div className="space-y-3 bg-[#171b22] p-2.5 rounded-lg border border-[#2d3748]">
            <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 block">
              Color & Exposure Adjustments
            </span>

            {/* Brightness */}
            <div className="space-y-1">
              <div className="flex justify-between text-[11px]">
                <span className="text-gray-400">Brightness</span>
                <span className="text-white font-mono">{currentFilters.brightness}%</span>
              </div>
              <input
                type="range"
                min={20}
                max={200}
                value={currentFilters.brightness}
                onChange={e => setFilter('brightness', Number(e.target.value))}
                className="w-full h-1 bg-gray-600 rounded-lg cursor-pointer"
              />
            </div>

            {/* Contrast */}
            <div className="space-y-1">
              <div className="flex justify-between text-[11px]">
                <span className="text-gray-400">Contrast</span>
                <span className="text-white font-mono">{currentFilters.contrast}%</span>
              </div>
              <input
                type="range"
                min={20}
                max={200}
                value={currentFilters.contrast}
                onChange={e => setFilter('contrast', Number(e.target.value))}
                className="w-full h-1 bg-gray-600 rounded-lg cursor-pointer"
              />
            </div>

            {/* Saturation */}
            <div className="space-y-1">
              <div className="flex justify-between text-[11px]">
                <span className="text-gray-400">Saturation</span>
                <span className="text-white font-mono">{currentFilters.saturation}%</span>
              </div>
              <input
                type="range"
                min={0}
                max={250}
                value={currentFilters.saturation}
                onChange={e => setFilter('saturation', Number(e.target.value))}
                className="w-full h-1 bg-gray-600 rounded-lg cursor-pointer"
              />
            </div>

            {/* Hue Rotate */}
            <div className="space-y-1">
              <div className="flex justify-between text-[11px]">
                <span className="text-gray-400">Hue Shift</span>
                <span className="text-white font-mono">{currentFilters.hueRotate}°</span>
              </div>
              <input
                type="range"
                min={0}
                max={360}
                value={currentFilters.hueRotate}
                onChange={e => setFilter('hueRotate', Number(e.target.value))}
                className="w-full h-1 bg-gray-600 rounded-lg cursor-pointer"
              />
            </div>

            {/* Blur */}
            <div className="space-y-1">
              <div className="flex justify-between text-[11px]">
                <span className="text-gray-400">Soft Blur</span>
                <span className="text-white font-mono">{currentFilters.blur}px</span>
              </div>
              <input
                type="range"
                min={0}
                max={15}
                value={currentFilters.blur}
                onChange={e => setFilter('blur', Number(e.target.value))}
                className="w-full h-1 bg-gray-600 rounded-lg cursor-pointer"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
