import React, { useState } from 'react';
import { useCorel } from '../../context/CorelContext';
import { Download, X, FileText, Image as ImageIcon, Sparkles, Printer } from 'lucide-react';
import { exportPageToSvg } from '../../engine/svgEngine';
import { exportToRaster, exportToPdf, exportToSvgFile, exportToCorelJson } from '../../engine/exportEngine';

export const ExportDialog: React.FC = () => {
  const {
    openDialog,
    setOpenDialog,
    activePage,
    activeObjects,
    projectTitle,
    getProjectDocument,
  } = useCorel();

  const [format, setFormat] = useState<'png' | 'svg' | 'pdf' | 'jpg' | 'cdrw'>('png');
  const [scale, setScale] = useState<number>(2); // 2x default for sharp rendering
  const [filename, setFilename] = useState(projectTitle.replace(/\s+/g, '_').toLowerCase());
  const [isExporting, setIsExporting] = useState(false);

  if (openDialog !== 'export') return null;

  const handleExport = async () => {
    setIsExporting(true);
    try {
      if (format === 'svg') {
        exportToSvgFile(activePage, activeObjects, filename);
      } else if (format === 'png' || format === 'jpg') {
        const svgStr = exportPageToSvg(activePage, activeObjects);
        await exportToRaster(svgStr, activePage.width, activePage.height, scale, format, 0.95, filename);
      } else if (format === 'pdf') {
        await exportToPdf(activePage, activeObjects, filename);
      } else if (format === 'cdrw') {
        exportToCorelJson(getProjectDocument(), filename);
      }
      setOpenDialog(null);
    } catch (err) {
      console.error(err);
      alert('Export failed. Please try again.');
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4 select-none">
      <div className="bg-[#1f2430] border border-[#374151] rounded-xl shadow-2xl w-full max-w-md overflow-hidden text-gray-200 text-xs">
        {/* Header */}
        <div className="px-4 py-3 border-b border-[#2d3748] flex items-center justify-between bg-[#171b22]">
          <span className="font-bold text-white text-sm flex items-center">
            <Download className="w-4 h-4 mr-2 text-teal-400" /> Export Artwork
          </span>
          <button onClick={() => setOpenDialog(null)} className="text-gray-400 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="p-4 space-y-3">
          <div>
            <label className="text-[11px] text-gray-400">File Name</label>
            <input
              type="text"
              value={filename}
              onChange={e => setFilename(e.target.value)}
              className="w-full bg-[#262e3d] text-white px-2.5 py-1.5 rounded border border-[#374151] mt-1 outline-none text-xs"
            />
          </div>

          <div>
            <label className="text-[11px] text-gray-400">Export Format</label>
            <div className="grid grid-cols-2 gap-2 mt-1">
              {/* PNG */}
              <button
                onClick={() => setFormat('png')}
                className={`p-2.5 rounded-lg border text-left flex items-center space-x-2 transition ${
                  format === 'png'
                    ? 'bg-[#2563eb] border-blue-500 text-white font-bold'
                    : 'bg-[#1b2029] border-[#2d3748] text-gray-300 hover:bg-[#262e3d]'
                }`}
              >
                <ImageIcon className="w-4 h-4 text-emerald-400" />
                <div>
                  <div className="text-xs">PNG Image</div>
                  <div className="text-[10px] opacity-70">Lossless Transparent</div>
                </div>
              </button>

              {/* SVG */}
              <button
                onClick={() => setFormat('svg')}
                className={`p-2.5 rounded-lg border text-left flex items-center space-x-2 transition ${
                  format === 'svg'
                    ? 'bg-[#2563eb] border-blue-500 text-white font-bold'
                    : 'bg-[#1b2029] border-[#2d3748] text-gray-300 hover:bg-[#262e3d]'
                }`}
              >
                <Sparkles className="w-4 h-4 text-purple-400" />
                <div>
                  <div className="text-xs">SVG Vector</div>
                  <div className="text-[10px] opacity-70">W3C Standard Vector</div>
                </div>
              </button>

              {/* PDF */}
              <button
                onClick={() => setFormat('pdf')}
                className={`p-2.5 rounded-lg border text-left flex items-center space-x-2 transition ${
                  format === 'pdf'
                    ? 'bg-[#2563eb] border-blue-500 text-white font-bold'
                    : 'bg-[#1b2029] border-[#2d3748] text-gray-300 hover:bg-[#262e3d]'
                }`}
              >
                <FileText className="w-4 h-4 text-red-400" />
                <div>
                  <div className="text-xs">PDF Document</div>
                  <div className="text-[10px] opacity-70">Print-Ready Vector</div>
                </div>
              </button>

              {/* JPG */}
              <button
                onClick={() => setFormat('jpg')}
                className={`p-2.5 rounded-lg border text-left flex items-center space-x-2 transition ${
                  format === 'jpg'
                    ? 'bg-[#2563eb] border-blue-500 text-white font-bold'
                    : 'bg-[#1b2029] border-[#2d3748] text-gray-300 hover:bg-[#262e3d]'
                }`}
              >
                <ImageIcon className="w-4 h-4 text-amber-400" />
                <div>
                  <div className="text-xs">JPEG Photo</div>
                  <div className="text-[10px] opacity-70">Solid Background</div>
                </div>
              </button>
            </div>
          </div>

          {/* Raster Scale Resolution */}
          {(format === 'png' || format === 'jpg') && (
            <div className="pt-1">
              <label className="text-[11px] text-gray-400">Resolution Multiplier</label>
              <div className="grid grid-cols-3 gap-2 mt-1">
                <button
                  onClick={() => setScale(1)}
                  className={`py-1.5 rounded-lg border text-center ${
                    scale === 1 ? 'bg-[#3b82f6] text-white font-bold border-blue-400' : 'bg-[#1b2029] border-[#2d3748] text-gray-400'
                  }`}
                >
                  1x ({activePage.width} × {activePage.height})
                </button>
                <button
                  onClick={() => setScale(2)}
                  className={`py-1.5 rounded-lg border text-center ${
                    scale === 2 ? 'bg-[#3b82f6] text-white font-bold border-blue-400' : 'bg-[#1b2029] border-[#2d3748] text-gray-400'
                  }`}
                >
                  2x Retina ({activePage.width * 2} × {activePage.height * 2})
                </button>
                <button
                  onClick={() => setScale(4)}
                  className={`py-1.5 rounded-lg border text-center ${
                    scale === 4 ? 'bg-[#3b82f6] text-white font-bold border-blue-400' : 'bg-[#1b2029] border-[#2d3748] text-gray-400'
                  }`}
                >
                  4x Ultra HD ({activePage.width * 4} × {activePage.height * 4})
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-4 py-3 border-t border-[#2d3748] flex items-center justify-end space-x-2 bg-[#171b22]">
          <button onClick={() => setOpenDialog(null)} className="px-3 py-1.5 rounded hover:bg-[#2d3748] text-gray-300">
            Cancel
          </button>
          <button
            disabled={isExporting}
            onClick={handleExport}
            className="px-4 py-1.5 bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-500 hover:to-emerald-500 text-white rounded font-bold shadow flex items-center"
          >
            <Download className="w-3.5 h-3.5 mr-1.5" />
            <span>{isExporting ? 'Exporting...' : `Download .${format}`}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
