import React from 'react';
import { useCorel } from '../../context/CorelContext';
import { PRESET_TEMPLATES } from '../../engine/presetTemplates';
import { Sparkles, X, Check } from 'lucide-react';

export const TemplatesDialog: React.FC = () => {
  const { openDialog, setOpenDialog, loadTemplate } = useCorel();

  if (openDialog !== 'templates') return null;

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4 select-none">
      <div className="bg-[#1f2430] border border-[#374151] rounded-xl shadow-2xl w-full max-w-2xl overflow-hidden text-gray-200 text-xs">
        {/* Header */}
        <div className="px-4 py-3 border-b border-[#2d3748] flex items-center justify-between bg-[#171b22]">
          <span className="font-bold text-white text-sm flex items-center">
            <Sparkles className="w-4 h-4 mr-2 text-amber-400" /> Vector Artwork Templates
          </span>
          <button onClick={() => setOpenDialog(null)} className="text-gray-400 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Template Cards */}
        <div className="p-4 grid grid-cols-1 md:grid-cols-3 gap-3 max-h-[70vh] overflow-y-auto">
          {PRESET_TEMPLATES.map(tpl => (
            <div
              key={tpl.id}
              onClick={() => {
                loadTemplate(tpl.id);
                setOpenDialog(null);
              }}
              className="bg-[#1b2029] border border-[#2d3748] hover:border-blue-500 rounded-xl p-4 cursor-pointer hover:bg-[#262e3d] transition flex flex-col justify-between group shadow-md"
            >
              <div>
                <div className="text-3xl mb-2 group-hover:scale-110 transition-transform origin-left">
                  {tpl.thumbnail}
                </div>
                <span className="text-[10px] px-2 py-0.5 bg-blue-500/20 text-blue-400 rounded-full font-semibold uppercase">
                  {tpl.category}
                </span>
                <h4 className="font-bold text-white text-sm mt-2">{tpl.title}</h4>
                <p className="text-[11px] text-gray-400 mt-1 leading-relaxed">{tpl.description}</p>
              </div>

              <div className="mt-4 pt-3 border-t border-[#2d3748] flex items-center justify-between text-gray-400 group-hover:text-blue-400">
                <span className="text-[10px] font-mono">{tpl.objects.length} Vector Elements</span>
                <span className="font-bold text-xs">Load →</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
