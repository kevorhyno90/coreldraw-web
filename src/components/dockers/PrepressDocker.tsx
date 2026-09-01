import React from 'react';
import { useCorel } from '../../context/CorelContext';
import {
  Printer,
  Layers,
  Scissors,
  Eye,
  Sliders,
  CheckCircle2,
  FileCheck,
  RotateCw,
  Sparkles,
  Grid,
  BookOpen,
} from 'lucide-react';
import { exportToPdfDocument } from '../../engine/exportEngine';

export const PrepressDocker: React.FC = () => {
  const {
    prepressSettings,
    setPrepressSettings,
    generateCutContour,
    primarySelectedObject,
    pages,
    activePage,
    activeObjects,
  } = useCorel();

  const handleTogglePlate = (plate: 'cyan' | 'magenta' | 'yellow' | 'black' | 'spots') => {
    setPrepressSettings(prev => ({
      ...prev,
      separations: {
        ...prev.separations,
        [plate]: !prev.separations[plate],
      },
    }));
  };

  const handleExportPrepressPdf = () => {
    exportToPdfDocument(activePage, activeObjects, 'prepress-proof.pdf');
  };

  return (
    <div className="flex flex-col h-full bg-[#181a20] text-gray-200 text-xs overflow-y-auto divide-y divide-gray-800">
      {/* Header */}
      <div className="p-3 bg-gradient-to-r from-blue-900/40 via-indigo-950/30 to-purple-900/40 border-b border-gray-800">
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-blue-500/20 text-blue-400 rounded-lg">
            <Printer size={16} />
          </div>
          <div>
            <div className="font-bold text-gray-100 uppercase tracking-wider text-[11px]">
              2025 Prepress & Print Driver
            </div>
            <div className="text-[10px] text-gray-400">
              Color Separations, Imposition, Plate Inversion & Bleeds
            </div>
          </div>
        </div>
      </div>

      {/* Mode Switcher */}
      <div className="p-3 flex flex-col gap-2">
        <label className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">
          Prepress Output Mode
        </label>
        <div className="grid grid-cols-2 gap-1.5 bg-gray-900/80 p-1 rounded-xl border border-gray-800">
          <button
            onClick={() => setPrepressSettings(p => ({ ...p, mode: 'composite' }))}
            className={`py-1.5 px-2 rounded-lg font-medium transition-all text-center ${
              prepressSettings.mode === 'composite'
                ? 'bg-blue-600 text-white shadow'
                : 'text-gray-400 hover:text-gray-200'
            }`}
          >
            Composite CMYK
          </button>
          <button
            onClick={() => setPrepressSettings(p => ({ ...p, mode: 'separations' }))}
            className={`py-1.5 px-2 rounded-lg font-medium transition-all text-center ${
              prepressSettings.mode === 'separations'
                ? 'bg-blue-600 text-white shadow'
                : 'text-gray-400 hover:text-gray-200'
            }`}
          >
            Color Separations
          </button>
        </div>
      </div>

      {/* Color Separations & Plates */}
      <div className="p-3 flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <label className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">
            CMYK Plate Separations
          </label>
          <span className="text-[10px] text-blue-400 bg-blue-950/60 px-1.5 py-0.5 rounded border border-blue-800/40">
            {prepressSettings.mode === 'separations' ? 'Active' : 'Standby'}
          </span>
        </div>

        <div className="grid grid-cols-2 gap-2">
          {/* Cyan */}
          <button
            onClick={() => handleTogglePlate('cyan')}
            className={`flex items-center justify-between p-2 rounded-xl border transition-all ${
              prepressSettings.separations.cyan
                ? 'bg-cyan-950/40 border-cyan-500/50 text-cyan-200 shadow-sm shadow-cyan-900/20'
                : 'bg-gray-900/50 border-gray-800 text-gray-500'
            }`}
          >
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-cyan-400 shadow-sm shadow-cyan-400/50" />
              <span className="font-semibold text-[11px]">Cyan (C)</span>
            </div>
            <Eye size={13} className={prepressSettings.separations.cyan ? 'text-cyan-400' : 'text-gray-600'} />
          </button>

          {/* Magenta */}
          <button
            onClick={() => handleTogglePlate('magenta')}
            className={`flex items-center justify-between p-2 rounded-xl border transition-all ${
              prepressSettings.separations.magenta
                ? 'bg-pink-950/40 border-pink-500/50 text-pink-200 shadow-sm shadow-pink-900/20'
                : 'bg-gray-900/50 border-gray-800 text-gray-500'
            }`}
          >
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-pink-500 shadow-sm shadow-pink-500/50" />
              <span className="font-semibold text-[11px]">Magenta (M)</span>
            </div>
            <Eye size={13} className={prepressSettings.separations.magenta ? 'text-pink-400' : 'text-gray-600'} />
          </button>

          {/* Yellow */}
          <button
            onClick={() => handleTogglePlate('yellow')}
            className={`flex items-center justify-between p-2 rounded-xl border transition-all ${
              prepressSettings.separations.yellow
                ? 'bg-yellow-950/40 border-yellow-500/50 text-yellow-200 shadow-sm shadow-yellow-900/20'
                : 'bg-gray-900/50 border-gray-800 text-gray-500'
            }`}
          >
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-yellow-400 shadow-sm shadow-yellow-400/50" />
              <span className="font-semibold text-[11px]">Yellow (Y)</span>
            </div>
            <Eye size={13} className={prepressSettings.separations.yellow ? 'text-yellow-400' : 'text-gray-600'} />
          </button>

          {/* Black */}
          <button
            onClick={() => handleTogglePlate('black')}
            className={`flex items-center justify-between p-2 rounded-xl border transition-all ${
              prepressSettings.separations.black
                ? 'bg-gray-800 border-gray-500 text-gray-100 shadow-sm shadow-black/40'
                : 'bg-gray-900/50 border-gray-800 text-gray-500'
            }`}
          >
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-gray-950 border border-gray-600" />
              <span className="font-semibold text-[11px]">Black (K)</span>
            </div>
            <Eye size={13} className={prepressSettings.separations.black ? 'text-gray-300' : 'text-gray-600'} />
          </button>
        </div>

        {/* Plate Inversion */}
        <div className="flex items-center justify-between p-2.5 rounded-xl bg-gray-900/80 border border-gray-800">
          <div>
            <div className="font-medium text-gray-200 text-[11px]">Invert Plates (Negative Film)</div>
            <div className="text-[10px] text-gray-400">Invert plate exposure for flexo / negative film</div>
          </div>
          <input
            type="checkbox"
            checked={prepressSettings.invertPlates}
            onChange={e => setPrepressSettings(p => ({ ...p, invertPlates: e.target.checked }))}
            className="w-4 h-4 accent-blue-500 rounded cursor-pointer"
          />
        </div>
      </div>

      {/* Imposition Layout Engine (N-up) */}
      <div className="p-3 flex flex-col gap-3">
        <label className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">
          Imposition Layout & Binding
        </label>

        <div className="flex flex-col gap-2 bg-gray-900/80 p-2.5 rounded-xl border border-gray-800">
          <div className="flex items-center justify-between">
            <span className="text-gray-300">Imposition Scheme:</span>
            <select
              value={prepressSettings.imposition}
              onChange={e => setPrepressSettings(p => ({ ...p, imposition: e.target.value as any }))}
              className="bg-gray-800 border border-gray-700 rounded-lg px-2 py-1 text-[11px] text-gray-200 outline-none"
            >
              <option value="1-up">1-Up (Standard Single Page)</option>
              <option value="2-up-spread">2-Up Reader's Spread</option>
              <option value="2-up-booklet">2-Up Saddle-Stitch Booklet</option>
              <option value="4-up-step">4-Up Step & Repeat</option>
              <option value="8-up-signature">8-Up Signature Fold</option>
            </select>
          </div>

          <div className="flex items-center justify-between pt-1">
            <span className="text-gray-300">Binding Type:</span>
            <select
              value={prepressSettings.binding}
              onChange={e => setPrepressSettings(p => ({ ...p, binding: e.target.value as any }))}
              className="bg-gray-800 border border-gray-700 rounded-lg px-2 py-1 text-[11px] text-gray-200 outline-none"
            >
              <option value="saddle-stitch">Saddle Stitch</option>
              <option value="perfect-bound">Perfect Bound</option>
              <option value="side-stitch">Side Stitch</option>
            </select>
          </div>
        </div>
      </div>

      {/* Printer Marks & Bleeds */}
      <div className="p-3 flex flex-col gap-3">
        <label className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">
          Bleeds, Slugs & Printer Marks
        </label>

        <div className="grid grid-cols-2 gap-2">
          <div className="flex flex-col gap-1 bg-gray-900/60 p-2 rounded-xl border border-gray-800">
            <span className="text-[10px] text-gray-400">Bleed (mm)</span>
            <input
              type="number"
              value={prepressSettings.bleedMm}
              onChange={e => setPrepressSettings(p => ({ ...p, bleedMm: Number(e.target.value) }))}
              className="bg-gray-800 border border-gray-700 rounded px-2 py-1 text-gray-200 text-xs"
            />
          </div>
          <div className="flex flex-col gap-1 bg-gray-900/60 p-2 rounded-xl border border-gray-800">
            <span className="text-[10px] text-gray-400">Slug Area (mm)</span>
            <input
              type="number"
              value={prepressSettings.slugMm}
              onChange={e => setPrepressSettings(p => ({ ...p, slugMm: Number(e.target.value) }))}
              className="bg-gray-800 border border-gray-700 rounded px-2 py-1 text-gray-200 text-xs"
            />
          </div>
        </div>

        {/* Mark checkboxes */}
        <div className="flex flex-col gap-1.5 bg-gray-900/80 p-2.5 rounded-xl border border-gray-800">
          <label className="flex items-center justify-between text-gray-300">
            <span>Crop & Trim Marks</span>
            <input
              type="checkbox"
              checked={prepressSettings.cropMarks}
              onChange={e => setPrepressSettings(p => ({ ...p, cropMarks: e.target.checked }))}
              className="w-3.5 h-3.5 accent-blue-500 rounded"
            />
          </label>
          <label className="flex items-center justify-between text-gray-300">
            <span>Registration Bullseyes</span>
            <input
              type="checkbox"
              checked={prepressSettings.registrationMarks}
              onChange={e => setPrepressSettings(p => ({ ...p, registrationMarks: e.target.checked }))}
              className="w-3.5 h-3.5 accent-blue-500 rounded"
            />
          </label>
          <label className="flex items-center justify-between text-gray-300">
            <span>CMYK Density Color Bars</span>
            <input
              type="checkbox"
              checked={prepressSettings.colorBars}
              onChange={e => setPrepressSettings(p => ({ ...p, colorBars: e.target.checked }))}
              className="w-3.5 h-3.5 accent-blue-500 rounded"
            />
          </label>
        </div>
      </div>

      {/* Vinyl & CNC Cut-Path Section */}
      <div className="p-3 flex flex-col gap-2">
        <label className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">
          Vinyl Cutting & Signage Setup
        </label>
        <div className="bg-gradient-to-r from-pink-950/30 to-purple-950/30 p-2.5 rounded-xl border border-pink-500/30 flex flex-col gap-2">
          <div className="text-[11px] text-pink-300">
            Generate standard 0.25pt <span className="font-bold">CutContour</span> spot magenta hairline for vinyl plotters and CNC cutters.
          </div>
          <button
            onClick={() => generateCutContour()}
            disabled={!primarySelectedObject}
            className={`w-full py-2 px-3 rounded-lg font-medium flex items-center justify-center gap-2 transition-all ${
              primarySelectedObject
                ? 'bg-pink-600 hover:bg-pink-500 text-white shadow-lg shadow-pink-600/30'
                : 'bg-gray-800 text-gray-500 cursor-not-allowed'
            }`}
          >
            <Scissors size={14} />
            <span>Create CutContour Hairline</span>
          </button>
        </div>
      </div>

      {/* Export to PDF button */}
      <div className="p-3 mt-auto">
        <button
          onClick={handleExportPrepressPdf}
          className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-semibold flex items-center justify-center gap-2 shadow-lg shadow-blue-600/30 transition-all"
        >
          <FileCheck size={16} />
          <span>Export Print-Ready Prepress PDF</span>
        </button>
      </div>
    </div>
  );
};
