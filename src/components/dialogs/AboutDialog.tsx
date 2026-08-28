import React from 'react';
import { useCorel } from '../../context/CorelContext';
import { HelpCircle, X, Sparkles, Heart } from 'lucide-react';

export const AboutDialog: React.FC = () => {
  const { openDialog, setOpenDialog } = useCorel();

  if (openDialog !== 'about') return null;

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4 select-none">
      <div className="bg-[#1f2430] border border-[#374151] rounded-xl shadow-2xl w-full max-w-md overflow-hidden text-gray-200 text-xs">
        <div className="px-4 py-3 border-b border-[#2d3748] flex items-center justify-between bg-[#171b22]">
          <span className="font-bold text-white text-sm flex items-center">
            <HelpCircle className="w-4 h-4 mr-2 text-emerald-400" /> About Devin's CorelDRAW
          </span>
          <button onClick={() => setOpenDialog(null)} className="text-gray-400 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-6 text-center space-y-4">
          <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-emerald-500 via-cyan-400 to-indigo-600 flex items-center justify-center text-3xl font-black text-white mx-auto shadow-xl">
            D
          </div>

          <div>
            <h3 className="font-extrabold text-white text-lg tracking-tight">Devin's CorelDRAW</h3>
            <div className="text-emerald-400 font-semibold text-xs mt-0.5">Version 2026.1 Offline & Desktop Edition</div>
          </div>

          <p className="text-gray-300 leading-relaxed text-xs">
            A comprehensive in-browser and 100% offline vector illustration, page layout, and precision graphic design suite featuring Bézier curve editing, Boolean shaping (Weld/Trim/Intersect), 3D Extrusion, Contour steps, and PowerTRACE bitmap vectorization. Works completely without internet and automatically saves your work locally.
          </p>

          <div className="pt-2 border-t border-[#2d3748] text-gray-400 text-[11px] flex items-center justify-center space-x-1">
            <span>Crafted with</span>
            <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500 inline" />
            <span>for Devin and digital artists</span>
          </div>
        </div>

        <div className="px-4 py-3 border-t border-[#2d3748] flex items-center justify-center bg-[#171b22]">
          <button
            onClick={() => setOpenDialog(null)}
            className="px-6 py-1.5 bg-[#2563eb] hover:bg-blue-600 text-white rounded font-bold"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
