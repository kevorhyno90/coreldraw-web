import React, { useState, useRef } from 'react';
import { useCorel } from '../../context/CorelContext';
import { Sparkles, Upload, Image as ImageIcon, CheckCircle, RefreshCw } from 'lucide-react';
import { traceImageToVector } from '../../engine/autoTrace';

export const AutoTraceDocker: React.FC = () => {
  const { addObject, setSelectedIds, pushHistory } = useCorel();
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [threshold, setThreshold] = useState(128);
  const [smoothness, setSmoothness] = useState(4);
  const [isProcessing, setIsProcessing] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = evt => {
      setImageSrc(evt.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleRunTrace = async () => {
    if (!imageSrc) return;
    setIsProcessing(true);

    try {
      const res = await traceImageToVector(imageSrc, {
        threshold,
        smoothness,
        colorCount: 4,
        minPathLength: 6,
      });

      if (res.objects.length === 0) {
        alert('No vector contours detected with current threshold. Try adjusting the slider.');
        setIsProcessing(false);
        return;
      }

      const createdIds: string[] = [];
      res.objects.forEach(obj => {
        const added = addObject(obj);
        createdIds.push(added.id);
      });

      setSelectedIds(createdIds);
      pushHistory(`PowerTRACE (${res.objects.length} vector curves)`);
      alert(`Successfully generated ${res.objects.length} editable vector paths!`);
    } catch (err) {
      console.error(err);
      alert('Tracing failed on this image.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="flex-1 overflow-y-auto p-3 space-y-4 text-xs select-none text-gray-200">
      <div className="border-b border-[#2d3748] pb-2">
        <h3 className="font-bold text-white flex items-center">
          <Sparkles className="w-4 h-4 mr-1.5 text-emerald-400" /> PowerTRACE (Auto-Trace)
        </h3>
        <p className="text-[11px] text-gray-400 mt-1">
          Convert raster bitmap images into crisp, editable Bézier vector curves.
        </p>
      </div>

      <input
        type="file"
        ref={fileRef}
        className="hidden"
        accept="image/*"
        onChange={handleImageUpload}
      />

      {/* Image Preview & Upload Dropzone */}
      {!imageSrc ? (
        <div
          onClick={() => fileRef.current?.click()}
          className="border-2 border-dashed border-[#374151] hover:border-emerald-500 rounded-lg p-6 text-center cursor-pointer bg-[#1b2029] hover:bg-[#202736] transition space-y-2"
        >
          <ImageIcon className="w-8 h-8 text-gray-500 mx-auto" />
          <div className="font-semibold text-gray-300">Click to Upload Bitmap Image</div>
          <div className="text-[10px] text-gray-500">Supports PNG, JPG, WebP, GIF</div>
        </div>
      ) : (
        <div className="space-y-3">
          <div className="relative rounded-lg overflow-hidden border border-[#374151] bg-black/40 max-h-40 flex items-center justify-center">
            <img src={imageSrc} alt="To Trace" className="max-h-36 object-contain" />
            <button
              onClick={() => fileRef.current?.click()}
              className="absolute top-2 right-2 px-2 py-1 bg-black/70 hover:bg-black text-white rounded text-[10px] backdrop-blur"
            >
              Change
            </button>
          </div>

          {/* Controls */}
          <div className="space-y-3 bg-[#1b2029] p-3 rounded-lg border border-[#2d3748]">
            <div>
              <div className="flex justify-between text-[11px] text-gray-400 mb-1">
                <span>Detail / Threshold</span>
                <span className="font-mono">{threshold}</span>
              </div>
              <input
                type="range"
                min={20}
                max={230}
                value={threshold}
                onChange={e => setThreshold(Number(e.target.value))}
                className="w-full h-1.5 bg-gray-600 rounded-lg cursor-pointer"
              />
            </div>

            <div>
              <div className="flex justify-between text-[11px] text-gray-400 mb-1">
                <span>Curve Smoothness</span>
                <span className="font-mono">{smoothness}</span>
              </div>
              <input
                type="range"
                min={1}
                max={10}
                value={smoothness}
                onChange={e => setSmoothness(Number(e.target.value))}
                className="w-full h-1.5 bg-gray-600 rounded-lg cursor-pointer"
              />
            </div>

            <button
              disabled={isProcessing}
              onClick={handleRunTrace}
              className="w-full py-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white rounded-lg font-bold flex items-center justify-center space-x-2 shadow transition"
            >
              {isProcessing ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin text-white" />
                  <span>Tracing Contours...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 text-emerald-300" />
                  <span>Convert to Vector Curves</span>
                </>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
